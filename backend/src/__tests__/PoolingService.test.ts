import { PoolingService } from '../../../src/core/application/PoolingService';
import { PrismaClient } from '@prisma/client';

describe('PoolingService', () => {
  let poolingService: PoolingService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      pool: {
        create: jest.fn(),
      },
    };

    poolingService = new PoolingService({} as any, mockPrisma);
  });

  describe('validatePool', () => {
    it('should validate pool with positive total CB', () => {
      const members = [
        { shipId: 'SHIP001', cbBefore: 100000 },
        { shipId: 'SHIP002', cbBefore: -50000 },
      ];

      const result = poolingService.validatePool(members);

      expect(result.isValid).toBe(true);
    });

    it('should reject pool with negative total CB', () => {
      const members = [
        { shipId: 'SHIP001', cbBefore: -100000 },
        { shipId: 'SHIP002', cbBefore: -50000 },
      ];

      const result = poolingService.validatePool(members);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('negative');
    });

    it('should accept pool with zero total CB', () => {
      const members = [
        { shipId: 'SHIP001', cbBefore: 100000 },
        { shipId: 'SHIP002', cbBefore: -100000 },
      ];

      const result = poolingService.validatePool(members);

      expect(result.isValid).toBe(true);
    });
  });
});
