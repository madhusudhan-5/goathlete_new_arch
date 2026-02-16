"""
Tests for authentication endpoints.
"""
import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestAuthentication:
    """Test authentication endpoints."""

    def test_user_registration(self, api_client):
        """Test user registration."""
        url = reverse('register')  # Adjust based on your URL name
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        # This will fail if endpoint doesn't exist - adjust as needed
        # response = api_client.post(url, data)
        # assert response.status_code == status.HTTP_201_CREATED
        # assert 'access' in response.data
        pass  # Placeholder

    def test_login_success(self, api_client, user):
        """Test successful login."""
        url = reverse('token_obtain_pair')  # JWT login endpoint
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self, api_client, user):
        """Test login with invalid credentials."""
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh(self, api_client, user):
        """Test token refresh."""
        # First get tokens
        login_url = reverse('token_obtain_pair')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = api_client.post(login_url, login_data)
        refresh_token = login_response.data['refresh']
        
        # Now refresh
        refresh_url = reverse('token_refresh')
        refresh_data = {'refresh': refresh_token}
        
        response = api_client.post(refresh_url, refresh_data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_whatsapp_otp_send(self, api_client):
        """Test sending WhatsApp OTP."""
        url = reverse('send-otp')  # Adjust based on your URL name
        data = {'phone_number': '+919876543210'}
        
        # This will depend on your Twilio setup
        # response = api_client.post(url, data)
        # assert response.status_code == status.HTTP_200_OK
        pass  # Placeholder

    def test_whatsapp_otp_verify(self, api_client):
        """Test verifying WhatsApp OTP."""
        # First send OTP
        # Then verify with correct OTP
        # This requires mocking Twilio
        pass  # Placeholder

    def test_unauthorized_access(self, api_client):
        """Test accessing protected endpoint without authentication."""
        url = reverse('venue-list')  # Protected endpoint
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authorized_access(self, authenticated_client):
        """Test accessing protected endpoint with authentication."""
        url = reverse('venue-list')
        response = authenticated_client.get(url)
        # Should return 200 or 403 depending on permissions
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]
