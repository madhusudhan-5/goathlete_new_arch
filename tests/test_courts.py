"""
Tests for court management endpoints.
"""
import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from venues.models import Court


@pytest.mark.django_db
class TestCourtAPI:
    """Test court CRUD operations."""

    def test_list_courts_for_venue(self, api_client, venue, court):
        """Test listing courts for a venue."""
        url = reverse('court-list')
        response = api_client.get(url, {'venue': venue.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_court(self, admin_client, venue):
        """Test creating a new court."""
        url = reverse('court-list')
        data = {
            'venue': venue.id,
            'name': 'Court 2',
            'sport': 'Tennis',
            'surface_type': 'Clay',
            'is_active': True
        }
        
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Court.objects.filter(name='Court 2').exists()

    def test_update_court(self, admin_client, court):
        """Test updating a court."""
        url = reverse('court-detail', kwargs={'pk': court.id})
        data = {'name': 'Updated Court'}
        
        response = admin_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        court.refresh_from_db()
        assert court.name == 'Updated Court'

    def test_deactivate_court(self, admin_client, court):
        """Test deactivating a court."""
        url = reverse('court-detail', kwargs={'pk': court.id})
        data = {'is_active': False}
        
        response = admin_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        court.refresh_from_db()
        assert court.is_active is False

    def test_court_availability(self, api_client, court):
        """Test checking court availability."""
        url = reverse('court-availability', kwargs={'pk': court.id})
        tomorrow = timezone.now().date() + timedelta(days=1)
        
        response = api_client.get(url, {'date': str(tomorrow)})
        assert response.status_code == status.HTTP_200_OK
        # Should return available time slots
