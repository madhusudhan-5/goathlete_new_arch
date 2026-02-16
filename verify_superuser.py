#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

print("=" * 50)
print("Checking for existing superusers...")
print("=" * 50)

superusers = User.objects.filter(is_superuser=True)
print(f"\nFound {superusers.count()} superuser(s)")

for user in superusers:
    print(f"\n📧 Email: {user.email}")
    print(f"👤 Name: {user.first_name} {user.last_name}")
    print(f"🔑 Role: {user.role}")
    print(f"✅ Is Superuser: {user.is_superuser}")
    print(f"✅ Is Staff: {user.is_staff}")

# Try to get or create the admin user
print("\n" + "=" * 50)
print("Creating/Updating admin@goathlete.com...")
print("=" * 50)

try:
    user, created = User.objects.get_or_create(
        email='admin@goathlete.com',
        defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': 'SUPER_ADMIN',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
        }
    )
    
    # Set password
    user.set_password('admin123')
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.save()
    
    if created:
        print("\n✅ NEW superuser created!")
    else:
        print("\n✅ Existing superuser updated!")
    
    print(f"\n📧 Email: {user.email}")
    print(f"🔑 Password: admin123")
    print(f"👤 Name: {user.first_name} {user.last_name}")
    print(f"🎭 Role: {user.role}")
    print(f"\n🌐 Admin Panel: http://localhost:8000/admin/")
    print("\n" + "=" * 50)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
