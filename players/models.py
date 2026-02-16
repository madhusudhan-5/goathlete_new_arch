from django.db import models
from accounts.models import User


class Player(models.Model):
    """Customer app user - player/athlete"""
    
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    
    FITNESS_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('PROFESSIONAL', 'Professional'),
    ]
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='player_profile'
    )
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    city = models.CharField(max_length=100, blank=True)
    profile_image = models.TextField(blank=True, help_text="Base64 encoded image")
    
    # Fitness profile
    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Height in cm"
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weight in kg"
    )
    fitness_level = models.CharField(
        max_length=20,
        choices=FITNESS_CHOICES,
        default='BEGINNER'
    )
    
    # Stats (updated automatically)
    total_matches = models.IntegerField(default=0)
    total_tournaments = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    
    # Badges (list of badge codes)
    badges = models.JSONField(
        default=list,
        blank=True,
        help_text="List of earned badge codes: ['first_tournament', 'winner', ...]"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Player: {self.user.get_full_name() or self.user.email}"

    class Meta:
        verbose_name = "Player"
        verbose_name_plural = "Players"
        ordering = ['-created_at']


class Badge(models.Model):
    """Achievement badges that players can earn"""
    
    CATEGORY_CHOICES = [
        ('TOURNAMENT', 'Tournament'),
        ('PERFORMANCE', 'Performance'),
        ('MILESTONE', 'Milestone'),
        ('SPECIAL', 'Special'),
    ]
    
    code = models.CharField(max_length=50, unique=True, help_text="Unique badge code")
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Emoji or icon name")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # Requirements (JSON for flexibility)
    requirements = models.JSONField(
        default=dict,
        blank=True,
        help_text="Requirements to earn this badge: {'min_tournaments': 1, ...}"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.icon} {self.name}"

    class Meta:
        verbose_name = "Badge"
        verbose_name_plural = "Badges"
        ordering = ['category', 'name']


class PlayerBadge(models.Model):
    """Badges earned by players"""
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='player_badges'
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player.user.email} - {self.badge.name}"

    class Meta:
        verbose_name = "Player Badge"
        verbose_name_plural = "Player Badges"
        unique_together = ['player', 'badge']
        ordering = ['-earned_at']
