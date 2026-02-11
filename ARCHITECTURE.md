# Architecture Technique - Arbre Généalogique

## Structure du Projet

```
arbre-genealogique/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Services API
│   │   ├── store/          # State management (Redux)
│   │   ├── types/          # Types TypeScript
│   │   ├── utils/          # Utilitaires
│   │   └── styles/         # Styles globaux
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs
│   │   ├── services/       # Logique métier
│   │   ├── models/         # Modèles Prisma
│   │   ├── routes/         # Routes Express
│   │   ├── middleware/     # Middlewares
│   │   ├── utils/          # Utilitaires
│   │   └── config/         # Configuration
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                    # Documentation
│   ├── SPECIFICATIONS.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── USER_GUIDE.md
│
├── scripts/                 # Scripts utilitaires
│   ├── setup.sh
│   ├── seed.js
│   └── deploy.sh
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Technologies Détaillées

### Frontend
- **React 18**: Framework UI
- **TypeScript**: Typage statique
- **Vite**: Build tool rapide
- **Tailwind CSS**: Styling utility-first
- **Shadcn/ui**: Composants UI
- **React Router**: Navigation
- **Redux Toolkit**: State management
- **React Query**: Data fetching
- **D3.js**: Visualisation arbre
- **React Hook Form**: Gestion formulaires
- **Zod**: Validation schémas
- **Axios**: HTTP client
- **date-fns**: Manipulation dates

### Backend
- **Node.js 20**: Runtime
- **Express**: Framework web
- **TypeScript**: Typage statique
- **Prisma**: ORM
- **PostgreSQL**: Base de données
- **JWT**: Authentification
- **Bcrypt**: Hashing mots de passe
- **Multer**: Upload fichiers
- **Sharp**: Traitement images
- **Winston**: Logging
- **Joi**: Validation

### DevOps
- **Docker**: Conteneurisation
- **GitHub Actions**: CI/CD
- **Jest**: Tests unitaires
- **Cypress**: Tests E2E
- **ESLint**: Linting
- **Prettier**: Formatage code

## Flux de Données

```
User Action → Component → Hook → Service → API → Controller → Service → Database
                                                                    ↓
User ← Component ← Hook ← Service ← API Response ← Controller ← Service
```

## Sécurité

### Authentification
- JWT avec access token (15min) et refresh token (7 jours)
- Stockage sécurisé dans httpOnly cookies
- Rotation automatique des tokens

### Autorisation
- RBAC (Role-Based Access Control)
- Middleware de vérification des permissions
- Logs d'accès

### Protection
- Rate limiting
- CORS configuré
- Helmet.js
- Input validation
- SQL injection prevention
- XSS protection

## Performance

### Frontend
- Code splitting par route
- Lazy loading des composants
- Memoization (React.memo, useMemo)
- Virtualisation des listes (react-window)
- Image lazy loading
- Service Worker pour cache

### Backend
- Connection pooling PostgreSQL
- Cache Redis pour queries fréquentes
- Pagination systématique
- Index database optimisés
- Compression gzip

## Scalabilité

### Horizontal
- Stateless API (JWT)
- Load balancer ready
- Session storage externe (Redis)

### Vertical
- Optimisation queries SQL
- Batch processing
- Async operations
