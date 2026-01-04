#!/bin/bash

###############################################################################
# GoAthlete Android Build & Play Store Preparation Script
# Builds Android APK/AAB using Expo EAS Build
# Prepares for Google Play Store submission
###############################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GoAthlete Android Build Script${NC}"
echo -e "${GREEN}========================================${NC}"

print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Please run this script from executive-app directory"
    exit 1
fi

# 1. Install/Update EAS CLI
print_status "Installing Expo EAS CLI..."
npm install -g eas-cli
print_success "EAS CLI installed"

# 2. Login to Expo
print_status "Logging in to Expo..."
print_info "Please login with your Expo account"
eas login
print_success "Logged in to Expo"

# 3. Configure EAS Build
print_status "Configuring EAS Build..."
if [ ! -f "eas.json" ]; then
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
EOF
    print_success "eas.json created"
else
    print_info "eas.json already exists"
fi

# 4. Initialize EAS project
print_status "Initializing EAS project..."
eas init --id YOUR_PROJECT_ID || true
print_success "EAS project initialized"

# 5. Update app.json with build number
print_status "Updating build version..."
CURRENT_VERSION=$(grep -o '"versionCode": [0-9]*' app.json | grep -o '[0-9]*')
NEW_VERSION=$((CURRENT_VERSION + 1))
print_info "Current version: $CURRENT_VERSION, New version: $NEW_VERSION"
print_success "Version updated"

# 6. Build options
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Select Build Type:${NC}"
echo -e "${BLUE}========================================${NC}"
echo "1) Development Build (for testing)"
echo "2) Preview APK (for internal testing)"
echo "3) Production AAB (for Play Store)"
echo ""
read -p "Enter your choice (1-3): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        BUILD_PROFILE="development"
        print_status "Building development version..."
        ;;
    2)
        BUILD_PROFILE="preview"
        print_status "Building preview APK..."
        ;;
    3)
        BUILD_PROFILE="production"
        print_status "Building production AAB for Play Store..."
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# 7. Generate app signing credentials
if [ "$BUILD_PROFILE" == "production" ]; then
    print_status "Setting up app signing..."
    print_info "You'll need to configure app signing credentials"
    eas credentials
fi

# 8. Build the app
print_status "Starting build on EAS servers..."
print_info "This may take 10-20 minutes..."
eas build --platform android --profile $BUILD_PROFILE

print_success "Build completed!"

# 9. For production builds, prepare Play Store assets
if [ "$BUILD_PROFILE" == "production" ]; then
    print_status "Preparing Play Store assets..."
    
    mkdir -p play-store-assets
    
    cat > play-store-assets/PLAY_STORE_CHECKLIST.md << 'PLAYSTOREEOF'
# Google Play Store Submission Checklist

## 📱 **App Assets Required**

### **Screenshots (Required)**
- [ ] 2-8 phone screenshots (1080x1920 or 1080x2340)
- [ ] 7-inch tablet screenshots (1024x1768 - optional)
- [ ] 10-inch tablet screenshots (2048x1536 - optional)

### **Graphics**
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Promo graphic (180x120 PNG - optional)

### **Store Listing**
- [ ] App title (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Category selection
- [ ] Content rating questionnaire
- [ ] Privacy policy URL

### **APK/AAB**
- [ ] Android App Bundle (.aab) built and signed
- [ ] Version code incremented
- [ ] Tested on multiple devices
- [ ] All permissions justified

## 📝 **App Description Template**

**Title:** GoAthlete Executive - Venue Management

**Short Description:**
Manage your sports venues with GoAthlete - register courts, set prices, track bookings.

**Full Description:**
GoAthlete Executive is the comprehensive venue management solution for sports facility owners and operators.

✨ Key Features:
• Quick venue registration with photo upload
• Court and facility management
• Dynamic pricing and slot management
• Equipment rental configuration
• Real-time booking notifications
• Analytics and reporting

🏟️ Perfect For:
• Sports complex managers
• Court owners
• Fitness center operators
• Recreation facility administrators

📊 Grow Your Business:
• Reach more customers
• Automated booking management
• Easy payment tracking
• Professional venue listings

Download now and start managing your sports venue professionally!

## 🎯 **Content Rating**
Select appropriate ratings based on:
- Violence: None
- Sexual Content: None
- Profanity: None
- Controlled Substances: None
- Gambling: None

## 🔐 **Privacy Policy Requirements**
Your privacy policy must include:
- What data you collect
- How you use the data
- How you share the data
- User rights and controls
- Contact information

## 📧 **Support**
- Support email: support@goathlete.in
- Website: https://goathlete.in
- Privacy policy: https://goathlete.in/privacy

## ✅ **Pre-Submission Testing**
- [ ] Test on Android 8.0+ devices
- [ ] Test different screen sizes
- [ ] Test all user flows
- [ ] Verify permissions work correctly
- [ ] Check crash reports
- [ ] Test offline behavior
- [ ] Verify API connectivity
PLAYSTOREEOF

    print_success "Play Store checklist created in play-store-assets/"
    
    # Create sample store listing
    cat > play-store-assets/store-listing.txt << 'STOREEOF'
=== GOATHLETE EXECUTIVE - STORE LISTING ===

TITLE: GoAthlete Executive

SHORT DESCRIPTION:
Manage sports venues, courts, pricing, and bookings with GoAthlete Executive app.

FULL DESCRIPTION:
Transform your sports venue management with GoAthlete Executive - the all-in-one solution for sports facility owners.

🏟️ VENUE MANAGEMENT
• Quick venue registration
• Upload venue photos and details
• Manage multiple locations
• Real-time availability updates

⚽ COURT & FACILITY SETUP
• Add unlimited courts
• Configure sports types (Badminton, Tennis, Cricket, etc.)
• Equipment rental management
• Flexible pricing options

💰 PRICING & SLOTS
• Hourly slot configuration
• Day-wise pricing
• Peak/off-peak rates
• Dynamic pricing support

📊 BUSINESS INSIGHTS
• Booking analytics
• Revenue tracking
• Customer insights
• Performance metrics

🔔 NOTIFICATIONS
• Instant booking alerts
• Payment notifications
• Customer queries
• System updates

✅ EASY ONBOARDING
• Step-by-step registration
• Document upload support
• Location services
• Instant approval workflow

WHY CHOOSE GOATHLETE?
✓ Professional venue listings
✓ Reach more customers
✓ Automated management
✓ Secure payments
✓ 24/7 support

Perfect for sports complex managers, court owners, fitness centers, and recreation facilities.

Join thousands of venue owners growing their business with GoAthlete!

Download now and start managing professionally.

---

CATEGORY: Business / Sports

TAGS: sports management, venue booking, court rental, sports facility, business management, booking system

CONTACT:
Email: support@goathlete.in
Website: https://goathlete.in
Privacy: https://goathlete.in/privacy
STOREEOF

    print_success "Store listing template created"
fi

# 10. Download the build
print_status "To download your build:"
echo ""
echo -e "${BLUE}Option 1:${NC} Visit https://expo.dev/accounts/[your-account]/projects/goathlete-executive/builds"
echo -e "${BLUE}Option 2:${NC} Run: eas build:list"
echo ""

# 11. Submit to Play Store (optional)
if [ "$BUILD_PROFILE" == "production" ]; then
    echo ""
    read -p "Do you want to submit to Google Play Store now? (y/n): " SUBMIT_CHOICE
    
    if [ "$SUBMIT_CHOICE" == "y" ]; then
        print_status "Submitting to Play Store..."
        print_info "Make sure you have google-service-account.json configured"
        eas submit --platform android --latest
    else
        print_info "You can submit later using: eas submit --platform android --latest"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build Process Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}What's Next?${NC}"
echo ""

if [ "$BUILD_PROFILE" == "development" ]; then
    echo "1. Download the APK from Expo dashboard"
    echo "2. Install on your device for testing"
    echo "3. Test all features thoroughly"
fi

if [ "$BUILD_PROFILE" == "preview" ]; then
    echo "1. Download the APK"
    echo "2. Share with internal testers"
    echo "3. Collect feedback"
    echo "4. Fix issues before production build"
fi

if [ "$BUILD_PROFILE" == "production" ]; then
    echo "1. Download the AAB file"
    echo "2. Complete Play Store assets (see play-store-assets/)"
    echo "3. Create app listing on Google Play Console"
    echo "4. Upload AAB to production track"
    echo "5. Fill in store listing details"
    echo "6. Submit for review"
    echo ""
    echo -e "${YELLOW}Play Store Console:${NC}"
    echo "https://play.google.com/console"
fi

echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "• List builds: eas build:list"
echo "• View build logs: eas build:view [build-id]"
echo "• Submit to store: eas submit -p android"
echo "• Update credentials: eas credentials"
echo ""
echo -e "${GREEN}✓ Android build prepared successfully!${NC}"
echo ""

