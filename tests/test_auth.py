"""
Tests for authentication endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from accounts.otp_models import WhatsAppOTP


@pytest.mark.django_db
class TestAuthentication:
    """Test authentication endpoints."""

    def test_admin_login_success(self, api_client, admin_user):
        """Test successful admin login."""
        url = reverse('admin-login')
        data = {
            'email': admin_user.email,
            'password': 'adminpass123'
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == admin_user.email

    def test_admin_login_invalid_credentials(self, api_client, admin_user):
        """Test login with invalid credentials."""
        url = reverse('admin-login')
        data = {
            'email': admin_user.email,
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_executive_login_and_verify_otp(self, api_client, executive):
        """Test executive login and OTP verification."""
        # Set user role to EXECUTIVE to satisfy validator
        executive.user.role = 'EXECUTIVE'
        executive.user.save()

        # 1. Initiate login
        login_url = reverse('executive-login')
        login_data = {'email': executive.user.email}
        login_response = api_client.post(login_url, login_data)
        assert login_response.status_code == status.HTTP_200_OK
        assert 'otp' in login_response.data
        otp_code = login_response.data['otp']

        # 2. Verify OTP
        verify_url = reverse('verify-otp')
        verify_data = {
            'email': executive.user.email,
            'otp': otp_code
        }
        verify_response = api_client.post(verify_url, verify_data)
        assert verify_response.status_code == status.HTTP_200_OK
        assert 'access' in verify_response.data
        assert 'refresh' in verify_response.data

    def test_whatsapp_otp_send_and_verify(self, api_client):
        """Test player OTP sending and verification."""
        phone_number = '+919876543210'
        
        # 1. Send OTP
        send_url = reverse('send-otp')
        send_data = {'phone_number': phone_number}
        send_response = api_client.post(send_url, send_data)
        assert send_response.status_code == status.HTTP_200_OK
        
        # 2. Retrieve generated OTP from DB
        otp_obj = WhatsAppOTP.objects.filter(phone_number=phone_number).latest('created_at')
        otp_code = otp_obj.otp
        
        # 3. Verify OTP
        verify_url = reverse('verify-otp-whatsapp')
        verify_data = {
            'phone_number': phone_number,
            'otp': otp_code
        }
        verify_response = api_client.post(verify_url, verify_data)
        assert verify_response.status_code == status.HTTP_200_OK
        assert 'tokens' in verify_response.data
        assert 'access' in verify_response.data['tokens']

    def test_unauthorized_access(self, api_client):
        """Test accessing protected endpoint without authentication."""
        url = reverse('venue-list')  # Protected endpoint
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authorized_access(self, authenticated_client):
        """Test accessing protected endpoint with authentication."""
        url = reverse('venue-list')
        response = authenticated_client.get(url)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]
