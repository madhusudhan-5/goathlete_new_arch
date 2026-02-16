from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from accounts.twilio_service import otp_service
from accounts.otp_models import WhatsAppOTP
from players.models import Player

User = get_user_model()


class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP"""
    phone_number = serializers.CharField(
        max_length=17,
        help_text="Phone number with country code (e.g., +919876543210)"
    )


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    phone_number = serializers.CharField(max_length=17)
    otp = serializers.CharField(max_length=6)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    Send OTP to phone number via WhatsApp
    
    POST /api/auth/send-otp/
    {
        "phone_number": "+919876543210"
    }
    """
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    
    # Generate and send OTP
    result = otp_service.generate_and_send_otp(phone_number)
    
    if result['success']:
        return Response({
            'success': True,
            'message': result['message'],
            'phone_number': phone_number
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_429_TOO_MANY_REQUESTS if 'limit' in result['message'].lower() else status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP and login/register player
    
    POST /api/auth/verify-otp-whatsapp/
    {
        "phone_number": "+919876543210",
        "otp": "123456"
    }
    
    Response:
    {
        "success": true,
        "message": "Login successful",
        "user": {...},
        "player": {...},
        "tokens": {
            "access": "...",
            "refresh": "..."
        }
    }
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    otp_code = serializer.validated_data['otp']
    
    # Verify OTP
    result = otp_service.verify_otp(phone_number, otp_code)
    
    if not result['success']:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # OTP verified - check if user exists
    try:
        # Try to find user by phone number
        # First check if player exists with this phone
        player = Player.objects.filter(phone=phone_number).first()
        
        if player:
            user = player.user
            is_new_user = False
        else:
            # Create new user and player
            # Generate email from phone number
            email = f"{phone_number.replace('+', '')}@goathlete.temp"
            
            # Create user
            user = User.objects.create_user(
                email=email,
                role='PLAYER',
                is_active=True
            )
            
            # Create player profile
            player = Player.objects.create(
                user=user,
                phone=phone_number
            )
            
            is_new_user = True
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful' if is_new_user else 'Login successful',
            'is_new_user': is_new_user,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            },
            'player': {
                'id': player.id,
                'phone': player.phone,
                'first_name': player.user.first_name,
                'last_name': player.user.last_name
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Authentication failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP to phone number
    
    POST /api/auth/resend-otp/
    {
        "phone_number": "+919876543210"
    }
    """
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    
    # Resend OTP (generates new OTP)
    result = otp_service.resend_otp(phone_number)
    
    if result['success']:
        return Response({
            'success': True,
            'message': 'OTP resent successfully',
            'phone_number': phone_number
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_429_TOO_MANY_REQUESTS if 'limit' in result['message'].lower() else status.HTTP_400_BAD_REQUEST)
