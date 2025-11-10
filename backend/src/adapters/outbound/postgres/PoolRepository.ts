import { PrismaClient } from '@prisma/client';
import { IPoolRepository } from '../../core/ports/IPoolService';
import { Pool, CreatePoolDTO } from '../../core/domain/Pool';

export class PoolRepository implements IPoolRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Pool | null> {
    return this.prisma.pool.findUnique({
      where: { id },
      include: { members: true }
    });
  }

  async findByYear(year: number): Promise<Pool[]> {
    return this.prisma.pool.findMany({
      where: { year },
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(poolData: CreatePoolDTO): Promise<Pool> {
    const totalCbBefore = poolData.members.reduce((sum, m) => sum + m.cbBefore, 0);
    
    return this.prisma.pool.create({
      data: {
        year: poolData.year,
        totalCbBefore,
        totalCbAfter: 0, // Will be updated after allocation
        members: {
          create: poolData.members.map(m => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbBefore // Will be updated
          }))
        }
      },
      include: { members: true }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pool.delete({
      where: { id }
    });
  }
}
