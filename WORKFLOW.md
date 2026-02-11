# Workflow Git

## 🌳 Structure des branches

- **`main`** - Production (code stable uniquement)
- **`dev`** - Développement (nouvelles fonctionnalités)
- **`feature/*`** - Branches de fonctionnalités

## 🔄 Processus de développement

### 1. Créer une nouvelle fonctionnalité

```bash
# Partir de dev
git checkout dev
git pull origin dev

# Créer une branche feature
git checkout -b feature/nom-fonctionnalite

# Développer...
git add .
git commit -m "feat: description"
git push origin feature/nom-fonctionnalite
```

### 2. Merger dans dev

```bash
# Via Pull Request sur GitHub (recommandé)
# OU en local:
git checkout dev
git merge feature/nom-fonctionnalite
git push origin dev
```

### 3. Merger dev dans main (Release)

```bash
# Quand dev est stable et testé
git checkout main
git merge dev
git tag -a v1.x.x -m "Release v1.x.x"
git push origin main --tags
```

## ✅ Règles

### Branch `main`
- ✅ Code 100% testé
- ✅ CI/CD passe
- ✅ Documentation à jour
- ✅ Pas de commit direct (sauf hotfix urgent)
- ✅ Merge uniquement depuis `dev`

### Branch `dev`
- ✅ Tests passent
- ✅ Code review fait
- ✅ Fonctionnalités complètes
- ✅ Merge depuis `feature/*`

### Branch `feature/*`
- ✅ Une fonctionnalité = une branche
- ✅ Nom descriptif
- ✅ Commits atomiques
- ✅ Supprimée après merge

## 🚀 CI/CD

### Sur `dev`
- Tests automatiques
- Build
- Déploiement dev (optionnel)

### Sur `main`
- Tests complets
- Build production
- Déploiement production
- Création release GitHub

## 📝 Conventions de commit

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: ajout de tests
chore: maintenance
```

## 🔥 Hotfix urgent sur main

```bash
git checkout main
git checkout -b hotfix/description
# Fix...
git commit -m "fix: description urgente"
git checkout main
git merge hotfix/description
git push origin main

# Reporter sur dev
git checkout dev
git merge main
git push origin dev
```
