/**
 * Utility functions for FuelEU Maritime calculations
 * Following regulation requirements for precision and rounding
 */

/**
 * Round to 5 decimal places (regulation requirement)
 * Used for all intermediate calculations
 */
export function roundTo5Decimals(value: number): number {
  return Math.round(value * 100000) / 100000;
}

/**
 * Round penalty to nearest integer (EUR)
 */
export function roundPenalty(value: number): number {
  return Math.round(value);
}

/**
 * Constants from FuelEU Maritime Regulation
 */
export const CONSTANTS = {
  // Reference GHG intensity (gCO2eq/MJ)
  REFERENCE_GHGIE: 91.16,
  
  // VLSFO LCV for penalty calculation (MJ/tonne)
  VLSFO_LCV: 41000,
  
  // Penalty rate (EUR/tonne VLSFO equivalent)
  PENALTY_RATE: 2400,
  
  // Maximum borrowing percentage
  MAX_BORROWING_PERCENT: 0.02, // 2%
  
  // Borrowing aggravation factor
  BORROWING_AGGRAVATION: 1.1, // 10%
  
  // Consecutive non-compliance penalty multiplier
  CONSECUTIVE_PENALTY_INCREMENT: 0.10, // 10%
  
  // Reward factor for RFNBOs (2025-2033)
  RFNBO_REWARD_FACTOR: 2,
  
  // Default reward factor
  DEFAULT_REWARD_FACTOR: 1,
  
  // Global Warming Potentials (GWP100 from IPCC AR4)
  GWP: {
    CO2: 1,
    CH4: 25,
    N2O: 298
  },
  
  // Fuel Lower Calorific Values (MJ/g) from Annex II
  LCV: {
    HFO: 0.0405,
    LFO: 0.0410,
    MDO: 0.0427,
    MGO: 0.0427,
    LNG: 0.0491,
    METHANOL: 0.0199,
    AMMONIA: 0.0186,
    HYDROGEN: 0.1200
  },
  
  // Slip coefficients (%) from Annex II
  SLIP_COEFFICIENT: {
    HFO: 0,
    MDO: 0,
    MGO: 0,
    LNG_OTTO_MS: 3.1,
    LNG_OTTO_SS: 1.7,
    LNG_DIESEL_SS: 0.2,
    LNG_LBSI: 2.6,
    DEFAULT: 0
  }
};

/**
 * Get target GHG intensity for a given year
 * Based on Article 4.2
 */
export function getTargetGHGIE(year: number): number {
  if (year >= 2025 && year <= 2029) {
    return roundTo5Decimals(89.33680); // -2%
  } else if (year >= 2030 && year <= 2034) {
    return roundTo5Decimals(85.69040); // -6%
  } else if (year >= 2035 && year <= 2039) {
    return roundTo5Decimals(77.94180); // -14.5%
  } else if (year >= 2040 && year <= 2044) {
    return roundTo5Decimals(62.90040); // -31%
  } else if (year >= 2045 && year <= 2049) {
    return roundTo5Decimals(34.64080); // -62%
  } else if (year >= 2050) {
    return roundTo5Decimals(18.23200); // -80%
  }
  return roundTo5Decimals(CONSTANTS.REFERENCE_GHGIE); // Default baseline
}

/**
 * Calculate penalty for non-compliance
 * Formula: |CB| / (GHGIEactual × 41,000) × 2,400 EUR
 * 
 * @param complianceBalance - CB in gCO2eq (should be negative)
 * @param ghgieActual - Actual GHG intensity (gCO2eq/MJ)
 * @param consecutiveYears - Number of consecutive non-compliant years
 * @returns Penalty in EUR (rounded to nearest integer)
 */
export function calculatePenalty(
  complianceBalance: number,
  ghgieActual: number,
  consecutiveYears: number = 1
): number {
  if (complianceBalance >= 0) {
    return 0; // No penalty for positive or zero CB
  }
  
  const basePenalty = (Math.abs(complianceBalance) / (ghgieActual * CONSTANTS.VLSFO_LCV)) * CONSTANTS.PENALTY_RATE;
  
  // Apply consecutive non-compliance multiplier
  // Total Penalty = FuelEU Penalty × (1 + (n-1) × 0.10)
  const multiplier = 1 + (consecutiveYears - 1) * CONSTANTS.CONSECUTIVE_PENALTY_INCREMENT;
  
  const totalPenalty = basePenalty * multiplier;
  
  return roundPenalty(totalPenalty);
}

/**
 * Calculate maximum allowed borrowing (ACS)
 * Max ACS = 2% × GHGIEtarget × Energy consumed
 * 
 * @param year - Reporting year
 * @param energyMJ - Total energy consumed in MJ
 * @returns Maximum ACS in gCO2eq
 */
export function calculateMaxBorrowing(year: number, energyMJ: number): number {
  const target = getTargetGHGIE(year);
  const maxACS = CONSTANTS.MAX_BORROWING_PERCENT * target * energyMJ;
  return roundTo5Decimals(maxACS);
}

/**
 * Calculate aggravated ACS for repayment
 * Aggravated ACS = ACS × 1.1
 * 
 * @param borrowedAmount - Amount borrowed (gCO2eq)
 * @returns Amount to repay with 10% aggravation
 */
export function calculateAggravatedACS(borrowedAmount: number): number {
  return roundTo5Decimals(borrowedAmount * CONSTANTS.BORROWING_AGGRAVATION);
}

/**
 * Get reward factor for fuel type and year
 * RFNBOs get reward factor of 2 from 2025-2033
 * 
 * @param fuelType - Type of fuel
 * @param year - Year of consumption
 * @param isRFNBO - Whether fuel is RFNBO/e-fuel
 * @returns Reward factor (1 or 2)
 */
export function getRewardFactor(fuelType: string, year: number, isRFNBO: boolean = false): number {
  if (isRFNBO && year >= 2025 && year <= 2033) {
    return CONSTANTS.RFNBO_REWARD_FACTOR;
  }
  return CONSTANTS.DEFAULT_REWARD_FACTOR;
}

/**
 * Get slip coefficient for fuel/engine combination
 * 
 * @param fuelType - Type of fuel
 * @param engineType - Type of engine (for LNG)
 * @returns Slip coefficient as percentage
 */
export function getSlipCoefficient(fuelType: string, engineType?: string): number {
  const normalizedFuel = fuelType.toUpperCase();
  
  if (normalizedFuel === 'LNG' && engineType) {
    const key = `LNG_${engineType.toUpperCase()}` as keyof typeof CONSTANTS.SLIP_COEFFICIENT;
    return CONSTANTS.SLIP_COEFFICIENT[key] || CONSTANTS.SLIP_COEFFICIENT.DEFAULT;
  }
  
  const key = normalizedFuel as keyof typeof CONSTANTS.SLIP_COEFFICIENT;
  return CONSTANTS.SLIP_COEFFICIENT[key] || CONSTANTS.SLIP_COEFFICIENT.DEFAULT;
}
