#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from accounts.models import User

# Delete any existing admin users
print("Deleting existing admin users...")
User.objects.filter(email='admin@goathlete.com').delete()

# Create new superuser
print("Creating new superuser...")
user = User.objects.create_superuser(
    email='admin@goathlete.com',
    password='admin123',
    first_name='Super',
    last_name='Admin',
    role='SUPER_ADMIN'
)

# Verify the user was created correctly
print("\n" + "="*60)
print("✅ SUPERUSER CREATED SUCCESSFULLY!")
print("="*60)
print(f"📧 Email: {user.email}")
print(f"🔑 Password: admin123")
print(f"👤 Name: {user.first_name} {user.last_name}")
print(f"🎭 Role: {user.role}")
print(f"✅ Is Superuser: {user.is_superuser}")
print(f"✅ Is Staff: {user.is_staff}")
print(f"✅ Is Active: {user.is_active}")
print(f"🔐 Has Usable Password: {user.has_usable_password()}")
print("\n🌐 Login at: http://localhost:8000/admin/")
print("="*60)

# Test password
if user.check_password('admin123'):
    print("✅ Password verification: SUCCESS")
else:
    print("❌ Password verification: FAILED")
    
print("="*60)
