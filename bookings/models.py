from django.db import models
from venues.models import Venue, Court
from partners.models import VendorAdmin, VendorPartner
from players.models import Player


class BookingStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    COMPLETED = 'COMPLETED', 'Completed'


class BookingType(models.TextChoices):
    ONLINE = 'ONLINE', 'Online'  # Booked via customer app
    OFFLINE = 'OFFLINE', 'Offline'  # Walk-in, marked by partner/admin


class Booking(models.Model):
    """Court booking - online or offline"""
    booking_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto-generated: BK20260201001"
    )
    court = models.ForeignKey(
        Court,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text="Denormalized for quick queries"
    )
    
    # Booking details
    booking_type = models.CharField(
        max_length=10,
        choices=BookingType.choices,
        default=BookingType.ONLINE
    )
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Duration in hours"
    )
    
    # Pricing
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Customer (null for offline bookings without player account)
    player = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    customer_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="For offline bookings"
    )
    customer_phone = models.CharField(
        max_length=15,
        blank=True,
        help_text="For offline bookings"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    
    # Who created this booking
    created_by_partner = models.ForeignKey(
        VendorPartner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_bookings'
    )
    created_by_admin = models.ForeignKey(
        VendorAdmin,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_bookings'
    )
    
    # Payment (future feature)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate booking_id if not set
        if not self.booking_id:
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            # Get last booking ID for today
            last_booking = Booking.objects.filter(
                booking_id__startswith=f'BK{date_str}'
            ).order_by('-booking_id').first()
            
            if last_booking:
                last_num = int(last_booking.booking_id[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.booking_id = f'BK{date_str}{new_num:03d}'
        
        # Set venue from court if not set
        if not self.venue_id and self.court_id:
            self.venue = self.court.venue
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_id} - {self.court.name} on {self.booking_date}"

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ['-booking_date', '-start_time']
        indexes = [
            models.Index(fields=['booking_date', 'court']),
            models.Index(fields=['venue', 'booking_date']),
            models.Index(fields=['status']),
        ]


class SlotBlock(models.Model):
    """Blocked slots for maintenance, events, etc."""
    court = models.ForeignKey(
        Court,
        on_delete=models.CASCADE,
        related_name='blocked_slots'
    )
    block_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=255)
    
    # Who blocked this slot
    blocked_by_partner = models.ForeignKey(
        VendorPartner,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blocked_slots'
    )
    blocked_by_admin = models.ForeignKey(
        VendorAdmin,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blocked_slots'
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Set to False to unblock"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.court.name} blocked on {self.block_date} {self.start_time}-{self.end_time}"

    class Meta:
        verbose_name = "Slot Block"
        verbose_name_plural = "Slot Blocks"
        ordering = ['-block_date', '-start_time']
        indexes = [
            models.Index(fields=['court', 'block_date']),
            models.Index(fields=['is_active']),
        ]
