from django.db import models
from accounts.models import User
from venues.models import Venue


class VendorAdmin(models.Model):
    """Venue owner/manager who manages venue operations"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='vendor_admin_profile'
    )
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name='admins',
        help_text="Venue managed by this admin"
    )
    phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this vendor admin can login."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Vendor Admin: {self.user.email} - {self.venue.name}"

    class Meta:
        verbose_name = "Vendor Admin"
        verbose_name_plural = "Vendor Admins"
        ordering = ['-created_at']


class VendorPartner(models.Model):
    """Ground staff/partner who operates venue day-to-day"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='vendor_partner_profile'
    )
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name='partners',
        help_text="Venue where this partner works"
    )
    admin = models.ForeignKey(
        VendorAdmin,
        on_delete=models.CASCADE,
        related_name='partners',
        help_text="Vendor admin who manages this partner"
    )
    phone = models.CharField(max_length=15, blank=True)
    
    # Permissions (JSON for flexibility)
    permissions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Partner-specific permissions: {'can_block_slots': True, 'can_export_reports': False, ...}"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this partner can login."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Partner: {self.user.email} - {self.venue.name}"

    class Meta:
        verbose_name = "Vendor Partner"
        verbose_name_plural = "Vendor Partners"
        ordering = ['-created_at']
