#!/bin/bash

# ============================================
# Stop All Services
# ============================================

PROJECT_ROOT="/Users/vigilant/Documents/Sem5Sprint1/Software 3"

echo "=========================================="
echo "Stopping Personal Finance Application"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Stop processes by PID files
if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Stopped backend (PID: $BACKEND_PID)${NC}"
    fi
    rm "$PROJECT_ROOT/.backend.pid"
fi

if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Stopped frontend (PID: $FRONTEND_PID)${NC}"
    fi
    rm "$PROJECT_ROOT/.frontend.pid"
fi

# Also kill by port (backup method)
echo "Checking ports..."
lsof -ti :5001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Cleaned up port 5001${NC}"
lsof -ti :5173 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Cleaned up port 5173${NC}"
lsof -ti :5174 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓ Cleaned up port 5174${NC}"

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
