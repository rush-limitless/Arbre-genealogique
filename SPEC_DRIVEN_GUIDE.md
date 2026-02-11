# Guide de Développement - Spec-Driven Development

## Qu'est-ce que le Spec-Driven Development (SDD) ?

Le **Spec-Driven Development** est une méthodologie où les spécifications détaillées sont écrites **avant** le code. C'est une approche qui combine les meilleures pratiques de:
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Documentation-Driven Development (DDD)

## Principes Fondamentaux

### 1. Spécifications d'Abord
Avant d'écrire une ligne de code, on écrit:
- **Quoi**: Ce que la fonctionnalité doit faire
- **Pourquoi**: La valeur métier
- **Comment**: Les critères d'acceptation
- **Contraintes**: Les règles métier

### 2. Documentation Vivante
Les spécifications sont:
- ✅ La source de vérité unique
- ✅ Toujours à jour
- ✅ Lisibles par tous (dev, PM, clients)
- ✅ Versionnées avec le code

### 3. Tests Basés sur Specs
Chaque spécification génère:
- Tests unitaires
- Tests d'intégration
- Tests E2E
- Critères de validation

## Workflow SDD

```
1. SPEC → Écrire la spécification détaillée
   ↓
2. REVIEW → Validation par l'équipe
   ↓
3. USER STORY → Créer les user stories
   ↓
4. TESTS → Écrire les tests (qui échouent)
   ↓
5. CODE → Implémenter la fonctionnalité
   ↓
6. VALIDATE → Vérifier que les tests passent
   ↓
7. DOCUMENT → Mettre à jour la doc
   ↓
8. DEPLOY → Déployer
```

## Structure d'une Spécification

### Template de Spec Fonctionnelle

```markdown
#### SPEC-F-XXX: [Titre Court]
**Priorité**: Haute/Moyenne/Basse
**Description**: Description détaillée de la fonctionnalité

**Données requises**:
- Champ 1 (obligatoire/optionnel)
- Champ 2 (obligatoire/optionnel)

**Règles métier**:
- Règle 1
- Règle 2

**Critères d'acceptation**:
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

**Dépendances**:
- SPEC-F-YYY

**Estimation**: X points
```

### Template de Spec Technique

```markdown
#### SPEC-T-XXX: [Titre]
**Type**: Architecture/API/Database/Security

**Description**: Description technique

**Implémentation**:
```code
// Code ou schéma
```

**Tests requis**:
- Test 1
- Test 2

**Performance**:
- Objectif: < Xms
```

## Exemple Complet: Créer une Personne

### 1. Spécification (SPEC-F-001)

```markdown
#### SPEC-F-001: Créer une Personne
**Priorité**: Haute
**Description**: L'utilisateur peut ajouter une nouvelle personne à l'arbre.

**Données requises**:
- Prénom (obligatoire, 2-100 caractères)
- Nom (obligatoire, 2-100 caractères)
- Sexe (obligatoire: Homme/Femme/Autre)
- Date de naissance (optionnel, format: JJ/MM/AAAA)

**Règles métier**:
- Le prénom et nom ne peuvent pas être vides
- La date de naissance ne peut pas être dans le futur
- L'âge est calculé automatiquement

**Critères d'acceptation**:
- [ ] Formulaire accessible depuis le menu
- [ ] Validation en temps réel
- [ ] Message de confirmation
- [ ] Redirection vers la fiche
```

### 2. User Story

```markdown
**En tant que** Marie (admin)
**Je veux** ajouter une nouvelle personne
**Afin de** compléter l'arbre généalogique

**Critères**:
- Je clique sur "Ajouter une personne"
- Je remplis le formulaire
- Je clique sur "Sauvegarder"
- Je vois la confirmation
- La personne apparaît dans l'arbre
```

### 3. Tests (Avant le Code)

```typescript
// PersonForm.test.tsx
describe('SPEC-F-001: Créer une Personne', () => {
  it('affiche le formulaire de création', () => {
    // Test
  });

  it('valide les champs obligatoires', () => {
    // Test
  });

  it('empêche la soumission si invalide', () => {
    // Test
  });

  it('crée la personne et redirige', async () => {
    // Test
  });

  it('affiche un message de confirmation', () => {
    // Test
  });
});
```

### 4. Implémentation

```typescript
// PersonForm.tsx
export const PersonForm = () => {
  // Implémentation basée sur la spec
};
```

### 5. Validation

```bash
# Tous les tests passent
npm test PersonForm.test.tsx
✓ SPEC-F-001: Tous les critères validés
```

## Avantages du SDD

### Pour les Développeurs
- ✅ Clarté sur ce qu'il faut coder
- ✅ Moins de refactoring
- ✅ Tests déjà définis
- ✅ Moins de bugs

### Pour le Projet
- ✅ Documentation toujours à jour
- ✅ Traçabilité complète
- ✅ Onboarding facilité
- ✅ Maintenance simplifiée

### Pour le Client
- ✅ Visibilité sur le développement
- ✅ Validation avant le code
- ✅ Moins de surprises
- ✅ ROI optimisé

## Outils et Pratiques

### Outils Recommandés
- **Specs**: Markdown + Git
- **User Stories**: Jira, Linear, GitHub Projects
- **Tests**: Jest, Cypress, Playwright
- **Documentation**: Docusaurus, GitBook
- **Validation**: Pull Request reviews

### Pratiques
1. **Spec Review**: Valider les specs avant le code
2. **Living Documentation**: Mettre à jour en continu
3. **Traceability**: Lier code → tests → specs
4. **Metrics**: Mesurer la couverture spec/code

## Checklist Avant de Coder

- [ ] La spec est complète et validée
- [ ] Les user stories sont créées
- [ ] Les tests sont écrits
- [ ] Les dépendances sont identifiées
- [ ] L'estimation est faite
- [ ] L'équipe a reviewé

## Anti-Patterns à Éviter

❌ **Coder avant de spécifier**
❌ **Specs trop vagues**
❌ **Ne pas mettre à jour les specs**
❌ **Ignorer les critères d'acceptation**
❌ **Pas de review des specs**

## Ressources

- [Spec-Driven Development Guide](https://spec-driven.dev)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [TDD Principles](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Adopter le SDD = Code de qualité + Documentation vivante + Équipe alignée**
