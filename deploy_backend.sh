#!/bin/bash

###############################################################################
# GoAthlete Django Backend Deployment Script
# Deploys Django backend with Gunicorn, Nginx, SSL (Let's Encrypt)
# Target: Ubuntu/Debian Linux servers
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration Variables (MODIFY THESE)
DOMAIN="api.goathlete.in"  # Your backend domain
PROJECT_NAME="goathlete"
PROJECT_DIR="/opt/goathlete"
VENV_DIR="$PROJECT_DIR/venv"
USER="www-data"
GROUP="www-data"
PYTHON_VERSION="python3.12"
EMAIL="admin@goathlete.in"  # For SSL certificate

# Database Configuration (SQLite)
DB_PATH="$PROJECT_DIR/data/db.sqlite3"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GoAthlete Backend Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print status
print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# 1. Update system
print_status "Updating system packages..."
apt-get update
apt-get upgrade -y
print_success "System updated"

# 2. Install system dependencies
print_status "Installing system dependencies..."
apt-get install -y \
    python3-pip \
    python3-venv \
    python3-dev \
    nginx \
    build-essential \
    git \
    curl \
    certbot \
    python3-certbot-nginx \
    supervisor \
    sqlite3
print_success "System dependencies installed"

# 3. Setup SQLite Database
print_status "Setting up SQLite database..."
mkdir -p $PROJECT_DIR/data
touch $PROJECT_DIR/data/db.sqlite3
print_success "SQLite database file created"

# 4. Create project directory
print_status "Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
print_success "Project directory created"

# 5. Copy project files (assumes you're running from project directory)
print_status "Copying project files..."
# NOTE: Run this script from your project directory or modify paths
rsync -av --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' \
    --exclude='db.sqlite3' --exclude='.git' \
    /path/to/your/project/ $PROJECT_DIR/
print_success "Project files copied"

# 6. Create and activate virtual environment
print_status "Creating Python virtual environment..."
$PYTHON_VERSION -m venv $VENV_DIR
source $VENV_DIR/bin/activate
print_success "Virtual environment created"

# 7. Install Python dependencies
print_status "Installing Python packages..."
pip install --upgrade pip
pip install -r $PROJECT_DIR/requirements.txt
pip install gunicorn
print_success "Python packages installed"

# 8. Create .env file
print_status "Creating environment file..."
cat > $PROJECT_DIR/.env << EOF
# Django Settings
SECRET_KEY='$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")'
DEBUG=False
ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN,localhost,127.0.0.1

# Database (SQLite)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=$PROJECT_DIR/data/db.sqlite3

# Email Configuration (Microsoft Graph)
USE_EMAIL_BACKEND=msgraph
MS_CLIENT_ID=YOUR_CLIENT_ID
MS_CLIENT_SECRET=YOUR_CLIENT_SECRET
MS_TENANT_ID=YOUR_TENANT_ID
MS_SENDER_EMAIL=contact@goathlete.in
DEFAULT_FROM_EMAIL=contact@goathlete.in

# CORS
CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://admin.goathlete.in

# Static Files
STATIC_URL=/static/
STATIC_ROOT=$PROJECT_DIR/staticfiles/
MEDIA_URL=/media/
MEDIA_ROOT=$PROJECT_DIR/media/
EOF
print_success "Environment file created"

# 9. Run Django migrations
print_status "Running database migrations..."
cd $PROJECT_DIR
source $VENV_DIR/bin/activate
python manage.py makemigrations
python manage.py migrate
print_success "Migrations completed"

# 10. Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput
print_success "Static files collected"

# 11. Create Django superuser (interactive)
print_status "Creating Django superuser..."
echo "Please create a superuser for Django admin:"
python manage.py createsuperuser || true

# 12. Set permissions
print_status "Setting file permissions..."
chown -R $USER:$GROUP $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
print_success "Permissions set"

# 13. Create Gunicorn systemd service
print_status "Creating Gunicorn service..."
cat > /etc/systemd/system/gunicorn_$PROJECT_NAME.service << EOF
[Unit]
Description=Gunicorn daemon for GoAthlete Django Backend
After=network.target

[Service]
User=$USER
Group=$GROUP
WorkingDirectory=$PROJECT_DIR
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=$VENV_DIR/bin/gunicorn \\
    --workers 4 \\
    --bind unix:$PROJECT_DIR/gunicorn.sock \\
    --timeout 300 \\
    --access-logfile $PROJECT_DIR/logs/gunicorn-access.log \\
    --error-logfile $PROJECT_DIR/logs/gunicorn-error.log \\
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Create logs directory
mkdir -p $PROJECT_DIR/logs
chown -R $USER:$GROUP $PROJECT_DIR/logs

systemctl daemon-reload
systemctl start gunicorn_$PROJECT_NAME
systemctl enable gunicorn_$PROJECT_NAME
print_success "Gunicorn service created and started"

# 14. Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
upstream $PROJECT_NAME {
    server unix:$PROJECT_DIR/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 100M;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias $PROJECT_DIR/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias $PROJECT_DIR/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://$PROJECT_NAME;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl restart nginx
systemctl enable nginx
print_success "Nginx configured and restarted"

# 15. Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
echo "Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
print_success "SSL certificate installed"

# 16. Setup automatic SSL renewal
print_status "Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer
print_success "SSL auto-renewal configured"

# 17. Set database file permissions
print_status "Setting database permissions..."
chown -R $USER:$GROUP $PROJECT_DIR/data
chmod 664 $PROJECT_DIR/data/db.sqlite3
chmod 775 $PROJECT_DIR/data
print_success "Database permissions set"

# 18. Configure firewall
print_status "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
print_success "Firewall configured"

# 19. Setup log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/$PROJECT_NAME << EOF
$PROJECT_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $GROUP
    sharedscripts
    postrotate
        systemctl reload gunicorn_$PROJECT_NAME > /dev/null
    endscript
}
EOF
print_success "Log rotation configured"

# 20. Setup database backup script
print_status "Creating database backup script..."
cat > /usr/local/bin/backup_goathlete.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/goathlete"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup SQLite database
cp $PROJECT_DIR/data/db.sqlite3 \$BACKUP_DIR/db_\$DATE.sqlite3
gzip \$BACKUP_DIR/db_\$DATE.sqlite3

# Backup media files
tar -czf \$BACKUP_DIR/media_\$DATE.tar.gz $PROJECT_DIR/media/

# Keep only last 30 days
find \$BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed at \$(date)" >> /var/log/goathlete_backup.log
EOF
chmod +x /usr/local/bin/backup_goathlete.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_goathlete.sh") | crontab -
print_success "Database backup script installed"

# 21. Setup monitoring script
print_status "Creating monitoring script..."
cat > $PROJECT_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Health check script

SERVICE="gunicorn_goathlete"
if ! systemctl is-active --quiet $SERVICE; then
    echo "Service $SERVICE is down, restarting..."
    systemctl restart $SERVICE
    echo "Service restarted at $(date)" >> /var/log/goathlete_monitor.log
fi
EOF
chmod +x $PROJECT_DIR/monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/monitor.sh") | crontab -
print_success "Monitoring script installed"

# 22. Final checks
print_status "Performing final checks..."
echo ""
echo "Service Status:"
systemctl status gunicorn_$PROJECT_NAME --no-pager | head -5
echo ""
systemctl status nginx --no-pager | head -5
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo "• Backend URL: https://$DOMAIN"
echo "• Admin Panel: https://$DOMAIN/admin"
echo "• API Docs: https://$DOMAIN/api/"
echo "• Project Directory: $PROJECT_DIR"
echo "• Database: $PROJECT_DIR/data/db.sqlite3"
echo "• Logs: $PROJECT_DIR/logs/"
echo "• Backups: /var/backups/goathlete/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update your .env file with actual credentials:"
echo "   sudo nano $PROJECT_DIR/.env"
echo "2. Test the API: curl https://$DOMAIN/api/health/"
echo "3. Access admin panel: https://$DOMAIN/admin"
echo "4. Update CORS settings if needed"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "• Restart backend: sudo systemctl restart gunicorn_$PROJECT_NAME"
echo "• View logs: sudo journalctl -u gunicorn_$PROJECT_NAME -f"
echo "• Django manage: cd $PROJECT_DIR && source venv/bin/activate && python manage.py <command>"
echo "• Nginx restart: sudo systemctl restart nginx"
echo "• Backup database: sudo /usr/local/bin/backup_goathlete.sh"
echo "• View database: sqlite3 $PROJECT_DIR/data/db.sqlite3"
echo ""
echo -e "${YELLOW}SQLite Database:${NC}"
echo "• Location: $PROJECT_DIR/data/db.sqlite3"
echo "• Backups run daily at 2 AM"
echo "• Manual backup: sudo /usr/local/bin/backup_goathlete.sh"
echo ""
echo -e "${GREEN}✓ Backend is now running at https://$DOMAIN${NC}"
echo ""

