#!/bin/bash

# GoAthlete - Complete Setup and Run Guide
# This file shows you exactly what to run in each terminal

cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🏆  GoAthlete Multi-App Startup Guide  🏆               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

✅ Backend setup is COMPLETE!
   - Database created
   - Migrations applied
   - Sample data loaded

Now follow these steps to run all applications:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 TERMINAL 1 - Django Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run this command:

    ./run_backend.sh

What it does:
  ✓ Starts Django server on http://localhost:8000
  ✓ Provides REST APIs for admin and executive apps
  ✓ Serves Django Admin panel

Access:
  • API:          http://localhost:8000/api
  • Admin Panel:  http://localhost:8000/admin
  
Credentials (Django Admin):
  📧 Email:    admin@goathlete.org.in
  🔑 Password: admin123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 TERMINAL 2 - Admin Web App (React)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First time only:

    ./setup_admin_web.sh

Then run:

    ./run_admin_web.sh

What it does:
  ✓ Starts React development server on http://localhost:5173
  ✓ Admin dashboard with executive management
  ✓ Venue listing and analytics

Access:
  • Web App:  http://localhost:5173
  
Credentials:
  📧 Email:    admin1@goathlete.org.in
  🔑 Password: admin123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 TERMINAL 3 - Executive App (Expo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First time only:

    ./setup_executive_app.sh

Then choose one:

  🌐 Web Version:
     ./run_executive_web.sh
     → Opens on http://localhost:8081

  📱 Android Version:
     ./run_executive_android.sh
     → Requires Android emulator or device with Expo Go

  🍎 iOS Version (macOS only):
     ./run_executive_ios.sh
     → Requires iOS simulator or device with Expo Go

Access:
  • Web App:  http://localhost:8081
  
Credentials:
  📧 Email:    exec1@goathlete.org.in
  🔑 Password: exec123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Quick Start Commands Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Terminal 1:  ./run_backend.sh
Terminal 2:  ./run_admin_web.sh
Terminal 3:  ./run_executive_web.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 What's Included
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Users:
  • 1 Super Admin  (Django admin access)
  • 1 Admin        (Web app access)
  • 2 Executives   (Mobile app access)

Venues:
  • Sports Arena   (Pre-Registered, Bangalore)
  • Fitness Hub    (Registered, Mumbai)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Pro Tips
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Always start Terminal 1 (backend) FIRST
2. Wait for "Starting development server" message before starting others
3. Use Ctrl+C to stop any server
4. Check QUICK_START.md for detailed documentation
5. If ports are in use, servers will use next available port

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• QUICK_START.md                         - Detailed setup guide
• SETUP_GUIDE.md                         - Comprehensive documentation
• executive-app/VENUE_PRE_REGISTRATION.md - Venue flow documentation
• admin-web/README.md                    - Admin app details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to start? Open 3 terminals and follow the commands above! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

