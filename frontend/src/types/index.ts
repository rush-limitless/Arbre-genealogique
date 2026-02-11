// SPEC-F-001: Types TypeScript

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  biography?: string;
  profession?: string;
  email?: string;
  phone?: string;
  profilePhotoUrl?: string;
  isAlive: boolean;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonDetail extends Person {
  parents: PersonRelation[];
  children: PersonRelation[];
  unions: Union[];
}

export interface PersonRelation {
  id: string;
  firstName: string;
  lastName: string;
  relationshipType: string;
}

export interface Relationship {
  id: string;
  parentId: string;
  childId: string;
  relationshipType: 'biological' | 'adoptive' | 'legal';
}

export interface Union {
  id: string;
  person1Id: string;
  person2Id: string;
  unionType: 'marriage' | 'pacs' | 'partnership';
  startDate?: string;
  endDate?: string;
  location?: string;
  status: 'active' | 'divorced' | 'separated' | 'ended';
  partner?: PersonRelation;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  persons: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
