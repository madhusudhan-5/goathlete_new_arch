from accounts.models import User

# Delete existing admin if exists
User.objects.filter(email='admin@goathlete.com').delete()

# Create fresh superuser
user = User.objects.create_superuser(
    email='admin@goathlete.com',
    password='admin123',
    role='SUPER_ADMIN',
    first_name='Super',
    last_name='Admin'
)

print('✅ Superuser created!')
print(f'Email: {user.email}')
print(f'Password: admin123')
print(f'Is Superuser: {user.is_superuser}')
print(f'Is Staff: {user.is_staff}')
print(f'Is Active: {user.is_active}')
