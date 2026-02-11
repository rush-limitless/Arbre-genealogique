// SPEC-F-010: Media Service

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export class MediaService {
  private uploadDir = './uploads';

  async getByPerson(personId: string) {
    return prisma.media.findMany({
      where: { personId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async upload(file: any, data: any) {
    // Créer le dossier uploads s'il n'existe pas
    await fs.mkdir(this.uploadDir, { recursive: true });

    // Générer un nom unique
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    // Redimensionner et optimiser l'image
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // Créer une miniature
    const thumbFilename = `thumb-${filename}`;
    const thumbPath = path.join(this.uploadDir, thumbFilename);
    
    await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // Enregistrer dans la base de données
    const media = await prisma.media.create({
      data: {
        personId: data.personId,
        mediaType: 'photo',
        fileUrl: `/uploads/${filename}`,
        title: data.title || file.originalname,
        description: data.description
      }
    });

    // Mettre à jour la photo de profil de la personne
    if (data.personId) {
      await prisma.person.update({
        where: { id: data.personId },
        data: { profilePhotoUrl: `/uploads/${filename}` }
      });
    }

    return media;
  }

  async delete(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    
    if (!media) {
      throw new AppError('Media non trouvé', 404);
    }

    // Supprimer le fichier
    try {
      const filepath = path.join('.', media.fileUrl);
      await fs.unlink(filepath);
      
      // Supprimer la miniature
      const thumbPath = filepath.replace(path.basename(filepath), `thumb-${path.basename(filepath)}`);
      await fs.unlink(thumbPath).catch(() => {});
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
    }

    // Supprimer de la base de données
    return prisma.media.delete({ where: { id } });
  }
}
