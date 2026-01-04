#!/bin/bash

echo "=================================================="
echo "  Starting GoAthlete Executive App (Web)"
echo "=================================================="

# Navigate to executive-app directory
cd "$(dirname "$0")/executive-app"

# Start Expo web
echo "Starting executive app at http://localhost:8081"
echo ""
echo "Login credentials:"
echo "  Email: exec1@goathlete.org.in"
echo "  Password: exec123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

npx expo start --web

