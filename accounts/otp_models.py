from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from datetime import timedelta
import random
import string


class WhatsAppOTP(models.Model):
    """
    WhatsApp OTP for mobile number authentication.
    Used for Player login only (no email/password).
    """
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        help_text="Phone number with country code"
    )
    otp = models.CharField(max_length=6)
    otp_hash = models.CharField(max_length=255, help_text="Hashed OTP for security")
    
    # OTP metadata
    is_verified = models.BooleanField(default=False)
    is_expired = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0, help_text="Number of verification attempts")
    max_attempts = models.IntegerField(default=3)
    
    # Twilio tracking
    twilio_sid = models.CharField(max_length=100, blank=True, help_text="Twilio message SID")
    twilio_status = models.CharField(max_length=50, blank=True, help_text="Twilio delivery status")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Set expiry time (5 minutes from creation)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """Check if OTP is still valid"""
        if self.is_verified:
            return False
        if self.is_expired:
            return False
        if timezone.now() > self.expires_at:
            self.is_expired = True
            self.save()
            return False
        if self.attempts >= self.max_attempts:
            return False
        return True
    
    def verify(self, otp_input):
        """Verify OTP input"""
        self.attempts += 1
        
        if not self.is_valid():
            self.save()
            return False
        
        # Check OTP match
        if self.otp == otp_input:
            self.is_verified = True
            self.verified_at = timezone.now()
            self.save()
            return True
        
        self.save()
        return False
    
    @staticmethod
    def generate_otp(length=6):
        """Generate random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def __str__(self):
        return f"{self.phone_number} - {'Verified' if self.is_verified else 'Pending'}"
    
    class Meta:
        verbose_name = "WhatsApp OTP"
        verbose_name_plural = "WhatsApp OTPs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', 'is_verified']),
            models.Index(fields=['created_at']),
        ]


class OTPRateLimit(models.Model):
    """
    Rate limiting for OTP requests to prevent abuse.
    Limits: 3 OTPs per phone per hour, 10 OTPs per phone per day.
    """
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17
    )
    
    # Rate limit counters
    hourly_count = models.IntegerField(default=0)
    daily_count = models.IntegerField(default=0)
    
    # Reset timestamps
    hourly_reset_at = models.DateTimeField()
    daily_reset_at = models.DateTimeField()
    
    # Limits
    hourly_limit = models.IntegerField(default=3)
    daily_limit = models.IntegerField(default=10)
    
    # Blocking
    is_blocked = models.BooleanField(default=False)
    blocked_until = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Set reset times on creation
        if not self.hourly_reset_at:
            self.hourly_reset_at = timezone.now() + timedelta(hours=1)
        if not self.daily_reset_at:
            self.daily_reset_at = timezone.now() + timedelta(days=1)
        super().save(*args, **kwargs)
    
    def can_request_otp(self):
        """Check if OTP can be requested"""
        now = timezone.now()
        
        # Check if blocked
        if self.is_blocked and self.blocked_until and now < self.blocked_until:
            return False, "Phone number is temporarily blocked. Please try again later."
        
        # Reset counters if needed
        if now > self.hourly_reset_at:
            self.hourly_count = 0
            self.hourly_reset_at = now + timedelta(hours=1)
        
        if now > self.daily_reset_at:
            self.daily_count = 0
            self.daily_reset_at = now + timedelta(days=1)
            self.is_blocked = False
            self.blocked_until = None
        
        # Check hourly limit
        if self.hourly_count >= self.hourly_limit:
            return False, f"Hourly limit reached. Please try again after {self.hourly_reset_at.strftime('%H:%M')}."
        
        # Check daily limit
        if self.daily_count >= self.daily_limit:
            return False, "Daily limit reached. Please try again tomorrow."
        
        self.save()
        return True, "OK"
    
    def increment(self):
        """Increment OTP request counters"""
        self.hourly_count += 1
        self.daily_count += 1
        
        # Block if limits exceeded
        if self.daily_count >= self.daily_limit:
            self.is_blocked = True
            self.blocked_until = self.daily_reset_at
        
        self.save()
    
    def __str__(self):
        return f"{self.phone_number} - {self.hourly_count}/{self.hourly_limit} (hourly), {self.daily_count}/{self.daily_limit} (daily)"
    
    class Meta:
        verbose_name = "OTP Rate Limit"
        verbose_name_plural = "OTP Rate Limits"
        ordering = ['-created_at']
