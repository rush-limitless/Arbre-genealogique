# User Stories - Arbre Généalogique

## Personas

### 1. Marie (Admin Familiale)
- 55 ans, retraitée
- Passionnée de généalogie
- Veut centraliser toutes les informations familiales
- Niveau technique: Moyen

### 2. Thomas (Membre Actif)
- 32 ans, ingénieur
- Veut contribuer et ajouter des informations
- Niveau technique: Élevé

### 3. Sophie (Consultante)
- 28 ans, étudiante
- Veut juste consulter l'arbre
- Niveau technique: Basique

---

## Epic 1: Gestion des Personnes

### US-001: Ajouter un Membre de la Famille
**En tant que** Marie  
**Je veux** ajouter une nouvelle personne à l'arbre  
**Afin de** compléter la généalogie familiale

**Critères d'acceptation**:
- Je peux remplir un formulaire avec nom, prénom, dates
- Je peux uploader une photo
- La personne apparaît immédiatement dans l'arbre
- Je reçois une confirmation

**Priorité**: Haute  
**Estimation**: 5 points

---

### US-002: Modifier les Informations d'une Personne
**En tant que** Thomas  
**Je veux** corriger ou compléter les informations d'une personne  
**Afin de** maintenir l'exactitude des données

**Critères d'acceptation**:
- Je peux éditer tous les champs
- Les modifications sont sauvegardées automatiquement
- Un historique des modifications est conservé

**Priorité**: Haute  
**Estimation**: 3 points

---

### US-003: Voir la Fiche Détaillée
**En tant que** Sophie  
**Je veux** voir toutes les informations d'une personne  
**Afin de** découvrir son histoire

**Critères d'acceptation**:
- J'accède à la fiche en cliquant sur une personne
- Je vois photo, dates, biographie, relations
- Je peux naviguer vers les personnes liées

**Priorité**: Haute  
**Estimation**: 3 points

---

## Epic 2: Relations Familiales

### US-004: Lier un Parent et un Enfant
**En tant que** Marie  
**Je veux** établir une relation parent-enfant  
**Afin de** construire l'arbre généalogique

**Critères d'acceptation**:
- Je peux sélectionner deux personnes
- Je définis le type de relation (biologique, adoptif)
- La relation apparaît visuellement dans l'arbre

**Priorité**: Haute  
**Estimation**: 5 points

---

### US-005: Créer une Union
**En tant que** Marie  
**Je veux** enregistrer un mariage ou partenariat  
**Afin de** documenter les unions familiales

**Critères d'acceptation**:
- Je peux lier deux personnes en union
- Je peux ajouter date et lieu
- Les enfants communs sont associés automatiquement

**Priorité**: Haute  
**Estimation**: 5 points

---

## Epic 3: Visualisation

### US-006: Explorer l'Arbre Interactif
**En tant que** Sophie  
**Je veux** naviguer visuellement dans l'arbre  
**Afin de** découvrir ma famille

**Critères d'acceptation**:
- Je peux zoomer et déplacer l'arbre
- Je peux cliquer sur une personne pour voir ses détails
- L'arbre est fluide et responsive

**Priorité**: Haute  
**Estimation**: 8 points

---

### US-007: Filtrer l'Arbre
**En tant que** Thomas  
**Je veux** filtrer l'arbre par critères  
**Afin de** me concentrer sur une branche spécifique

**Critères d'acceptation**:
- Je peux filtrer par génération, lieu, période
- Les filtres se combinent
- L'arbre se met à jour instantanément

**Priorité**: Moyenne  
**Estimation**: 5 points

---

## Epic 4: Recherche

### US-008: Rechercher une Personne
**En tant que** Sophie  
**Je veux** rechercher rapidement une personne  
**Afin de** la trouver dans l'arbre

**Critères d'acceptation**:
- Je tape un nom dans la barre de recherche
- Les résultats apparaissent instantanément
- Je peux cliquer pour centrer l'arbre sur la personne

**Priorité**: Haute  
**Estimation**: 3 points

---

## Epic 5: Médias

### US-009: Ajouter des Photos
**En tant que** Marie  
**Je veux** uploader des photos de famille  
**Afin de** enrichir l'arbre avec des souvenirs

**Critères d'acceptation**:
- Je peux uploader plusieurs photos à la fois
- Je peux taguer les personnes présentes
- Les photos sont organisées par date/événement

**Priorité**: Moyenne  
**Estimation**: 5 points

---

### US-010: Voir la Galerie
**En tant que** Sophie  
**Je veux** parcourir toutes les photos  
**Afin de** découvrir les souvenirs familiaux

**Critères d'acceptation**:
- Je vois une galerie avec toutes les photos
- Je peux filtrer par personne ou événement
- Je peux lancer un diaporama

**Priorité**: Basse  
**Estimation**: 3 points

---

## Epic 6: Export et Partage

### US-011: Exporter l'Arbre en PDF
**En tant que** Marie  
**Je veux** exporter l'arbre en PDF  
**Afin de** l'imprimer et le partager

**Critères d'acceptation**:
- Je peux choisir quelle branche exporter
- Le PDF est de haute qualité
- Je peux personnaliser le design

**Priorité**: Moyenne  
**Estimation**: 5 points

---

### US-012: Partager une Branche
**En tant que** Thomas  
**Je veux** partager une partie de l'arbre  
**Afin de** la montrer à des proches

**Critères d'acceptation**:
- Je génère un lien de partage
- Le lien donne accès en lecture seule
- Je peux définir une date d'expiration

**Priorité**: Basse  
**Estimation**: 3 points

---

## Epic 7: Statistiques

### US-013: Voir les Statistiques Familiales
**En tant que** Marie  
**Je veux** voir des statistiques sur la famille  
**Afin de** découvrir des tendances intéressantes

**Critères d'acceptation**:
- Je vois le nombre total de personnes
- Je vois la répartition par génération
- Je vois une carte des lieux de naissance

**Priorité**: Basse  
**Estimation**: 5 points

---

## Epic 8: Collaboration

### US-014: Inviter un Membre
**En tant que** Marie  
**Je veux** inviter d'autres membres de la famille  
**Afin de** collaborer sur l'arbre

**Critères d'acceptation**:
- J'envoie une invitation par email
- Je définis le rôle (admin, éditeur, lecteur)
- La personne peut s'inscrire via le lien

**Priorité**: Haute  
**Estimation**: 5 points

---

### US-015: Recevoir des Notifications
**En tant que** Thomas  
**Je veux** être notifié des changements  
**Afin de** rester informé de l'activité

**Critères d'acceptation**:
- Je reçois une notification quand quelqu'un ajoute une personne
- Je reçois une notification pour les anniversaires
- Je peux configurer mes préférences

**Priorité**: Basse  
**Estimation**: 3 points

---

## Backlog Priorisé

### Sprint 1 (MVP)
1. US-001: Ajouter un membre (5pts)
2. US-002: Modifier une personne (3pts)
3. US-003: Voir fiche détaillée (3pts)
4. US-004: Lier parent-enfant (5pts)
5. US-006: Explorer l'arbre (8pts)

**Total**: 24 points

### Sprint 2
1. US-005: Créer une union (5pts)
2. US-008: Rechercher (3pts)
3. US-014: Inviter un membre (5pts)
4. US-009: Ajouter photos (5pts)

**Total**: 18 points

### Sprint 3
1. US-007: Filtrer l'arbre (5pts)
2. US-011: Export PDF (5pts)
3. US-010: Galerie photos (3pts)
4. US-013: Statistiques (5pts)

**Total**: 18 points

### Backlog
- US-012: Partager branche (3pts)
- US-015: Notifications (3pts)
