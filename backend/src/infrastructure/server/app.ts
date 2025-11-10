import express, { Application } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Repositories
import { RouteRepository } from '../../adapters/outbound/postgres/RouteRepository';
import { ComplianceRepository } from '../../adapters/outbound/postgres/ComplianceRepository';
import { BankRepository } from '../../adapters/outbound/postgres/BankRepository';
import { PoolRepository } from '../../adapters/outbound/postgres/PoolRepository';

// Services
import { ComplianceService } from '../../core/application/ComplianceService';
import { BankingService } from '../../core/application/BankingService';
import { PoolingService } from '../../core/application/PoolingService';

// Controllers
import { RouteController } from '../../adapters/inbound/http/RouteController';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';
import { PoolingController } from '../../adapters/inbound/http/PoolingController';

// Routes
import { createRouteRouter } from '../../adapters/inbound/http/routes';
import { createComplianceRouter } from '../../adapters/inbound/http/complianceRoutes';
import { createBankingRouter } from '../../adapters/inbound/http/bankingRoutes';
import { createPoolingRouter } from '../../adapters/inbound/http/poolingRoutes';

export class App {
  public app: Application;
  private prisma: PrismaClient;

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    // Initialize repositories
    const routeRepo = new RouteRepository(this.prisma);
    const complianceRepo = new ComplianceRepository(this.prisma);
    const bankRepo = new BankRepository(this.prisma);
    const poolRepo = new PoolRepository(this.prisma);

    // Initialize services
    const complianceService = new ComplianceService(complianceRepo, bankRepo);
    const bankingService = new BankingService(bankRepo, complianceService);
    const poolingService = new PoolingService(poolRepo, this.prisma);

    // Initialize controllers
    const routeController = new RouteController(routeRepo);
    const complianceController = new ComplianceController(complianceService);
    const bankingController = new BankingController(bankingService);
    const poolingController = new PoolingController(poolingService);

    // Setup routes
    this.app.use('/api/routes', createRouteRouter(routeController));
    this.app.use('/api/compliance', createComplianceRouter(complianceController));
    this.app.use('/api/banking', createBankingRouter(bankingController));
    this.app.use('/api/pools', createPoolingRouter(poolingController));

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  public async connect() {
    await this.prisma.$connect();
    console.log('Database connected');
  }

  public async disconnect() {
    await this.prisma.$disconnect();
    console.log('Database disconnected');
  }
}
