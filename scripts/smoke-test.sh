#!/bin/bash

echo "🧪 Running Smoke Tests for Phase 3"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
}

# 1. Check if package.json is valid
run_test "package.json validity" "node -e 'require(\"./package.json\")'"

# 2. Check if TypeScript config is valid
run_test "tsconfig.json validity" "node -e 'require(\"./tsconfig.json\")'"

# 3. Check critical files exist
run_test "conversationalJourney.js exists" "test -f src/ai/promptTemplates/conversationalJourney.js"
run_test "SOPFlowManager.ts exists" "test -f src/core/SOPFlowManager.ts"

# 4. Check new service directories
run_test "services/core directory exists" "test -d src/services/core"
run_test "services/future directory exists" "test -d src/services/future"

# 5. Count service files
CORE_COUNT=$(find src/services/core -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
FUTURE_COUNT=$(find src/services/future -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $CORE_COUNT core services and $FUTURE_COUNT future services${NC}"

# 6. Check for syntax errors in critical files
echo -n "Testing: JavaScript syntax in conversationalJourney.js... "
if node -c src/ai/promptTemplates/conversationalJourney.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# 7. Try to build
echo -n "Testing: Build process... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
    
    # Check build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo -e "  ${GREEN}Build artifacts created successfully${NC}"
    fi
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# 8. Check for obvious import errors
echo -n "Testing: Import resolution in services... "
ERROR_COUNT=$(grep -r "from ['\"]\.\.\/\.\.\/" src/services 2>/dev/null | grep -c "\.\.\/\.\.\/" || echo "0")
if [ "$ERROR_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING: Found $ERROR_COUNT potential problematic imports${NC}"
fi

# Summary
echo ""
echo "=================================="
echo "Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests PASSED! Safe to proceed.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Review before committing.${NC}"
    exit 1
fi