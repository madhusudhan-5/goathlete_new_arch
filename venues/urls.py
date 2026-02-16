from django.urls import path
from .views import VenuePreRegisterView, VenueByExecutiveView, CourtCreateView, VenueCourtsView, VenueSlotGenerationView, VenueStatusUpdateView

urlpatterns = [
    path('pre-register', VenuePreRegisterView.as_view(), name='venue-pre-register'),
    path('by-executive', VenueByExecutiveView.as_view(), name='venue-by-executive'),
    path('courts/', CourtCreateView.as_view(), name='court-create'),
    path('<int:venue_id>/courts/', VenueCourtsView.as_view(), name='venue-courts-list'),
    path('<int:venue_id>/generate-slots/', VenueSlotGenerationView.as_view(), name='venue-generate-slots'),
    path('<int:venue_id>/status/', VenueStatusUpdateView.as_view(), name='venue-status-update'),
]

