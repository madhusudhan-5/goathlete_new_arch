from django.contrib import admin
from .models import Player, Badge, PlayerBadge


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'full_name', 'phone', 'city', 'fitness_level', 'total_tournaments', 'total_matches', 'is_active']
    list_filter = ['is_active', 'fitness_level', 'gender', 'city', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone', 'city']
    readonly_fields = ['total_matches', 'total_tournaments', 'total_wins', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone', 'date_of_birth', 'gender', 'city', 'profile_image')
        }),
        ('Fitness Profile', {
            'fields': ('height', 'weight', 'fitness_level')
        }),
        ('Statistics', {
            'fields': ('total_matches', 'total_tournaments', 'total_wins', 'badges'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'
    
    def full_name(self, obj):
        return obj.user.get_full_name() or '-'
    full_name.short_description = 'Name'


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['icon_display', 'name', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Badge Information', {
            'fields': ('code', 'name', 'description', 'icon', 'category')
        }),
        ('Requirements', {
            'fields': ('requirements',),
            'description': 'JSON format: {"min_tournaments": 1, "min_matches": 5}'
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def icon_display(self, obj):
        return f"{obj.icon} {obj.name}"
    icon_display.short_description = 'Badge'


@admin.register(PlayerBadge)
class PlayerBadgeAdmin(admin.ModelAdmin):
    list_display = ['player_email', 'badge_name', 'earned_at']
    list_filter = ['badge__category', 'earned_at']
    search_fields = ['player__user__email', 'badge__name']
    readonly_fields = ['earned_at']
    
    def player_email(self, obj):
        return obj.player.user.email
    player_email.short_description = 'Player'
    player_email.admin_order_field = 'player__user__email'
    
    def badge_name(self, obj):
        return f"{obj.badge.icon} {obj.badge.name}"
    badge_name.short_description = 'Badge'
    badge_name.admin_order_field = 'badge__name'
