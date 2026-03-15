#!/bin/bash

# build_apks_locally.sh
# Automates the creation of Android APKs via Expo (EAS Build) for GoAthlete Apps
# Ensure you have 'eas-cli' installed globally: npm install -g eas-cli
# Assumes you are logged into EAS: eas login

set -e

# Export Android SDK Path for Mac
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "============================================="
echo "🏋️‍♂️  GoAthlete - Local APK Builder   🏋️‍♂️"
echo "============================================="

APP_DIRS=("customer_app" "vendor_partner_mobile" "executive-app")

for APP in "${APP_DIRS[@]}"; do
    echo "---------------------------------------------"
    echo "⚙️  Building APK for: $APP"
    echo "---------------------------------------------"
    
    cd "$APP"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing node modules for $APP..."
        npm install
    fi

    # Trigger local APK build via EAS
    # Profile "preview" should be set up in eas.json to compile for Android APK
    # If eas.json is missing, this command will prompt to initialize it.
    echo "🔨 Initiating EAS Build (Android Local/Preview)..."
    eas build --platform android --profile preview --local
    
    cd ..
    echo "✅ Completed processing for $APP."
done

echo "============================================="
echo "🎉 All local APK builds completed!"
echo "Check the parent directories of the apps for the exported .apk files."
echo "============================================="
