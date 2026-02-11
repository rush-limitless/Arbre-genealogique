// SPEC-F-001: Créer une Personne - Service

import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class PersonService {
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } }
      ],
      isDeleted: false
    } : { isDeleted: false };

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          birthDate: true,
          birthPlace: true,
          deathDate: true,
          isAlive: true,
          profilePhotoUrl: true
        }
      }),
      prisma.person.count({ where })
    ]);

    return {
      persons: persons.map(p => ({
        ...p,
        age: this.calculateAge(p.birthDate, p.deathDate)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        asChild: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        asParent: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        unionsPerson1: {
          include: {
            person2: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        unionsPerson2: {
          include: {
            person1: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!person || person.isDeleted) {
      return null;
    }

    return {
      ...person,
      age: this.calculateAge(person.birthDate, person.deathDate),
      parents: person.asChild.map(r => ({
        ...r.parent,
        relationshipType: r.relationshipType
      })),
      children: person.asParent.map(r => ({
        ...r.child,
        relationshipType: r.relationshipType
      })),
      unions: [
        ...person.unionsPerson1.map(u => ({ ...u, partner: u.person2 })),
        ...person.unionsPerson2.map(u => ({ ...u, partner: u.person1 }))
      ]
    };
  }

  async create(data: any) {
    // Validation
    if (!data.firstName || !data.lastName || !data.gender) {
      throw new AppError('Prénom, nom et sexe sont obligatoires', 400);
    }

    if (data.deathDate && data.birthDate && new Date(data.deathDate) < new Date(data.birthDate)) {
      throw new AppError('La date de décès doit être postérieure à la date de naissance', 400);
    }

    return prisma.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        maidenName: data.maidenName,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        birthPlace: data.birthPlace,
        deathDate: data.deathDate ? new Date(data.deathDate) : null,
        deathPlace: data.deathPlace,
        biography: data.biography,
        profession: data.profession,
        email: data.email,
        phone: data.phone,
        profilePhotoUrl: data.profilePhotoUrl,
        isAlive: data.isAlive ?? true
      }
    });
  }

  async update(id: string, data: any) {
    const person = await prisma.person.findUnique({ where: { id } });
    
    if (!person || person.isDeleted) {
      throw new AppError('Personne non trouvée', 404);
    }

    return prisma.person.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        deathDate: data.deathDate ? new Date(data.deathDate) : undefined,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string) {
    const person = await prisma.person.findUnique({ where: { id } });
    
    if (!person) {
      throw new AppError('Personne non trouvée', 404);
    }

    // Soft delete
    return prisma.person.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async getAncestors(personId: string, maxGenerations: number = 10) {
    const ancestors: any[] = [];
    const visited = new Set<string>();

    const fetchAncestors = async (id: string, generation: number) => {
      if (generation > maxGenerations || visited.has(id)) return;
      visited.add(id);

      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          asChild: {
            include: {
              parent: true
            }
          }
        }
      });

      if (!person || person.isDeleted) return;

      if (generation > 0) {
        ancestors.push({
          ...person,
          generation,
          age: this.calculateAge(person.birthDate, person.deathDate)
        });
      }

      for (const rel of person.asChild) {
        await fetchAncestors(rel.parent.id, generation + 1);
      }
    };

    await fetchAncestors(personId, 0);
    return ancestors.sort((a, b) => b.generation - a.generation);
  }

  async getDescendants(personId: string, maxGenerations: number = 10) {
    const descendants: any[] = [];
    const visited = new Set<string>();

    const fetchDescendants = async (id: string, generation: number) => {
      if (generation > maxGenerations || visited.has(id)) return;
      visited.add(id);

      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          asParent: {
            include: {
              child: true
            }
          }
        }
      });

      if (!person || person.isDeleted) return;

      if (generation > 0) {
        descendants.push({
          ...person,
          generation,
          age: this.calculateAge(person.birthDate, person.deathDate)
        });
      }

      for (const rel of person.asParent) {
        await fetchDescendants(rel.child.id, generation + 1);
      }
    };

    await fetchDescendants(personId, 0);
    return descendants.sort((a, b) => a.generation - b.generation);
  }

  private calculateAge(birthDate: Date | null, deathDate: Date | null): number | null {
    if (!birthDate) return null;
    
    const endDate = deathDate || new Date();
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }
}
