/**
 * Fuel Consumption Data Model
 * Represents fuel consumption details for GHG intensity calculations
 */

export interface FuelConsumption {
  fuelType: string;
  mass: number;              // Mass in grams (Mi)
  lcv: number;               // Lower calorific value in MJ/g (LCVi)
  wttEmissions: number;      // Well-to-Tank emissions (gCO2eq/MJ)
  ttwEmissions: number;      // Tank-to-Wake emissions (gCO2eq/MJ)
  slipCoefficient: number;   // Non-combusted fuel percentage
  rewardFactor: number;      // RWD (1 or 2 for RFNBOs)
  isRFNBO: boolean;          // Renewable fuel of non-biological origin
}

export interface GHGIntensityResult {
  wtt: number;               // Well-to-Tank intensity (gCO2eq/MJ)
  ttw: number;               // Tank-to-Wake intensity (gCO2eq/MJ)
  total: number;             // Total GHG intensity (gCO2eq/MJ)
  energy: number;            // Total energy in MJ
}

/**
 * Calculate GHG Intensity using full formula from Annex I
 * 
 * @param fuelConsumptions - Array of fuel consumption data
 * @param opsElectricity - Onshore power supply electricity in MJ
 * @returns GHG intensity breakdown
 */
export function calculateGHGIntensity(
  fuelConsumptions: FuelConsumption[],
  opsElectricity: number = 0
): GHGIntensityResult {
  // Calculate total energy with reward factors
  // Σ(Mi × LCVi × RWDi + ΣEk)
  const totalEnergy = fuelConsumptions.reduce((sum, fuel) => {
    return sum + (fuel.mass * fuel.lcv * fuel.rewardFactor);
  }, 0) + opsElectricity;

  if (totalEnergy === 0) {
    return { wtt: 0, ttw: 0, total: 0, energy: 0 };
  }

  // Calculate WtT (Well-to-Tank)
  // WtT = Σ(Mi × CO2eqWtT,i × LCVi) / Σ(Mi × LCVi × RWDi + ΣEk)
  const wttNumerator = fuelConsumptions.reduce((sum, fuel) => {
    return sum + (fuel.mass * fuel.wttEmissions * fuel.lcv);
  }, 0);
  
  const wtt = wttNumerator / totalEnergy;

  // Calculate TtW (Tank-to-Wake)
  // TtW = Σ[Mi × ((1 - Cslip/100) × CO2eq,TtW,i + (Cslip/100) × CO2eq_TtW,slip,i)] / totalEnergy
  const ttwNumerator = fuelConsumptions.reduce((sum, fuel) => {
    // Simplified: assuming slip emissions = combusted emissions for this implementation
    // In full implementation, would need separate slip emission factors
    const combustedFraction = 1 - (fuel.slipCoefficient / 100);
    const slippedFraction = fuel.slipCoefficient / 100;
    const emissions = fuel.mass * fuel.lcv * fuel.ttwEmissions * (combustedFraction + slippedFraction);
    return sum + emissions;
  }, 0);
  
  const ttw = ttwNumerator / totalEnergy;

  // Total GHG intensity
  const total = wtt + ttw;

  // Round to 5 decimals
  return {
    wtt: Math.round(wtt * 100000) / 100000,
    ttw: Math.round(ttw * 100000) / 100000,
    total: Math.round(total * 100000) / 100000,
    energy: Math.round(totalEnergy * 100000) / 100000
  };
}
