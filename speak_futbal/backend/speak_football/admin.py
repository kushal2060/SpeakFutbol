from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import path, reverse
from django.shortcuts import redirect
from django.contrib import messages
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

# Import your models
from events.models import Event
from users.models import CustomUser

class SpeakFootballAdminSite(AdminSite):
    site_header = "Speak Football Administration"
    site_title = "Speak Football Admin"
    index_title = "Welcome to Speak Football Administration"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
            path('quick-stats/', self.admin_view(self.quick_stats_view), name='quick-stats'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        # Get quick statistics
        total_users = CustomUser.objects.count()
        total_events = Event.objects.count()
        active_events = Event.objects.filter(is_active=True).count()
        recent_events = Event.objects.filter(
            start_date__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        context = {
            'total_users': total_users,
            'total_events': total_events,
            'active_events': active_events,
            'recent_events': recent_events,
            'opts': self._registry[CustomUser]._meta,
        }
        return self.index(request, context)
    
    def quick_stats_view(self, request):
        # Get detailed statistics
        stats = {
            'users_by_month': CustomUser.objects.extra(
                select={'month': "EXTRACT(month FROM date_joined)"}
            ).values('month').annotate(count=Count('id')).order_by('month'),
            
            'events_by_type': Event.objects.values('event_type').annotate(
                count=Count('id')
            ).order_by('event_type'),
            
            'top_event_creators': CustomUser.objects.annotate(
                event_count=Count('created_events')
            ).filter(event_count__gt=0).order_by('-event_count')[:10],
        }
        
        context = {
            'stats': stats,
            'opts': self._registry[CustomUser]._meta,
        }
        return self.index(request, context)

# Create custom admin site instance
admin_site = SpeakFootballAdminSite(name='speak_football_admin')

# Register models with custom admin site
from events.admin import EventAdmin
from users.admin import CustomUserAdmin

admin_site.register(Event, EventAdmin)
admin_site.register(CustomUser, CustomUserAdmin)

# Custom admin actions
@admin.action(description="Send welcome email to selected users")
def send_welcome_email(modeladmin, request, queryset):
    for user in queryset:
        # Here you would implement email sending logic
        pass
    modeladmin.message_user(request, f"Welcome emails sent to {queryset.count()} users.")

@admin.action(description="Generate event report")
def generate_event_report(modeladmin, request, queryset):
    # Here you would implement report generation logic
    modeladmin.message_user(request, f"Event report generated for {queryset.count()} events.")

# Custom admin filters
class EventTypeFilter(admin.SimpleListFilter):
    title = 'Event Type'
    parameter_name = 'event_type'
    
    def lookups(self, request, model_admin):
        return Event.EVENT_TYPES
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(event_type=self.value())

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

# Add custom filters to admin classes
EventAdmin.list_filter += [EventTypeFilter]
CustomUserAdmin.list_filter += [UserActivityFilter] 