# 🌳 Arbre Généalogique - Guide de Démarrage

## ✅ Ce qui a été développé

### Backend (Node.js + Express + TypeScript + Prisma)
- ✅ Serveur Express configuré
- ✅ Schéma Prisma complet (7 modèles)
- ✅ API REST pour les personnes (CRUD complet)
- ✅ Gestion d'erreurs
- ✅ Structure modulaire (controllers, services, routes)

### Frontend (React + TypeScript + Tailwind)
- ✅ Application React avec Vite
- ✅ Routing (React Router)
- ✅ 3 pages principales :
  - HomePage : Liste des personnes
  - CreatePersonPage : Formulaire de création
  - PersonDetailPage : Détails d'une personne
- ✅ Composants :
  - PersonForm : Formulaire avec validation Zod
  - PersonCard : Carte personne
- ✅ Service API (Axios)
- ✅ Types TypeScript complets
- ✅ Tailwind CSS configuré

## 🚀 Installation et Démarrage

### 1. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et configurer votre base de données PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/arbre_genealogique"

# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et les tables
npm run prisma:migrate

# Démarrer le serveur
npm run dev
```

Le backend sera disponible sur **http://localhost:3000**

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm run dev
```

Le frontend sera disponible sur **http://localhost:5173**

## 📦 Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

## 🗄️ Configuration PostgreSQL

```bash
# Installer PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE arbre_genealogique;
CREATE USER votre_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE arbre_genealogique TO votre_user;
\q
```

## 🧪 Tester l'API

```bash
# Health check
curl http://localhost:3000/health

# Créer une personne
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Dupont",
    "gender": "female",
    "birthDate": "1950-05-15",
    "birthPlace": "Paris, France"
  }'

# Lister les personnes
curl http://localhost:3000/api/persons
```

## 📁 Structure du Projet

```
arbre-genealogique/
├── backend/
│   ├── src/
│   │   ├── controllers/     ✅ PersonController
│   │   ├── services/        ✅ PersonService
│   │   ├── routes/          ✅ Routes API
│   │   ├── middleware/      ✅ Error handling
│   │   └── index.ts         ✅ Server
│   ├── prisma/
│   │   └── schema.prisma    ✅ Schéma DB
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      ✅ PersonForm, PersonCard
│   │   ├── pages/           ✅ Home, Create, Detail
│   │   ├── services/        ✅ API service
│   │   ├── types/           ✅ TypeScript types
│   │   ├── App.tsx          ✅ Router
│   │   └── main.tsx         ✅ Entry point
│   └── package.json
│
└── docs/                     ✅ Spécifications complètes
```

## 🎯 Fonctionnalités Implémentées

### SPEC-F-001 : Créer une Personne ✅
- Formulaire complet avec validation
- Champs : prénom, nom, sexe, dates, lieu, profession, biographie
- Validation Zod côté frontend
- Validation métier côté backend

### SPEC-F-002 : Modifier une Personne ✅
- Service backend prêt
- À implémenter : page d'édition frontend

### SPEC-F-003 : Supprimer une Personne ✅
- Soft delete implémenté
- Bouton de suppression avec confirmation

### SPEC-F-007 : Fiche Détaillée ✅
- Affichage complet des informations
- Relations (parents, enfants, unions)
- Navigation entre personnes

### SPEC-F-008 : Recherche ✅
- Recherche en temps réel
- Filtrage par nom/prénom

## 🔜 Prochaines Étapes

### Phase 1 - À compléter
- [ ] SPEC-F-004 : Relations parent-enfant
- [ ] SPEC-F-005 : Unions/Mariages
- [ ] SPEC-F-006 : Arbre interactif (D3.js)
- [ ] SPEC-F-014 : Authentification JWT

### Phase 2
- [ ] Upload de photos
- [ ] Export PDF/GEDCOM
- [ ] Statistiques

## 🐛 Dépannage

### Erreur de connexion à la base de données
Vérifiez que PostgreSQL est démarré et que DATABASE_URL est correct dans `.env`

### Port déjà utilisé
Changez le PORT dans `.env` (backend) ou dans `vite.config.ts` (frontend)

### Erreur CORS
Vérifiez que CORS_ORIGIN dans `.env` correspond à l'URL du frontend

## 📚 Documentation

Consultez les fichiers dans `/docs` :
- `SPECIFICATIONS.md` - Specs complètes
- `API.md` - Documentation API
- `USER_STORIES.md` - User stories
- `ARCHITECTURE.md` - Architecture

---

**Développé avec la méthodologie Spec-Driven Development** 🚀
