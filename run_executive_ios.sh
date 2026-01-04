#!/bin/bash

echo "=================================================="
echo "  Starting GoAthlete Executive App (iOS)"
echo "=================================================="

# Navigate to executive-app directory
cd "$(dirname "$0")/executive-app"

# Start Expo for iOS
echo "Starting executive app for iOS"
echo ""
echo "Make sure you have:"
echo "  - Xcode installed (macOS only)"
echo "  - iOS simulator running, OR"
echo "  - Expo Go app installed on your iOS device"
echo ""
echo "Login credentials:"
echo "  Email: exec1@goathlete.org.in"
echo "  Password: exec123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

npx expo start --ios

