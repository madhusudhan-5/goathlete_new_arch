from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from .models import User, OTP, Executive
from .serializers import (
    ExecutiveLoginSerializer,
    OTPVerifySerializer,
    AdminLoginSerializer
)
import sys
import os

# Add parent directory to path to import email_templates
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from email_templates import get_otp_email_html, get_otp_email_text


class ExecutiveLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ExecutiveLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email, role='EXECUTIVE')
            
            # Check if executive profile exists and is active
            try:
                executive = user.executive_profile
                if not executive.is_active:
                    return Response({
                        'error': 'Your account has been deactivated. Please contact administrator.'
                    }, status=status.HTTP_403_FORBIDDEN)
            except Executive.DoesNotExist:
                return Response({
                    'error': 'Executive profile not found.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Generate OTP
            otp_code = OTP.generate_otp_code()
            expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
            
            OTP.objects.create(
                user=user,
                code=otp_code,
                expires_at=expires_at
            )
            
            # Send OTP via email with professional template
            try:
                # Get HTML and plain text versions
                html_content = get_otp_email_html(otp_code, user.email, purpose="login")
                text_content = get_otp_email_text(otp_code, user.email, purpose="login")
                
                # Create email with both HTML and plain text
                email_message = EmailMultiAlternatives(
                    subject='GoAthlete - Your OTP Code',
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email]
                )
                email_message.attach_alternative(html_content, "text/html")
                email_message.send()
                
                # For development, also return OTP in response
                # Remove 'otp' field in production
                return Response({
                    'message': 'OTP sent to your email',
                    'otp': otp_code,  # Remove this in production
                    'email': email
                }, status=status.HTTP_200_OK)
            except Exception as e:
                # If email fails, still return OTP for development
                return Response({
                    'message': 'OTP generated (email sending failed)',
                    'otp': otp_code,
                    'email': email,
                    'error': str(e)
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

