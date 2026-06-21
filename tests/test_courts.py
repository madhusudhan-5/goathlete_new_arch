"""
Tests for court management endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from venues.models import Court


@pytest.mark.django_db
class TestCourtAPI:
    """Test court CRUD operations."""

    def test_list_courts_for_venue(self, admin_client, venue, court):
        """Test listing courts for a venue."""
        url = reverse('venue-courts-list', kwargs={'venue_id': venue.id})
        response = admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_court(self, admin_client, venue):
        """Test creating a new court."""
        url = reverse('court-create')
        data = {
            'venue': venue.id,
            'name': 'Court 2',
            'sport_type': 'Tennis',
            'price_per_hour': 600.0,
            'is_active': True
        }
        
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Court.objects.filter(name='Court 2').exists()

