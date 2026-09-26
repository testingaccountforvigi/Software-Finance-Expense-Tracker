#!/bin/bash

# ============================================
# Setup Verification Script
# Checks if everything is configured correctly
# ============================================

PROJECT_ROOT="/Users/vigilant/Documents/Sem5Sprint1/Software 3"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Verification Report${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ISSUES=0
WARNINGS=0

# Check Node.js
echo -e "${BLUE}1. Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check npm
echo -e "${BLUE}2. Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check MySQL
echo -e "${BLUE}3. Checking MySQL...${NC}"
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo -e "${GREEN}✓ MySQL installed: $MYSQL_VERSION${NC}"
else
    echo -e "${RED}✗ MySQL not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check backend directory
echo -e "${BLUE}4. Checking backend directory...${NC}"
if [ -d "$PROJECT_ROOT/backend" ]; then
    echo -e "${GREEN}✓ Backend directory exists${NC}"
else
    echo -e "${RED}✗ Backend directory not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check backend node_modules
echo -e "${BLUE}5. Checking backend dependencies...${NC}"
if [ -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependencies not installed${NC}"
    echo "  Run: cd backend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check backend .env
echo -e "${BLUE}6. Checking backend .env...${NC}"
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${GREEN}✓ Backend .env exists${NC}"
    
    # Check for required variables
    if grep -q "DB_HOST=" "$PROJECT_ROOT/backend/.env" && \
       grep -q "DB_USER=" "$PROJECT_ROOT/backend/.env" && \
       grep -q "DB_PASSWORD=" "$PROJECT_ROOT/backend/.env" && \
       grep -q "JWT_SECRET=" "$PROJECT_ROOT/backend/.env"; then
        echo -e "${GREEN}✓ Required environment variables present${NC}"
    else
        echo -e "${YELLOW}⚠ Some environment variables may be missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ Backend .env not found${NC}"
    echo "  Run: cp backend/.env.example backend/.env"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check frontend directory
echo -e "${BLUE}7. Checking frontend directory...${NC}"
if [ -d "$PROJECT_ROOT/frontend" ]; then
    echo -e "${GREEN}✓ Frontend directory exists${NC}"
else
    echo -e "${RED}✗ Frontend directory not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check frontend node_modules
echo -e "${BLUE}8. Checking frontend dependencies...${NC}"
if [ -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies not installed${NC}"
    echo "  Run: cd frontend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check frontend .env
echo -e "${BLUE}9. Checking frontend .env...${NC}"
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo -e "${GREEN}✓ Frontend .env exists${NC}"
    
    if grep -q "VITE_API_URL=" "$PROJECT_ROOT/frontend/.env"; then
        echo -e "${GREEN}✓ VITE_API_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠ VITE_API_URL not set${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ Frontend .env not found${NC}"
    echo "  Creating frontend .env..."
    echo "VITE_API_URL=http://localhost:5001/api" > "$PROJECT_ROOT/frontend/.env"
    echo -e "${GREEN}✓ Frontend .env created${NC}"
fi
echo ""

# Check database files
echo -e "${BLUE}10. Checking database files...${NC}"
if [ -f "$PROJECT_ROOT/database/schema.sql" ]; then
    echo -e "${GREEN}✓ schema.sql exists${NC}"
else
    echo -e "${RED}✗ schema.sql not found${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ -f "$PROJECT_ROOT/database/insert-demo-data.sql" ]; then
    echo -e "${GREEN}✓ insert-demo-data.sql exists${NC}"
else
    echo -e "${RED}✗ insert-demo-data.sql not found${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check if API service exists
echo -e "${BLUE}11. Checking API service...${NC}"
if [ -f "$PROJECT_ROOT/frontend/src/services/api.js" ]; then
    echo -e "${GREEN}✓ API service exists${NC}"
else
    echo -e "${RED}✗ API service not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Check ports
echo -e "${BLUE}12. Checking ports availability...${NC}"
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 5001 is in use (Backend)${NC}"
    echo "  Process: $(lsof -ti :5001 | xargs ps -p | tail -n 1)"
else
    echo -e "${GREEN}✓ Port 5001 is available${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 5173 is in use (Frontend)${NC}"
    echo "  Process: $(lsof -ti :5173 | xargs ps -p | tail -n 1)"
else
    echo -e "${GREEN}✓ Port 5173 is available${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to start.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run schema.sql in MySQL"
    echo "2. Start backend: cd backend && npm run dev"
    echo "3. Start frontend: cd frontend && npm run dev"
    echo "4. Register at http://localhost:5173"
    echo "5. Run insert-demo-data.sql for sample data"
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with $WARNINGS warning(s)${NC}"
    echo "  Review warnings above and address if needed"
else
    echo -e "${RED}✗ Found $ISSUES issue(s) and $WARNINGS warning(s)${NC}"
    echo "  Please address the issues above before proceeding"
fi

echo ""
