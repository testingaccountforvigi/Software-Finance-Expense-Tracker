#!/bin/bash

# ============================================
# Start All Services
# Starts backend on 5001 and frontend on 5173
# ============================================

PROJECT_ROOT="/Users/vigilant/Documents/Sem5Sprint1/Software 3"

echo "=========================================="
echo "Starting Personal Finance Application"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backend .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${RED}ERROR: backend/.env not found${NC}"
    echo "Please create it from .env.example and configure your database credentials"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$PROJECT_ROOT/backend"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install backend dependencies${NC}"
        exit 1
    fi
fi

# Check if frontend dependencies are installed
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

# Create frontend .env if doesn't exist
if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:5001/api" > "$PROJECT_ROOT/frontend/.env"
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
fi

# Kill any existing processes on these ports
echo "Checking for existing processes..."
lsof -ti :5001 | xargs kill -9 2>/dev/null
lsof -ti :5173 | xargs kill -9 2>/dev/null
echo ""

# Start backend
echo -e "${GREEN}Starting Backend (Port 5001)...${NC}"
cd "$PROJECT_ROOT/backend"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo "Check backend.log for errors"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo ""

# Start frontend
echo -e "${GREEN}Starting Frontend (Port 5173)...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "Waiting for frontend to initialize..."
sleep 5

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend failed to start${NC}"
    echo "Check frontend.log for errors"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✓ All Services Started Successfully!${NC}"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:5001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:  $PROJECT_ROOT/backend.log"
echo "  Frontend: $PROJECT_ROOT/frontend.log"
echo ""
echo "To stop all services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or run:"
echo "  ./stop-all.sh"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop monitoring logs${NC}"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > "$PROJECT_ROOT/.backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/.frontend.pid"

# Tail logs
tail -f "$PROJECT_ROOT/backend.log" "$PROJECT_ROOT/frontend.log"
