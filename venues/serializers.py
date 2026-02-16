from rest_framework import serializers
from .models import Venue, Court
from accounts.models import Executive


class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = [
            'id', 'venue', 'name', 'sport_type', 'price_per_hour',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_venue(self, value):
        # Ensure the venue is registered
        if value.status != 'REGISTERED':
            raise serializers.ValidationError("Courts can only be added to registered venues.")
        return value


class VenueSerializer(serializers.ModelSerializer):
    courts_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'address', 'city', 'state', 'pincode',
            'phone', 'email', 'status', 'executive', 'created_at', 'updated_at',
            'courts_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VenuePreRegisterSerializer(serializers.Serializer):
    # Basic details
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
    # License fields
    aadhar_number = serializers.CharField(max_length=12, required=False, allow_blank=True)
    aadhar_document = serializers.CharField(required=False, allow_blank=True)  # Base64
    pan_number = serializers.CharField(max_length=10, required=False, allow_blank=True)
    pan_document = serializers.CharField(required=False, allow_blank=True)  # Base64
    gst_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    gst_document = serializers.CharField(required=False, allow_blank=True)  # Base64
    
    # Images as base64
    images = serializers.JSONField(required=False)
    
    # Location (not stored in DB for now, just validated)
    latitude = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    longitude = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # NEW: Facilities
    facilities = serializers.JSONField(required=False)
    
    # NEW: Open Hours
    open_hours = serializers.JSONField(required=False)
    
    # NEW: Equipment Rental
    equipment_rental = serializers.JSONField(required=False)
    
    # NEW: Court Slots
    court_slots = serializers.JSONField(required=False)
    
    # NEW: Adventures/Other Activities
    adventure_type = serializers.CharField(required=False, allow_blank=True)
    activities = serializers.JSONField(required=False)
    
    # Meeting (optional for simple pre-registration)
    meeting_datetime = serializers.DateTimeField(required=False, allow_null=True)
    
    # Courts (optional for simple pre-registration)
    courts = serializers.JSONField(required=False)
    
    # Status (always PRE_REGISTERED)
    status = serializers.CharField(required=False)

    def create(self, validated_data):
        # Get executive from the authenticated user
        user = self.context['request'].user
        try:
            executive = user.executive_profile
        except Executive.DoesNotExist:
            raise serializers.ValidationError("User is not an executive.")
        
        # Remove fields that aren't in the Venue model
        validated_data.pop('latitude', None)
        validated_data.pop('longitude', None)
        validated_data.pop('meeting_datetime', None)
        validated_data.pop('adventure_type', None)
        validated_data.pop('activities', None)
        court_slots_data = validated_data.pop('court_slots', {})
        
        # Extract courts data
        courts_data = validated_data.pop('courts', [])
        
        # Remove status if present (we'll set it ourselves)
        validated_data.pop('status', None)
        
        # Create venue with PRE_REGISTERED status
        venue = Venue.objects.create(
            executive=executive,
            status='PRE_REGISTERED',
            name=validated_data.get('name'),
            description=validated_data.get('description', ''),
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            state=validated_data.get('state', ''),
            pincode=validated_data.get('pincode', ''),
            email=validated_data.get('email'),
            phone=validated_data.get('phone', ''),
            facilities=validated_data.get('facilities', []),
            open_hours=validated_data.get('open_hours', {}),
            equipment_rental=validated_data.get('equipment_rental', []),
            aadhar_number=validated_data.get('aadhar_number', ''),
            aadhar_document=validated_data.get('aadhar_document', ''),
            pan_number=validated_data.get('pan_number', ''),
            pan_document=validated_data.get('pan_document', ''),
            gst_number=validated_data.get('gst_number', ''),
            gst_document=validated_data.get('gst_document', ''),
            images=validated_data.get('images', []),
        )
        
        # Create courts if provided (optional) with slots
        if courts_data and isinstance(courts_data, list):
            for index, court_data in enumerate(courts_data):
                court = Court.objects.create(
                    venue=venue,
                    name=court_data.get('name', 'Court'),
                    sport_type=court_data.get('sport_type', 'General'),
                    surface_type=court_data.get('surface_type', ''),
                    count=court_data.get('count', 1),
                    price_per_hour=0,  # Default, will be set by slots
                    is_active=True
                )
                
                # Create court slots if provided
                if court_slots_data and str(index) in court_slots_data:
                    slots = court_slots_data[str(index)]
                    if isinstance(slots, list):
                        from .models import CourtSlot
                        for slot_data in slots:
                            CourtSlot.objects.create(
                                court=court,
                                day_of_week=slot_data.get('day', 'Monday'),
                                start_time=slot_data.get('start_time', '06:00'),
                                end_time=slot_data.get('end_time', '07:00'),
                                price_per_hour=slot_data.get('price', 0),
                                is_active=True
                            )
        
        # Send pre-registration confirmation email
        try:
            from .email_utils import send_venue_preregistration_email
            send_venue_preregistration_email(venue, executive)
        except Exception as e:
            print(f"Warning: Failed to send pre-registration email: {e}")
        
        return venue


class SlotGenerationSerializer(serializers.Serializer):
    court_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of court IDs to generate slots for. If empty, generates for all courts in venue."
    )
    start_time = serializers.TimeField(format='%H:%M')
    end_time = serializers.TimeField(format='%H:%M')
    duration_minutes = serializers.IntegerField(min_value=30, max_value=120, default=60)
    days = serializers.ListField(
        child=serializers.CharField(),
        default=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    )
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Peak pricing (optional)
    peak_start_time = serializers.TimeField(format='%H:%M', required=False)
    peak_end_time = serializers.TimeField(format='%H:%M', required=False)
    peak_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must be before end time")
            
        if 'peak_start_time' in data and 'peak_end_time' in data:
            if data['peak_start_time'] >= data['peak_end_time']:
                raise serializers.ValidationError("Peak start time must be before peak end time")
                
        return data
