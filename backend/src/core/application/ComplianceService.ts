import { IComplianceService, IComplianceRepository } from '../ports/IComplianceService';
import { IBankRepository } from '../ports/IBankRepository';
import { IBorrowRepository } from '../ports/IBorrowRepository';
import { ComplianceCalculationResult } from '../domain/ComplianceBalance';
import {
  roundTo5Decimals,
  calculatePenalty,
  getTargetGHGIE as getTargetFromUtils
} from '../utils/calculations';
import { calculateGHGIntensity, FuelConsumption } from '../domain/FuelConsumption';

/**
 * FuelEU Maritime Compliance Service
 * Implements core business logic for compliance balance calculations
 */
export class ComplianceService implements IComplianceService {
  constructor(
    private complianceRepo: IComplianceRepository,
    private bankRepo: IBankRepository,
    private borrowRepo: IBorrowRepository
  ) {}

  /**
   * Get target GHG intensity for a given year
   * Based on Annex IV Part A
   */
  getTargetGHGIE(year: number): number {
    return getTargetFromUtils(year);
  }

  /**
   * Calculate penalty for non-compliance
   * Formula: |CB| / (GHGIEactual × 41,000) × 2,400 EUR
   * 
   * @param shipId - Ship identifier
   * @param year - Reporting year
   * @param consecutiveYears - Number of consecutive non-compliant years
   * @returns Penalty amount in EUR
   */
  async calculateCompliancePenalty(
    shipId: string,
    year: number,
    consecutiveYears: number = 1
  ): Promise<number> {
    const compliance = await this.calculateComplianceBalance(shipId, year);
    
    return calculatePenalty(
      compliance.cbGco2eq,
      compliance.ghgieActual,
      consecutiveYears
    );
  }

  /**
   * Calculate Compliance Balance (CB) for a ship in a given year
   * Formula: CB = (GHGIEtarget - GHGIEactual) × Energy
   * 
   * For this implementation, we'll use simplified calculation based on route data
   * In production, this would aggregate all voyages for the ship/year
   */
  async calculateComplianceBalance(
    shipId: string, 
    year: number
  ): Promise<ComplianceCalculationResult> {
    const ghgieTarget = this.getTargetGHGIE(year);
    
    // For demo purposes, using simplified calculation
    // In production, this would aggregate fuel consumption across all voyages
    // Example fuel consumption - should come from voyage data in production
    const fuelConsumptions: FuelConsumption[] = [
      {
        fuelType: 'VLSFO',
        mass: 120000000, // 120,000 kg = 120,000,000 g
        lcv: 0.041,      // 41 MJ/kg = 0.041 MJ/g
        wttEmissions: 3.206,   // gCO2eq/MJ from Annex I Table 1
        ttwEmissions: 77.389,  // gCO2eq/MJ from Annex I Table 1
        slipCoefficient: 0,    // No slip for conventional fuel
        rewardFactor: 1,       // Standard fuel
        isRFNBO: false
      }
    ];
    
    // Calculate GHG intensity using full formula
    const ghgIntensity = calculateGHGIntensity(fuelConsumptions, 0);
    const ghgieActual = roundTo5Decimals(ghgIntensity.total);
    const energyScopeMj = roundTo5Decimals(ghgIntensity.energy);
    
    // Calculate compliance balance
    const cbGco2eq = roundTo5Decimals(
      (ghgieTarget - ghgieActual) * energyScopeMj
    );

    // Save or update compliance record
    const existing = await this.complianceRepo.findByShipAndYear(shipId, year);
    
    if (existing) {
      await this.complianceRepo.update(existing.id, {
        cbGco2eq,
        ghgieActual,
        ghgieTarget,
        energyScopeMj
      });
    } else {
      await this.complianceRepo.create({
        shipId,
        year,
        cbGco2eq,
        ghgieActual,
        ghgieTarget,
        energyScopeMj
      });
    }

    return {
      shipId,
      year,
      cbGco2eq,
      ghgieActual,
      ghgieTarget,
      energyScopeMj,
      isCompliant: cbGco2eq >= 0,
      surplus: cbGco2eq > 0 ? cbGco2eq : undefined,
      deficit: cbGco2eq < 0 ? Math.abs(cbGco2eq) : undefined
    };
  }

  /**
   * Get adjusted CB after applying banked surplus and aggravated ACS
   * Adjusted CB = Initial CB + Banked Surplus - Aggravated ACS (from previous year)
   */
  async getAdjustedCB(shipId: string, year: number): Promise<number> {
    const compliance = await this.calculateComplianceBalance(shipId, year);
    let adjustedCB = compliance.cbGco2eq;
    
    // Subtract aggravated ACS from previous year (if any)
    const unpaidBorrow = await this.borrowRepo.getUnpaidFromPreviousYear(shipId, year);
    if (unpaidBorrow) {
      adjustedCB = roundTo5Decimals(adjustedCB - unpaidBorrow.aggravatedAmount);
      // Mark as repaid
      await this.borrowRepo.markAsRepaid(unpaidBorrow.id);
    }
    
    // If ship has deficit after borrowing repayment, apply banked surplus
    if (adjustedCB < 0) {
      const totalBanked = await this.bankRepo.getTotalBanked(shipId);
      if (totalBanked > 0) {
        const deficit = Math.abs(adjustedCB);
        const applied = Math.min(deficit, totalBanked);
        adjustedCB = roundTo5Decimals(adjustedCB + applied);
      }
    }
    
    return adjustedCB;
  }

  private roundTo5Decimals(value: number): number {
    return roundTo5Decimals(value);
  }
}
