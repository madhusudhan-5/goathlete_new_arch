#!/bin/bash

echo "=================================================="
echo "  Starting GoAthlete Executive App (Android)"
echo "=================================================="

# Navigate to executive-app directory
cd "$(dirname "$0")/executive-app"

# Start Expo for Android
echo "Starting executive app for Android"
echo ""
echo "Make sure you have:"
echo "  - Android emulator running, OR"
echo "  - Android device connected via USB with debugging enabled, OR"
echo "  - Expo Go app installed on your Android device"
echo ""
echo "Login credentials:"
echo "  Email: exec1@goathlete.org.in"
echo "  Password: exec123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

npx expo start --android

