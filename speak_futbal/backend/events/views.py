from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Event
from .serializers import EventSerializer, EventListSerializer

class EventListView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'event_type']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        queryset = Event.objects.filter(is_active=True)
        
        # Filter by location if coordinates are provided
        lat = self.request.query_params.get('latitude')
        lng = self.request.query_params.get('longitude')
        radius = self.request.query_params.get('radius', 10)  # Default 10km radius
        
        if lat and lng:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
            lat_range = (lat - radius/111.32, lat + radius/111.32)
            lng_range = (lng - radius/(111.32 * abs(lat) if lat != 0 else 1), 
                        lng + radius/(111.32 * abs(lat) if lat != 0 else 1))
            queryset = queryset.filter(
                latitude__isnull=False,
                longitude__isnull=False,
                latitude__range=lat_range,
                longitude__range=lng_range
            )
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

class EventParticipateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk, is_active=True)
            
            # Check if event is full
            if event.max_participants and event.participants.count() >= event.max_participants:
                return Response(
                    {'error': 'Event is full'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add user to participants
            event.participants.add(request.user)
            return Response(status=status.HTTP_200_OK)
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            event = Event.objects.get(pk=pk, is_active=True)
            event.participants.remove(request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class EventRemoveParticipantView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, event_id, user_id):
        try:
            event = Event.objects.get(pk=event_id, is_active=True)
        except Event.DoesNotExist:
            
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

        # Only the creator can remove participants
        if event.created_by != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Don't allow removing the creator
        if user_id == event.created_by.id:
            return Response({'error': 'Cannot remove event creator'}, status=status.HTTP_400_BAD_REQUEST)
        
        participant = event.participants.filter(id=user_id).first()
        
        if not participant:
            
            return Response({'error': 'Participant not found'}, status=status.HTTP_404_NOT_FOUND)

        event.participants.remove(participant)
            
        return Response(status=status.HTTP_204_NO_CONTENT)

