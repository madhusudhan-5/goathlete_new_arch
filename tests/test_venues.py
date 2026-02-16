"""
Tests for venue endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from venues.models import Venue


@pytest.mark.django_db
class TestVenueAPI:
    """Test venue CRUD operations."""

    def test_list_venues(self, api_client, venue):
        """Test listing all venues."""
        url = reverse('venue-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]['name'] == 'Test Sports Complex'

    def test_retrieve_venue(self, api_client, venue):
        """Test retrieving a single venue."""
        url = reverse('venue-detail', kwargs={'pk': venue.id})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Test Sports Complex'
        assert response.data['city'] == 'Mumbai'

    def test_create_venue_as_admin(self, admin_client):
        """Test creating a venue as admin."""
        url = reverse('venue-list')
        data = {
            'name': 'New Sports Complex',
            'address': '456 New Street',
            'city': 'Delhi',
            'state': 'Delhi',
            'pincode': '110001',
            'contact_number': '+919876543213',
            'contact_email': 'new@venue.com',
            'status': 'ACTIVE'
        }
        
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Sports Complex'
        assert Venue.objects.filter(name='New Sports Complex').exists()

    def test_create_venue_unauthorized(self, api_client):
        """Test creating venue without authentication."""
        url = reverse('venue-list')
        data = {'name': 'Unauthorized Venue'}
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_venue(self, admin_client, venue):
        """Test updating a venue."""
        url = reverse('venue-detail', kwargs={'pk': venue.id})
        data = {'name': 'Updated Sports Complex'}
        
        response = admin_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Sports Complex'
        
        venue.refresh_from_db()
        assert venue.name == 'Updated Sports Complex'

    def test_delete_venue(self, admin_client, venue):
        """Test deleting a venue."""
        url = reverse('venue-detail', kwargs={'pk': venue.id})
        response = admin_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Venue.objects.filter(id=venue.id).exists()

    def test_filter_venues_by_city(self, api_client, venue):
        """Test filtering venues by city."""
        url = reverse('venue-list')
        response = api_client.get(url, {'city': 'Mumbai'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert all(v['city'] == 'Mumbai' for v in response.data)

    def test_search_venues(self, api_client, venue):
        """Test searching venues by name."""
        url = reverse('venue-list')
        response = api_client.get(url, {'search': 'Test'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_venue_courts(self, api_client, venue, court):
        """Test retrieving courts for a venue."""
        url = reverse('venue-courts', kwargs={'pk': venue.id})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]['name'] == 'Court 1'
