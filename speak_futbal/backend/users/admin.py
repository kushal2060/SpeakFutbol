from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser

class UserActivityFilter(admin.SimpleListFilter):
    title = 'User Activity'
    parameter_name = 'activity'
    
    def lookups(self, request, model_admin):
        return (
            ('active', 'Active Users'),
            ('inactive', 'Inactive Users'),
            ('recent', 'Recently Joined'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(last_login__gte=timezone.now() - timedelta(days=30))
        elif self.value() == 'inactive':
            return queryset.filter(last_login__lt=timezone.now() - timedelta(days=30))
        elif self.value() == 'recent':
            return queryset.filter(date_joined__gte=timezone.now() - timedelta(days=7))
        return queryset

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = [
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'location', 
        'is_active', 
        'is_staff', 
        'date_joined',
        'last_login',
        'event_count'
    ]
    
    list_filter = [
        UserActivityFilter,
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
        'last_login',
        'location'
    ]
    
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name',
        'location'
    ]
    
    list_editable = ['is_active', 'is_staff']
    
    readonly_fields = [
        'date_joined',
        'last_login',
        'event_count',
        'location_link'
    ]
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'location', 'latitude', 'longitude')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    
    filter_horizontal = ['groups', 'user_permissions']
    
    date_hierarchy = 'date_joined'
    
    ordering = ['-date_joined']
    
    list_per_page = 25
    
    actions = ['activate_users', 'deactivate_users', 'make_staff', 'remove_staff', 'export_users', 'send_welcome_email']
    
    def event_count(self, obj):
        created_count = obj.created_events.count()
        participated_count = obj.participated_events.count()
        return f"{created_count} created, {participated_count} participated"
    event_count.short_description = 'Events'
    
    def location_link(self, obj):
        if obj.latitude and obj.longitude:
            url = f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
            return format_html('<a href="{}" target="_blank">View on Map</a>', url)
        return "No coordinates"
    location_link.short_description = 'Map Link'
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users have been activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users have been deactivated.')
    deactivate_users.short_description = "Deactivate selected users"
    
    def make_staff(self, request, queryset):
        updated = queryset.update(is_staff=True)
        self.message_user(request, f'{updated} users have been made staff members.')
    make_staff.short_description = "Make selected users staff"
    
    def remove_staff(self, request, queryset):
        updated = queryset.update(is_staff=False)
        self.message_user(request, f'{updated} users have been removed from staff.')
    remove_staff.short_description = "Remove staff status from selected users"
    
    def export_users(self, request, queryset):
        # This would typically export to CSV/Excel
        self.message_user(request, f'{queryset.count()} users selected for export.')
    export_users.short_description = "Export selected users"
    
    def send_welcome_email(self, request, queryset):
        for user in queryset:
            # Here you would implement email sending logic
            pass
        self.message_user(request, f"Welcome emails sent to {queryset.count()} users.")
    send_welcome_email.short_description = "Send welcome email to selected users"
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('created_events', 'participated_events')
