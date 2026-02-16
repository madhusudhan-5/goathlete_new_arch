from rest_framework import serializers
from .models import VendorAdmin, VendorPartner
from accounts.serializers import UserSerializer
from venues.serializers import VenueSerializer


class VendorAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    venue_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = VendorAdmin
        fields = [
            'id', 'user', 'user_id', 'venue', 'venue_id', 
            'phone', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VendorAdminCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendor admin"""
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = VendorAdmin
        fields = ['email', 'password', 'first_name', 'last_name', 'venue', 'phone']
    
    def create(self, validated_data):
        from accounts.models import User, UserRole
        
        # Extract user data
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.VENDOR_ADMIN
        )
        
        # Create vendor admin profile
        vendor_admin = VendorAdmin.objects.create(user=user, **validated_data)
        return vendor_admin


class VendorPartnerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    admin = VendorAdminSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    venue_id = serializers.IntegerField(write_only=True, required=False)
    admin_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = VendorPartner
        fields = [
            'id', 'user', 'user_id', 'venue', 'venue_id', 
            'admin', 'admin_id', 'phone', 'permissions',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class VendorPartnerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendor partner"""
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = VendorPartner
        fields = ['email', 'password', 'first_name', 'last_name', 'venue', 'admin', 'phone', 'permissions']
    
    def create(self, validated_data):
        from accounts.models import User, UserRole
        
        # Extract user data
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.VENDOR_PARTNER
        )
        
        # Create vendor partner profile
        vendor_partner = VendorPartner.objects.create(user=user, **validated_data)
        return vendor_partner
