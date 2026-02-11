// SPEC-F-010: Media Controller

import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/media.service';

const mediaService = new MediaService();

export class MediaController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'Aucun fichier fourni' }
        });
      }

      const media = await mediaService.upload(req.file, req.body);

      res.status(201).json({
        success: true,
        data: media,
        message: 'Photo uploadée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPerson(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getByPerson(req.params.personId);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await mediaService.delete(req.params.id);

      res.json({
        success: true,
        message: 'Photo supprimée'
      });
    } catch (error) {
      next(error);
    }
  }
}
