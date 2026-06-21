from django.db import models


class BannerAd(models.Model):
    """Hero slider banners — managed by Admin/Super Admin"""

    LINK_TYPE_CHOICES = [
        ('TOURNAMENT', 'Tournament'),
        ('VENUE', 'Venue'),
        ('OPEN_MATCH', 'Open Match'),
        ('EXTERNAL', 'External URL'),
        ('NONE', 'No Link'),
    ]

    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True)
    image_base64 = models.TextField(blank=True, help_text="Base64 encoded banner image")
    image_url = models.URLField(blank=True, help_text="External image URL (alternative to base64)")

    link_type = models.CharField(max_length=20, choices=LINK_TYPE_CHOICES, default='NONE')
    link_id = models.CharField(max_length=100, blank=True, help_text="ID of linked tournament, venue, or match")
    external_url = models.URLField(blank=True, help_text="For EXTERNAL link type")

    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Lower number = shown first")
    start_date = models.DateField(null=True, blank=True, help_text="Show banner from this date")
    end_date = models.DateField(null=True, blank=True, help_text="Hide banner after this date")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.link_type})"

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Banner Ad"
        verbose_name_plural = "Banner Ads"
