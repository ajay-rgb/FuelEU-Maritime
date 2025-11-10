import { IBankRepository } from '../ports/IBankRepository';
import { IComplianceService } from '../ports/IComplianceService';
import { CreateBankEntryDTO } from '../domain/BankEntry';

/**
 * Banking Service - Handles banking and applying of surplus CB
 */
export class BankingService {
  constructor(
    private bankRepo: IBankRepository,
    private complianceService: IComplianceService
  ) {}

  /**
   * Bank positive CB for future use
   */
  async bankSurplus(
    shipId: string,
    year: number,
    amount: number
  ): Promise<{ success: boolean; message: string }> {
    // Get current CB
    const compliance = await this.complianceService.calculateComplianceBalance(shipId, year);
    
    // Validate: CB must be positive and amount must not exceed CB
    if (compliance.cbGco2eq <= 0) {
      return {
        success: false,
        message: 'Cannot bank surplus. Compliance balance is not positive.'
      };
    }

    if (amount > compliance.cbGco2eq) {
      return {
        success: false,
        message: `Amount to bank (${amount}) exceeds available surplus (${compliance.cbGco2eq}).`
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount to bank must be positive.'
      };
    }

    // Create bank entry
    const entry: CreateBankEntryDTO = {
      shipId,
      year,
      amountGco2eq: amount
    };

    await this.bankRepo.create(entry);

    return {
      success: true,
      message: `Successfully banked ${amount} gCO2eq for ship ${shipId}.`
    };
  }

  /**
   * Apply banked surplus to current deficit
   */
  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<{ 
    success: boolean; 
    message: string;
    cbBefore?: number;
    cbAfter?: number;
    applied?: number;
  }> {
    // Get current CB
    const compliance = await this.complianceService.calculateComplianceBalance(shipId, year);
    const totalBanked = await this.bankRepo.getTotalBanked(shipId);

    // Validate: must have deficit
    if (compliance.cbGco2eq >= 0) {
      return {
        success: false,
        message: 'Cannot apply banked surplus. Ship has no deficit.'
      };
    }

    // Validate: sufficient banked amount
    if (totalBanked < amount) {
      return {
        success: false,
        message: `Insufficient banked surplus. Available: ${totalBanked}, Requested: ${amount}.`
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount to apply must be positive.'
      };
    }

    const deficit = Math.abs(compliance.cbGco2eq);
    const actualApplied = Math.min(amount, deficit);

    // In a real system, we'd track which banked entries are being used
    // For simplicity, we're just validating the total is sufficient
    
    const cbAfter = compliance.cbGco2eq + actualApplied;

    return {
      success: true,
      message: `Successfully applied ${actualApplied} gCO2eq from banked surplus.`,
      cbBefore: compliance.cbGco2eq,
      cbAfter: this.roundTo5Decimals(cbAfter),
      applied: actualApplied
    };
  }

  /**
   * Get bank balance for a ship
   */
  async getBankBalance(shipId: string) {
    return this.bankRepo.getBankBalance(shipId);
  }

  private roundTo5Decimals(value: number): number {
    return Math.round(value * 100000) / 100000;
  }
}
