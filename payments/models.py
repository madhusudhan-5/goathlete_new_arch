from django.db import models
from players.models import Player


class Payment(models.Model):
    """Razorpay payment record linked to a booking or open match"""

    PAYMENT_STATUS = [
        ('CREATED', 'Created'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    PAYMENT_FOR = [
        ('BOOKING', 'Court Booking'),
        ('OPEN_MATCH', 'Open Match'),
        ('TOURNAMENT', 'Tournament Entry'),
        ('EQUIPMENT', 'Equipment Rental'),
    ]

    # Razorpay fields
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=300, blank=True)

    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount in INR")
    currency = models.CharField(max_length=5, default='INR')

    # Status
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='CREATED')
    payment_for = models.CharField(max_length=20, choices=PAYMENT_FOR, default='BOOKING')

    # Links (only one should be set)
    player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='payments')
    booking_id = models.IntegerField(null=True, blank=True, help_text="bookings.Booking ID")
    open_match_id = models.IntegerField(null=True, blank=True, help_text="tournaments.OpenMatch ID")
    tournament_id = models.IntegerField(null=True, blank=True, help_text="tournaments.Tournament ID")

    # Notes JSON
    notes = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.razorpay_order_id} — {self.status}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
