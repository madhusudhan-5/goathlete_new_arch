#!/bin/bash

###############################################################################
# GoAthlete Complete Deployment Script
# Deploys entire GoAthlete platform:
# - Django Backend (with HTTPS)
# - Admin Web Panel (with HTTPS)
# - Prepares Android build
###############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${MAGENTA}"
cat << "EOF"
  ____       _   _   _     _      _       
 / ___| ___ / \ | |_| |__ | | ___| |_ ___ 
| |  _ / _ \/ _ \| __| '_ \| |/ _ \ __/ _ \
| |_| | (_) / ___ \ |_| | | | |  __/ ||  __/
 \____|\___/_/   \_\__|_| |_|_|\___|\__\___|

    Complete Deployment Script v1.0
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

# Pre-flight checks
print_header "Pre-Flight Checks"

# Check if root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Check if scripts exist
SCRIPTS=(
    "deploy_backend.sh"
    "deploy_admin_web.sh"
    "prepare_android.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ ! -f "$script" ]; then
        print_error "Required script not found: $script"
        exit 1
    fi
    chmod +x "$script"
done

print_success "All deployment scripts found"

# Configuration
print_header "Deployment Configuration"
echo ""
echo "This script will deploy:"
echo "  1. Django Backend (API) with HTTPS"
echo "  2. Admin Web Panel with HTTPS"
echo "  3. Prepare Android app for Play Store"
echo ""
print_info "Before proceeding, ensure you have:"
echo "  - Domain names configured (DNS A records)"
echo "  - Server access (SSH)"
echo "  - Email for SSL certificates"
echo "  - Database credentials ready"
echo ""

read -p "Continue with deployment? (y/n): " CONTINUE
if [ "$CONTINUE" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Get deployment options
echo ""
echo "Select components to deploy:"
echo "1) Backend only"
echo "2) Admin Web only"
echo "3) Android preparation only"
echo "4) Backend + Admin Web"
echo "5) Complete deployment (Backend + Admin + Android)"
echo ""
read -p "Enter your choice (1-5): " DEPLOY_CHOICE

# Deploy based on choice
case $DEPLOY_CHOICE in
    1)
        print_header "Deploying Backend"
        ./deploy_backend.sh
        ;;
    2)
        print_header "Deploying Admin Web"
        ./deploy_admin_web.sh
        ;;
    3)
        print_header "Preparing Android Build"
        cd executive-app
        ../prepare_android.sh
        cd ..
        ;;
    4)
        print_header "Deploying Backend + Admin Web"
        ./deploy_backend.sh
        echo ""
        echo -e "${BLUE}Waiting 10 seconds before admin deployment...${NC}"
        sleep 10
        ./deploy_admin_web.sh
        ;;
    5)
        print_header "Complete Deployment"
        
        # Deploy Backend
        print_status "Step 1/3: Deploying Backend..."
        ./deploy_backend.sh
        print_success "Backend deployed"
        
        echo ""
        echo -e "${BLUE}Waiting 10 seconds...${NC}"
        sleep 10
        
        # Deploy Admin Web
        print_status "Step 2/3: Deploying Admin Web..."
        ./deploy_admin_web.sh
        print_success "Admin Web deployed"
        
        echo ""
        echo -e "${BLUE}Waiting 5 seconds...${NC}"
        sleep 5
        
        # Prepare Android
        print_status "Step 3/3: Preparing Android Build..."
        cd executive-app
        ../prepare_android.sh
        cd ..
        print_success "Android prepared"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Final summary
echo ""
print_header "Deployment Summary"
echo ""

if [[ $DEPLOY_CHOICE == 1 || $DEPLOY_CHOICE == 4 || $DEPLOY_CHOICE == 5 ]]; then
    echo -e "${GREEN}✓ Backend deployed${NC}"
    echo "  URL: https://api.goathlete.in"
    echo "  Admin: https://api.goathlete.in/admin"
    echo ""
fi

if [[ $DEPLOY_CHOICE == 2 || $DEPLOY_CHOICE == 4 || $DEPLOY_CHOICE == 5 ]]; then
    echo -e "${GREEN}✓ Admin Web deployed${NC}"
    echo "  URL: https://admin.goathlete.in"
    echo ""
fi

if [[ $DEPLOY_CHOICE == 3 || $DEPLOY_CHOICE == 5 ]]; then
    echo -e "${GREEN}✓ Android build prepared${NC}"
    echo "  Check Expo dashboard for build status"
    echo ""
fi

echo -e "${YELLOW}Important Next Steps:${NC}"
echo ""
echo "1. Update environment variables:"
echo "   - Backend: /var/www/goathlete/.env"
echo "   - Admin: /var/www/goathlete-admin/.env"
echo ""
echo "2. Configure email settings (Microsoft Graph):"
echo "   - Update MS_CLIENT_ID, MS_CLIENT_SECRET, MS_TENANT_ID"
echo ""
echo "3. Setup database backups:"
echo "   - Configure automated PostgreSQL backups"
echo ""
echo "4. Monitor services:"
echo "   - Backend: sudo systemctl status gunicorn_goathlete"
echo "   - Nginx: sudo systemctl status nginx"
echo ""
echo "5. Test everything:"
echo "   - API health: curl https://api.goathlete.in/api/health/"
echo "   - Admin panel: Visit https://admin.goathlete.in"
echo "   - Mobile app: Test with production API"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "For detailed information, check:"
echo "  - DEPLOYMENT_GUIDE.md"
echo "  - Individual script logs"
echo ""
echo -e "${BLUE}Support: support@goathlete.in${NC}"
echo ""

