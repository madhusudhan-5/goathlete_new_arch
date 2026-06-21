"""
Tests for booking endpoints and flow.
"""
import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from bookings.models import Booking


@pytest.mark.django_db
class TestBookingAPI:
    """Test booking CRUD operations."""

    def test_create_booking_online(self, player_client, court, player):
        """Test creating an online booking."""
        url = reverse('booking-list')
        tomorrow = timezone.now().date() + timedelta(days=1)
        
        data = {
            'court': court.id,
            'player': player.id,
            'booking_date': str(tomorrow),
            'start_time': '10:00',
            'end_time': '11:00',
            'duration_hours': 1.0,
            'price_per_hour': 500,
            'total_amount': 500,
            'booking_type': 'ONLINE',
            'payment_method': 'ONLINE',
            'is_paid': True
        }
        
        response = player_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        booking = Booking.objects.get(court=court)
        assert booking.status == 'PENDING'
        assert Booking.objects.filter(court=court).exists()

    def test_create_booking_offline(self, partner_client, court, vendor_partner):
        """Test creating an offline booking by partner."""
        url = reverse('booking-list')
        tomorrow = timezone.now().date() + timedelta(days=1)
        
        data = {
            'court': court.id,
            'booking_date': str(tomorrow),
            'start_time': '14:00',
            'end_time': '16:00',
            'duration_hours': 2.0,
            'price_per_hour': 600,
            'total_amount': 1200,
            'booking_type': 'OFFLINE',
            'customer_name': 'Walk-in Customer',
            'customer_phone': '+919876543214',
            'payment_method': 'CASH',
            'is_paid': False
        }
        
        response = partner_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        booking = Booking.objects.get(court=court)
        assert booking.customer_name == 'Walk-in Customer'

    def test_list_my_bookings(self, player_client, court, player):
        """Test listing user's own bookings."""
        # Create a booking
        tomorrow = timezone.now().date() + timedelta(days=1)
        Booking.objects.create(
            court=court,
            player=player,
            booking_date=tomorrow,
            start_time='10:00',
            end_time='11:00',
            duration_hours=1.0,
            price_per_hour=500,
            total_amount=500,
            booking_type='ONLINE',
            status='CONFIRMED'
        )
        
        url = reverse('booking-list')
        response = player_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_cancel_booking(self, player_client, court, player):
        """Test cancelling a booking."""
        tomorrow = timezone.now().date() + timedelta(days=1)
        booking = Booking.objects.create(
            court=court,
            player=player,
            booking_date=tomorrow,
            start_time='10:00',
            end_time='11:00',
            duration_hours=1.0,
            price_per_hour=500,
            total_amount=500,
            booking_type='ONLINE',
            status='CONFIRMED'
        )
        
        url = reverse('booking-cancel', kwargs={'pk': booking.id})
        response = player_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        booking.refresh_from_db()
        assert booking.status == 'CANCELLED'

    def test_cannot_cancel_others_booking(self, player_client, court):
        """Test that user cannot cancel another user's booking."""
        tomorrow = timezone.now().date() + timedelta(days=1)
        booking = Booking.objects.create(
            court=court,
            player=None,  # No player (not owned by current user)
            booking_date=tomorrow,
            start_time='10:00',
            end_time='11:00',
            duration_hours=1.0,
            price_per_hour=500,
            total_amount=500,
            booking_type='ONLINE',
            status='CONFIRMED'
        )
        
        url = reverse('booking-cancel', kwargs={'pk': booking.id})
        response = player_client.post(url)
        
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_booking_validation_past_date(self, player_client, court, player):
        """Test that booking in the past is not allowed."""
        url = reverse('booking-list')
        yesterday = timezone.now().date() - timedelta(days=1)
        
        data = {
            'court': court.id,
            'player': player.id,
            'booking_date': str(yesterday),
            'start_time': '10:00',
            'end_time': '11:00',
            'duration_hours': 1.0,
            'price_per_hour': 500,
            'total_amount': 500,
            'booking_type': 'ONLINE'
        }
        
        response = player_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_bookings_by_date(self, player_client, court, player):
        """Test filtering bookings by date."""
        tomorrow = timezone.now().date() + timedelta(days=1)
        Booking.objects.create(
            court=court,
            player=player,
            booking_date=tomorrow,
            start_time='10:00',
            end_time='11:00',
            duration_hours=1.0,
            price_per_hour=500,
            total_amount=500,
            booking_type='ONLINE',
            status='CONFIRMED'
        )
        
        url = reverse('booking-list')
        response = player_client.get(url, {'booking_date': str(tomorrow)})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_booking_analytics(self, admin_client, court, player):
        """Test booking analytics endpoint."""
        # Create some bookings
        tomorrow = timezone.now().date() + timedelta(days=1)
        Booking.objects.create(
            court=court,
            player=player,
            booking_date=tomorrow,
            start_time='10:00',
            end_time='11:00',
            duration_hours=1.0,
            price_per_hour=500,
            total_amount=500,
            booking_type='ONLINE',
            status='CONFIRMED',
            is_paid=True
        )
        
        url = reverse('booking-analytics-reports')
        response = admin_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'total_revenue' in response.data
