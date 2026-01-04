#!/bin/bash

echo "=================================================="
echo "  Starting GoAthlete Admin Web App"
echo "=================================================="

# Navigate to admin-web directory
cd "$(dirname "$0")/admin-web"

# Start development server
echo "Starting admin web app at http://localhost:5173"
echo ""
echo "Login credentials:"
echo "  Email: admin1@goathlete.org.in"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

npm run dev

