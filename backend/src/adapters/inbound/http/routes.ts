import { Router } from 'express';
import { RouteController } from './RouteController';

export function createRouteRouter(controller: RouteController): Router {
  const router = Router();

  router.get('/', (req, res) => controller.getRoutes(req, res));
  router.get('/comparison', (req, res) => controller.getComparison(req, res));
  router.get('/:id', (req, res) => controller.getRoute(req, res));
  router.post('/:id/baseline', (req, res) => controller.setBaseline(req, res));
  router.post('/', (req, res) => controller.createRoute(req, res));

  return router;
}
