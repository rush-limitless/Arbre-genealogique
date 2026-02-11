#!/bin/bash

# Script de démarrage du frontend

cd "$(dirname "$0")"

echo "🎨 Démarrage du frontend..."
echo "📍 Port: 5173"
echo "🔗 URL: http://localhost:5173"
echo ""

npm run dev
