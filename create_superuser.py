#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

# Check if superuser already exists
if User.objects.filter(email='admin@goathlete.com').exists():
    print('❌ Superuser with email admin@goathlete.com already exists')
    user = User.objects.get(email='admin@goathlete.com')
    print(f'Email: {user.email}')
    print(f'Role: {user.role}')
else:
    # Create superuser
    user = User.objects.create_superuser(
        email='admin@goathlete.com',
        password='admin123',
        role='SUPER_ADMIN',
        first_name='Super',
        last_name='Admin'
    )
    print('✅ Superuser created successfully!')
    print(f'Email: {user.email}')
    print(f'Role: {user.role}')
    print('Password: admin123')
    print('\n📝 Admin Panel: http://localhost:8000/admin/')
