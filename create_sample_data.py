"""
Script to create sample data for testing
Run: python manage.py shell < create_sample_data.py
"""

from django.contrib.auth import get_user_model
from accounts.models import Executive
from venues.models import Venue, Court
from decimal import Decimal

User = get_user_model()

print("Creating sample data...")

# Create Admin user
admin_user, created = User.objects.get_or_create(
    email='admin@goathlete.com',
    defaults={
        'role': 'ADMIN',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_staff': True,
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"✓ Created Admin user: {admin_user.email}")
else:
    print(f"- Admin user already exists: {admin_user.email}")

# Create Executive user
exec_user, created = User.objects.get_or_create(
    email='executive@goathlete.com',
    defaults={
        'role': 'EXECUTIVE',
        'first_name': 'John',
        'last_name': 'Executive',
    }
)
if created:
    print(f"✓ Created Executive user: {exec_user.email}")
else:
    print(f"- Executive user already exists: {exec_user.email}")

# Create Executive profile
executive, created = Executive.objects.get_or_create(
    user=exec_user,
    defaults={
        'phone': '9876543210'
    }
)
if created:
    print(f"✓ Created Executive profile for: {exec_user.email}")
else:
    print(f"- Executive profile already exists for: {exec_user.email}")

# Create sample venues
venue1, created = Venue.objects.get_or_create(
    name='Sports Arena Mumbai',
    defaults={
        'address': '123 Andheri West',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'pincode': '400058',
        'phone': '9876543211',
        'email': 'arena@example.com',
        'status': 'REGISTERED',
        'executive': executive
    }
)
if created:
    print(f"✓ Created venue: {venue1.name}")
else:
    print(f"- Venue already exists: {venue1.name}")

venue2, created = Venue.objects.get_or_create(
    name='PlayZone Bangalore',
    defaults={
        'address': '456 Koramangala',
        'city': 'Bangalore',
        'state': 'Karnataka',
        'pincode': '560034',
        'phone': '9876543212',
        'email': 'playzone@example.com',
        'status': 'PRE_REGISTERED',
        'executive': executive
    }
)
if created:
    print(f"✓ Created venue: {venue2.name}")
else:
    print(f"- Venue already exists: {venue2.name}")

# Create sample courts for registered venue
court1, created = Court.objects.get_or_create(
    venue=venue1,
    name='Badminton Court 1',
    defaults={
        'sport_type': 'Badminton',
        'price_per_hour': Decimal('500.00'),
        'is_active': True
    }
)
if created:
    print(f"✓ Created court: {court1.name}")
else:
    print(f"- Court already exists: {court1.name}")

court2, created = Court.objects.get_or_create(
    venue=venue1,
    name='Tennis Court 1',
    defaults={
        'sport_type': 'Tennis',
        'price_per_hour': Decimal('800.00'),
        'is_active': True
    }
)
if created:
    print(f"✓ Created court: {court2.name}")
else:
    print(f"- Court already exists: {court2.name}")

print("\n" + "="*50)
print("Sample data created successfully!")
print("="*50)
print("\nLogin Credentials:")
print("-" * 50)
print("Admin Login:")
print("  Email: admin@goathlete.com")
print("  Password: admin123")
print("\nExecutive Login (OTP-based):")
print("  Email: executive@goathlete.com")
print("  (OTP will be generated on login)")
print("-" * 50)

