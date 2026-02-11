// SPEC-F-005: Union Controller

import { Request, Response, NextFunction } from 'express';
import { UnionService } from '../services/union.service';

const unionService = new UnionService();

export class UnionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const unions = await unionService.getAll();

      res.json({
        success: true,
        data: unions
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const union = await unionService.create(req.body);

      res.status(201).json({
        success: true,
        data: union,
        message: 'Union créée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const union = await unionService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: union,
        message: 'Union mise à jour'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await unionService.delete(req.params.id);

      res.json({
        success: true,
        message: 'Union supprimée'
      });
    } catch (error) {
      next(error);
    }
  }
}
