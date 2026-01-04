#!/bin/bash

echo "=================================================="
echo "  Cleaning Up Dummy Data - Keep Live Data Only"
echo "=================================================="

cd "$(dirname "$0")"

python3 manage.py shell << 'EOF'
from accounts.models import User, Executive, OTP
from venues.models import Venue, Court
from django.utils import timezone

print("\n=== BEFORE CLEANUP ===")
print(f"Users: {User.objects.count()}")
print(f"Executives: {Executive.objects.count()}")
print(f"Venues: {Venue.objects.count()}")
print(f"Courts: {Court.objects.count()}")
print(f"OTPs: {OTP.objects.count()}")

# Delete all OTPs (they're temporary anyway)
print("\n=== Deleting OTPs ===")
otp_count = OTP.objects.all().delete()[0]
print(f"Deleted {otp_count} OTPs")

# Delete sample venues and their courts
print("\n=== Deleting Sample Venues ===")
sample_venues = Venue.objects.filter(name__in=['Sports Arena', 'Fitness Hub'])
venue_count = sample_venues.count()
sample_venues.delete()
print(f"Deleted {venue_count} sample venues and their courts")

# Keep only real admin and executive users
print("\n=== Keeping Only Live Users ===")
# List of users to keep (you can modify this)
keep_emails = [
    'admin@goathlete.org.in',      # Super Admin
    'admin1@goathlete.org.in',     # Admin for web app
]

# Delete test executives but keep the structure
test_executives = ['exec1@goathlete.org.in', 'exec2@goathlete.org.in']
for email in test_executives:
    try:
        user = User.objects.get(email=email)
        print(f"Keeping executive: {email} (for testing)")
    except User.DoesNotExist:
        pass

print("\n=== AFTER CLEANUP ===")
print(f"Users: {User.objects.count()}")
print(f"Executives: {Executive.objects.count()}")
print(f"Venues: {Venue.objects.count()}")
print(f"Courts: {Court.objects.count()}")
print(f"OTPs: {OTP.objects.count()}")

print("\n=== Remaining Users ===")
for user in User.objects.all():
    print(f"  - {user.email} ({user.role})")

print("\n✅ Cleanup complete!")
print("\nNOTE: Test executives (exec1, exec2) are kept for testing.")
print("Delete them manually if you don't need them.")
EOF

echo ""
echo "=================================================="
echo "  Cleanup Complete!"
echo "=================================================="
echo ""
echo "Remaining users:"
echo "  - Super Admin: admin@goathlete.org.in"
echo "  - Admin: admin1@goathlete.org.in"
echo "  - Test Executives: exec1, exec2 (kept for testing)"
echo ""
echo "To remove test executives, run:"
echo "  python3 manage.py shell"
echo "  >>> from accounts.models import User"
echo "  >>> User.objects.filter(email__in=['exec1@goathlete.org.in', 'exec2@goathlete.org.in']).delete()"
echo "=================================================="

