from django.urls import path
from .views import (
    EventListView,
    EventDetailView,
    EventParticipateView,
    EventRemoveParticipantView,
)

urlpatterns = [
    path('', EventListView.as_view(), name='event-list'),
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('<int:pk>/participate/', EventParticipateView.as_view(), name='event-participate'),
    path('<int:event_id>/participants/<int:user_id>/', EventRemoveParticipantView.as_view(), name='event-remove-participant'),
] 