#!/bin/bash

###############################################################################
# Create Sample Data for GoAthlete Platform
# Populates database with test users, venues, courts, bookings, and tournaments
###############################################################################

echo "Creating sample data for GoAthlete..."

python3 manage.py shell << 'PYEOF'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from venues.models import Venue, Court
from partners.models import VendorAdmin, VendorPartner
from players.models import Player
from bookings.models import Booking
from tournaments.models import Tournament
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

print("\n" + "="*60)
print("CREATING SAMPLE DATA")
print("="*60)

# Create users
print("\n📝 Creating users...")

admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@goathlete.com',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'ADMIN'
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
print(f"{'✓ Created' if created else '  Exists'}: Admin User (admin / admin123)")

vendor_user, created = User.objects.get_or_create(
    username='vendor',
    defaults={
        'email': 'vendor@goathlete.com',
        'first_name': 'Venue',
        'last_name': 'Owner',
        'role': 'VENDOR_ADMIN'
    }
)
if created:
    vendor_user.set_password('vendor123')
    vendor_user.save()
print(f"{'✓ Created' if created else '  Exists'}: Vendor Admin (vendor / vendor123)")

partner_user, created = User.objects.get_or_create(
    username='partner',
    defaults={
        'email': 'partner@goathlete.com',
        'first_name': 'Staff',
        'last_name': 'Member',
        'role': 'VENDOR_PARTNER'
    }
)
if created:
    partner_user.set_password('partner123')
    partner_user.save()
print(f"{'✓ Created' if created else '  Exists'}: Partner (partner / partner123)")

player_user, created = User.objects.get_or_create(
    username='player1',
    defaults={
        'email': 'player1@example.com',
        'phone': '+919876543210',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'PLAYER'
    }
)
if created:
    player_user.set_password('player123')
    player_user.save()
print(f"{'✓ Created' if created else '  Exists'}: Player (player1 / player123)")

# Create more players
for i in range(2, 6):
    player, created = User.objects.get_or_create(
        username=f'player{i}',
        defaults={
            'email': f'player{i}@example.com',
            'phone': f'+9198765432{10+i}',
            'first_name': f'Player',
            'last_name': f'{i}',
            'role': 'PLAYER'
        }
    )
    if created:
        player.set_password('player123')
        player.save()
        print(f"✓ Created: Player {i} (player{i} / player123)")

# Create venues
print("\n🏟️  Creating venues...")

venues_data = [
    {
        'name': 'Sports Arena Mumbai',
        'address': '123 MG Road, Andheri East',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'pincode': '400053',
        'contact_number': '+912212345678',
        'contact_email': 'mumbai@sportsarena.com',
    },
    {
        'name': 'Elite Sports Complex',
        'address': '456 Park Street, Bandra West',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'pincode': '400050',
        'contact_number': '+912298765432',
        'contact_email': 'bandra@elitesports.com',
    },
    {
        'name': 'Champions Sports Club',
        'address': '789 Link Road, Malad',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'pincode': '400064',
        'contact_number': '+912287654321',
        'contact_email': 'malad@champions.com',
    }
]

venues = []
for venue_data in venues_data:
    venue, created = Venue.objects.get_or_create(
        name=venue_data['name'],
        defaults={**venue_data, 'status': 'ACTIVE'}
    )
    venues.append(venue)
    print(f"{'✓ Created' if created else '  Exists'}: {venue.name}")

# Create vendor admin and partner
vendor_admin, created = VendorAdmin.objects.get_or_create(
    user=vendor_user,
    defaults={
        'venue': venues[0],
        'phone': '+919876543200'
    }
)

partner, created = VendorPartner.objects.get_or_create(
    user=partner_user,
    defaults={
        'venue': venues[0],
        'vendor_admin': vendor_admin,
        'phone': '+919876543201',
        'status': 'ACTIVE'
    }
)

# Create player profiles
player, created = Player.objects.get_or_create(
    user=player_user,
    defaults={'phone': '+919876543210'}
)

# Create courts
print("\n🎾 Creating courts...")

courts_data = [
    ('Badminton', 'Wooden', 4),
    ('Tennis', 'Clay', 2),
    ('Squash', 'Wooden', 2),
    ('Basketball', 'Synthetic', 1),
]

all_courts = []
for venue in venues[:2]:  # First 2 venues
    for sport, surface, count in courts_data:
        for i in range(1, count + 1):
            court, created = Court.objects.get_or_create(
                venue=venue,
                name=f'{sport} Court {i}',
                defaults={
                    'sport': sport,
                    'surface_type': surface,
                    'is_active': True
                }
            )
            all_courts.append(court)
            if created:
                print(f"✓ Created: {venue.name} - {court.name}")

# Create bookings
print("\n📅 Creating sample bookings...")

booking_count = 0
for i in range(5):
    court = all_courts[i % len(all_courts)]
    booking_date = timezone.now().date() + timedelta(days=i)
    
    booking, created = Booking.objects.get_or_create(
        court=court,
        booking_date=booking_date,
        start_time=f'{10 + (i % 8)}:00',
        defaults={
            'user': player_user,
            'duration_hours': 1.0,
            'price_per_hour': 500 + (i * 50),
            'total_amount': 500 + (i * 50),
            'booking_type': 'ONLINE',
            'status': 'CONFIRMED',
            'is_paid': True
        }
    )
    if created:
        booking_count += 1

print(f"✓ Created {booking_count} bookings")

# Create tournaments
print("\n🏆 Creating tournaments...")

tournaments_data = [
    {
        'name': 'Mumbai Open Badminton Championship',
        'sport': 'Badminton',
        'days': 7,
        'duration': 3,
        'type': 'SINGLES',
        'fee': 500,
        'max': 32
    },
    {
        'name': 'Elite Tennis Tournament',
        'sport': 'Tennis',
        'days': 14,
        'duration': 5,
        'type': 'DOUBLES',
        'fee': 1000,
        'max': 16
    },
    {
        'name': 'Squash Masters Cup',
        'sport': 'Squash',
        'days': 21,
        'duration': 2,
        'type': 'SINGLES',
        'fee': 750,
        'max': 24
    }
]

tournament_count = 0
for t_data in tournaments_data:
    start_date = timezone.now().date() + timedelta(days=t_data['days'])
    tournament, created = Tournament.objects.get_or_create(
        name=t_data['name'],
        defaults={
            'sport': t_data['sport'],
            'venue': venues[0],
            'start_date': start_date,
            'end_date': start_date + timedelta(days=t_data['duration']),
            'tournament_type': t_data['type'],
            'status': 'UPCOMING',
            'entry_fee': t_data['fee'],
            'max_participants': t_data['max']
        }
    )
    if created:
        tournament_count += 1
        print(f"✓ Created: {tournament.name}")

print("\n" + "="*60)
print("✅ SAMPLE DATA CREATED SUCCESSFULLY!")
print("="*60)

print("\n📊 Summary:")
print(f"  • {User.objects.count()} users")
print(f"  • {Venue.objects.count()} venues")
print(f"  • {Court.objects.count()} courts")
print(f"  • {Booking.objects.count()} bookings")
print(f"  • {Tournament.objects.count()} tournaments")

print("\n🔐 Login Credentials:")
print("  ┌─────────────┬──────────┬─────────────┐")
print("  │ Role        │ Username │ Password    │")
print("  ├─────────────┼──────────┼─────────────┤")
print("  │ Admin       │ admin    │ admin123    │")
print("  │ Vendor      │ vendor   │ vendor123   │")
print("  │ Partner     │ partner  │ partner123  │")
print("  │ Player      │ player1  │ player123   │")
print("  └─────────────┴──────────┴─────────────┘")

print("\n🌐 Access URLs:")
print("  • Backend API:    http://localhost:8000/api/")
print("  • Admin Panel:    http://localhost:8000/admin")
print("  • Vendor Admin:   http://localhost:5173")
print("  • Partner Web:    http://localhost:5174")
print("  • Customer App:   http://localhost:8081")

print("\n" + "="*60)
PYEOF

echo ""
echo "✅ Done! You can now test all applications with the sample data."
echo ""
