// SPEC-F-001: Créer une Personne - Controller

import { Request, Response, NextFunction } from 'express';
import { PersonService } from '../services/person.service';
import { AppError } from '../middleware/error.middleware';

const personService = new PersonService();

export class PersonController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;

      const result = await personService.getAll(page, limit, search);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const person = await personService.getById(req.params.id);
      
      if (!person) {
        throw new AppError('Personne non trouvée', 404);
      }

      res.json({
        success: true,
        data: person
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const person = await personService.create(req.body);

      res.status(201).json({
        success: true,
        data: person,
        message: 'Personne créée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const person = await personService.update(req.params.id, req.body);

      res.json({
        success: true,
        data: person,
        message: 'Personne mise à jour'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await personService.delete(req.params.id);

      res.json({
        success: true,
        message: 'Personne supprimée'
      });
    } catch (error) {
      next(error);
    }
  }
}
