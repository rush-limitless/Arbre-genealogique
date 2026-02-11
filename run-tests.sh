#!/bin/bash

# Script de tests automatiques - Arbre Généalogique
# Exécute tous les tests backend et frontend

set -e

echo "🧪 TESTS AUTOMATIQUES - Arbre Généalogique"
echo "=========================================="
echo ""

FAILED=0
PASSED=0

# Fonction pour tester
test_command() {
    local name="$1"
    local command="$2"
    
    echo -n "Testing: $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo "✅"
        ((PASSED++))
    else
        echo "❌"
        ((FAILED++))
    fi
}

# Tests Backend
echo "📦 Backend Tests"
echo "----------------"
test_command "Backend process" "ps aux | grep -q 'tsx.*index.ts' && ! grep -q grep"
test_command "Backend health" "curl -sf http://localhost:3000/health"
test_command "PostgreSQL active" "sudo systemctl is-active --quiet postgresql"
test_command "Database exists" "sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw arbre_genealogique"
test_command "API GET /persons" "curl -sf http://localhost:3000/api/persons"
test_command "API POST /persons" "curl -sf -X POST http://localhost:3000/api/persons -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"lastName\":\"Auto\",\"gender\":\"male\"}'"

echo ""
echo "🎨 Frontend Tests"
echo "-----------------"
test_command "Frontend process" "ps aux | grep -q vite && ! grep -q grep"
test_command "Frontend responds" "curl -sf http://localhost:5173"
test_command "HTML loads" "curl -s http://localhost:5173 | grep -q 'root'"
test_command "Tailwind CSS" "curl -s http://localhost:5173/src/index.css | grep -q tailwindcss"

echo ""
echo "📊 Database Tests"
echo "-----------------"
test_command "Table: users" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q users"
test_command "Table: persons" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q persons"
test_command "Table: relationships" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q relationships"
test_command "Table: unions" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q unions"

echo ""
echo "=========================================="
echo "📊 RÉSULTATS"
echo "=========================================="
echo "✅ Tests réussis: $PASSED"
echo "❌ Tests échoués: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 TOUS LES TESTS PASSENT !"
    exit 0
else
    echo "⚠️  Certains tests ont échoué"
    exit 1
fi
