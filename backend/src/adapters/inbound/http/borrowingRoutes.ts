import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BorrowingController } from './BorrowingController';
import { BorrowingService } from '../../../core/application/BorrowingService';
import { BorrowRepository } from '../../outbound/postgres/BorrowRepository';
import { ComplianceRepository } from '../../outbound/postgres/ComplianceRepository';
import { BankRepository } from '../../outbound/postgres/BankRepository';
import { ComplianceService } from '../../../core/application/ComplianceService';

const prisma = new PrismaClient();
const borrowRepository = new BorrowRepository(prisma);
const complianceRepository = new ComplianceRepository(prisma);
const bankRepository = new BankRepository(prisma);
const complianceService = new ComplianceService(
  complianceRepository,
  bankRepository,
  borrowRepository
);
const borrowingService = new BorrowingService(
  borrowRepository,
  complianceService
);
const borrowingController = new BorrowingController(borrowingService);

const router = Router();

// GET /api/borrowing/validate?shipId=xxx&year=2025
router.get('/validate', (req, res) => 
  borrowingController.validateBorrowing(req, res)
);

// POST /api/borrowing/borrow { shipId, year }
router.post('/borrow', (req, res) => 
  borrowingController.borrowDeficit(req, res)
);

// GET /api/borrowing/history?shipId=xxx
router.get('/history', (req, res) => 
  borrowingController.getBorrowHistory(req, res)
);

export default router;
