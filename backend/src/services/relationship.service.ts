// SPEC-F-004: Relationship Service

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class RelationshipService {
  async create(data: any) {
    // Validation
    if (!data.parentId || !data.childId) {
      throw new AppError('Parent et enfant sont obligatoires', 400);
    }

    if (data.parentId === data.childId) {
      throw new AppError('Une personne ne peut pas être son propre parent', 400);
    }

    // Vérifier que les personnes existent
    const [parent, child] = await Promise.all([
      prisma.person.findUnique({ where: { id: data.parentId } }),
      prisma.person.findUnique({ where: { id: data.childId } })
    ]);

    if (!parent || !child) {
      throw new AppError('Parent ou enfant non trouvé', 404);
    }

    // Vérifier les dates (parent né avant enfant)
    if (parent.birthDate && child.birthDate && parent.birthDate > child.birthDate) {
      throw new AppError('Le parent doit être né avant l\'enfant', 400);
    }

    // Créer la relation
    return prisma.relationship.create({
      data: {
        parentId: data.parentId,
        childId: data.childId,
        relationshipType: data.relationshipType || 'biological'
      },
      include: {
        parent: { select: { id: true, firstName: true, lastName: true } },
        child: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  async delete(id: string) {
    const relationship = await prisma.relationship.findUnique({ where: { id } });
    
    if (!relationship) {
      throw new AppError('Relation non trouvée', 404);
    }

    return prisma.relationship.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getByPerson(personId: string) {
    const [asParent, asChild] = await Promise.all([
      prisma.relationship.findMany({
        where: { parentId: personId, isActive: true },
        include: {
          child: { select: { id: true, firstName: true, lastName: true, birthDate: true } }
        }
      }),
      prisma.relationship.findMany({
        where: { childId: personId, isActive: true },
        include: {
          parent: { select: { id: true, firstName: true, lastName: true, birthDate: true } }
        }
      })
    ]);

    return { asParent, asChild };
  }
}
