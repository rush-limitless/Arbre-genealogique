# Spécifications - Application Arbre Généalogique

## 1. Vue d'Ensemble du Projet

### 1.1 Objectif
Créer une application web moderne permettant de visualiser, gérer et explorer l'arbre généalogique d'une famille nombreuse.

### 1.2 Méthodologie
**Spec-Driven Development (SDD)** - Développement piloté par les spécifications
- Spécifications complètes avant le code
- Documentation vivante
- Tests basés sur les specs
- Validation continue

### 1.3 Stack Technique
- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **Visualisation**: D3.js / React Flow
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT
- **Stockage fichiers**: AWS S3 / Local
- **Tests**: Jest + React Testing Library
- **Build**: Vite

---

## 2. Spécifications Fonctionnelles

### 2.1 Gestion des Personnes

#### SPEC-F-001: Créer une Personne
**Priorité**: Haute  
**Description**: L'utilisateur peut ajouter une nouvelle personne à l'arbre généalogique.

**Données requises**:
- Prénom (obligatoire)
- Nom de famille (obligatoire)
- Sexe (obligatoire: Homme/Femme/Autre)
- Date de naissance (optionnel)
- Lieu de naissance (optionnel)
- Date de décès (optionnel)
- Lieu de décès (optionnel)
- Photo de profil (optionnel)
- Biographie (optionnel, texte riche)
- Profession (optionnel)
- Email (optionnel)
- Téléphone (optionnel)

**Règles métier**:
- Le prénom et nom ne peuvent pas être vides
- La date de décès doit être postérieure à la date de naissance
- L'âge est calculé automatiquement
- Format de date: JJ/MM/AAAA

**Critères d'acceptation**:
- [ ] Formulaire de création accessible
- [ ] Validation des champs obligatoires
- [ ] Message de confirmation après création
- [ ] Redirection vers la fiche de la personne
- [ ] Photo uploadée et redimensionnée automatiquement

---

#### SPEC-F-002: Modifier une Personne
**Priorité**: Haute  
**Description**: L'utilisateur peut modifier les informations d'une personne existante.

**Critères d'acceptation**:
- [ ] Formulaire pré-rempli avec les données existantes
- [ ] Sauvegarde automatique (debounce 2s)
- [ ] Historique des modifications
- [ ] Possibilité d'annuler les modifications

---

#### SPEC-F-003: Supprimer une Personne
**Priorité**: Moyenne  
**Description**: L'utilisateur peut supprimer une personne de l'arbre.

**Règles métier**:
- Suppression logique (soft delete)
- Conservation des relations pour l'historique
- Confirmation obligatoire avec avertissement

**Critères d'acceptation**:
- [ ] Modal de confirmation avec détails des impacts
- [ ] Option de suppression définitive (admin uniquement)
- [ ] Les relations sont marquées comme inactives

---

### 2.2 Gestion des Relations

#### SPEC-F-004: Définir une Relation Parent-Enfant
**Priorité**: Haute  
**Description**: L'utilisateur peut établir une relation de filiation.

**Types de relations**:
- Parent biologique
- Parent adoptif
- Tuteur légal

**Règles métier**:
- Une personne peut avoir 0 à 2 parents biologiques
- Une personne peut avoir plusieurs parents adoptifs
- Validation de cohérence des dates (parent né avant enfant)
- Détection automatique de cycles impossibles

**Critères d'acceptation**:
- [ ] Interface drag & drop pour lier les personnes
- [ ] Recherche rapide de personnes
- [ ] Validation des contraintes
- [ ] Affichage visuel des types de relations

---

#### SPEC-F-005: Définir une Union (Mariage/Partenariat)
**Priorité**: Haute  
**Description**: L'utilisateur peut créer une union entre deux personnes.

**Données**:
- Type d'union (Mariage, PACS, Union libre, Divorcé, Séparé)
- Date de début
- Date de fin (optionnel)
- Lieu (optionnel)
- Enfants communs

**Règles métier**:
- Une personne peut avoir plusieurs unions (successives ou simultanées)
- Les enfants peuvent être associés à une union
- Calcul automatique de la durée

**Critères d'acceptation**:
- [ ] Création d'union entre deux personnes
- [ ] Gestion des unions multiples
- [ ] Timeline des unions
- [ ] Association automatique des enfants

---

### 2.3 Visualisation de l'Arbre

#### SPEC-F-006: Vue Arbre Interactif
**Priorité**: Haute  
**Description**: Affichage graphique de l'arbre généalogique avec navigation interactive.

**Fonctionnalités**:
- Zoom/Dézoom
- Pan (déplacement)
- Centrage sur une personne
- Expansion/Collapse des branches
- Filtres (génération, branche, vivants/décédés)
- Recherche visuelle

**Modes d'affichage**:
- Vue descendante (ancêtres → descendants)
- Vue ascendante (descendants → ancêtres)
- Vue horizontale
- Vue compacte

**Critères d'acceptation**:
- [ ] Arbre responsive et fluide (60 fps)
- [ ] Navigation intuitive
- [ ] Indicateurs visuels (âge, statut, photo)
- [ ] Tooltips informatifs au survol
- [ ] Performance optimale jusqu'à 1000+ personnes

---

#### SPEC-F-007: Fiche Détaillée d'une Personne
**Priorité**: Haute  
**Description**: Vue détaillée avec toutes les informations d'une personne.

**Sections**:
- Informations personnelles
- Photo et galerie
- Relations (parents, enfants, unions)
- Timeline de vie
- Documents attachés
- Notes et anecdotes

**Critères d'acceptation**:
- [ ] Design moderne et lisible
- [ ] Navigation rapide entre personnes liées
- [ ] Édition inline des informations
- [ ] Partage de la fiche (lien, PDF)

---

### 2.4 Recherche et Filtres

#### SPEC-F-008: Recherche Globale
**Priorité**: Haute  
**Description**: Recherche rapide dans toute la base de données.

**Critères de recherche**:
- Nom, prénom
- Date de naissance
- Lieu
- Profession
- Recherche floue (typos)

**Critères d'acceptation**:
- [ ] Résultats instantanés (< 100ms)
- [ ] Suggestions automatiques
- [ ] Filtres avancés
- [ ] Historique de recherche

---

#### SPEC-F-009: Filtres Avancés
**Priorité**: Moyenne  
**Description**: Filtrage multi-critères de l'arbre.

**Filtres disponibles**:
- Par génération
- Par branche familiale
- Par période (siècle, décennie)
- Par lieu géographique
- Vivants/Décédés
- Avec/Sans photo

**Critères d'acceptation**:
- [ ] Combinaison de filtres
- [ ] Sauvegarde des filtres favoris
- [ ] Export des résultats filtrés

---

### 2.5 Médias et Documents

#### SPEC-F-010: Galerie Photos
**Priorité**: Moyenne  
**Description**: Gestion des photos familiales.

**Fonctionnalités**:
- Upload multiple
- Tag de personnes sur les photos
- Organisation par événement/date
- Diaporama
- Téléchargement

**Critères d'acceptation**:
- [ ] Upload drag & drop
- [ ] Compression automatique
- [ ] Reconnaissance faciale (optionnel)
- [ ] Partage de galeries

---

#### SPEC-F-011: Documents et Certificats
**Priorité**: Basse  
**Description**: Stockage de documents officiels.

**Types de documents**:
- Actes de naissance
- Actes de mariage
- Actes de décès
- Certificats
- Lettres, correspondances

**Critères d'acceptation**:
- [ ] Upload sécurisé
- [ ] Prévisualisation PDF
- [ ] OCR pour extraction de données (optionnel)
- [ ] Contrôle d'accès par document

---

### 2.6 Statistiques et Rapports

#### SPEC-F-012: Statistiques Familiales
**Priorité**: Basse  
**Description**: Visualisation de statistiques sur la famille.

**Statistiques**:
- Nombre total de personnes
- Répartition par génération
- Âge moyen
- Espérance de vie
- Lieux de naissance (carte)
- Professions les plus courantes
- Prénoms populaires

**Critères d'acceptation**:
- [ ] Graphiques interactifs
- [ ] Export en PDF/Excel
- [ ] Mise à jour en temps réel

---

#### SPEC-F-013: Export de l'Arbre
**Priorité**: Moyenne  
**Description**: Export de l'arbre dans différents formats.

**Formats supportés**:
- PDF (haute qualité)
- PNG/SVG
- GEDCOM (standard généalogique)
- JSON (backup)

**Critères d'acceptation**:
- [ ] Personnalisation du design
- [ ] Sélection de branches spécifiques
- [ ] Qualité d'impression optimale

---

### 2.7 Collaboration et Partage

#### SPEC-F-014: Gestion des Utilisateurs
**Priorité**: Haute  
**Description**: Système multi-utilisateurs avec rôles.

**Rôles**:
- **Admin**: Tous les droits
- **Éditeur**: Ajout/modification
- **Lecteur**: Consultation uniquement
- **Invité**: Accès limité à certaines branches

**Critères d'acceptation**:
- [ ] Inscription/Connexion sécurisée
- [ ] Gestion des permissions
- [ ] Invitation par email
- [ ] Logs d'activité

---

#### SPEC-F-015: Notifications
**Priorité**: Basse  
**Description**: Système de notifications pour les événements.

**Types de notifications**:
- Anniversaires
- Modifications importantes
- Nouveaux membres ajoutés
- Commentaires/mentions

**Critères d'acceptation**:
- [ ] Notifications in-app
- [ ] Notifications email (optionnel)
- [ ] Préférences personnalisables

---

## 3. Spécifications Techniques

### 3.1 Architecture

#### SPEC-T-001: Architecture Globale
**Type**: Microservices légers

```
┌─────────────┐
│   Client    │ (React + TypeScript)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS/WSS
       │
┌──────▼──────────────────────┐
│     API Gateway             │
│   (Express + TypeScript)    │
└──────┬──────────────────────┘
       │
   ┌───┴────┬─────────┬────────┐
   │        │         │        │
┌──▼──┐ ┌──▼──┐  ┌───▼───┐ ┌──▼──┐
│Auth │ │User │  │Family │ │Media│
│Svc  │ │Svc  │  │ Svc   │ │ Svc │
└──┬──┘ └──┬──┘  └───┬───┘ └──┬──┘
   │       │         │        │
   └───────┴─────────┴────────┘
              │
        ┌─────▼─────┐
        │PostgreSQL │
        └───────────┘
```

---

#### SPEC-T-002: Base de Données

**Schéma Principal**:

```sql
-- Personnes
CREATE TABLE persons (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  maiden_name VARCHAR(100),
  gender VARCHAR(20) NOT NULL,
  birth_date DATE,
  birth_place VARCHAR(255),
  death_date DATE,
  death_place VARCHAR(255),
  biography TEXT,
  profession VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  profile_photo_url VARCHAR(500),
  is_alive BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Relations parent-enfant
CREATE TABLE relationships (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES persons(id),
  child_id UUID REFERENCES persons(id),
  relationship_type VARCHAR(50), -- biological, adoptive, legal
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unions (mariages, partenariats)
CREATE TABLE unions (
  id UUID PRIMARY KEY,
  person1_id UUID REFERENCES persons(id),
  person2_id UUID REFERENCES persons(id),
  union_type VARCHAR(50), -- marriage, pacs, partnership
  start_date DATE,
  end_date DATE,
  location VARCHAR(255),
  status VARCHAR(50), -- active, divorced, separated, ended
  created_at TIMESTAMP DEFAULT NOW()
);

-- Médias
CREATE TABLE media (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES persons(id),
  media_type VARCHAR(50), -- photo, document, video
  file_url VARCHAR(500),
  title VARCHAR(255),
  description TEXT,
  date_taken DATE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags de personnes sur photos
CREATE TABLE media_tags (
  id UUID PRIMARY KEY,
  media_id UUID REFERENCES media(id),
  person_id UUID REFERENCES persons(id),
  x_position FLOAT,
  y_position FLOAT
);

-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50), -- admin, editor, reader, guest
  person_id UUID REFERENCES persons(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Événements/Timeline
CREATE TABLE events (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES persons(id),
  event_type VARCHAR(50), -- birth, death, marriage, education, career
  title VARCHAR(255),
  description TEXT,
  event_date DATE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_persons_name ON persons(last_name, first_name);
CREATE INDEX idx_persons_birth ON persons(birth_date);
CREATE INDEX idx_relationships_parent ON relationships(parent_id);
CREATE INDEX idx_relationships_child ON relationships(child_id);
CREATE INDEX idx_unions_persons ON unions(person1_id, person2_id);
```

---

#### SPEC-T-003: API REST

**Endpoints principaux**:

```
# Authentification
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Personnes
GET    /api/persons              # Liste avec pagination
GET    /api/persons/:id          # Détails
POST   /api/persons              # Créer
PUT    /api/persons/:id          # Modifier
DELETE /api/persons/:id          # Supprimer
GET    /api/persons/:id/tree     # Arbre de la personne
GET    /api/persons/:id/timeline # Timeline

# Relations
POST   /api/relationships        # Créer relation
DELETE /api/relationships/:id    # Supprimer relation
GET    /api/persons/:id/parents
GET    /api/persons/:id/children

# Unions
POST   /api/unions               # Créer union
PUT    /api/unions/:id           # Modifier
DELETE /api/unions/:id           # Supprimer
GET    /api/persons/:id/unions

# Médias
POST   /api/media/upload         # Upload fichier
GET    /api/media/:id
DELETE /api/media/:id
POST   /api/media/:id/tag        # Tag personne

# Recherche
GET    /api/search?q=...         # Recherche globale
GET    /api/search/advanced      # Recherche avancée

# Statistiques
GET    /api/stats/overview
GET    /api/stats/generations
GET    /api/stats/locations

# Export
GET    /api/export/gedcom
GET    /api/export/pdf
GET    /api/export/json
```

**Format de réponse standard**:
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2026-02-10T23:00:00Z"
}
```

---

#### SPEC-T-004: Sécurité

**Mesures de sécurité**:
- HTTPS obligatoire
- JWT avec refresh tokens
- Rate limiting (100 req/min par IP)
- Validation des entrées (Zod)
- Sanitization XSS
- CORS configuré
- Helmet.js pour headers sécurisés
- Bcrypt pour mots de passe (12 rounds)
- CSRF protection
- SQL injection prevention (Prisma ORM)

---

#### SPEC-T-005: Performance

**Objectifs**:
- Temps de chargement initial: < 2s
- Time to Interactive: < 3s
- Rendu de l'arbre (100 personnes): < 500ms
- Recherche: < 100ms
- Upload photo: < 5s

**Optimisations**:
- Code splitting
- Lazy loading des composants
- Image optimization (WebP)
- CDN pour assets statiques
- Cache Redis pour queries fréquentes
- Pagination (50 items/page)
- Virtualisation des listes longues
- Service Worker pour offline

---

### 3.2 Frontend

#### SPEC-T-006: Structure des Composants React

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── person/
│   │   ├── PersonCard.tsx
│   │   ├── PersonForm.tsx
│   │   ├── PersonDetail.tsx
│   │   └── PersonTimeline.tsx
│   ├── tree/
│   │   ├── FamilyTree.tsx
│   │   ├── TreeNode.tsx
│   │   ├── TreeControls.tsx
│   │   └── TreeFilters.tsx
│   ├── media/
│   │   ├── PhotoGallery.tsx
│   │   ├── PhotoUpload.tsx
│   │   └── PhotoTagger.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── pages/
│   ├── Home.tsx
│   ├── TreeView.tsx
│   ├── PersonPage.tsx
│   ├── Search.tsx
│   ├── Statistics.tsx
│   └── Settings.tsx
├── hooks/
│   ├── usePersons.ts
│   ├── useTree.ts
│   ├── useAuth.ts
│   └── useMedia.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── storage.ts
├── store/
│   ├── personSlice.ts
│   ├── treeSlice.ts
│   └── authSlice.ts
├── types/
│   └── index.ts
└── utils/
    ├── dateUtils.ts
    ├── treeUtils.ts
    └── validators.ts
```

---

#### SPEC-T-007: Design System

**Palette de couleurs**:
```css
:root {
  --primary: #3B82F6;      /* Bleu */
  --secondary: #8B5CF6;    /* Violet */
  --success: #10B981;      /* Vert */
  --warning: #F59E0B;      /* Orange */
  --error: #EF4444;        /* Rouge */
  --background: #F9FAFB;   /* Gris clair */
  --surface: #FFFFFF;      /* Blanc */
  --text-primary: #111827; /* Noir */
  --text-secondary: #6B7280; /* Gris */
}
```

**Typographie**:
- Font principale: Inter
- Font titres: Poppins
- Tailles: 12px, 14px, 16px, 18px, 24px, 32px, 48px

---

## 4. Spécifications de Tests

### 4.1 Tests Unitaires

#### SPEC-TEST-001: Couverture de Code
**Objectif**: 80% minimum

**Priorités**:
- Logique métier: 100%
- Composants React: 80%
- Utilitaires: 90%
- API endpoints: 100%

---

#### SPEC-TEST-002: Tests des Composants

**Exemple - PersonCard.test.tsx**:
```typescript
describe('PersonCard', () => {
  it('affiche le nom complet', () => {});
  it('affiche la photo de profil', () => {});
  it('affiche l\'âge calculé', () => {});
  it('gère le clic sur la carte', () => {});
  it('affiche le badge décédé si applicable', () => {});
});
```

---

### 4.2 Tests d'Intégration

#### SPEC-TEST-003: Scénarios Utilisateur

**Scénario 1**: Créer une personne et l'ajouter à l'arbre
```
1. Se connecter
2. Cliquer sur "Ajouter une personne"
3. Remplir le formulaire
4. Sauvegarder
5. Vérifier que la personne apparaît dans l'arbre
```

---

### 4.3 Tests E2E

#### SPEC-TEST-004: Tests Cypress

**Tests critiques**:
- Parcours complet d'ajout de personne
- Navigation dans l'arbre
- Recherche et filtres
- Upload de photo
- Export PDF

---

## 5. Spécifications de Déploiement

### 5.1 Environnements

#### SPEC-DEPLOY-001: Environnements

- **Development**: Local
- **Staging**: Serveur de test
- **Production**: Serveur principal

---

### 5.2 CI/CD

#### SPEC-DEPLOY-002: Pipeline

```yaml
1. Commit → GitHub
2. Tests automatiques (Jest, Cypress)
3. Build (Vite)
4. Analyse de code (ESLint, SonarQube)
5. Deploy staging (auto)
6. Tests E2E staging
7. Deploy production (manuel)
```

---

## 6. Planning et Priorités

### Phase 1 - MVP (4 semaines)
- [ ] SPEC-F-001: Créer personne
- [ ] SPEC-F-002: Modifier personne
- [ ] SPEC-F-004: Relations parent-enfant
- [ ] SPEC-F-006: Vue arbre basique
- [ ] SPEC-F-007: Fiche personne
- [ ] SPEC-F-014: Auth basique

### Phase 2 - Fonctionnalités Avancées (3 semaines)
- [ ] SPEC-F-005: Unions
- [ ] SPEC-F-008: Recherche
- [ ] SPEC-F-010: Galerie photos
- [ ] SPEC-F-013: Export

### Phase 3 - Améliorations (2 semaines)
- [ ] SPEC-F-009: Filtres avancés
- [ ] SPEC-F-012: Statistiques
- [ ] SPEC-F-015: Notifications
- [ ] Optimisations performance

---

## 7. Critères de Succès

### Métriques Techniques
- ✅ 80%+ couverture de tests
- ✅ Score Lighthouse > 90
- ✅ 0 vulnérabilités critiques
- ✅ Temps de réponse API < 200ms

### Métriques Utilisateur
- ✅ 100+ personnes dans l'arbre
- ✅ 5+ utilisateurs actifs
- ✅ Satisfaction > 4/5
- ✅ Taux d'adoption familiale > 70%

---

**Version**: 1.0  
**Date**: 10 février 2026  
**Statut**: Spécifications initiales  
**Prochaine révision**: Après validation
