#!/bin/bash

# GoAthlete Django Admin - Quick Start Script
echo "================================================"
echo "   GoAthlete Django Admin - Quick Start"
echo "================================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "================================================"
echo "   Setup Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. CREATE SUPERUSER (Super Admin):"
echo "   python manage.py createsuperuser"
echo ""
echo "2. (OPTIONAL) Load sample data:"
echo "   python manage.py shell < create_sample_data.py"
echo ""
echo "3. START SERVER:"
echo "   python manage.py runserver"
echo ""
echo "4. ACCESS ADMIN:"
echo "   URL: http://localhost:8000/admin/"
echo ""
echo "================================================"
echo "   Admin Capabilities"
echo "================================================"
echo ""
echo "✓ Create Admins (password login)"
echo "✓ Create Executives (OTP login)"
echo "✓ Activate/Deactivate Executives"
echo "✓ View All Venues (all executives)"
echo "✓ Manage Courts"
echo "✓ Bulk Actions"
echo "✓ Advanced Filtering & Search"
echo ""
echo "📖 Documentation:"
echo "   - ADMIN_GUIDE.md (complete guide)"
echo "   - ADMIN_QUICK_REFERENCE.md (quick lookup)"
echo "   - ADMIN_INTERFACE.md (visual overview)"
echo "   - FEATURE_CHECKLIST.md (feature list)"
echo ""
echo "================================================"

