# 🌳 Arbre Généalogique

Application web moderne et complète pour créer et gérer votre arbre généalogique familial.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)

## 📸 Screenshots

<div align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="45%">
  <img src="screenshots/tree.png" alt="Arbre" width="45%">
  <img src="screenshots/person-detail.png" alt="Détail personne" width="45%">
  <img src="screenshots/stats.png" alt="Statistiques" width="45%">
</div>

> 💡 **Note:** Ajoutez vos screenshots dans le dossier `screenshots/`

## ✨ Fonctionnalités

### 👥 Gestion des Personnes
- ✅ CRUD complet (Créer, Lire, Modifier, Supprimer)
- ✅ Informations détaillées (dates, lieux, profession, biographie)
- ✅ Upload de photos de profil
- ✅ Galerie photos par personne
- ✅ Badges vivant/décédé

### 🔗 Relations Familiales
- ✅ Parents/Enfants (biologiques, adoptifs)
- ✅ Unions (mariages, partenariats)
- ✅ Calcul automatique des générations
- ✅ Navigation entre membres de la famille

### 📊 Visualisations
- ✅ Arbre généalogique interactif (React Flow)
- ✅ Timeline des événements familiaux
- ✅ Statistiques et graphiques (âge moyen, répartition par genre, décennies)
- ✅ Carte des lieux de naissance

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Mode sombre/clair
- ✅ Recherche globale (Ctrl+K)
- ✅ Sélection multiple et actions groupées
- ✅ Animations fluides
- ✅ Breadcrumb navigation

### 📥 Import/Export
- ✅ Export GEDCOM (standard généalogie)
- ✅ Export CSV (Excel/Sheets)
- ✅ Export JSON (backup complet)

### 🔐 Authentification
- ✅ Système de connexion/inscription
- ✅ Gestion des rôles (admin, editor, viewer)
- ✅ Protection des routes

## 🚀 Technologies

### Backend
- **Node.js** + **Express** - Serveur API REST
- **TypeScript** - Typage statique
- **Prisma ORM** - Gestion base de données
- **SQLite** - Base de données légère
- **Multer** - Upload de fichiers
- **JWT** - Authentification

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling moderne
- **React Router** - Navigation
- **React Flow** - Visualisation d'arbre
- **Recharts** - Graphiques et statistiques

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/VOTRE_USERNAME/arbre-genealogique.git
cd arbre-genealogique

# Démarrer tout automatiquement
./START_PROJECT.sh
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

### Installation manuelle

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

## 📖 Documentation

- 📘 [Guide de démarrage](./GETTING_STARTED.md)
- 📗 [Documentation API](./API.md)
- 📕 [Spécifications techniques](./SPECIFICATIONS.md)
- 📙 [Architecture](./ARCHITECTURE.md)
- 📔 [User Stories](./USER_STORIES.md)

## 🧪 Tests

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Tests complets
./run-tests.sh
```

## 📂 Structure du Projet

```
arbre-genealogique/
├── backend/              # API REST Node.js
│   ├── src/
│   │   ├── controllers/  # Logique métier
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services
│   │   └── middleware/   # Middlewares
│   ├── prisma/           # Schéma DB et migrations
│   └── uploads/          # Fichiers uploadés
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'app
│   │   ├── services/     # API client
│   │   └── types/        # Types TypeScript
│   └── public/           # Assets statiques
└── docs/                 # Documentation
```

## 🎯 Utilisation

### Créer une personne
1. Cliquez sur "➕ Nouvelle personne"
2. Remplissez le formulaire
3. Ajoutez une photo (optionnel)
4. Enregistrez

### Ajouter des relations
1. Ouvrez la fiche d'une personne
2. Cliquez sur "➕ Ajouter" dans Parents/Unions
3. Sélectionnez la personne à lier
4. Confirmez

### Visualiser l'arbre
1. Allez dans "🌳 Arbre"
2. Activez le mode auto pour générer l'arbre complet
3. Ou ajoutez manuellement les personnes en mode manuel
4. Déplacez et zoomez pour explorer

### Exporter les données
1. Allez dans Dashboard
2. Section "📥 Export"
3. Choisissez le format (GEDCOM/CSV/JSON)
4. Le fichier se télécharge automatiquement

## 🔑 Raccourcis Clavier

- `Ctrl+K` - Recherche globale
- `N` - Nouvelle personne
- `T` - Vue arbre
- `L` - Vue liste

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails

## 👨‍💻 Auteur

Créé avec ❤️ pour préserver l'histoire familiale

## 🐛 Bugs & Support

Ouvrez une [issue](https://github.com/VOTRE_USERNAME/arbre-genealogique/issues) pour signaler un bug ou demander une fonctionnalité.

## 🗺️ Roadmap

- [ ] Import GEDCOM
- [ ] Partage multi-utilisateurs
- [ ] Notifications anniversaires
- [ ] Export PDF de l'arbre
- [ ] Application mobile
- [ ] Intégration avec services généalogiques

---

⭐ N'oubliez pas de mettre une étoile si ce projet vous plaît !
