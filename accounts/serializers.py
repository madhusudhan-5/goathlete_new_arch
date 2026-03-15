from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import User, Executive, OTP


class ExecutiveLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value, role='EXECUTIVE')
        except User.DoesNotExist:
            raise serializers.ValidationError("Executive with this email does not exist.")
        return value


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp_code = data.get('otp')

        try:
            user = User.objects.get(email=email, role='EXECUTIVE')
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")

        try:
            otp = OTP.objects.filter(
                user=user,
                code=otp_code,
                is_used=False
            ).latest('created_at')
            
            if not otp.is_valid():
                raise serializers.ValidationError("OTP has expired or is invalid.")
            
            otp.is_used = True
            otp.save()
            
            data['user'] = user
            return data
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP.")


class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(email=email, role__in=['SUPER_ADMIN', 'ADMIN', 'VENDOR_ADMIN'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")

        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'first_name', 'last_name']


class ExecutiveSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Executive
        fields = ['id', 'user', 'phone', 'created_at', 'updated_at']

