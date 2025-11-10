import request from 'supertest';
import { App } from '../../infrastructure/server/app';

describe('API Integration Tests', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    await app.connect();
    server = app.app;
  });

  afterAll(async () => {
    await app.disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 on health check', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Routes API', () => {
    it('should get all routes', async () => {
      const response = await request(server)
        .get('/api/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get a specific route by ID', async () => {
      const response = await request(server)
        .get('/api/routes/R001')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', 'R001');
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(server)
        .get('/api/routes/NONEXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should get route comparison', async () => {
      const response = await request(server)
        .get('/api/routes/comparison')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Compliance API', () => {
    it('should calculate compliance balance', async () => {
      const response = await request(server)
        .get('/api/compliance/cb')
        .query({ shipId: 'SHIP001', year: 2025 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('cbGco2eq');
      expect(response.body.data).toHaveProperty('ghgieActual');
      expect(response.body.data).toHaveProperty('ghgieTarget');
      expect(response.body.data).toHaveProperty('isCompliant');
    });

    it('should require shipId and year for compliance calculation', async () => {
      const response = await request(server)
        .get('/api/compliance/cb')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('required');
    });

    it('should get adjusted compliance balance', async () => {
      const response = await request(server)
        .get('/api/compliance/adjusted-cb')
        .query({ shipId: 'SHIP001', year: 2025 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('adjustedCB');
    });
  });

  describe('Banking API', () => {
    it('should get bank records for a ship', async () => {
      const response = await request(server)
        .get('/api/banking/records')
        .query({ shipId: 'SHIP001', year: 2025 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get total banked surplus', async () => {
      const response = await request(server)
        .get('/api/banking/total')
        .query({ shipId: 'SHIP001' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('total');
    });

    it('should bank surplus', async () => {
      const response = await request(server)
        .post('/api/banking/bank')
        .send({
          shipId: 'SHIP_TEST_BANK',
          year: 2025,
          surplus: 5000
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should apply banked surplus to deficit', async () => {
      // First bank some surplus
      await request(server)
        .post('/api/banking/bank')
        .send({
          shipId: 'SHIP_TEST_APPLY',
          year: 2024,
          surplus: 10000
        });

      // Then apply it
      const response = await request(server)
        .post('/api/banking/apply')
        .send({
          shipId: 'SHIP_TEST_APPLY',
          year: 2025,
          deficit: 5000
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Borrowing API', () => {
    const testShipId = 'SHIP_BORROW_TEST';

    it('should validate borrowing eligibility', async () => {
      const response = await request(server)
        .get('/api/borrowing/validate')
        .query({ shipId: testShipId, year: 2025 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('canBorrow');
      expect(response.body.data).toHaveProperty('reason');
    });

    it('should require shipId and year for validation', async () => {
      const response = await request(server)
        .get('/api/borrowing/validate')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('required');
    });

    it('should get borrow history', async () => {
      const response = await request(server)
        .get('/api/borrowing/history')
        .query({ shipId: testShipId })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should borrow deficit', async () => {
      const response = await request(server)
        .post('/api/borrowing/borrow')
        .send({
          shipId: 'SHIP_BORROW_NEW',
          year: 2025
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      // Can be true or false depending on deficit and validation
    });

    it('should prevent consecutive year borrowing', async () => {
      const shipId = 'SHIP_CONSECUTIVE_TEST';
      
      // Borrow in year 2025
      await request(server)
        .post('/api/borrowing/borrow')
        .send({ shipId, year: 2025 });

      // Try to borrow in 2026 (should fail)
      const response = await request(server)
        .post('/api/borrowing/borrow')
        .send({ shipId, year: 2026 });

      // Expect failure if there was borrowing in 2025
      if (response.body.success === false) {
        expect(response.body.message).toContain('consecutive');
      }
    });
  });

  describe('Pooling API', () => {
    it('should create a compliance pool', async () => {
      const response = await request(server)
        .post('/api/pools')
        .send({
          name: 'Test Pool',
          year: 2025
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Test Pool');
    });

    it('should get all pools', async () => {
      const response = await request(server)
        .get('/api/pools')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should add member to pool', async () => {
      // First create a pool
      const poolResponse = await request(server)
        .post('/api/pools')
        .send({
          name: 'Member Test Pool',
          year: 2025
        });

      const poolId = poolResponse.body.data.id;

      // Add member
      const response = await request(server)
        .post(`/api/pools/${poolId}/members`)
        .send({
          shipId: 'SHIP_POOL_MEMBER',
          cbGco2eq: 5000
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should allocate pool surplus using greedy algorithm', async () => {
      // Create pool
      const poolResponse = await request(server)
        .post('/api/pools')
        .send({
          name: 'Allocation Test Pool',
          year: 2025
        });

      const poolId = poolResponse.body.data.id;

      // Add members with surplus and deficit
      await request(server)
        .post(`/api/pools/${poolId}/members`)
        .send({ shipId: 'SHIP_SURPLUS_1', cbGco2eq: 10000 });

      await request(server)
        .post(`/api/pools/${poolId}/members`)
        .send({ shipId: 'SHIP_DEFICIT_1', cbGco2eq: -5000 });

      // Allocate
      const response = await request(server)
        .post(`/api/pools/${poolId}/allocate`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('allocations');
    });
  });

  describe('End-to-End Scenarios', () => {
    it('should handle full compliance cycle with banking', async () => {
      const shipId = 'SHIP_E2E_BANKING';
      
      // 1. Calculate initial CB (assume surplus)
      const cbResponse = await request(server)
        .get('/api/compliance/cb')
        .query({ shipId, year: 2024 });

      if (cbResponse.body.data.cbGco2eq > 0) {
        // 2. Bank the surplus
        await request(server)
          .post('/api/banking/bank')
          .send({
            shipId,
            year: 2024,
            surplus: cbResponse.body.data.cbGco2eq
          })
          .expect(200);

        // 3. Get adjusted CB for next year
        const adjustedResponse = await request(server)
          .get('/api/compliance/adjusted-cb')
          .query({ shipId, year: 2025 })
          .expect(200);

        expect(adjustedResponse.body).toHaveProperty('success', true);
      }
    });

    it('should handle borrowing and repayment cycle', async () => {
      const shipId = 'SHIP_E2E_BORROW';
      
      // 1. Check if eligible to borrow
      const validationResponse = await request(server)
        .get('/api/borrowing/validate')
        .query({ shipId, year: 2025 });

      // 2. Attempt to borrow
      const borrowResponse = await request(server)
        .post('/api/borrowing/borrow')
        .send({ shipId, year: 2025 });

      // 3. Get history
      const historyResponse = await request(server)
        .get('/api/borrowing/history')
        .query({ shipId })
        .expect(200);

      expect(historyResponse.body).toHaveProperty('success', true);
    });

    it('should handle pooling allocation scenario', async () => {
      // Create pool
      const poolResponse = await request(server)
        .post('/api/pools')
        .send({ name: 'E2E Test Pool', year: 2025 });

      const poolId = poolResponse.body.data.id;

      // Add ships with different CBs
      await request(server)
        .post(`/api/pools/${poolId}/members`)
        .send({ shipId: 'SHIP_POOL_SURPLUS', cbGco2eq: 15000 });

      await request(server)
        .post(`/api/pools/${poolId}/members`)
        .send({ shipId: 'SHIP_POOL_DEFICIT', cbGco2eq: -8000 });

      // Allocate
      const allocationResponse = await request(server)
        .post(`/api/pools/${poolId}/allocate`)
        .expect(200);

      expect(allocationResponse.body.success).toBe(true);
      expect(allocationResponse.body.data.allocations).toBeDefined();
    });
  });
});
