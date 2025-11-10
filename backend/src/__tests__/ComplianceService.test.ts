import { ComplianceService } from '../../../src/core/application/ComplianceService';
import { IComplianceRepository } from '../../../src/core/ports/IComplianceService';
import { IBankRepository } from '../../../src/core/ports/IBankRepository';

describe('ComplianceService', () => {
  let complianceService: ComplianceService;
  let mockComplianceRepo: jest.Mocked<IComplianceRepository>;
  let mockBankRepo: jest.Mocked<IBankRepository>;

  beforeEach(() => {
    mockComplianceRepo = {
      findByShipAndYear: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBankRepo = {
      findByShipAndYear: jest.fn(),
      create: jest.fn(),
      getTotalBanked: jest.fn(),
      getBankBalance: jest.fn(),
      delete: jest.fn(),
    };

    complianceService = new ComplianceService(mockComplianceRepo, mockBankRepo);
  });

  describe('getTargetGHGIE', () => {
    it('should return correct target for 2025-2029', () => {
      expect(complianceService.getTargetGHGIE(2025)).toBe(89.3368);
      expect(complianceService.getTargetGHGIE(2029)).toBe(89.3368);
    });

    it('should return correct target for 2030-2034', () => {
      expect(complianceService.getTargetGHGIE(2030)).toBe(85.6904);
      expect(complianceService.getTargetGHGIE(2034)).toBe(85.6904);
    });

    it('should return baseline for years before 2025', () => {
      expect(complianceService.getTargetGHGIE(2020)).toBe(91.16);
    });
  });

  describe('calculateComplianceBalance', () => {
    it('should create new compliance record if none exists', async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);
      mockComplianceRepo.create.mockResolvedValue({
        id: '1',
        shipId: 'SHIP001',
        year: 2025,
        cbGco2eq: -5000,
        ghgieActual: 90.5,
        ghgieTarget: 89.3368,
        energyScopeMj: 5000000,
      });

      const result = await complianceService.calculateComplianceBalance('SHIP001', 2025);

      expect(result.shipId).toBe('SHIP001');
      expect(result.year).toBe(2025);
      expect(mockComplianceRepo.create).toHaveBeenCalled();
    });
  });

  describe('getAdjustedCB', () => {
    it('should return CB plus banked surplus for deficit ships', async () => {
      mockComplianceRepo.findByShipAndYear.mockResolvedValue(null);
      mockComplianceRepo.create.mockResolvedValue({
        id: '1',
        shipId: 'SHIP001',
        year: 2025,
        cbGco2eq: -5000,
        ghgieActual: 90.5,
        ghgieTarget: 89.3368,
        energyScopeMj: 5000000,
      });
      mockBankRepo.getTotalBanked.mockResolvedValue(3000);

      const adjustedCB = await complianceService.getAdjustedCB('SHIP001', 2025);

      expect(adjustedCB).toBeLessThan(0);
    });
  });
});
