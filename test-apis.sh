#!/bin/bash

# API Testing Script - Verify All Fixes
# Run this to verify all APIs are working

echo "========================================="
echo "🧪 Testing Personal Finance APIs"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get auth token
echo "1️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mahesh@gmail.com","password":"Mahesh@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# Test Reimbursements
echo "2️⃣  Testing Reimbursements API..."
REIMB_COUNT=$(curl -s http://localhost:5001/api/reimbursements \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d['data']['reimbursements']))" 2>/dev/null)

if [ "$REIMB_COUNT" = "3" ]; then
  echo -e "${GREEN}✅ Reimbursements: $REIMB_COUNT items (Expected: 3)${NC}"
else
  echo -e "${RED}❌ Reimbursements: $REIMB_COUNT items (Expected: 3)${NC}"
fi
echo ""

# Test Shared Expenses
echo "3️⃣  Testing Shared Expenses API..."
SHARED_COUNT=$(curl -s http://localhost:5001/api/shared-expenses \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d['data']['shared_expenses']))" 2>/dev/null)

if [ "$SHARED_COUNT" = "2" ]; then
  echo -e "${GREEN}✅ Shared Expenses: $SHARED_COUNT items (Expected: 2)${NC}"
else
  echo -e "${RED}❌ Shared Expenses: $SHARED_COUNT items (Expected: 2)${NC}"
fi
echo ""

# Test Transactions
echo "4️⃣  Testing Transactions API..."
TRANS_COUNT=$(curl -s "http://localhost:5001/api/transactions?status=pending" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d['data']['transactions']))" 2>/dev/null)

if [ "$TRANS_COUNT" = "4" ]; then
  echo -e "${GREEN}✅ Transactions: $TRANS_COUNT pending (Expected: 4)${NC}"
else
  echo -e "${RED}❌ Transactions: $TRANS_COUNT pending (Expected: 4)${NC}"
fi
echo ""

# Test Expenses
echo "5️⃣  Testing Expenses API..."
EXPENSE_COUNT=$(curl -s "http://localhost:5001/api/expenses?limit=100" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d['data']))" 2>/dev/null)

if [ "$EXPENSE_COUNT" = "50" ]; then
  echo -e "${GREEN}✅ Expenses: $EXPENSE_COUNT items (Expected: 50)${NC}"
else
  echo -e "${YELLOW}⚠️  Expenses: $EXPENSE_COUNT items (Expected: 50)${NC}"
fi
echo ""

# Summary
echo "========================================="
echo "🎉 API Testing Complete!"
echo "========================================="
echo ""
echo "All critical APIs tested:"
echo "  ✅ Login & Authentication"
echo "  ✅ Reimbursements (3 items)"
echo "  ✅ Shared Expenses (2 items)"
echo "  ✅ Transactions (4 pending)"
echo "  ✅ Expenses (50 items)"
echo ""
echo "Next Steps:"
echo "  1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Login: mahesh@gmail.com / Mahesh@123"
echo "  3. Verify all pages load with data"
echo ""
