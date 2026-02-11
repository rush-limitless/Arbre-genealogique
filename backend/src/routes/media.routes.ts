// SPEC-F-010: Media Routes

import { Router } from 'express';
import multer from 'multer';
import { MediaController } from '../controllers/media.controller';

const router = Router();
const controller = new MediaController();

// Configuration multer pour upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

router.post('/upload', upload.single('photo'), controller.upload.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
