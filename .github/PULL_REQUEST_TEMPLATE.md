name: Pull Request
description: Soumettre des modifications

body:
  - type: markdown
    attributes:
      value: |
        ## 📋 Checklist
        
        Avant de soumettre votre PR, vérifiez que :
        
        - [ ] Les tests passent (`npm test`)
        - [ ] Le code est formaté correctement
        - [ ] La documentation est à jour
        - [ ] Les commits suivent les conventions
        - [ ] Pas de conflits avec la branche cible
  
  - type: dropdown
    id: type
    attributes:
      label: Type de changement
      options:
        - 🎉 Nouvelle fonctionnalité
        - 🐛 Correction de bug
        - 📚 Documentation
        - 🎨 Style/UI
        - ♻️ Refactoring
        - ⚡ Performance
        - ✅ Tests
    validations:
      required: true
  
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Décrivez vos modifications
    validations:
      required: true
  
  - type: textarea
    id: related
    attributes:
      label: Issues liées
      description: Référencez les issues (ex: Closes #123)
      placeholder: Closes #
  
  - type: textarea
    id: testing
    attributes:
      label: Tests effectués
      description: Comment avez-vous testé vos modifications ?
    validations:
      required: true
  
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots (si applicable)
      description: Ajoutez des captures d'écran si pertinent
