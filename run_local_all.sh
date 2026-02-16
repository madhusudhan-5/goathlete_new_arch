#!/bin/bash

###############################################################################
# GoAthlete Local Development - Run All Apps
# Starts ALL applications for local testing with dynamic data
# Includes: Backend, Executive, Admin, Vendor Admin, Vendor Partner, Customer
###############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${MAGENTA}"
cat << "EOF"
  ____       _   _   _     _      _       
 / ___| ___ / \ | |_| |__ | | ___| |_ ___ 
| |  _ / _ \/ _ \| __| '_ \| |/ _ \ __/ _ \
| |_| | (_) / ___ \ |_| | | | |  __/ ||  __/
 \____|\___/_/   \_\__|_| |_|_|\___|\__\___|

    Complete Local Development Environment
    All 6 Applications + Backend
EOF
echo -e "${NC}"

print_header() {
    echo -e "${MAGENTA}========================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}========================================${NC}"
}

print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_header "Pre-Flight Checks"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 not found. Please install Python 3.8+"
    exit 1
fi
print_success "Python3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi
print_success "Node.js found ($(node --version))"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_success "npm found ($(npm --version))"

echo ""
print_header "Setup Options"
echo ""
echo "What would you like to run?"
echo ""
echo "1) Backend only"
echo "2) Backend + Executive App (Super Admin)"
echo "3) Backend + Admin Web (System Admin)"
echo "4) Backend + Vendor Admin Web"
echo "5) Backend + Vendor Partner Web"
echo "6) Backend + Customer Mobile (Web)"
echo "7) Backend + All Admin Apps (Executive + Admin + Vendor Admin)"
echo "8) Backend + All Vendor Apps (Vendor Admin + Partner Web + Partner Mobile)"
echo "9) Complete Setup (ALL 6 Apps + Backend + Sample Data) ⭐"
echo ""
read -p "Enter your choice (1-9): " CHOICE

# Function to create sample data
create_sample_data() {
    print_status "Creating sample data..."
    bash create_test_data.sh
    print_success "Sample data created"
}

# Function to start backend
start_backend() {
    print_status "Starting Django backend..."
    
    # Check if migrations are needed
    python3 manage.py makemigrations --check --dry-run > /dev/null 2>&1 || {
        print_status "Running migrations..."
        python3 manage.py makemigrations
        python3 manage.py migrate
    }
    
    python3 manage.py migrate > /dev/null 2>&1
    
    # Start backend in background
    python3 manage.py runserver 0.0.0.0:8000 > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    sleep 3
    print_success "Backend started on http://localhost:8000 (PID: $BACKEND_PID)"
}

# Function to start Executive App (Super Admin)
start_executive_app() {
    print_status "Starting Executive App (Super Admin)..."
    cd executive-app
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    npx expo start --web --port 8082 > ../logs/executive_app.log 2>&1 &
    EXEC_PID=$!
    echo $EXEC_PID > ../.executive_app.pid
    cd ..
    
    sleep 3
    print_success "Executive App started on http://localhost:8082 (PID: $EXEC_PID)"
}

# Function to start Admin Web (System Admin)
start_admin_web_old() {
    print_status "Starting Admin Web (System Admin)..."
    cd admin-web
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    npm run dev -- --port 5175 > ../logs/admin_web_old.log 2>&1 &
    ADMIN_OLD_PID=$!
    echo $ADMIN_OLD_PID > ../.admin_web_old.pid
    cd ..
    
    sleep 3
    print_success "Admin Web started on http://localhost:5175 (PID: $ADMIN_OLD_PID)"
}

# Function to start Vendor Admin Web
start_vendor_admin_web() {
    print_status "Starting Vendor Admin Web..."
    cd vendor_admin_web
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    npm run dev > ../logs/vendor_admin_web.log 2>&1 &
    VENDOR_ADMIN_PID=$!
    echo $VENDOR_ADMIN_PID > ../.vendor_admin_web.pid
    cd ..
    
    sleep 3
    print_success "Vendor Admin Web started on http://localhost:5173 (PID: $VENDOR_ADMIN_PID)"
}

# Function to start Vendor Partner Web
start_vendor_partner_web() {
    print_status "Starting Vendor Partner Web..."
    cd vendor_partner_web
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    npm run dev -- --port 5174 > ../logs/vendor_partner_web.log 2>&1 &
    PARTNER_PID=$!
    echo $PARTNER_PID > ../.vendor_partner_web.pid
    cd ..
    
    sleep 3
    print_success "Vendor Partner Web started on http://localhost:5174 (PID: $PARTNER_PID)"
}

# Function to start Customer Mobile (Web)
start_customer_web() {
    print_status "Starting Customer App (Web)..."
    cd customer_app
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install > /dev/null 2>&1
    fi
    
    # Update API URL for localhost
    sed -i.bak "s|const BASE_URL = .*|const BASE_URL = 'http://localhost:8000/api';|" services/api.ts
    
    npm run web > ../logs/customer_web.log 2>&1 &
    CUSTOMER_PID=$!
    echo $CUSTOMER_PID > ../.customer_web.pid
    cd ..
    
    sleep 3
    print_success "Customer App started on http://localhost:8081 (PID: $CUSTOMER_PID)"
}

# Create logs directory
mkdir -p logs

# Execute based on choice
case $CHOICE in
    1)
        start_backend
        ;;
    2)
        start_backend
        start_executive_app
        ;;
    3)
        start_backend
        start_admin_web_old
        ;;
    4)
        start_backend
        start_vendor_admin_web
        ;;
    5)
        start_backend
        start_vendor_partner_web
        ;;
    6)
        start_backend
        start_customer_web
        ;;
    7)
        print_header "Starting All Admin Apps"
        start_backend
        sleep 2
        start_executive_app
        start_admin_web_old
        start_vendor_admin_web
        ;;
    8)
        print_header "Starting All Vendor Apps"
        start_backend
        sleep 2
        start_vendor_admin_web
        start_vendor_partner_web
        ;;
    9)
        print_header "Complete Setup - All Apps"
        start_backend
        sleep 2
        create_sample_data
        sleep 2
        print_status "Starting all applications..."
        start_executive_app
        start_admin_web_old
        start_vendor_admin_web
        start_vendor_partner_web
        start_customer_web
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_header "Applications Running"
echo ""

if [ -f ".backend.pid" ]; then
    echo -e "${GREEN}✓ Backend API${NC}           http://localhost:8000"
    echo -e "  Admin Panel:          http://localhost:8000/admin"
    echo -e "  API Docs:             http://localhost:8000/api/"
    echo ""
fi

if [ -f ".executive_app.pid" ]; then
    echo -e "${GREEN}✓ Executive App${NC}         http://localhost:8082"
    echo -e "  (Super Admin)         exec1@goathlete.org.in / exec123"
    echo ""
fi

if [ -f ".admin_web_old.pid" ]; then
    echo -e "${GREEN}✓ Admin Web${NC}             http://localhost:5175"
    echo -e "  (System Admin)        admin1@goathlete.org.in / admin123"
    echo ""
fi

if [ -f ".vendor_admin_web.pid" ]; then
    echo -e "${GREEN}✓ Vendor Admin Web${NC}     http://localhost:5173"
    echo -e "  (Venue Owner)         vendor / vendor123"
    echo ""
fi

if [ -f ".vendor_partner_web.pid" ]; then
    echo -e "${GREEN}✓ Vendor Partner Web${NC}   http://localhost:5174"
    echo -e "  (Staff)               partner / partner123"
    echo ""
fi

if [ -f ".customer_web.pid" ]; then
    echo -e "${GREEN}✓ Customer App${NC}         http://localhost:8081"
    echo -e "  (Player)              player1 / player123"
    echo ""
fi

echo -e "${CYAN}========================================${NC}"
print_info "Logs are in ./logs/ directory"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Create/Update stop script
cat > stop_local.sh << 'STOPEOF'
#!/bin/bash
echo "Stopping all services..."

if [ -f ".backend.pid" ]; then
    kill $(cat .backend.pid) 2>/dev/null
    rm .backend.pid
    echo "✓ Backend stopped"
fi

if [ -f ".executive_app.pid" ]; then
    kill $(cat .executive_app.pid) 2>/dev/null
    rm .executive_app.pid
    echo "✓ Executive App stopped"
fi

if [ -f ".admin_web_old.pid" ]; then
    kill $(cat .admin_web_old.pid) 2>/dev/null
    rm .admin_web_old.pid
    echo "✓ Admin Web stopped"
fi

if [ -f ".vendor_admin_web.pid" ]; then
    kill $(cat .vendor_admin_web.pid) 2>/dev/null
    rm .vendor_admin_web.pid
    echo "✓ Vendor Admin Web stopped"
fi

if [ -f ".vendor_partner_web.pid" ]; then
    kill $(cat .vendor_partner_web.pid) 2>/dev/null
    rm .vendor_partner_web.pid
    echo "✓ Vendor Partner Web stopped"
fi

if [ -f ".customer_web.pid" ]; then
    kill $(cat .customer_web.pid) 2>/dev/null
    rm .customer_web.pid
    echo "✓ Customer App stopped"
fi

echo "All services stopped"
STOPEOF

chmod +x stop_local.sh

# Wait for user interrupt
trap "bash stop_local.sh; exit" INT TERM

# Keep script running
while true; do
    sleep 1
done
