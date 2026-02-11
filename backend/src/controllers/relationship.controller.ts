// SPEC-F-004: Relationship Controller

import { Request, Response, NextFunction } from 'express';
import { RelationshipService } from '../services/relationship.service';
import { AppError } from '../middleware/error.middleware';

const relationshipService = new RelationshipService();

export class RelationshipController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const relationship = await relationshipService.create(req.body);

      res.status(201).json({
        success: true,
        data: relationship,
        message: 'Relation créée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await relationshipService.delete(req.params.id);

      res.json({
        success: true,
        message: 'Relation supprimée'
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const relationships = await relationshipService.getByPerson(req.params.personId);

      res.json({
        success: true,
        data: relationships
      });
    } catch (error) {
      next(error);
    }
  }
}
