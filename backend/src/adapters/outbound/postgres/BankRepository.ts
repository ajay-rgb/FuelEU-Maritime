import { PrismaClient } from '@prisma/client';
import { IBankRepository } from '../../core/ports/IBankRepository';
import { BankEntry, CreateBankEntryDTO, BankBalance } from '../../core/domain/BankEntry';

export class BankRepository implements IBankRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year?: number): Promise<BankEntry[]> {
    const where: any = { shipId };
    
    if (year !== undefined) {
      where.year = year;
    }

    return this.prisma.bankEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(entry: CreateBankEntryDTO): Promise<BankEntry> {
    return this.prisma.bankEntry.create({
      data: entry
    });
  }

  async getTotalBanked(shipId: string): Promise<number> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId }
    });

    return entries.reduce((sum, entry) => sum + entry.amountGco2eq, 0);
  }

  async getBankBalance(shipId: string): Promise<BankBalance> {
    const entries = await this.findByShipAndYear(shipId);
    const totalBanked = await this.getTotalBanked(shipId);

    return {
      shipId,
      totalBanked,
      entries
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bankEntry.delete({
      where: { id }
    });
  }
}
