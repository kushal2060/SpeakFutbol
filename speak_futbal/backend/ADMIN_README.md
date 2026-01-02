# Speak Football Admin Documentation

This document describes the comprehensive admin functionality implemented for the Speak Football application.

## Overview

The admin interface provides full CRUD operations for managing users and events, with advanced filtering, search capabilities, and bulk actions.

## Admin Files Structure

- `events/admin.py` - Event management admin interface
- `users/admin.py` - User management admin interface  
- `speak_football/admin.py` - Custom admin site configuration

## Event Admin Features

### List Display
- **Title** - Event title
- **Event Type** - Match, Tournament, Training, or Other
- **Location** - Event location
- **Start/End Date** - Event timing
- **Created By** - User who created the event
- **Participant Count** - Number of participants
- **Active Status** - Whether event is active
- **Created At** - Creation timestamp

### Filtering Options
- Event Type (custom filter)
- Active Status
- Start Date
- End Date
- Created Date
- Location

### Search Fields
- Title
- Description
- Location
- Creator username/email

### Bulk Actions
1. **Activate Events** - Enable selected events
2. **Deactivate Events** - Disable selected events
3. **Export Events** - Export event data
4. **Generate Event Report** - Create reports for selected events

### Custom Features
- **Map Link** - Direct link to Google Maps for event location
- **Participant Count** - Real-time participant count
- **Inline Editing** - Edit active status directly from list
- **Optimized Queries** - Efficient database queries with select_related and prefetch_related

## User Admin Features

### List Display
- **Username** - User's username
- **Email** - User's email address
- **First/Last Name** - User's full name
- **Location** - User's location
- **Active Status** - Whether user account is active
- **Staff Status** - Whether user is staff member
- **Date Joined** - Account creation date
- **Last Login** - Last login timestamp
- **Event Count** - Number of events created and participated in

### Filtering Options
- User Activity (custom filter - Active, Inactive, Recently Joined)
- Active Status
- Staff Status
- Superuser Status
- Date Joined
- Last Login
- Location

### Search Fields
- Username
- Email
- First Name
- Last Name
- Location

### Bulk Actions
1. **Activate Users** - Enable selected user accounts
2. **Deactivate Users** - Disable selected user accounts
3. **Make Staff** - Grant staff privileges
4. **Remove Staff** - Revoke staff privileges
5. **Export Users** - Export user data
6. **Send Welcome Email** - Send welcome emails to selected users

### Custom Features
- **Map Link** - Direct link to Google Maps for user location
- **Event Count** - Shows events created and participated in
- **Inline Editing** - Edit active and staff status directly from list
- **Optimized Queries** - Efficient database queries

## Custom Admin Site Features

### Dashboard
- Quick statistics overview
- Total users and events count
- Active events count
- Recent events count

### Quick Stats
- Users by month
- Events by type
- Top event creators

### Custom Filters

#### EventTypeFilter
- Filters events by type (Match, Tournament, Training, Other)
- Dropdown selection in admin interface

#### UserActivityFilter
- **Active Users** - Users who logged in within last 30 days
- **Inactive Users** - Users who haven't logged in for 30+ days
- **Recently Joined** - Users who joined within last 7 days

## Usage Instructions

### Accessing Admin Interface
1. Start the Django development server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Navigate to `/admin/` in your browser

3. Login with superuser credentials

### Creating a Superuser
```bash
python manage.py createsuperuser
```

### Key Admin Operations

#### Managing Events
1. **View Events**: Go to Events section to see all events
2. **Create Event**: Click "Add Event" to create new events
3. **Edit Event**: Click on event title to edit details
4. **Bulk Actions**: Select multiple events and use bulk actions
5. **Filter Events**: Use filters to find specific events
6. **Search Events**: Use search box to find events by title/description

#### Managing Users
1. **View Users**: Go to Users section to see all users
2. **Create User**: Click "Add User" to create new users
3. **Edit User**: Click on username to edit user details
4. **Bulk Actions**: Select multiple users and use bulk actions
5. **Filter Users**: Use filters to find specific users
6. **Search Users**: Use search box to find users by name/email

### Advanced Features

#### Location Management
- Both events and users have latitude/longitude fields
- Admin interface provides direct links to Google Maps
- Location data can be used for proximity-based features

#### Event Participation
- Track which users are participating in events
- View participant counts in admin interface
- Manage event capacity with max_participants field

#### User Activity Tracking
- Monitor user login activity
- Filter users by activity level
- Track event creation and participation

## Security Features

- **Permission-based access** - Only superusers and staff can access admin
- **Audit trails** - Track creation and modification timestamps
- **Bulk operations** - Safe bulk actions with confirmation
- **Data validation** - Form validation for all inputs

## Performance Optimizations

- **Database optimization** - Efficient queries with select_related and prefetch_related
- **Pagination** - 25 items per page for better performance
- **Caching** - Admin interface benefits from Django's caching
- **Indexed fields** - Database indexes on frequently searched fields

## Customization

### Adding New Actions
To add new bulk actions, modify the `actions` list in the admin class:

```python
actions = ['existing_action', 'new_action']

def new_action(self, request, queryset):
    # Implementation here
    self.message_user(request, "Action completed")
new_action.short_description = "Description of action"
```

### Adding New Filters
Create custom filters by extending `admin.SimpleListFilter`:

```python
class CustomFilter(admin.SimpleListFilter):
    title = 'Filter Title'
    parameter_name = 'filter_param'
    
    def lookups(self, request, model_admin):
        return [('value', 'Label')]
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(field=self.value())
```

### Customizing Display
Modify `list_display`, `list_filter`, and `search_fields` to customize the admin interface.

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all Django imports are correct
2. **Permission Errors**: Make sure user has proper admin permissions
3. **Database Errors**: Run migrations if models have changed
4. **Performance Issues**: Check database indexes and query optimization

### Debug Mode
Enable Django debug mode for detailed error messages during development.

## Support

For issues or questions about the admin interface, refer to:
- Django Admin Documentation
- Django ModelAdmin Reference
- Custom Admin Actions Documentation 