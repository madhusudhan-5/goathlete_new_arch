#!/bin/bash

echo "=================================================="
echo "  GoAthlete Backend Setup"
echo "=================================================="

# Navigate to project root
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo "Warning: Could not activate virtual environment"
fi

# Install dependencies
echo "Installing dependencies..."
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Remove old database if exists
if [ -f "db.sqlite3" ]; then
    echo "Removing old database..."
    rm db.sqlite3
fi

# Remove old migrations
echo "Removing old migrations..."
rm -f accounts/migrations/0*.py
rm -f venues/migrations/0*.py

# Create new migrations
echo "Creating migrations..."
python3 manage.py makemigrations accounts
python3 manage.py makemigrations venues
python3 manage.py makemigrations

# Apply migrations
echo "Applying migrations..."
python3 manage.py migrate

# Create superuser
echo ""
echo "=================================================="
echo "  Creating Super Admin"
echo "=================================================="
echo "Email: admin@goathlete.org.in"
echo "Password: admin123"
echo ""

python3 manage.py shell << EOF
from accounts.models import User
if not User.objects.filter(email='admin@goathlete.org.in').exists():
    User.objects.create_superuser(
        email='admin@goathlete.org.in',
        password='admin123',
        role='SUPER_ADMIN'
    )
    print("✅ Super Admin created successfully!")
else:
    print("ℹ️  Super Admin already exists")
EOF

# Create sample data
echo ""
echo "=================================================="
echo "  Creating Sample Data"
echo "=================================================="
python3 manage.py shell << EOF
from accounts.models import User, Executive
from venues.models import Venue, Court
from datetime import datetime, timedelta

# Create Admin user
if not User.objects.filter(email='admin1@goathlete.org.in').exists():
    admin = User.objects.create_user(
        email='admin1@goathlete.org.in',
        password='admin123',
        role='ADMIN'
    )
    print("✅ Admin user created")

# Create Executive users
exec_emails = ['exec1@goathlete.org.in', 'exec2@goathlete.org.in']
for i, email in enumerate(exec_emails, 1):
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(
            email=email,
            password='exec123',
            role='EXECUTIVE'
        )
        Executive.objects.create(
            user=user,
            phone=f'+9190000000{i}'
        )
        print(f"✅ Executive {email} created")

# Create sample venues
venues_data = [
    {'name': 'Sports Arena', 'city': 'Bangalore', 'status': 'PRE_REGISTERED'},
    {'name': 'Fitness Hub', 'city': 'Mumbai', 'status': 'REGISTERED'},
]

exec_instance = Executive.objects.first()
if exec_instance:
    for venue_data in venues_data:
        if not Venue.objects.filter(name=venue_data['name']).exists():
            venue = Venue.objects.create(
                name=venue_data['name'],
                address='123 Main Street',
                city=venue_data['city'],
                state='Karnataka' if venue_data['city'] == 'Bangalore' else 'Maharashtra',
                pincode='560001' if venue_data['city'] == 'Bangalore' else '400001',
                phone='+919000000000',
                email=f"{venue_data['name'].lower().replace(' ', '')}@venue.com",
                status=venue_data['status'],
                executive=exec_instance
            )
            # Add courts
            Court.objects.create(
                venue=venue,
                name='Court 1',
                sport_type='BADMINTON',
                price_per_hour=500.00
            )
            print(f"✅ Venue {venue_data['name']} created")

print("")
print("✅ Sample data created successfully!")
EOF

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="
echo ""
echo "Credentials:"
echo "  Super Admin: admin@goathlete.org.in / admin123"
echo "  Admin: admin1@goathlete.org.in / admin123"
echo "  Executive: exec1@goathlete.org.in / exec123"
echo ""
echo "Run './run_backend.sh' to start the Django server"
echo "=================================================="

