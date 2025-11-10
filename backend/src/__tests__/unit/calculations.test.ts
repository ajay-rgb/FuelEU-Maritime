import { roundTo5Decimals, calculatePenalty, calculateMaxBorrowing, calculateAggravatedACS } from '../../core/utils/calculations';

describe('Calculations Utility Tests', () => {
  describe('roundTo5Decimals', () => {
    it('should round to 5 decimal places', () => {
      expect(roundTo5Decimals(1.123456789)).toBe(1.12346);
      expect(roundTo5Decimals(1.123454999)).toBe(1.12345);
      expect(roundTo5Decimals(10)).toBe(10);
    });

    it('should handle negative numbers', () => {
      expect(roundTo5Decimals(-1.123456789)).toBe(-1.12346);
    });

    it('should handle zero', () => {
      expect(roundTo5Decimals(0)).toBe(0);
    });
  });

  describe('calculatePenalty', () => {
    it('should calculate penalty for negative CB', () => {
      const cb = -10000; // 10,000 gCO2eq deficit
      const ghgieActual = 90.5; // gCO2eq/MJ
      const penalty = calculatePenalty(cb, ghgieActual, 1);
      
      // |CB| / (GHGIEactual × 41,000) × 2,400 = 6.47
      // But roundPenalty rounds to nearest integer = 6
      expect(penalty).toBeGreaterThan(0);
      expect(penalty).toBe(6); // Rounded to nearest EUR
    });

    it('should return 0 for positive CB', () => {
      const cb = 5000;
      const ghgieActual = 85.0;
      const penalty = calculatePenalty(cb, ghgieActual, 1);
      
      expect(penalty).toBe(0);
    });

    it('should multiply penalty for consecutive years', () => {
      const cb = -10000;
      const ghgieActual = 90.5;
      const penalty1 = calculatePenalty(cb, ghgieActual, 1);
      const penalty3 = calculatePenalty(cb, ghgieActual, 3);
      
      // Penalty increases by 10% per consecutive year
      // Year 1: base penalty
      // Year 2: base * 1.1
      // Year 3: base * 1.2
      expect(penalty3).toBeGreaterThan(penalty1);
    });
  });

  describe('calculateMaxBorrowing', () => {
    it('should calculate maximum borrowing as 2% of target × energy', () => {
      const year = 2025; // Target: 89.3368
      const energy = 5000000; // 5 million MJ
      
      const maxBorrowing = calculateMaxBorrowing(year, energy);
      
      // 2% × 89.3368 × 5,000,000 = 8,933,680
      expect(maxBorrowing).toBeCloseTo(8933680, 0);
    });

    it('should handle zero energy', () => {
      const maxBorrowing = calculateMaxBorrowing(2025, 0);
      expect(maxBorrowing).toBe(0);
    });
  });

  describe('calculateAggravatedACS', () => {
    it('should calculate aggravated amount with 10% increase', () => {
      const borrowed = 100000;
      const aggravated = calculateAggravatedACS(borrowed);
      
      expect(aggravated).toBe(110000);
    });

    it('should round aggravated amount to 5 decimals', () => {
      const borrowed = 123456.789123;
      const aggravated = calculateAggravatedACS(borrowed);
      
      // 123456.789123 × 1.1 = 135802.4680353, rounded to 5 decimals
      expect(aggravated).toBeCloseTo(135802.46804, 5);
    });
  });
});
