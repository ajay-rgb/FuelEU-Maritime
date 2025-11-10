import { Router } from 'express';
import { ComplianceController } from './ComplianceController';

export function createComplianceRouter(controller: ComplianceController): Router {
  const router = Router();

  router.get('/cb', (req, res) => controller.getComplianceBalance(req, res));
  router.get('/adjusted-cb', (req, res) => controller.getAdjustedCB(req, res));
  router.get('/target', (req, res) => controller.getTarget(req, res));

  return router;
}
