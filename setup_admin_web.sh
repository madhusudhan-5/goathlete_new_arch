#!/bin/bash

echo "=================================================="
echo "  GoAthlete Admin Web App Setup"
echo "=================================================="

# Navigate to admin-web directory
cd "$(dirname "$0")/admin-web"

# Always run npm install to ensure dependencies are up to date
echo "Installing dependencies..."
npm install

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo ""
echo "Dependencies installed successfully."
echo "Run './run_admin_web.sh' to start the admin web app"
echo "=================================================="

