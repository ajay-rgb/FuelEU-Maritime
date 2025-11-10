import { Router } from 'express';
import { PoolingController } from './PoolingController';

export function createPoolingRouter(controller: PoolingController): Router {
  const router = Router();

  router.post('/', (req, res) => controller.createPool(req, res));
  router.post('/validate', (req, res) => controller.validatePool(req, res));

  return router;
}
