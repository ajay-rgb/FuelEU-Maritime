import { PrismaClient } from '@prisma/client';
import { IComplianceRepository } from '../../core/ports/IComplianceService';
import { 
  ComplianceBalance, 
  CreateComplianceBalanceDTO 
} from '../../core/domain/ComplianceBalance';

export class ComplianceRepository implements IComplianceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: {
          shipId,
          year
        }
      }
    });
  }

  async create(compliance: CreateComplianceBalanceDTO): Promise<ComplianceBalance> {
    return this.prisma.shipCompliance.create({
      data: compliance
    });
  }

  async update(id: string, data: Partial<ComplianceBalance>): Promise<ComplianceBalance> {
    return this.prisma.shipCompliance.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shipCompliance.delete({
      where: { id }
    });
  }
}
