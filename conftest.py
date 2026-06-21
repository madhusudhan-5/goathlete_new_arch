"""
Test configuration and fixtures for GoAthlete platform.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from venues.models import Venue, Court
from partners.models import VendorAdmin, VendorPartner
from players.models import Player
from accounts.models import Executive

from tournaments.scoreboard_models import Sport

User = get_user_model()


@pytest.fixture
def sport():
    """Create a test sport."""
    sport, _ = Sport.objects.get_or_create(
        name='Badminton',
        defaults={
            'code': 'BADMINTON',
            'icon': '🏸',
            'description': 'Badminton Sport'
        }
    )
    return sport


@pytest.fixture
def api_client():
    """Return an API client instance."""
    return APIClient()


@pytest.fixture
def user():
    """Create a test user."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )


@pytest.fixture
def admin_user():
    """Create an admin user."""
    return User.objects.create_user(
        email='admin@example.com',
        password='adminpass123',
        first_name='Admin',
        last_name='User',
        role='ADMIN'
    )


@pytest.fixture
def executive(admin_user):
    """Create an executive."""
    return Executive.objects.create(
        user=admin_user,
        phone='+919876543210'
    )


@pytest.fixture
def venue(executive):
    """Create a test venue."""
    return Venue.objects.create(
        name='Test Sports Complex',
        address='123 Test Street',
        city='Mumbai',
        state='Maharashtra',
        pincode='400001',
        phone='+919876543210',
        email='venue@test.com',
        status='REGISTERED',
        executive=executive
    )


@pytest.fixture
def vendor_admin(admin_user, venue):
    """Create a vendor admin."""
    return VendorAdmin.objects.create(
        user=admin_user,
        venue=venue,
        phone='+919876543210'
    )


@pytest.fixture
def partner_user():
    """Create a partner user."""
    return User.objects.create_user(
        email='partner@example.com',
        password='partnerpass123',
        first_name='Partner',
        last_name='User',
        role='VENDOR_PARTNER'
    )


@pytest.fixture
def vendor_partner(partner_user, venue, vendor_admin):
    """Create a vendor partner."""
    return VendorPartner.objects.create(
        user=partner_user,
        venue=venue,
        admin=vendor_admin,
        phone='+919876543211',
        is_active=True
    )


@pytest.fixture
def player_user():
    """Create a player user."""
    return User.objects.create_user(
        email='player@example.com',
        password='playerpass123',
        first_name='Player',
        last_name='User',
        role='PLAYER'
    )


@pytest.fixture
def player(player_user):
    """Create a player."""
    return Player.objects.create(
        user=player_user,
        phone='+919876543212'
    )


@pytest.fixture
def court(venue):
    """Create a test court."""
    return Court.objects.create(
        venue=venue,
        name='Court 1',
        sport_type='Badminton',
        surface_type='Wooden',
        price_per_hour=500.0,
        is_active=True
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Return an admin authenticated API client."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def partner_client(api_client, partner_user):
    """Return a partner authenticated API client."""
    api_client.force_authenticate(user=partner_user)
    return api_client


@pytest.fixture
def player_client(api_client, player_user):
    """Return a player authenticated API client."""
    api_client.force_authenticate(user=player_user)
    return api_client
