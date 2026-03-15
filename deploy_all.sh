#!/bin/bash

# deploy_all.sh
# ALL-IN-ONE AUTOMATED DEPLOYMENT SCRIPT
# Run this from /opt/goathlete (as root) after transferring all the files!

set -e

echo "==============================================================="
echo "🚀 GoAthlete FULL PLATFORM DEPLOYMENT SCRIPT 🚀"
echo "==============================================================="

# ======================================================
# CONFIGURATION — Django files live directly in /opt/goathlete
# ======================================================
BASE_DIR="/opt/goathlete"
VENV_DIR="$BASE_DIR/venv"
GUNICORN_SOCK="$BASE_DIR/gunicorn.sock"
STATIC_DIR="$BASE_DIR/staticfiles"
MEDIA_DIR="$BASE_DIR/media"

# Check we are running as root
if [ "$(whoami)" != "root" ]; then
  echo "❌ Please run this script as root (e.g., sudo ./deploy_all.sh)"
  exit 1
fi

echo "---------------------------------------------------------------"
echo "1. 🛑 Stopping Existing Services"
systemctl stop gunicorn_goathlete || true
systemctl stop nginx || true

echo "---------------------------------------------------------------"
echo "2. 🐍 Setting up Django Backend API"
cd "$BASE_DIR"

# Fix permissions (server runs as root)
chown -R root:www-data "$BASE_DIR" 2>/dev/null || chown -R root:root "$BASE_DIR"
chmod -R 755 "$BASE_DIR"

# Create venv if not already there
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python Virtual Environment..."
    python3 -m venv "$VENV_DIR"
fi

. "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt
# Ensure MSGraph email dependencies are present
pip install msal requests

# Create static and media folders if missing
mkdir -p "$STATIC_DIR" "$MEDIA_DIR"

# Database setup
python manage.py migrate
python manage.py collectstatic --noinput

echo "---------------------------------------------------------------"
echo "3. 🔐 Creating Default Test Credentials for All Roles"
python manage.py shell -c "
from accounts.models import User, UserRole

def create_or_reset(email, password, role, first, last, is_staff=False, is_superuser=False):
    if not User.objects.filter(email=email).exists():
        u = User.objects.create_user(email=email, password=password, role=role, first_name=first, last_name=last)
        u.is_staff = is_staff
        u.is_superuser = is_superuser
        u.save()
        print(f'  ✅ Created: {email} / {password}  [{role}]')
    else:
        u = User.objects.get(email=email)
        u.set_password(password)
        u.role = role
        u.is_staff = is_staff
        u.is_superuser = is_superuser
        u.save()
        print(f'  🔄 Reset:   {email} / {password}  [{role}]')

create_or_reset('superadmin@goathlete.com', 'admin123', 'SUPER_ADMIN',   'Super',  'Admin',   is_staff=True, is_superuser=True)
create_or_reset('admin@goathlete.com',      'admin123', 'ADMIN',         'GoAthlete', 'Admin', is_staff=True)
create_or_reset('venueadmin@goathlete.com', 'admin123', 'VENDOR_ADMIN',  'Venue',  'Admin')
create_or_reset('executive@goathlete.com',  'admin123', 'EXECUTIVE',     'Test',   'Executive')
create_or_reset('partner@goathlete.com',    'admin123', 'VENDOR_PARTNER','Test',   'Partner')
print('')
print('All credentials seeded successfully!')
"

echo "---------------------------------------------------------------"
echo "4. ⚙️ Writing Systemd Gunicorn Service"
cat > /etc/systemd/system/gunicorn_goathlete.service << EOF
[Unit]
Description=gunicorn daemon for GoAthlete
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=${BASE_DIR}
ExecStart=${VENV_DIR}/bin/gunicorn --access-logfile - --workers 3 --bind unix:${GUNICORN_SOCK} config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl start gunicorn_goathlete
systemctl enable gunicorn_goathlete

# Give a moment for the socket to appear
sleep 2

if systemctl is-active --quiet gunicorn_goathlete; then
    echo "✅ Gunicorn is running!"
else
    echo "❌ Gunicorn failed to start. Run: journalctl -u gunicorn_goathlete -e"
    exit 1
fi

echo "---------------------------------------------------------------"
echo "5. 🌐 Compiling React Frontends (this may take a few minutes)"

echo "🔨 Building Main Admin (admin-web)..."
cd "$BASE_DIR/admin-web"
npm install && npm run build
mkdir -p /var/www/admin.goathlete.in/html
cp -r dist/* /var/www/admin.goathlete.in/html/
echo "✅ Main Admin built!"

echo "🔨 Building Venue/Vendor Admin (vendor_admin_web)..."
cd "$BASE_DIR/vendor_admin_web"
npm install && npm run build
mkdir -p /var/www/vendor.goathlete.in/html
cp -r dist/* /var/www/vendor.goathlete.in/html/
echo "✅ Venue Admin built!"

chown -R www-data:www-data /var/www/
chmod -R 755 /var/www/

echo "---------------------------------------------------------------"
echo "6. 🛠️ Writing Nginx Configurations"

# --- API Config (api.goathlete.in) ---
cat > /etc/nginx/sites-available/api_goathlete << EOF
upstream goathlete {
    server unix:${GUNICORN_SOCK} fail_timeout=0;
}
server {
    listen 80;
    server_name api.goathlete.in;
    client_max_body_size 100M;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias ${STATIC_DIR}/;
    }
    location /media/ {
        alias ${MEDIA_DIR}/;
    }
    location / {
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://goathlete;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
EOF

# --- Vendor/Admin Frontend Config (vendor.goathlete.in) ---
cat > /etc/nginx/sites-available/vendor_goathlete << 'EOF'
server {
    listen 80;
    server_name vendor.goathlete.in;

    # Main Admin App at the root
    location / {
        root /var/www/admin.goathlete.in/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Venue Admin App at /venueadmin/
    location /venueadmin/ {
        alias /var/www/vendor.goathlete.in/html/;
        try_files $uri $uri/ /venueadmin/index.html;
    }
}
EOF

# Enable the two sites (remove old, re-enable fresh)
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/api_goathlete /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/vendor_goathlete /etc/nginx/sites-enabled/

nginx -t
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx running!"

echo "---------------------------------------------------------------"
echo "7. 🔒 Securing with SSL (Certbot)"
certbot --nginx \
  -d api.goathlete.in \
  -d vendor.goathlete.in \
  --non-interactive \
  --agree-tos \
  --email contact@goathlete.in \
  --redirect || echo "⚠️ Certbot could not issue a certificate — check your DNS settings."

echo ""
echo "==============================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==============================================================="
echo ""
echo "📱 1. Super Admin (Django): https://api.goathlete.in/admin"
echo "📱 2. Main Admin (React):   https://vendor.goathlete.in/"
echo "📱 3. Venue Admin (React):  https://vendor.goathlete.in/venueadmin/"
echo ""
echo "🔑 Login Credentials (all portals):"
echo "   Email:    admin@goathlete.com"
echo "   Password: admin123"
echo "==============================================================="
