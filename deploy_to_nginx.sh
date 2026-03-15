#!/bin/bash

# deploy_to_nginx.sh
# Safely deploys the new architecture to your existing Nginx/Systemd setup.

set -e

echo "=========================================================="
echo "🚀 GoAthlete - Production Deployment (Nginx + Systemd) 🚀"
echo "=========================================================="

# Define directories
PROJECT_DIR="/home/$USER/GoAthlete_New_Arch"
OLD_BACKEND_DIR="/opt/goathlete"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory $PROJECT_DIR not found."
    echo "Please upload the GoAthlete_New_Arch folder to the server first."
    exit 1
fi

echo "🛑 Stopping the existing Gunicorn Service..."
sudo systemctl stop gunicorn_goathlete

echo "📦 Backing up old backend to /opt/goathlete_backup_$(date +%F)..."
# Create a backup just in case
sudo cp -r "$OLD_BACKEND_DIR" "/opt/goathlete_backup_$(date +%F)" || true

echo "🔄 Copying new backend architecture over..."
# Remove old python files, keep venv, staticfiles, media, .env, and db.sqlite3 intact
sudo find "$OLD_BACKEND_DIR" -maxdepth 1 -type d ! -name "venv" ! -name "staticfiles" ! -name "media" ! -name "goathlete" ! -path "$OLD_BACKEND_DIR" -exec rm -rf {} +
sudo find "$OLD_BACKEND_DIR" -maxdepth 1 -type f ! -name ".env" ! -name "db.sqlite3" ! -name "gunicorn.sock" -exec rm -f {} +

# Copy the new python code over
sudo cp -r "$PROJECT_DIR/goathlete_backend/"* "$OLD_BACKEND_DIR/"
sudo chown -R $USER:$GROUPS "$OLD_BACKEND_DIR"

echo "🐍 Updating Python environment & Dependencies..."
cd "$OLD_BACKEND_DIR"
source venv/bin/activate

# Install the dependencies from the new requirements file
pip install -r requirements.txt

# Ensure msal and requests are explicitly installed, which you added recently
pip install msal requests

echo "🗄️ Running Django Migrations and Static Collection..."
python manage.py migrate
python manage.py collectstatic --noinput

echo "🚀 Restarting Gunicorn Service..."
sudo systemctl restart gunicorn_goathlete

# Check status
if systemctl is-active --quiet gunicorn_goathlete; then
    echo "✅ Backend successfully deployed to $OLD_BACKEND_DIR!"
else
    echo "❌ Warning: gunicorn_goathlete failed to start. Run 'journalctl -u gunicorn_goathlete -e' to debug."
fi
echo ""

echo "----------------------------------------------------------"
echo "🌐 Building React Web Dashboards (Frontend)"
echo "----------------------------------------------------------"

build_web_app() {
    APP_NAME=$1
    echo "🔨 Building $APP_NAME..."
    cd "$PROJECT_DIR/$APP_NAME"
    npm install
    npm run build
    echo "✅ $APP_NAME built perfectly (dist folder created)."
}

# Compile the new React Apps
build_web_app "super_admin_web"
build_web_app "admin-web"
build_web_app "vendor_admin_web"

echo "=========================================================="
echo "🎉 Deployment Sequence Complete 🎉"
echo "The new Backend is purely handling API requests via api.goathlete.in!"
echo ""
echo "Next Steps for Frontend:"
echo "Your React dashboard builds are located at:"
echo "1. $PROJECT_DIR/super_admin_web/dist"
echo "2. $PROJECT_DIR/admin-web/dist"
echo "3. $PROJECT_DIR/vendor_admin_web/dist"
echo ""
echo "You can now copy these 'dist' folders to wherever Nginx serves your HTML,"
echo "for example: 'sudo cp -r $PROJECT_DIR/vendor_admin_web/dist/* /var/www/vendor.goathlete.in/html/'"
echo "=========================================================="
