# 🧪 Suite de Tests Automatisés

## Scripts de Tests Créés

### 1. **run-tests.sh** - Tests Complets
Script bash qui teste tous les composants de l'application.

**Utilisation**:
```bash
./run-tests.sh
```

**Tests inclus**:
- ✅ Backend (processus, health, API)
- ✅ Base de données (PostgreSQL, tables)
- ✅ Frontend (processus, HTML, CSS)
- ✅ Intégration

---

### 2. **ci-test.sh** - Pipeline CI/CD
Script de tests pour intégration continue avec sortie colorée.

**Utilisation**:
```bash
./ci-test.sh
```

**Catégories**:
1. Backend Tests (4 tests)
2. Database Tests (4 tests)
3. Frontend Tests (4 tests)
4. Integration Tests (2 tests)

---

### 3. **backend/tests/api.test.ts** - Tests Jest Backend
Tests unitaires et d'intégration pour l'API.

**Utilisation**:
```bash
cd backend
npm test
```

**Tests**:
- Health check
- GET /api/persons
- POST /api/persons
- GET /api/persons/:id
- PUT /api/persons/:id
- DELETE /api/persons/:id
- Validation des champs

---

### 4. **frontend/tests/App.test.tsx** - Tests React
Tests des composants React avec Testing Library.

**Utilisation**:
```bash
cd frontend
npm test
```

**Tests**:
- Rendu du composant
- Affichage du header
- Bouton d'ajout
- Barre de recherche
- Navigation

---

### 5. **.github/workflows/tests.yml** - GitHub Actions
Pipeline CI/CD automatique sur GitHub.

**Déclenchement**:
- Push sur main/develop
- Pull requests

**Actions**:
- Installation des dépendances
- Tests backend
- Tests frontend
- Build production

---

## Commandes Rapides

```bash
# Tests complets
./run-tests.sh

# Tests CI/CD
./ci-test.sh

# Tests backend uniquement
cd backend && npm test

# Tests frontend uniquement
cd frontend && npm test

# Tests avec couverture
cd backend && npm run test:coverage
```

---

## Configuration

### Backend (Jest)
- Config: `backend/jest.config.json`
- Tests: `backend/tests/*.test.ts`

### Frontend (Vitest)
- Config: `frontend/vite.config.ts`
- Tests: `frontend/tests/*.test.tsx`

---

## Intégration Continue

Les tests s'exécutent automatiquement :
- ✅ À chaque commit
- ✅ À chaque pull request
- ✅ Avant chaque déploiement

---

## Métriques de Qualité

**Objectifs**:
- Couverture de code: 80%+
- Tous les tests passent
- 0 erreurs ESLint
- Build réussi

---

**Les tests sont maintenant intégrés au projet et s'exécutent automatiquement !** 🚀
