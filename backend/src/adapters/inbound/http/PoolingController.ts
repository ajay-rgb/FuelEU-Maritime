import { Request, Response } from 'express';
import { PoolingService } from '../../../core/application/PoolingService';

export class PoolingController {
  constructor(private poolingService: PoolingService) {}

  async createPool(req: Request, res: Response) {
    try {
      const { year, members } = req.body;
      
      if (!year || !members || !Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: 'year and members array are required'
        });
      }

      const result = await this.poolingService.createPool({
        year: parseInt(year),
        members
      });

      if (!result.isValid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: result
        });
      }

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

  async validatePool(req: Request, res: Response) {
    try {
      const { members } = req.body;
      
      if (!members || !Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          message: 'members array is required'
        });
      }

      const validation = this.poolingService.validatePool(members);

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
}
