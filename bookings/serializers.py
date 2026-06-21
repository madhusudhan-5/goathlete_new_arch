from rest_framework import serializers
from .models import Booking, SlotBlock, BookingStatus, BookingType
from venues.serializers import CourtSerializer, VenueSerializer
from partners.serializers import VendorAdminSerializer, VendorPartnerSerializer
from players.serializers import PlayerSerializer


class BookingSerializer(serializers.ModelSerializer):
    court = CourtSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)
    created_by_admin = VendorAdminSerializer(read_only=True)
    created_by_partner = VendorPartnerSerializer(read_only=True)
    
    court_id = serializers.IntegerField(write_only=True)
    venue_id = serializers.IntegerField(write_only=True, required=False)
    player_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'court', 'court_id', 'venue', 'venue_id',
            'booking_type', 'booking_date', 'start_time', 'end_time', 'duration_hours',
            'price_per_hour', 'total_amount',
            'player', 'player_id', 'customer_name', 'customer_phone',
            'status', 'is_paid', 'payment_method', 'payment_reference',
            'created_by_admin', 'created_by_partner', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['booking_id', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    class Meta:
        model = Booking
        fields = [
            'court', 'booking_type', 'booking_date', 'start_time', 'end_time',
            'duration_hours', 'price_per_hour', 'total_amount',
            'player', 'customer_name', 'customer_phone', 'notes'
        ]
    
    def validate(self, data):
        # Validate booking date is not in the past
        from django.utils import timezone
        if data.get('booking_date') < timezone.now().date():
            raise serializers.ValidationError("Booking date cannot be in the past")

        # Validate offline booking has customer details
        if data.get('booking_type') == BookingType.OFFLINE:
            if not data.get('customer_name') and not data.get('player'):
                raise serializers.ValidationError("Customer name or player is required for offline bookings")
        
        # Validate online booking has player
        if data.get('booking_type') == BookingType.ONLINE:
            if not data.get('player'):
                raise serializers.ValidationError("Player is required for online bookings")
        
        # Check for overlapping bookings
        from django.db.models import Q
        overlapping = Booking.objects.filter(
            court=data['court'],
            booking_date=data['booking_date'],
            status__in=[BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ).filter(
            Q(start_time__lt=data['end_time'], end_time__gt=data['start_time'])
        )
        
        if overlapping.exists():
            raise serializers.ValidationError("This time slot is already booked")
        
        return data


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing bookings"""
    court_name = serializers.CharField(source='court.name', read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    customer = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'court_name', 'venue_name',
            'booking_type', 'booking_date', 'start_time', 'end_time',
            'total_amount', 'customer', 'status', 'is_paid'
        ]
    
    def get_customer(self, obj):
        if obj.player:
            return obj.player.user.get_full_name() or obj.player.user.email
        return obj.customer_name or 'Walk-in'


class SlotBlockSerializer(serializers.ModelSerializer):
    court = CourtSerializer(read_only=True)
    blocked_by_admin = VendorAdminSerializer(read_only=True)
    blocked_by_partner = VendorPartnerSerializer(read_only=True)
    
    court_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SlotBlock
        fields = [
            'id', 'court', 'court_id', 'block_date', 'start_time', 'end_time',
            'reason', 'blocked_by_admin', 'blocked_by_partner',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SlotBlockCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating slot blocks"""
    class Meta:
        model = SlotBlock
        fields = ['court', 'block_date', 'start_time', 'end_time', 'reason']
    
    def validate(self, data):
        # Check for overlapping blocks
        overlapping = SlotBlock.objects.filter(
            court=data['court'],
            block_date=data['block_date'],
            is_active=True
        ).filter(
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        )
        
        if overlapping.exists():
            raise serializers.ValidationError("This time slot is already blocked")
        
        return data
