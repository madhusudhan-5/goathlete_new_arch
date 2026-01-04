#!/bin/bash

echo "=================================================="
echo "  GoAthlete Executive App Setup"
echo "=================================================="

# Navigate to executive-app directory
cd "$(dirname "$0")/executive-app"

# Always run npm install to ensure dependencies are up to date
echo "Installing dependencies..."
npm install

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo ""
echo "Dependencies installed successfully."
echo "Run one of the following scripts:"
echo "  './run_executive_web.sh'     - Web version"
echo "  './run_executive_android.sh' - Android version"
echo "  './run_executive_ios.sh'     - iOS version"
echo "=================================================="

