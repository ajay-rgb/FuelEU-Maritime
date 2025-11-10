import { Router } from 'express';
import { BankingController } from './BankingController';

export function createBankingRouter(controller: BankingController): Router {
  const router = Router();

  router.get('/records', (req, res) => controller.getBankRecords(req, res));
  router.post('/bank', (req, res) => controller.bankSurplus(req, res));
  router.post('/apply', (req, res) => controller.applyBanked(req, res));

  return router;
}
