from django.contrib import admin
from .models import VendorAdmin, VendorPartner


@admin.register(VendorAdmin)
class VendorAdminAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'venue_name', 'phone', 'is_active_display', 'created_at']
    list_filter = ['is_active', 'created_at', 'venue__city']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'venue__name', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone')
        }),
        ('Venue Assignment', {
            'fields': ('venue',)
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
    
    def venue_name(self, obj):
        return obj.venue.name
    venue_name.short_description = 'Venue'
    venue_name.admin_order_field = 'venue__name'
    
    def is_active_display(self, obj):
        from django.utils.html import format_html
        if obj.is_active:
            return format_html('<span style="color: green;">● Active</span>')
        return format_html('<span style="color: red;">● Inactive</span>')
    is_active_display.short_description = 'Status'


@admin.register(VendorPartner)
class VendorPartnerAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'venue_name', 'admin_email', 'phone', 'is_active_display', 'created_at']
    list_filter = ['is_active', 'created_at', 'venue__city']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'venue__name', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone')
        }),
        ('Assignment', {
            'fields': ('venue', 'admin')
        }),
        ('Permissions', {
            'fields': ('permissions',),
            'description': 'JSON format: {"can_block_slots": true, "can_export_reports": false}'
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
    
    def venue_name(self, obj):
        return obj.venue.name
    venue_name.short_description = 'Venue'
    venue_name.admin_order_field = 'venue__name'
    
    def admin_email(self, obj):
        return obj.admin.user.email
    admin_email.short_description = 'Reports To'
    admin_email.admin_order_field = 'admin__user__email'
    
    def is_active_display(self, obj):
        from django.utils.html import format_html
        if obj.is_active:
            return format_html('<span style="color: green;">● Active</span>')
        return format_html('<span style="color: red;">● Inactive</span>')
    is_active_display.short_description = 'Status'
