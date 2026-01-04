from django.db import models
from accounts.models import Executive


class VenueStatus(models.TextChoices):
    PRE_REGISTERED = 'PRE_REGISTERED', 'Pre-Registered'
    REGISTERED = 'REGISTERED', 'Registered'


class Venue(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # NEW
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    
    # License fields
    aadhar_number = models.CharField(max_length=12, blank=True)
    aadhar_document = models.TextField(blank=True)  # Base64 encoded
    pan_number = models.CharField(max_length=10, blank=True)
    pan_document = models.TextField(blank=True)  # Base64 encoded
    gst_number = models.CharField(max_length=15, blank=True)
    gst_document = models.TextField(blank=True)  # Base64 encoded (optional)
    
    # Venue images stored as base64
    images = models.JSONField(default=list, blank=True)  # List of base64 encoded images
    
    # NEW: Store as JSON
    facilities = models.JSONField(default=list, blank=True)  # ['Parking', 'Washroom', etc.]
    open_hours = models.JSONField(default=dict, blank=True)  # {'Monday': {'open': '06:00', 'close': '22:00'}, ...}
    equipment_rental = models.JSONField(default=list, blank=True)  # [{'name': 'Racket', 'price': 100, 'unit': 'hour'}, ...]
    
    status = models.CharField(
        max_length=20,
        choices=VenueStatus.choices,
        default=VenueStatus.PRE_REGISTERED
    )
    executive = models.ForeignKey(
        Executive,
        on_delete=models.CASCADE,
        related_name='venues'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class Court(models.Model):
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name='courts'
    )
    name = models.CharField(max_length=255)
    sport_type = models.CharField(max_length=100)
    surface_type = models.CharField(max_length=100, blank=True)  # NEW
    count = models.IntegerField(default=1)  # NEW: Number of courts
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} at {self.venue.name}"

    class Meta:
        ordering = ['-created_at']


class CourtSlot(models.Model):
    """Time slots with specific pricing for courts"""
    court = models.ForeignKey(
        Court,
        on_delete=models.CASCADE,
        related_name='slots'
    )
    day_of_week = models.CharField(max_length=10)  # 'Monday', 'Tuesday', etc.
    start_time = models.TimeField()
    end_time = models.TimeField()
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.court.name} - {self.day_of_week} {self.start_time}-{self.end_time}"
    
    class Meta:
        ordering = ['day_of_week', 'start_time']

