from rest_framework import serializers
from .models import Player, Badge, PlayerBadge
from accounts.serializers import UserSerializer


class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Player
        fields = [
            'id', 'user', 'user_id', 'full_name', 'phone', 
            'date_of_birth', 'gender', 'city', 'profile_image',
            'height', 'weight', 'fitness_level',
            'total_matches', 'total_tournaments', 'total_wins',
            'badges', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_matches', 'total_tournaments', 'total_wins', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class PlayerCreateSerializer(serializers.ModelSerializer):
    """Serializer for player registration"""
    email = serializers.EmailField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Player
        fields = [
            'email', 'phone_number', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'gender', 'city'
        ]
    
    def validate(self, data):
        if not data.get('email') and not data.get('phone_number'):
            raise serializers.ValidationError("Either email or phone number is required")
        return data
    
    def create(self, validated_data):
        from accounts.models import User, UserRole
        
        # Extract user data
        email = validated_data.pop('email', None)
        phone_number = validated_data.pop('phone_number', None)
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        # Use phone as email if email not provided
        if not email:
            email = f"{phone_number}@goathlete.temp"
        
        # Create user
        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.PLAYER
        )
        
        # Create player profile
        player = Player.objects.create(user=user, **validated_data)
        return player


class PlayerProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating player profile"""
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Player
        fields = [
            'first_name', 'last_name', 'phone', 'date_of_birth', 
            'gender', 'city', 'profile_image'
        ]
    
    def update(self, instance, validated_data):
        # Update user fields if provided
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        if first_name is not None:
            instance.user.first_name = first_name
        if last_name is not None:
            instance.user.last_name = last_name
        
        if first_name or last_name:
            instance.user.save()
        
        # Update player fields
        return super().update(instance, validated_data)


class PlayerFitnessUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating fitness profile"""
    class Meta:
        model = Player
        fields = ['height', 'weight', 'fitness_level']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'code', 'name', 'description', 'icon', 'category', 'requirements', 'created_at']
        read_only_fields = ['created_at']


class PlayerBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    player_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PlayerBadge
        fields = ['id', 'player', 'player_name', 'badge', 'earned_at']
        read_only_fields = ['earned_at']
    
    def get_player_name(self, obj):
        return obj.player.user.get_full_name() or obj.player.user.email
