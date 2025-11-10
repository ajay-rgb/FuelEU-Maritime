import { IPoolService, IPoolRepository } from '../ports/IPoolService';
import { CreatePoolDTO, PoolResult } from '../domain/Pool';
import { PrismaClient } from '@prisma/client';

/**
 * Pooling Service - Handles pool creation and validation
 * Implements greedy allocation algorithm for deficit/surplus distribution
 */
export class PoolingService implements IPoolService {
  constructor(
    private poolRepo: IPoolRepository,
    private prisma: PrismaClient
  ) {}

  /**
   * Validate pool members
   * Rules:
   * 1. Total CB must be >= 0
   * 2. Deficit ships cannot exit worse than they entered
   * 3. Surplus ships cannot exit negative
   */
  validatePool(members: Array<{ shipId: string; cbBefore: number }>): {
    isValid: boolean;
    message?: string;
  } {
    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);

    if (totalCB < 0) {
      return {
        isValid: false,
        message: `Pool total CB is negative (${totalCB}). Cannot create pool.`
      };
    }

    return { isValid: true };
  }

  /**
   * Create pool with greedy allocation
   * Algorithm:
   * 1. Sort ships by CB (descending: surplus first, then deficits)
   * 2. Transfer surplus to deficits while respecting rules
   */
  async createPool(poolData: CreatePoolDTO): Promise<PoolResult> {
    // Validate pool
    const validation = this.validatePool(poolData.members);
    if (!validation.isValid) {
      return {
        poolId: '',
        year: poolData.year,
        totalCbBefore: poolData.members.reduce((sum, m) => sum + m.cbBefore, 0),
        totalCbAfter: 0,
        members: [],
        isValid: false,
        message: validation.message
      };
    }

    // Sort members by CB descending (surplus first)
    const sortedMembers = [...poolData.members].sort((a, b) => b.cbBefore - a.cbBefore);

    // Initialize cbAfter with cbBefore
    const membersWithAfter = sortedMembers.map(m => ({
      ...m,
      cbAfter: m.cbBefore
    }));

    // Greedy allocation: transfer from surplus to deficit
    for (let i = 0; i < membersWithAfter.length; i++) {
      const surplusMember = membersWithAfter[i];
      
      // Skip if no surplus
      if (surplusMember.cbAfter <= 0) continue;

      for (let j = membersWithAfter.length - 1; j > i; j--) {
        const deficitMember = membersWithAfter[j];
        
        // Skip if no deficit
        if (deficitMember.cbAfter >= 0) continue;

        // Calculate transfer amount
        const deficit = Math.abs(deficitMember.cbAfter);
        const availableSurplus = surplusMember.cbAfter;
        const transfer = Math.min(deficit, availableSurplus);

        // Apply transfer
        surplusMember.cbAfter = this.roundTo5Decimals(surplusMember.cbAfter - transfer);
        deficitMember.cbAfter = this.roundTo5Decimals(deficitMember.cbAfter + transfer);

        // Stop if no more surplus
        if (surplusMember.cbAfter <= 0) break;
      }
    }

    // Validate rules after allocation
    for (const member of membersWithAfter) {
      // Rule: Deficit ships cannot exit worse
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        return {
          poolId: '',
          year: poolData.year,
          totalCbBefore: poolData.members.reduce((sum, m) => sum + m.cbBefore, 0),
          totalCbAfter: 0,
          members: [],
          isValid: false,
          message: `Deficit ship ${member.shipId} would exit worse than entry.`
        };
      }

      // Rule: Surplus ships cannot exit negative
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        return {
          poolId: '',
          year: poolData.year,
          totalCbBefore: poolData.members.reduce((sum, m) => sum + m.cbBefore, 0),
          totalCbAfter: 0,
          members: [],
          isValid: false,
          message: `Surplus ship ${member.shipId} would exit with deficit.`
        };
      }
    }

    // Create pool in database
    const totalCbBefore = membersWithAfter.reduce((sum, m) => sum + m.cbBefore, 0);
    const totalCbAfter = membersWithAfter.reduce((sum, m) => sum + m.cbAfter, 0);

    const pool = await this.prisma.pool.create({
      data: {
        year: poolData.year,
        totalCbBefore,
        totalCbAfter,
        members: {
          create: membersWithAfter.map(m => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter
          }))
        }
      },
      include: { members: true }
    });

    return {
      poolId: pool.id,
      year: pool.year,
      totalCbBefore: pool.totalCbBefore,
      totalCbAfter: pool.totalCbAfter,
      members: pool.members.map(m => ({
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter
      })),
      isValid: true
    };
  }

  private roundTo5Decimals(value: number): number {
    return Math.round(value * 100000) / 100000;
  }
}
