import { IBorrowRepository } from '../ports/IBorrowRepository';
import { IComplianceService } from '../ports/IComplianceService';
import { BorrowResult, BorrowValidation } from '../domain/BorrowEntry';
import {
  calculateMaxBorrowing,
  calculateAggravatedACS,
  roundTo5Decimals
} from '../utils/calculations';

/**
 * Borrowing Service
 * Handles Advanced Compliance Surplus (ACS) borrowing mechanism
 */
export class BorrowingService {
  constructor(
    private borrowRepo: IBorrowRepository,
    private complianceService: IComplianceService
  ) {}

  /**
   * Validate if a ship can borrow for a given year
   */
  async validateBorrowing(
    shipId: string,
    year: number
  ): Promise<BorrowValidation> {
    // Check if borrowed in previous year
    const borrowedLastYear = await this.borrowRepo.borrowedInPreviousYear(shipId, year);
    if (borrowedLastYear) {
      return {
        canBorrow: false,
        reason: 'Cannot borrow for 2 consecutive years',
        borrowedLastYear: true
      };
    }

    // Get adjusted compliance balance
    const adjustedCB = await this.complianceService.getAdjustedCB(shipId, year);
    
    // Check if ship has deficit
    if (adjustedCB >= 0) {
      return {
        canBorrow: false,
        reason: 'No deficit to borrow against (Adjusted CB ≥ 0)'
      };
    }

    // Get compliance data for energy calculation
    const compliance = await this.complianceService.calculateComplianceBalance(shipId, year);
    
    // Calculate maximum allowed borrowing
    const maxACS = calculateMaxBorrowing(year, compliance.energyScopeMj);
    const deficitAmount = Math.abs(adjustedCB);

    // Check if deficit exceeds 2% limit
    if (deficitAmount > maxACS) {
      return {
        canBorrow: false,
        reason: `Deficit (${deficitAmount.toFixed(5)} gCO2eq) exceeds 2% limit (${maxACS.toFixed(5)} gCO2eq)`,
        maxAllowedACS: maxACS,
        deficitAmount
      };
    }

    return {
      canBorrow: true,
      maxAllowedACS: maxACS,
      deficitAmount
    };
  }

  /**
   * Borrow to cover deficit
   * Amount borrowed will be repaid with 10% aggravation next year
   */
  async borrowDeficit(
    shipId: string,
    year: number
  ): Promise<BorrowResult> {
    // Validate borrowing eligibility
    const validation = await this.validateBorrowing(shipId, year);
    
    if (!validation.canBorrow) {
      return {
        success: false,
        message: validation.reason || 'Cannot borrow'
      };
    }

    // Borrow exact deficit amount
    const amountToBorrow = validation.deficitAmount!;
    
    // Check if already borrowed this year
    const existing = await this.borrowRepo.findByShipAndYear(shipId, year);
    if (existing) {
      return {
        success: false,
        message: 'Already borrowed for this year'
      };
    }

    // Create borrow entry
    const entry = await this.borrowRepo.create({
      shipId,
      year,
      amountGco2eq: amountToBorrow
    });

    const aggravatedAmount = calculateAggravatedACS(amountToBorrow);

    return {
      success: true,
      message: `Successfully borrowed ${amountToBorrow.toFixed(5)} gCO2eq. ` +
               `Must repay ${aggravatedAmount.toFixed(5)} gCO2eq in ${year + 1}.`,
      entry,
      aggravatedAmount
    };
  }

  /**
   * Get borrow history for a ship
   */
  async getBorrowHistory(shipId: string) {
    return this.borrowRepo.findByShip(shipId);
  }

  /**
   * Get borrow entry for specific year
   */
  async getBorrowEntry(shipId: string, year: number) {
    return this.borrowRepo.findByShipAndYear(shipId, year);
  }
}
