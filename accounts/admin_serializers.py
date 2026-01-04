from rest_framework import serializers
from accounts.models import User, Executive


class AdminExecutiveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']


class AdminExecutiveSerializer(serializers.ModelSerializer):
    user = AdminExecutiveUserSerializer()
    
    class Meta:
        model = Executive
        fields = ['id', 'user', 'phone', 'is_active', 'created_at', 'updated_at']


class AdminExecutiveCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()

    def create(self, validated_data):
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='EXECUTIVE'
        )
        
        # Create executive profile
        executive = Executive.objects.create(
            user=user,
            phone=validated_data['phone']
        )
        
        return executive


class AdminExecutiveUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    is_active = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        # Update user fields
        if 'first_name' in validated_data:
            instance.user.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.user.last_name = validated_data['last_name']
        instance.user.save()
        
        # Update executive fields
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
        instance.save()
        
        return instance

