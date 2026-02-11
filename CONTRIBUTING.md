# Contributing to Arbre Généalogique

Merci de votre intérêt pour contribuer ! 🎉

## 🚀 Comment contribuer

### Signaler un bug
1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/rush-limitless/Arbre-genealogique/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Décrivez le problème en détail avec les étapes pour le reproduire

### Proposer une fonctionnalité
1. Créez une issue avec le template "Feature Request"
2. Expliquez le besoin et la solution proposée
3. Attendez les retours avant de commencer le développement

### Soumettre une Pull Request

1. **Fork** le projet
2. **Clone** votre fork
   ```bash
   git clone git@github.com:VOTRE_USERNAME/Arbre-genealogique.git
   ```
3. **Créez une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
4. **Développez** votre fonctionnalité
5. **Testez** votre code
   ```bash
   npm test
   ```
6. **Commit** vos changements
   ```bash
   git commit -m "feat: ajout de ma fonctionnalité"
   ```
7. **Push** vers votre fork
   ```bash
   git push origin feature/ma-fonctionnalite
   ```
8. **Ouvrez une Pull Request** sur le repo principal

## 📝 Conventions

### Commits
Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

### Code Style
- **Backend:** ESLint + Prettier
- **Frontend:** ESLint + Prettier
- Utilisez TypeScript strict mode
- Commentez le code complexe

### Tests
- Ajoutez des tests pour les nouvelles fonctionnalités
- Assurez-vous que tous les tests passent
- Visez une couverture > 80%

## 🏗️ Structure du projet

```
backend/src/
├── controllers/  # Logique métier
├── routes/       # Routes API
├── services/     # Services
└── middleware/   # Middlewares

frontend/src/
├── components/   # Composants réutilisables
├── pages/        # Pages
└── services/     # API client
```

## 💬 Questions ?

N'hésitez pas à ouvrir une [Discussion](https://github.com/rush-limitless/Arbre-genealogique/discussions) !

Merci pour votre contribution ! ❤️
