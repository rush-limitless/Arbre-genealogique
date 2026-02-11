# Changelog

## [1.0.0] - 2026-02-11

### ✨ Fonctionnalités

#### Gestion des Personnes
- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Informations détaillées (dates, lieux, profession, biographie)
- Upload de photos de profil
- Galerie photos par personne
- Badges vivant/décédé
- Sélection multiple et suppression groupée

#### Relations Familiales
- Gestion des parents/enfants (biologiques, adoptifs)
- Gestion des unions (mariages, partenariats)
- Calcul automatique des générations
- Navigation fluide entre membres

#### Visualisations
- Arbre généalogique interactif avec React Flow
- Mode auto/manuel pour construire l'arbre
- Timeline des événements familiaux
- Statistiques détaillées (âge moyen, répartition par genre)
- Graphiques par décennie
- Carte des lieux de naissance

#### Interface Utilisateur
- Design moderne et responsive
- Mode sombre/clair avec persistance
- Recherche globale (Ctrl+K)
- Breadcrumb navigation
- Animations fluides
- Skeleton loaders
- Toast notifications

#### Import/Export
- Export GEDCOM (standard généalogie)
- Export CSV (Excel/Sheets)
- Export JSON (backup complet)

#### Authentification
- Système de connexion/inscription
- Gestion des rôles (admin, editor, viewer)
- Protection des routes
- JWT tokens

### 🛠️ Technique

#### Backend
- API REST avec Express + TypeScript
- Base de données SQLite avec Prisma ORM
- Upload de fichiers avec Multer
- Validation des données
- Gestion d'erreurs centralisée
- Tests unitaires avec Jest

#### Frontend
- React 18 avec TypeScript
- Vite pour le build
- Tailwind CSS pour le styling
- React Router pour la navigation
- React Flow pour l'arbre
- Recharts pour les graphiques
- Tests avec Vitest

### 📚 Documentation
- README complet avec badges
- Documentation API
- Spécifications techniques
- Architecture détaillée
- User stories
- Guide de démarrage
- Scripts d'installation automatique

### 🧪 Tests
- Tests backend (API, services)
- Tests frontend (composants)
- Scripts CI/CD
- Tests d'intégration

---

Format basé sur [Keep a Changelog](https://keepachangelog.com/)
