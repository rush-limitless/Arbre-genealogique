# Protection des branches

## Configuration GitHub

### Branch `main` (Production)

**Settings → Branches → Add rule**

Branch name pattern: `main`

✅ **Protections activées :**
- [x] Require a pull request before merging
  - [x] Require approvals (1 minimum)
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - Status checks: `test-backend`, `test-frontend`, `quality-checks`
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings
- [x] Restrict who can push to matching branches (Admins only)

### Branch `dev` (Développement)

Branch name pattern: `dev`

✅ **Protections activées :**
- [x] Require a pull request before merging
  - [x] Require approvals (1 minimum)
- [x] Require status checks to pass before merging
  - Status checks: `test-backend`, `test-frontend`
- [x] Require conversation resolution before merging

## Workflow

```
feature/* → dev (via PR) → main (via PR)
```

### Merge vers `dev`
1. Créer PR depuis `feature/*` vers `dev`
2. Tests automatiques doivent passer
3. 1 approbation requise
4. Merge autorisé

### Merge vers `main`
1. Créer PR depuis `dev` vers `main`
2. Tous les tests doivent passer
3. 1 approbation requise
4. Code review obligatoire
5. Merge = déploiement production

## Commandes utiles

```bash
# Voir les protections
gh api repos/rush-limitless/Arbre-genealogique/branches/main/protection

# Créer une PR
gh pr create --base dev --head feature/ma-fonctionnalite

# Merger une PR
gh pr merge 123 --squash
```
