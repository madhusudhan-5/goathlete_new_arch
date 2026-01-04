#!/bin/bash

echo "=================================================="
echo "  Starting GoAthlete Django Backend"
echo "=================================================="

# Navigate to project root
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Start Django server
echo "Starting server at http://localhost:8000"
echo "Admin panel: http://localhost:8000/admin"
echo "API endpoints: http://localhost:8000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

python3 manage.py runserver

