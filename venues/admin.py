from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Venue, Court, CourtSlot


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'get_status_badge', 'get_executive_email', 'get_courts_count', 'created_at']
    list_filter = ['status', 'city', 'state', 'created_at']
    search_fields = ['name', 'city', 'address', 'executive__user__email', 'executive__user__first_name', 'executive__user__last_name']
    ordering = ['-created_at']
    
    # Actions for changing venue status
    actions = ['mark_as_registered', 'mark_as_pre_registered']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'phone', 'email')
        }),
        ('Address Details', {
            'fields': ('address', 'city', 'state', 'pincode')
        }),
        ('Facilities & Services', {
            'fields': ('facilities', 'equipment_rental', 'open_hours'),
            'classes': ('collapse',)
        }),
        ('Status & Assignment', {
            'fields': ('status', 'executive'),
            'description': 'Assign venue to executive and set registration status'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Optimize queryset with related data"""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('executive__user').annotate(
            courts_count=Count('courts')
        )
        return queryset
    
    def get_status_badge(self, obj):
        """Display status with color coding"""
        if obj.status == 'REGISTERED':
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">REGISTERED</span>'
            )
        return format_html(
            '<span style="background-color: #ffc107; color: black; padding: 3px 10px; border-radius: 3px; font-weight: bold;">PRE-REGISTERED</span>'
        )
    get_status_badge.short_description = 'Status'
    get_status_badge.admin_order_field = 'status'
    
    def get_executive_email(self, obj):
        """Display executive's email with name"""
        full_name = f"{obj.executive.user.first_name} {obj.executive.user.last_name}".strip()
        if full_name:
            return f"{obj.executive.user.email} ({full_name})"
        return obj.executive.user.email
    get_executive_email.short_description = 'Executive'
    get_executive_email.admin_order_field = 'executive__user__email'
    
    def get_courts_count(self, obj):
        """Display number of courts"""
        return obj.courts_count
    get_courts_count.short_description = 'Courts'
    get_courts_count.admin_order_field = 'courts_count'
    
    def mark_as_registered(self, request, queryset):
        """Mark selected venues as registered"""
        updated = queryset.update(status='REGISTERED')
        self.message_user(request, f'{updated} venue(s) marked as REGISTERED.')
    mark_as_registered.short_description = 'Mark as REGISTERED'
    
    def mark_as_pre_registered(self, request, queryset):
        """Mark selected venues as pre-registered"""
        updated = queryset.update(status='PRE_REGISTERED')
        self.message_user(request, f'{updated} venue(s) marked as PRE-REGISTERED.')
    mark_as_pre_registered.short_description = 'Mark as PRE-REGISTERED'


@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_venue_name', 'sport_type', 'price_per_hour', 'get_active_badge', 'created_at']
    list_filter = ['sport_type', 'is_active', 'venue__city', 'created_at']
    search_fields = ['name', 'venue__name', 'sport_type', 'venue__city']
    ordering = ['-created_at']
    
    # Actions for activating/deactivating courts
    actions = ['activate_courts', 'deactivate_courts']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('venue', 'name', 'sport_type')
        }),
        ('Pricing & Status', {
            'fields': ('price_per_hour', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Optimize queryset with related venue data"""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('venue__executive__user')
        return queryset
    
    def get_venue_name(self, obj):
        """Display venue name with city"""
        return f"{obj.venue.name} ({obj.venue.city})"
    get_venue_name.short_description = 'Venue'
    get_venue_name.admin_order_field = 'venue__name'
    
    def get_active_badge(self, obj):
        """Display active status with color coding"""
        if obj.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Active</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactive</span>'
        )
    get_active_badge.short_description = 'Status'
    get_active_badge.admin_order_field = 'is_active'
    
    def activate_courts(self, request, queryset):
        """Activate selected courts"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} court(s) successfully activated.')
    activate_courts.short_description = 'Activate selected courts'
    
    def deactivate_courts(self, request, queryset):
        """Deactivate selected courts"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} court(s) successfully deactivated.')
    deactivate_courts.short_description = 'Deactivate selected courts'


@admin.register(CourtSlot)
class CourtSlotAdmin(admin.ModelAdmin):
    list_display = ['get_court_name', 'day_of_week', 'start_time', 'end_time', 'price_per_hour', 'get_active_badge']
    list_filter = ['day_of_week', 'is_active', 'court__venue__city']
    search_fields = ['court__name', 'court__venue__name']
    ordering = ['court', 'day_of_week', 'start_time']
    
    fieldsets = (
        ('Slot Information', {
            'fields': ('court', 'day_of_week', 'start_time', 'end_time')
        }),
        ('Pricing', {
            'fields': ('price_per_hour', 'is_active')
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('court__venue')
        return queryset
    
    def get_court_name(self, obj):
        return f"{obj.court.name} - {obj.court.venue.name}"
    get_court_name.short_description = 'Court'
    
    def get_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
        return format_html('<span style="color: red; font-weight: bold;">✗ Inactive</span>')
    get_active_badge.short_description = 'Status'


