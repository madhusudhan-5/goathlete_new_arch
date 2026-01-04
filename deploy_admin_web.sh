#!/bin/bash

###############################################################################
# GoAthlete Admin Web Deployment Script
# Deploys React/Vite admin panel with Nginx and SSL
# Target: Ubuntu/Debian Linux servers
###############################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration Variables (MODIFY THESE)
DOMAIN="admin.goathlete.in"
PROJECT_NAME="goathlete-admin"
PROJECT_DIR="/opt/goathlete-admin"
BUILD_DIR="$PROJECT_DIR/dist"
USER="www-data"
GROUP="www-data"
EMAIL="admin@goathlete.in"
API_URL="https://api.goathlete.in"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GoAthlete Admin Web Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# 1. Install Node.js and npm
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
print_success "Node.js $(node --version) installed"

# 2. Install system dependencies
print_status "Installing dependencies..."
apt-get install -y nginx certbot python3-certbot-nginx git
print_success "Dependencies installed"

# 3. Create project directory
print_status "Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
print_success "Directory created"

# 4. Copy project files
print_status "Copying admin-web files..."
# NOTE: Adjust the source path to your admin-web directory
rsync -av --exclude='node_modules' --exclude='dist' \
    /path/to/your/admin-web/ $PROJECT_DIR/
print_success "Files copied"

# 5. Create .env file for build
print_status "Creating environment file..."
cat > $PROJECT_DIR/.env << EOF
VITE_API_URL=$API_URL
VITE_APP_NAME=GoAthlete Admin
VITE_APP_VERSION=1.0.0
EOF
print_success "Environment file created"

# 6. Install npm dependencies
print_status "Installing npm packages..."
npm install
print_success "npm packages installed"

# 7. Build production bundle
print_status "Building production bundle..."
npm run build
print_success "Build completed"

# 8. Set permissions
print_status "Setting permissions..."
chown -R $USER:$GROUP $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
print_success "Permissions set"

# 9. Create Nginx configuration
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $BUILD_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy (optional, for same-domain API calls)
    location /api/ {
        proxy_pass $API_URL/api/;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
print_success "Nginx configured"

# 10. Setup SSL
print_status "Installing SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive --agree-tos --email $EMAIL --redirect
print_success "SSL certificate installed"

# 11. Setup auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
print_success "SSL auto-renewal configured"

# 12. Configure firewall
print_status "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
print_success "Firewall configured"

# 13. Create deployment script for updates
print_status "Creating update script..."
cat > $PROJECT_DIR/update.sh << 'UPDATEEOF'
#!/bin/bash
# Quick update script for admin web

cd /var/www/goathlete-admin
git pull origin main
npm install
npm run build
systemctl restart nginx
echo "Admin web updated at $(date)"
UPDATEEOF
chmod +x $PROJECT_DIR/update.sh
print_success "Update script created"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Admin Web Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo "• Admin URL: https://$DOMAIN"
echo "• Build Directory: $BUILD_DIR"
echo "• Project Directory: $PROJECT_DIR"
echo "• API Backend: $API_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit https://$DOMAIN"
echo "2. Login with your admin credentials"
echo "3. Test all admin features"
echo "4. Setup CI/CD if needed"
echo ""
echo -e "${YELLOW}Update Admin Web:${NC}"
echo "• Run: $PROJECT_DIR/update.sh"
echo "• Or manually:"
echo "  cd $PROJECT_DIR"
echo "  git pull"
echo "  npm run build"
echo "  sudo systemctl restart nginx"
echo ""
echo -e "${GREEN}✓ Admin panel is live at https://$DOMAIN${NC}"
echo ""

