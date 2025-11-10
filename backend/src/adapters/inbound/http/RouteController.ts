import { Request, Response } from 'express';
import { IRouteRepository } from '../../../core/ports/IRouteRepository';

export class RouteController {
  constructor(private routeRepo: IRouteRepository) {}

  async getRoutes(req: Request, res: Response) {
    try {
      const { vesselType, fuelType, year } = req.query;
      
      const filters: any = {};
      if (vesselType) filters.vesselType = vesselType as string;
      if (fuelType) filters.fuelType = fuelType as string;
      if (year) filters.year = parseInt(year as string);

      const routes = await this.routeRepo.findAll(filters);
      
      res.json({
        success: true,
        data: routes
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRoute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await this.routeRepo.findById(id);
      
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      res.json({
        success: true,
        data: route
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async setBaseline(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await this.routeRepo.setBaseline(id);
      
      res.json({
        success: true,
        message: 'Baseline set successfully',
        data: route
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getComparison(req: Request, res: Response) {
    try {
      const baseline = await this.routeRepo.findBaseline();
      
      if (!baseline) {
        return res.status(404).json({
          success: false,
          message: 'No baseline route set'
        });
      }

      const allRoutes = await this.routeRepo.findAll();
      const target = 89.3368; // 2025 target

      const comparisons = allRoutes
        .filter(r => r.id !== baseline.id)
        .map(route => {
          const percentDiff = ((route.ghgIntensity - baseline.ghgIntensity) / baseline.ghgIntensity) * 100;
          const isCompliant = route.ghgIntensity <= target;

          return {
            route,
            baseline,
            percentDiff: Math.round(percentDiff * 100) / 100,
            isCompliant,
            target
          };
        });

      res.json({
        success: true,
        data: {
          baseline,
          target,
          comparisons
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRoute(req: Request, res: Response) {
    try {
      const route = await this.routeRepo.create(req.body);
      
      res.status(201).json({
        success: true,
        data: route
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
