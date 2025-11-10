import { Request, Response } from 'express';
import { BorrowingService } from '../../../core/application/BorrowingService';

export class BorrowingController {
  constructor(private borrowingService: BorrowingService) {}

  async validateBorrowing(req: Request, res: Response) {
    try {
      const { shipId, year } = req.query;
      
      if (!shipId || !year) {
        return res.status(400).json({
          success: false,
          message: 'shipId and year are required'
        });
      }

      const validation = await this.borrowingService.validateBorrowing(
        shipId as string,
        parseInt(year as string)
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async borrowDeficit(req: Request, res: Response) {
    try {
      const { shipId, year } = req.body;
      
      if (!shipId || !year) {
        return res.status(400).json({
          success: false,
          message: 'shipId and year are required'
        });
      }

      const result = await this.borrowingService.borrowDeficit(
        shipId,
        parseInt(year)
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

  async getBorrowHistory(req: Request, res: Response) {
    try {
      const { shipId } = req.query;
      
      if (!shipId) {
        return res.status(400).json({
          success: false,
          message: 'shipId is required'
        });
      }

      const history = await this.borrowingService.getBorrowHistory(shipId as string);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
