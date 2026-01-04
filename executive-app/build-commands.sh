#!/bin/bash

# GoAthlete Executive App - Build Commands
# Run these commands one by one in your terminal

echo "======================================"
echo "GoAthlete Executive App Build Script"
echo "======================================"
echo ""

# Navigate to project directory
echo "📁 Step 1: Navigate to project directory"
echo "Run: cd /Users/madhusudhanm/Documents/GoAthlete-App/GoAthlete_New_Arch/executive-app"
echo ""
echo "Press Enter when ready..."
read

# Initialize EAS project
echo "🚀 Step 2: Initialize EAS Project"
echo "Run: eas project:init"
echo ""
echo "When prompted 'Would you like to create a project?'"
echo "Type: Y and press Enter"
echo ""
echo "This will create a project on Expo servers and add project ID to app.json"
echo ""
echo "Press Enter when ready..."
read

# Build preview APK
echo "📱 Step 3: Build Preview APK (for testing)"
echo "Run: eas build --platform android --profile preview"
echo ""
echo "When prompted 'Generate new Android Keystore?'"
echo "Type: Y and press Enter (first time only)"
echo ""
echo "Build will take 10-15 minutes"
echo "You can press Ctrl+C anytime (build continues on server)"
echo ""
echo "After build completes:"
echo "1. Click the download link"
echo "2. Install APK on your Android phone"
echo "3. Test all features thoroughly"
echo ""
echo "Press Enter when ready..."
read

# Build production AAB
echo "🏆 Step 4: Build Production AAB (for Play Store)"
echo "Only run this AFTER testing the preview APK successfully!"
echo ""
echo "Run: eas build --platform android --profile production"
echo ""
echo "Build will take 15-20 minutes"
echo "After completion, download the .aab file"
echo ""
echo "Press Enter when ready..."
read

# View builds
echo "📊 Step 5: View All Builds"
echo "Run: eas build:list"
echo ""
echo "This shows all your builds with download links"
echo ""
echo "Or visit: https://expo.dev"
echo ""

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Test the APK thoroughly"
echo "2. Create Play Store assets (feature graphic, screenshots)"
echo "3. Set up Google Play Console"
echo "4. Upload AAB to Play Store"
echo ""
echo "Refer to BUILD_GUIDE.md for complete Play Store submission guide"
echo ""

