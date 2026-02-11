// SPEC-F-005: Union Service

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class UnionService {
  async getAll() {
    return prisma.union.findMany({
      include: {
        person1: { select: { id: true, firstName: true, lastName: true } },
        person2: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    if (!data.person1Id || !data.person2Id) {
      throw new AppError('Les deux personnes sont obligatoires', 400);
    }

    if (data.person1Id === data.person2Id) {
      throw new AppError('Une personne ne peut pas être en union avec elle-même', 400);
    }

    const [person1, person2] = await Promise.all([
      prisma.person.findUnique({ where: { id: data.person1Id } }),
      prisma.person.findUnique({ where: { id: data.person2Id } })
    ]);

    if (!person1 || !person2) {
      throw new AppError('Une ou plusieurs personnes non trouvées', 404);
    }

    return prisma.union.create({
      data: {
        person1Id: data.person1Id,
        person2Id: data.person2Id,
        unionType: data.unionType || 'marriage',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        status: data.status || 'active'
      },
      include: {
        person1: { select: { id: true, firstName: true, lastName: true } },
        person2: { select: { id: true, firstName: true, lastName: true } }
      }
    });
  }

  async update(id: string, data: any) {
    const union = await prisma.union.findUnique({ where: { id } });
    
    if (!union) {
      throw new AppError('Union non trouvée', 404);
    }

    return prisma.union.update({
      where: { id },
      data: {
        unionType: data.unionType,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        status: data.status
      }
    });
  }

  async delete(id: string) {
    const union = await prisma.union.findUnique({ where: { id } });
    
    if (!union) {
      throw new AppError('Union non trouvée', 404);
    }

    return prisma.union.delete({ where: { id } });
  }
}
