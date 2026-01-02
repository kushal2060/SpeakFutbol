from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from events.models import Event
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample events for testing'

    def handle(self, *args, **options):
        # Get or create a sample user
        user, created = User.objects.get_or_create(
            username='sample_user',
            defaults={
                'email': 'sample@example.com',
                'first_name': 'Sample',
                'last_name': 'User',
                'location': 'New York, NY'
            }
        )
        
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(f'Created sample user: {user.username}')
        else:
            self.stdout.write(f'Using existing user: {user.username}')

        # Sample events data
        sample_events = [
            {
                'title': 'Weekend Football Match',
                'description': 'Join us for a friendly 11v11 football match at Central Park. All skill levels welcome!',
                'event_type': 'match',
                'location': 'Central Park, New York',
                'latitude': 40.7829,
                'longitude': -73.9654,
                'start_date': datetime.now() + timedelta(days=2, hours=14),
                'end_date': datetime.now() + timedelta(days=2, hours=16),
                'max_participants': 22
            },
            {
                'title': 'Youth Training Session',
                'description': 'Professional coaching session for young players aged 12-16. Focus on technique and teamwork.',
                'event_type': 'training',
                'location': 'Brooklyn Bridge Park',
                'latitude': 40.7021,
                'longitude': -73.9969,
                'start_date': datetime.now() + timedelta(days=3, hours=10),
                'end_date': datetime.now() + timedelta(days=3, hours=12),
                'max_participants': 20
            },
            {
                'title': 'Summer Football Tournament',
                'description': 'Annual summer tournament with prizes for winners. Teams of 5 players. Registration required.',
                'event_type': 'tournament',
                'location': 'Prospect Park, Brooklyn',
                'latitude': 40.6602,
                'longitude': -73.9690,
                'start_date': datetime.now() + timedelta(days=7, hours=9),
                'end_date': datetime.now() + timedelta(days=7, hours=18),
                'max_participants': 50
            },
            {
                'title': 'Evening Pickup Game',
                'description': 'Casual pickup game every Tuesday evening. No registration needed, just show up!',
                'event_type': 'match',
                'location': 'Riverside Park',
                'latitude': 40.7755,
                'longitude': -73.9861,
                'start_date': datetime.now() + timedelta(days=1, hours=19),
                'end_date': datetime.now() + timedelta(days=1, hours=21),
                'max_participants': 30
            },
            {
                'title': 'Advanced Skills Workshop',
                'description': 'Advanced training session focusing on dribbling, shooting, and tactical awareness.',
                'event_type': 'training',
                'location': 'Flushing Meadows Park',
                'latitude': 40.7505,
                'longitude': -73.8454,
                'start_date': datetime.now() + timedelta(days=4, hours=15),
                'end_date': datetime.now() + timedelta(days=4, hours=17),
                'max_participants': 15
            },
            {
                'title': 'Community Football Meetup',
                'description': 'Weekly community gathering for football enthusiasts. Great for networking and making friends.',
                'event_type': 'other',
                'location': 'Washington Square Park',
                'latitude': 40.7308,
                'longitude': -73.9973,
                'start_date': datetime.now() + timedelta(days=5, hours=16),
                'end_date': datetime.now() + timedelta(days=5, hours=18),
                'max_participants': 25
            }
        ]

        # Create events
        created_count = 0
        for event_data in sample_events:
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    'description': event_data['description'],
                    'event_type': event_data['event_type'],
                    'location': event_data['location'],
                    'latitude': event_data['latitude'],
                    'longitude': event_data['longitude'],
                    'start_date': event_data['start_date'],
                    'end_date': event_data['end_date'],
                    'max_participants': event_data['max_participants'],
                    'created_by': user
                }
            )
            
            if created:
                created_count += 1
                # Add some random participants
                num_participants = random.randint(0, min(5, event_data['max_participants']))
                if num_participants > 0:
                    # Create some additional users for participants
                    for i in range(num_participants):
                        participant, _ = User.objects.get_or_create(
                            username=f'participant_{i}',
                            defaults={
                                'email': f'participant_{i}@example.com',
                                'first_name': f'Participant',
                                'last_name': f'{i}',
                                'location': 'New York, NY'
                            }
                        )
                        event.participants.add(participant)

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample events')
        ) 