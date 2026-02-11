#!/bin/bash

echo "🌳 Arbre Généalogique - Démarrage"
echo "=================================="
echo ""

# Vérifier PostgreSQL
if ! sudo systemctl is-active --quiet postgresql; then
    echo "⚠️  PostgreSQL n'est pas démarré. Démarrage..."
    sudo systemctl start postgresql
fi

echo "✅ PostgreSQL actif"
echo ""
echo "📋 Instructions:"
echo ""
echo "1️⃣  Ouvrir un NOUVEAU terminal et lancer:"
echo "   cd /home/f2g/Desktop/arbre-genealogique/backend"
echo "   ./start.sh"
echo ""
echo "2️⃣  Ouvrir un AUTRE terminal et lancer:"
echo "   cd /home/f2g/Desktop/arbre-genealogique/frontend"
echo "   ./start.sh"
echo ""
echo "3️⃣  Ouvrir le navigateur sur:"
echo "   http://localhost:5173"
echo ""
echo "🎉 Bon développement !"
