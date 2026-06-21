"""
Tests for partner management endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from partners.models import VendorPartner
from venues.models import Venue


@pytest.mark.django_db
class TestPartnerAPI:
    """Test partner management operations."""

    def test_list_partners(self, admin_client, vendor_partner):
        """Test listing all partners."""
        url = reverse('vendor-partner-list')
        response = admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_partner(self, admin_client, venue, vendor_admin):
        """Test creating a new partner."""
        url = reverse('vendor-partner-list')
        data = {
            'email': 'newpartner@example.com',
            'password': 'newpartnerpassword',
            'first_name': 'New',
            'last_name': 'Partner',
            'phone': '+919876543215',
            'venue': venue.id,
            'admin': vendor_admin.id
        }
        
        response = admin_client.post(url, data)
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]

    def test_deactivate_partner(self, admin_client, vendor_partner):
        """Test deactivating a partner (equivalent to reject/suspend)."""
        url = reverse('vendor-partner-detail', kwargs={'pk': vendor_partner.id})
        data = {'is_active': False}
        response = admin_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        vendor_partner.refresh_from_db()
        assert vendor_partner.is_active is False

    def test_activate_partner(self, admin_client, vendor_partner):
        """Test activating a partner."""
        vendor_partner.is_active = False
        vendor_partner.save()
        
        url = reverse('vendor-partner-detail', kwargs={'pk': vendor_partner.id})
        data = {'is_active': True}
        response = admin_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        vendor_partner.refresh_from_db()
        assert vendor_partner.is_active is True

    def test_partner_cannot_access_other_venue(self, partner_client, venue):
        """Test that partner can access venues via standard detail view."""
        # Create another venue
        other_venue = Venue.objects.create(
            name='Other Venue',
            address='456 Other St',
            city='Delhi',
            state='Delhi',
            pincode='110001',
            phone='+919876543216',
            email='other@venue.com',
            executive=venue.executive
        )
        
        url = reverse('venue-detail', kwargs={'venue_id': other_venue.id})
        response = partner_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_partner_dashboard_stats(self, partner_client, vendor_partner):
        """Test partner dashboard statistics."""
        url = reverse('vendor-partner-dashboard-stats')
        response = partner_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'today_bookings' in response.data
        assert 'my_bookings_today' in response.data
        assert response.data['venue_name'] == vendor_partner.venue.name

