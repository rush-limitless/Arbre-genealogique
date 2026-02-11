# API Documentation - Arbre Généalogique

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.famille-arbre.com/api
```

## Authentication
Toutes les requêtes (sauf login/register) nécessitent un JWT token dans le header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "editor"
    },
    "token": "jwt_token_here"
  }
}
```

---

#### POST /auth/login
Se connecter.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

### Persons

#### GET /persons
Liste toutes les personnes avec pagination.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 50)
- `search` (optionnel)
- `isAlive` (optionnel: true/false)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "persons": [
      {
        "id": "uuid",
        "firstName": "Marie",
        "lastName": "Dupont",
        "gender": "female",
        "birthDate": "1950-05-15",
        "birthPlace": "Paris, France",
        "deathDate": null,
        "isAlive": true,
        "profilePhotoUrl": "https://...",
        "age": 75
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

---

#### GET /persons/:id
Détails d'une personne.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Marie",
    "lastName": "Dupont",
    "maidenName": "Martin",
    "gender": "female",
    "birthDate": "1950-05-15",
    "birthPlace": "Paris, France",
    "deathDate": null,
    "deathPlace": null,
    "biography": "Marie est née à Paris...",
    "profession": "Enseignante",
    "email": "marie@example.com",
    "phone": "+33612345678",
    "profilePhotoUrl": "https://...",
    "isAlive": true,
    "age": 75,
    "parents": [
      {
        "id": "uuid",
        "firstName": "Jean",
        "lastName": "Martin",
        "relationshipType": "biological"
      }
    ],
    "children": [...],
    "unions": [...],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-02-10T00:00:00Z"
  }
}
```

---

#### POST /persons
Créer une nouvelle personne.

**Request Body**:
```json
{
  "firstName": "Pierre",
  "lastName": "Dupont",
  "gender": "male",
  "birthDate": "1980-03-20",
  "birthPlace": "Lyon, France",
  "profession": "Médecin",
  "biography": "Pierre est médecin..."
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Pierre",
    ...
  },
  "message": "Personne créée avec succès"
}
```

---

#### PUT /persons/:id
Modifier une personne.

**Request Body**: Mêmes champs que POST (tous optionnels)

**Response** (200):
```json
{
  "success": true,
  "data": { ... },
  "message": "Personne mise à jour"
}
```

---

#### DELETE /persons/:id
Supprimer une personne (soft delete).

**Response** (200):
```json
{
  "success": true,
  "message": "Personne supprimée"
}
```

---

### Relationships

#### POST /relationships
Créer une relation parent-enfant.

**Request Body**:
```json
{
  "parentId": "uuid",
  "childId": "uuid",
  "relationshipType": "biological"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "parentId": "uuid",
    "childId": "uuid",
    "relationshipType": "biological"
  }
}
```

---

#### DELETE /relationships/:id
Supprimer une relation.

**Response** (200):
```json
{
  "success": true,
  "message": "Relation supprimée"
}
```

---

### Unions

#### POST /unions
Créer une union.

**Request Body**:
```json
{
  "person1Id": "uuid",
  "person2Id": "uuid",
  "unionType": "marriage",
  "startDate": "2000-06-15",
  "location": "Paris, France",
  "status": "active"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "person1Id": "uuid",
    "person2Id": "uuid",
    "unionType": "marriage",
    "startDate": "2000-06-15",
    "location": "Paris, France",
    "status": "active",
    "duration": "25 ans"
  }
}
```

---

### Tree

#### GET /persons/:id/tree
Obtenir l'arbre généalogique d'une personne.

**Query Parameters**:
- `depth` (default: 3) - Profondeur de l'arbre
- `direction` (default: both) - both/ancestors/descendants

**Response** (200):
```json
{
  "success": true,
  "data": {
    "root": {
      "id": "uuid",
      "firstName": "Marie",
      "lastName": "Dupont",
      "parents": [...],
      "children": [...],
      "level": 0
    },
    "stats": {
      "totalPersons": 45,
      "generations": 5,
      "maxDepth": 3
    }
  }
}
```

---

### Media

#### POST /media/upload
Upload un fichier média.

**Request**: multipart/form-data
```
file: <binary>
personId: uuid
title: "Photo de famille"
description: "Noël 2020"
dateTaken: "2020-12-25"
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileUrl": "https://cdn.../photo.jpg",
    "thumbnailUrl": "https://cdn.../photo_thumb.jpg",
    "title": "Photo de famille",
    "mediaType": "photo"
  }
}
```

---

#### GET /media/:id
Obtenir un média.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileUrl": "https://...",
    "title": "Photo de famille",
    "description": "Noël 2020",
    "dateTaken": "2020-12-25",
    "tags": [
      {
        "personId": "uuid",
        "personName": "Marie Dupont",
        "x": 0.3,
        "y": 0.5
      }
    ]
  }
}
```

---

### Search

#### GET /search
Recherche globale.

**Query Parameters**:
- `q` (required) - Terme de recherche
- `type` (optionnel) - person/media/all

**Response** (200):
```json
{
  "success": true,
  "data": {
    "persons": [...],
    "media": [...],
    "total": 15
  }
}
```

---

### Statistics

#### GET /stats/overview
Statistiques générales.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalPersons": 150,
    "totalAlive": 85,
    "totalDeceased": 65,
    "totalUnions": 45,
    "totalMedia": 320,
    "generations": 7,
    "averageAge": 52,
    "averageLifeExpectancy": 78
  }
}
```

---

#### GET /stats/generations
Répartition par génération.

**Response** (200):
```json
{
  "success": true,
  "data": [
    { "generation": 1, "count": 2 },
    { "generation": 2, "count": 8 },
    { "generation": 3, "count": 24 },
    ...
  ]
}
```

---

### Export

#### GET /export/gedcom
Exporter en format GEDCOM.

**Response** (200):
```
Content-Type: application/x-gedcom
Content-Disposition: attachment; filename="family_tree.ged"

0 HEAD
1 SOUR Arbre Généalogique
...
```

---

#### GET /export/pdf
Exporter l'arbre en PDF.

**Query Parameters**:
- `personId` (optionnel) - Centrer sur une personne
- `depth` (default: 3)

**Response** (200):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="arbre.pdf"

<binary PDF data>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": [
      {
        "field": "email",
        "message": "Email invalide"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token invalide ou expiré"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Permissions insuffisantes"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ressource non trouvée"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur serveur",
    "requestId": "uuid"
  }
}
```

---

## Rate Limiting

- **Limite**: 100 requêtes par minute par IP
- **Headers de réponse**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1644523200

**Dépassement** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Trop de requêtes",
    "retryAfter": 60
  }
}
```
