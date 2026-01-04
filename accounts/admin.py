from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Executive, OTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'role', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    # Actions for activating/deactivating users
    actions = ['activate_users', 'deactivate_users']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Information', {'fields': ('first_name', 'last_name')}),
        ('Role & Status', {
            'fields': ('role', 'is_active'),
            'description': 'Set user role and activation status'
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'first_name', 'last_name', 'is_active'),
            'description': 'Create a new user (Admin or Executive)'
        }),
    )
    
    readonly_fields = ['last_login', 'date_joined']
    
    def activate_users(self, request, queryset):
        """Activate selected users"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) successfully activated.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) successfully deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'


@admin.register(Executive)
class ExecutiveAdmin(admin.ModelAdmin):
    list_display = ['get_email', 'get_full_name', 'phone', 'get_status', 'created_at']
    list_filter = ['user__is_active', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone']
    ordering = ['-created_at']
    
    # Actions for activating/deactivating executives
    actions = ['activate_executives', 'deactivate_executives']
    
    fieldsets = (
        ('Executive User', {
            'fields': ('user',),
            'description': 'Select the user account for this executive'
        }),
        ('Contact Information', {
            'fields': ('phone',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
    
    def get_full_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else '-'
    get_full_name.short_description = 'Name'
    
    def get_status(self, obj):
        if obj.user.is_active:
            return format_html(
                '<span style="color: green; font-weight: bold;">●</span> Active'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">●</span> Inactive'
        )
    get_status.short_description = 'Status'
    
    def activate_executives(self, request, queryset):
        """Activate selected executives"""
        user_ids = queryset.values_list('user_id', flat=True)
        updated = User.objects.filter(id__in=user_ids).update(is_active=True)
        self.message_user(request, f'{updated} executive(s) successfully activated.')
    activate_executives.short_description = 'Activate selected executives'
    
    def deactivate_executives(self, request, queryset):
        """Deactivate selected executives"""
        user_ids = queryset.values_list('user_id', flat=True)
        updated = User.objects.filter(id__in=user_ids).update(is_active=False)
        self.message_user(request, f'{updated} executive(s) successfully deactivated.')
    deactivate_executives.short_description = 'Deactivate selected executives'


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['get_user_email', 'code', 'get_status', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__email', 'code']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'expires_at', 'code']
    
    fieldsets = (
        ('OTP Details', {
            'fields': ('user', 'code', 'is_used')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        }),
    )
    
    def get_user_email(self, obj):
        return obj.user.email
    get_user_email.short_description = 'User Email'
    get_user_email.admin_order_field = 'user__email'
    
    def get_status(self, obj):
        if obj.is_used:
            return format_html(
                '<span style="color: gray; font-weight: bold;">Used</span>'
            )
        elif obj.is_valid():
            return format_html(
                '<span style="color: green; font-weight: bold;">Valid</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">Expired</span>'
            )
    get_status.short_description = 'Status'
    
    def has_add_permission(self, request):
        """Disable manual OTP creation"""
        return False


# Customize admin site header
admin.site.site_header = 'GoAthlete Admin Portal'
admin.site.site_title = 'GoAthlete Admin'
admin.site.index_title = 'Welcome to GoAthlete Administration'
