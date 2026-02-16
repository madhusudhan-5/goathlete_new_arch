from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from players.models import Player
from accounts.otp_models import WhatsAppOTP

User = get_user_model()

class WhatsAppOTPTests(APITestCase):
    def setUp(self):
        self.phone_number = "+919876543210"
        self.otp_code = "123456"
        self.url_send = reverse('send-otp')
        self.url_verify = reverse('verify-otp-whatsapp')

    def test_send_otp_success(self):
        """Test sending OTP successfully"""
        data = {'phone_number': self.phone_number}
        response = self.client.post(self.url_send, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        # Verify OTP record created
        self.assertTrue(WhatsAppOTP.objects.filter(phone_number=self.phone_number).exists())

    def test_verify_otp_registration(self):
        """Test verifying OTP creates a new user (registration flow)"""
        # First create OTP manually to verify
        WhatsAppOTP.objects.create(
            phone_number=self.phone_number,
            otp=self.otp_code
        )
        
        data = {
            'phone_number': self.phone_number,
            'otp': self.otp_code
        }
        response = self.client.post(self.url_verify, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['is_new_user'])
        self.assertIn('tokens', response.data)
        
        # Verify User and Player created
        self.assertTrue(User.objects.filter(role='PLAYER').exists())
        self.assertTrue(Player.objects.filter(phone=self.phone_number).exists())

    def test_verify_otp_login(self):
        """Test verifying OTP logs in existing user"""
        # Create existing user
        user = User.objects.create_user(email="test@example.com", role='PLAYER')
        Player.objects.create(user=user, phone=self.phone_number)
        
        # Create OTP
        WhatsAppOTP.objects.create(
            phone_number=self.phone_number,
            otp=self.otp_code
        )
        
        data = {
            'phone_number': self.phone_number,
            'otp': self.otp_code
        }
        response = self.client.post(self.url_verify, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_new_user'])
        self.assertEqual(response.data['user']['email'], "test@example.com")

    def test_verify_invalid_otp(self):
        """Test verifying with invalid OTP"""
        WhatsAppOTP.objects.create(
            phone_number=self.phone_number,
            otp=self.otp_code
        )
        
        data = {
            'phone_number': self.phone_number,
            'otp': '000000'
        }
        response = self.client.post(self.url_verify, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
