import { PrismaClient } from '@prisma/client';
import { IBorrowRepository } from '../../../core/ports/IBorrowRepository';
import { BorrowEntry, CreateBorrowDTO } from '../../../core/domain/BorrowEntry';
import { calculateAggravatedACS } from '../../../core/utils/calculations';

export class BorrowRepository implements IBorrowRepository {
  constructor(private prisma: PrismaClient) {}

  async create(entry: CreateBorrowDTO): Promise<BorrowEntry> {
    const aggravatedAmount = calculateAggravatedACS(entry.amountGco2eq);
    
    const created = await this.prisma.borrowEntry.create({
      data: {
        shipId: entry.shipId,
        year: entry.year,
        amountGco2eq: entry.amountGco2eq,
        aggravatedAmount: aggravatedAmount,
        repaid: false
      }
    });

    return {
      id: created.id,
      shipId: created.shipId,
      year: created.year,
      amountGco2eq: created.amountGco2eq,
      aggravatedAmount: created.aggravatedAmount,
      repaid: created.repaid,
      createdAt: created.createdAt
    };
  }

  async findByShipAndYear(shipId: string, year: number): Promise<BorrowEntry | null> {
    const entry = await this.prisma.borrowEntry.findUnique({
      where: {
        shipId_year: {
          shipId,
          year
        }
      }
    });

    return entry;
  }

  async findByShip(shipId: string): Promise<BorrowEntry[]> {
    return this.prisma.borrowEntry.findMany({
      where: { shipId },
      orderBy: { year: 'desc' }
    });
  }

  async markAsRepaid(id: string): Promise<BorrowEntry> {
    return this.prisma.borrowEntry.update({
      where: { id },
      data: { repaid: true }
    });
  }

  async borrowedInPreviousYear(shipId: string, currentYear: number): Promise<boolean> {
    const previousYear = currentYear - 1;
    const entry = await this.prisma.borrowEntry.findFirst({
      where: {
        shipId,
        year: previousYear
      }
    });

    return entry !== null;
  }

  async getUnpaidFromPreviousYear(shipId: string, currentYear: number): Promise<BorrowEntry | null> {
    const previousYear = currentYear - 1;
    return this.prisma.borrowEntry.findFirst({
      where: {
        shipId,
        year: previousYear,
        repaid: false
      }
    });
  }
}
