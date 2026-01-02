from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from datetime import timedelta
from .models import Event

class EventTypeFilter(admin.SimpleListFilter):
    title = 'Event Type'
    parameter_name = 'event_type'
    
    def lookups(self, request, model_admin):
        return Event.EVENT_TYPES
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(event_type=self.value())

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 
        'event_type', 
        'location', 
        'start_date', 
        'end_date', 
        'created_by', 
        'participant_count', 
        'is_active',
        'created_at'
    ]
    
    list_filter = [
        EventTypeFilter,
        'is_active',
        'start_date',
        'end_date',
        'created_at',
        'location'
    ]
    
    search_fields = [
        'title',
        'description',
        'location',
        'created_by__username',
        'created_by__email'
    ]
    
    list_editable = ['is_active']
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'participant_count',
        'location_link'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'event_type', 'is_active')
        }),
        ('Location & Timing', {
            'fields': ('location', 'latitude', 'longitude', 'start_date', 'end_date')
        }),
        ('Participants', {
            'fields': ('created_by', 'participants', 'max_participants')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ['participants']
    
    date_hierarchy = 'start_date'
    
    ordering = ['-start_date']
    
    list_per_page = 25
    
    actions = ['activate_events', 'deactivate_events', 'export_events', 'generate_event_report']
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'
    participant_count.admin_order_field = 'participants__count'
    
    def location_link(self, obj):
        if obj.latitude and obj.longitude:
            url = f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
            return format_html('<a href="{}" target="_blank">View on Map</a>', url)
        return "No coordinates"
    location_link.short_description = 'Map Link'
    
    def activate_events(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} events have been activated.')
    activate_events.short_description = "Activate selected events"
    
    def deactivate_events(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} events have been deactivated.')
    deactivate_events.short_description = "Deactivate selected events"
    
    def export_events(self, request, queryset):
        # This would typically export to CSV/Excel
        self.message_user(request, f'{queryset.count()} events selected for export.')
    export_events.short_description = "Export selected events"
    
    def generate_event_report(self, request, queryset):
        # This would implement report generation logic
        self.message_user(request, f"Event report generated for {queryset.count()} events.")
    generate_event_report.short_description = "Generate event report"
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('created_by').prefetch_related('participants')
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new event
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
