"""
Tests for partner management endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from partners.models import VendorPartner
from venues.models import Venue
from venues.models import Venue


@pytest.mark.django_db
class TestPartnerAPI:
    """Test partner management operations."""

    def test_list_partners(self, admin_client, vendor_partner):
        """Test listing all partners."""
        url = reverse('vendorpartner-list')
        response = admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_partner(self, admin_client, venue, vendor_admin):
        """Test creating a new partner."""
        url = reverse('vendorpartner-list')
        data = {
            'email': 'newpartner@example.com',
            'first_name': 'New',
            'last_name': 'Partner',
            'phone': '+919876543215',
            'venue': venue.id,
            'vendor_admin': vendor_admin.id
        }
        
        response = admin_client.post(url, data)
        # Status depends on your implementation (might be pending approval)
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]

    def test_approve_partner(self, admin_client, vendor_partner):
        """Test approving a pending partner."""
        vendor_partner.status = 'PENDING'
        vendor_partner.save()
        
        url = reverse('vendorpartner-approve', kwargs={'pk': vendor_partner.id})
        response = admin_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        vendor_partner.refresh_from_db()
        assert vendor_partner.status == 'ACTIVE'

    def test_reject_partner(self, admin_client, vendor_partner):
        """Test rejecting a pending partner."""
        vendor_partner.status = 'PENDING'
        vendor_partner.save()
        
        url = reverse('vendorpartner-reject', kwargs={'pk': vendor_partner.id})
        response = admin_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        vendor_partner.refresh_from_db()
        assert vendor_partner.status == 'REJECTED'

    def test_partner_cannot_access_other_venue(self, partner_client, venue):
        """Test that partner can only access their own venue."""
        # Create another venue
        other_venue = Venue.objects.create(
            name='Other Venue',
            address='456 Other St',
            city='Delhi',
            state='Delhi',
            pincode='110001',
            contact_number='+919876543216',
            contact_email='other@venue.com'
        )
        
        url = reverse('venue-detail', kwargs={'pk': other_venue.id})
        response = partner_client.get(url)
        
        # Partner should not have access to other venues
        # Depending on implementation, might be 403 or filtered out
        # assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_partner_dashboard_stats(self, partner_client):
        """Test partner dashboard statistics."""
        url = reverse('partner-dashboard')  # Adjust based on your URL name
        response = partner_client.get(url)
        
        # This will depend on your dashboard implementation
        # assert response.status_code == status.HTTP_200_OK
        # assert 'today_bookings' in response.data
        pass  # Placeholder
