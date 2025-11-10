import { Request, Response } from 'express';
import { IComplianceService } from '../../../core/ports/IComplianceService';

export class ComplianceController {
  constructor(private complianceService: IComplianceService) {}

  async getComplianceBalance(req: Request, res: Response) {
    try {
      const { shipId, year } = req.query;
      
      if (!shipId || !year) {
        return res.status(400).json({
          success: false,
          message: 'shipId and year are required'
        });
      }

      const result = await this.complianceService.calculateComplianceBalance(
        shipId as string,
        parseInt(year as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAdjustedCB(req: Request, res: Response) {
    try {
      const { shipId, year } = req.query;
      
      if (!shipId || !year) {
        return res.status(400).json({
          success: false,
          message: 'shipId and year are required'
        });
      }

      const adjustedCB = await this.complianceService.getAdjustedCB(
        shipId as string,
        parseInt(year as string)
      );

      res.json({
        success: true,
        data: {
          shipId,
          year: parseInt(year as string),
          adjustedCB
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTarget(req: Request, res: Response) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'year is required'
        });
      }

      const target = this.complianceService.getTargetGHGIE(parseInt(year as string));

      res.json({
        success: true,
        data: {
          year: parseInt(year as string),
          target
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
