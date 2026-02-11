#!/bin/bash

# QA Automation Script - Comprehensive Testing

echo "🔍 QA AUTOMATION - Arbre Généalogique"
echo "======================================"
echo ""

PASSED=0
FAILED=0
API_URL="http://localhost:3000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_case() {
    local name="$1"
    local command="$2"
    echo -n "  ▶ $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "📦 1. API CRUD Tests"
echo "--------------------"

# Create
PERSON_ID=$(curl -s -X POST $API_URL/persons -H "Content-Type: application/json" -d '{"firstName":"QA","lastName":"Automation","gender":"male","birthDate":"1990-01-01"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

test_case "Create person" "[ ! -z '$PERSON_ID' ]"
test_case "Read person" "curl -sf $API_URL/persons/$PERSON_ID"
test_case "Update person" "curl -sf -X PUT $API_URL/persons/$PERSON_ID -H 'Content-Type: application/json' -d '{\"profession\":\"QA Engineer\"}'"
test_case "List persons" "curl -sf $API_URL/persons"
test_case "Search persons" "curl -sf '$API_URL/persons?search=QA'"

echo ""
echo "🔗 2. Relationships Tests"
echo "-------------------------"

PERSON2_ID=$(curl -s -X POST $API_URL/persons -H "Content-Type: application/json" -d '{"firstName":"Child","lastName":"Test","gender":"female","birthDate":"2020-01-01"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

test_case "Create relationship" "curl -sf -X POST $API_URL/relationships -H 'Content-Type: application/json' -d '{\"parentId\":\"$PERSON_ID\",\"childId\":\"$PERSON2_ID\",\"relationshipType\":\"biological\"}'"
test_case "Validate parent before child" "curl -s -X POST $API_URL/relationships -H 'Content-Type: application/json' -d '{\"parentId\":\"$PERSON2_ID\",\"childId\":\"$PERSON_ID\",\"relationshipType\":\"biological\"}' | grep -q error"

echo ""
echo "💑 3. Unions Tests"
echo "------------------"

PERSON3_ID=$(curl -s -X POST $API_URL/persons -H "Content-Type: application/json" -d '{"firstName":"Partner","lastName":"Test","gender":"female","birthDate":"1992-01-01"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

test_case "Create union" "curl -sf -X POST $API_URL/unions -H 'Content-Type: application/json' -d '{\"person1Id\":\"$PERSON_ID\",\"person2Id\":\"$PERSON3_ID\",\"unionType\":\"marriage\",\"status\":\"active\"}'"
test_case "Validate different persons" "curl -s -X POST $API_URL/unions -H 'Content-Type: application/json' -d '{\"person1Id\":\"$PERSON_ID\",\"person2Id\":\"$PERSON_ID\",\"unionType\":\"marriage\"}' | grep -q error"

echo ""
echo "🔒 4. Validation Tests"
echo "----------------------"

test_case "Reject empty firstName" "curl -s -X POST $API_URL/persons -H 'Content-Type: application/json' -d '{\"lastName\":\"Test\",\"gender\":\"male\"}' | grep -q error"
test_case "Reject empty lastName" "curl -s -X POST $API_URL/persons -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"gender\":\"male\"}' | grep -q error"
test_case "Reject empty gender" "curl -s -X POST $API_URL/persons -H 'Content-Type: application/json' -d '{\"firstName\":\"Test\",\"lastName\":\"Test\"}' | grep -q error"
test_case "Accept valid data" "curl -sf -X POST $API_URL/persons -H 'Content-Type: application/json' -d '{\"firstName\":\"Valid\",\"lastName\":\"Person\",\"gender\":\"other\"}'"

echo ""
echo "🎨 5. Frontend Tests"
echo "--------------------"

test_case "Homepage loads" "curl -sf http://localhost:5173"
test_case "Contains title" "curl -s http://localhost:5173 | grep -q 'Arbre Généalogique'"
test_case "Contains root div" "curl -s http://localhost:5173 | grep -q 'id=\"root\"'"
test_case "React components load" "curl -s http://localhost:5173/src/main.tsx | grep -q 'StrictMode'"

echo ""
echo "⚡ 6. Performance Tests"
echo "----------------------"

test_case "API response < 200ms" "time curl -sf $API_URL/persons -w '%{time_total}' -o /dev/null | awk '{exit !(\$1 < 0.2)}'"
test_case "Health check < 50ms" "time curl -sf http://localhost:3000/health -w '%{time_total}' -o /dev/null | awk '{exit !(\$1 < 0.05)}'"

echo ""
echo "🗄️  7. Database Tests"
echo "---------------------"

test_case "PostgreSQL running" "sudo systemctl is-active --quiet postgresql"
test_case "Database exists" "sudo -u postgres psql -lqt | grep -q arbre_genealogique"
test_case "Tables exist" "sudo -u postgres psql -d arbre_genealogique -c '\dt' | grep -q persons"
test_case "Can query data" "curl -sf $API_URL/persons | python3 -c 'import sys,json; json.load(sys.stdin)' 2>/dev/null"

echo ""
echo "🧹 8. Cleanup Tests"
echo "-------------------"

test_case "Delete person" "curl -sf -X DELETE $API_URL/persons/$PERSON_ID"
test_case "Soft delete works" "curl -s $API_URL/persons/$PERSON_ID | grep -q 'non trouvée'"

echo ""
echo "======================================"
echo -e "📊 ${GREEN}PASSED: $PASSED${NC}"
echo -e "📊 ${RED}FAILED: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL QA TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
