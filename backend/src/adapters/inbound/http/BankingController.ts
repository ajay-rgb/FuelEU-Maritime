import { Request, Response } from 'express';
import { BankingService } from '../../../core/application/BankingService';

export class BankingController {
  constructor(private bankingService: BankingService) {}

  async getBankRecords(req: Request, res: Response) {
    try {
      const { shipId, year } = req.query;
      
      if (!shipId) {
        return res.status(400).json({
          success: false,
          message: 'shipId is required'
        });
      }

      const balance = await this.bankingService.getBankBalance(shipId as string);

      res.json({
        success: true,
        data: balance
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async bankSurplus(req: Request, res: Response) {
    try {
      const { shipId, year, amount } = req.body;
      
      if (!shipId || !year || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: 'shipId, year, and amount are required'
        });
      }

      const result = await this.bankingService.bankSurplus(
        shipId,
        parseInt(year),
        parseFloat(amount)
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async applyBanked(req: Request, res: Response) {
    try {
      const { shipId, year, amount } = req.body;
      
      if (!shipId || !year || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: 'shipId, year, and amount are required'
        });
      }

      const result = await this.bankingService.applyBanked(
        shipId,
        parseInt(year),
        parseFloat(amount)
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
