#!/bin/bash

# Force Stop and Restart Executive App with Cache Clear
# This script stops the executive app and restarts it with a clean cache

echo "==================================================="
echo "🔄 Restarting Executive App (Web) with Cache Clear"
echo "==================================================="
echo ""

cd "$(dirname "$0")/executive-app"

echo "📦 Clearing Metro bundler cache..."
npx expo start --clear -w

echo ""
echo "==================================================="
echo "✅ Executive App restarted with clean cache!"
echo "==================================================="
echo ""
echo "🌐 Open in browser: http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==================================================="

