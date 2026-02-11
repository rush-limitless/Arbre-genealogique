#!/bin/bash

# Script de démarrage du backend

cd "$(dirname "$0")"

echo "🚀 Démarrage du backend..."
echo "📍 Port: 3000"
echo "🗄️  Base de données: PostgreSQL"
echo ""

npm run dev
