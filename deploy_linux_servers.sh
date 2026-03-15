#!/bin/bash

# deploy_linux_servers.sh
# Server-side Deployment Script for GoAthlete Web & Backend Services

set -e

echo "============================================="
echo "⚙️ GoAthlete - Server Deployment Routine ⚙️"
echo "============================================="

PROJECT_DIR="/home/$USER/GoAthlete_New_Arch"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory $PROJECT_DIR not found."
    echo "Please run transfer_to_server.sh from your local machine first."
    exit 1
fi

cd "$PROJECT_DIR"

echo "---------------------------------------------"
echo "🐍 Deploying Django Backend"
echo "---------------------------------------------"

cd goathlete_backend 

# Create virtualenv if doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python Virtual Environment..."
    python3 -m venv venv
fi

# Activate and refresh
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
echo "Running Database Migrations..."
python manage.py migrate

# Restart systemd service (Gunicorn) or just background the process
echo "Booting/Restarting Gunicorn..."
# Ensure the port is freed
fuser -k 8000/tcp || true
nohup gunicorn goathlete_backend.wsgi:application --bind 0.0.0.0:8000 > "$LOG_DIR/backend.log" 2>&1 &
echo "✅ Backend successfully deployed on port 8000."

cd ..


echo "---------------------------------------------"
echo "🌐 Deploying React Web Dashboards"
echo "---------------------------------------------"

deploy_web_app() {
    APP_NAME=$1
    PORT=$2
    
    echo "🔨 Installing & Building $APP_NAME..."
    cd "$APP_NAME"
    npm install
    npm run build
    
    echo "🚀 Serving $APP_NAME on Port $PORT..."
    # Kill any existing serve instances on that port
    fuser -k $PORT/tcp || true
    # We use 'serve' to host the static build folder
    # Install globally if not present
    npm install -g serve
    
    nohup serve -s dist -l $PORT > "$LOG_DIR/$APP_NAME.log" 2>&1 &
    cd ..
    
    echo "✅ $APP_NAME deployed on port $PORT."
}

# Super Admin Web (Platform Administration)
deploy_web_app "super_admin_web" 3000

# GoAthlete Admin Web (Operations Admin)
deploy_web_app "admin-web" 3001

# Vendor Admin Web (Venue Owner)
deploy_web_app "vendor_admin_web" 3002

echo "============================================="
echo "🎉 GoAthlete Deployment Sequence Complete 🎉"
echo "Services Status:"
echo "- Backend API: running on :8000"
echo "- Super Admin Portal: running on :3000"
echo "- Admin Portal: running on :3001"
echo "- Vendor Portal: running on :3002"
echo "Logs saved to: $LOG_DIR"
echo "============================================="
