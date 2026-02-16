from django.contrib import admin
from .models import Booking, SlotBlock


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'court_name', 'venue_name', 'booking_date', 'time_slot', 'booking_type', 'status_badge', 'total_amount', 'created_at']
    list_filter = ['status', 'booking_type', 'booking_date', 'is_paid', 'created_at']
    search_fields = ['booking_id', 'court__name', 'venue__name', 'customer_name', 'customer_phone', 'player__user__email']
    readonly_fields = ['booking_id', 'created_at', 'updated_at']
    date_hierarchy = 'booking_date'
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'court', 'venue', 'booking_type', 'status')
        }),
        ('Schedule', {
            'fields': ('booking_date', 'start_time', 'end_time', 'duration_hours')
        }),
        ('Pricing', {
            'fields': ('price_per_hour', 'total_amount')
        }),
        ('Customer Details', {
            'fields': ('player', 'customer_name', 'customer_phone')
        }),
        ('Payment', {
            'fields': ('is_paid', 'payment_method', 'payment_reference'),
            'classes': ('collapse',)
        }),
        ('Created By', {
            'fields': ('created_by_admin', 'created_by_partner'),
            'classes': ('collapse',)
        }),
        ('Additional', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def court_name(self, obj):
        return obj.court.name
    court_name.short_description = 'Court'
    court_name.admin_order_field = 'court__name'
    
    def venue_name(self, obj):
        return obj.venue.name
    venue_name.short_description = 'Venue'
    venue_name.admin_order_field = 'venue__name'
    
    def time_slot(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"
    time_slot.short_description = 'Time'
    
    def status_badge(self, obj):
        from django.utils.html import format_html
        colors = {
            'PENDING': 'orange',
            'CONFIRMED': 'green',
            'CANCELLED': 'red',
            'COMPLETED': 'blue'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(SlotBlock)
class SlotBlockAdmin(admin.ModelAdmin):
    list_display = ['court_name', 'block_date', 'time_slot', 'reason', 'blocked_by', 'is_active_display', 'created_at']
    list_filter = ['is_active', 'block_date', 'created_at']
    search_fields = ['court__name', 'reason']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'block_date'
    
    fieldsets = (
        ('Block Information', {
            'fields': ('court', 'block_date', 'start_time', 'end_time', 'reason')
        }),
        ('Blocked By', {
            'fields': ('blocked_by_admin', 'blocked_by_partner')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def court_name(self, obj):
        return obj.court.name
    court_name.short_description = 'Court'
    court_name.admin_order_field = 'court__name'
    
    def time_slot(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"
    time_slot.short_description = 'Time'
    
    def blocked_by(self, obj):
        if obj.blocked_by_admin:
            return f"Admin: {obj.blocked_by_admin.user.email}"
        elif obj.blocked_by_partner:
            return f"Partner: {obj.blocked_by_partner.user.email}"
        return '-'
    blocked_by.short_description = 'Blocked By'
    
    def is_active_display(self, obj):
        from django.utils.html import format_html
        if obj.is_active:
            return format_html('<span style="color: red;">🚫 Blocked</span>')
        return format_html('<span style="color: green;">✓ Unblocked</span>')
    is_active_display.short_description = 'Status'
