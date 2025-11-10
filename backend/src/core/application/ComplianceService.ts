import { IComplianceService, IComplianceRepository } from '../ports/IComplianceService';
import { IBankRepository } from '../ports/IBankRepository';
import { ComplianceCalculationResult } from '../domain/ComplianceBalance';

/**
 * FuelEU Maritime Compliance Service
 * Implements core business logic for compliance balance calculations
 */
export class ComplianceService implements IComplianceService {
  constructor(
    private complianceRepo: IComplianceRepository,
    private bankRepo: IBankRepository
  ) {}

  /**
   * Get target GHG intensity for a given year
   * Based on Annex IV Part A
   */
  getTargetGHGIE(year: number): number {
    if (year >= 2025 && year <= 2029) {
      return 89.3368; // 2% reduction from 91.16
    } else if (year >= 2030 && year <= 2034) {
      return 85.6904; // 6% reduction from 91.16
    } else if (year >= 2035 && year <= 2039) {
      return 79.2808; // 13% reduction
    } else if (year >= 2040 && year <= 2044) {
      return 68.3700; // 26% reduction
    } else if (year >= 2045 && year <= 2049) {
      return 57.4592; // 37% reduction
    } else if (year >= 2050) {
      return 18.2320; // 80% reduction
    }
    return 91.16; // Default baseline
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
    // Using shipId as routeId for demo
    const ghgieActual = 90.5; // Mock value - should come from actual fuel data
    const energyScopeMj = 5000000; // Mock value - calculated from fuel consumption
    
    // Round to 5 decimal places
    const cbGco2eq = this.roundTo5Decimals(
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
   * Get adjusted CB after applying banked surplus
   */
  async getAdjustedCB(shipId: string, year: number): Promise<number> {
    const compliance = await this.calculateComplianceBalance(shipId, year);
    const totalBanked = await this.bankRepo.getTotalBanked(shipId);
    
    // If ship has deficit, apply banked surplus
    if (compliance.cbGco2eq < 0 && totalBanked > 0) {
      const deficit = Math.abs(compliance.cbGco2eq);
      const applied = Math.min(deficit, totalBanked);
      return this.roundTo5Decimals(compliance.cbGco2eq + applied);
    }
    
    return this.roundTo5Decimals(compliance.cbGco2eq);
  }

  private roundTo5Decimals(value: number): number {
    return Math.round(value * 100000) / 100000;
  }
}
