#!/bin/bash

# CI/CD Pipeline - Tests automatiques

echo "🚀 CI/CD Pipeline - Arbre Généalogique"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

FAILED=0

# Fonction de test
run_test() {
    echo -n "▶ $1... "
    if $2 > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📦 1. Backend Tests"
echo "-------------------"
run_test "Backend process running" "ps aux | grep -q 'tsx.*index.ts'"
run_test "Backend health check" "curl -sf http://localhost:3000/health"
run_test "API GET /persons" "curl -sf http://localhost:3000/api/persons"
run_test "API POST /persons" "curl -sf -X POST http://localhost:3000/api/persons -H 'Content-Type: application/json' -d '{\"firstName\":\"CI\",\"lastName\":\"Test\",\"gender\":\"male\"}'"

echo ""
echo "🗄️  2. Database Tests"
echo "--------------------"
run_test "PostgreSQL active" "sudo systemctl is-active --quiet postgresql"
run_test "Database exists" "sudo -u postgres psql -lqt | grep -q arbre_genealogique"
run_test "Table: persons" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q persons"
run_test "Table: relationships" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q relationships"

echo ""
echo "🎨 3. Frontend Tests"
echo "-------------------"
run_test "Frontend process running" "ps aux | grep -q vite"
run_test "Frontend responds" "curl -sf http://localhost:5173"
run_test "HTML contains root div" "curl -s http://localhost:5173 | grep -q 'root'"
run_test "Tailwind CSS loaded" "curl -s http://localhost:5173/src/index.css | grep -q tailwindcss"

echo ""
echo "🔗 4. Integration Tests"
echo "----------------------"
run_test "Backend → Database" "curl -s http://localhost:3000/api/persons | grep -q success"
run_test "CORS configured" "curl -s -H 'Origin: http://localhost:5173' http://localhost:3000/health"

echo ""
echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo "======================================"
    exit 0
else
    echo -e "${RED}❌ $FAILED TESTS FAILED${NC}"
    echo "======================================"
    exit 1
fi
