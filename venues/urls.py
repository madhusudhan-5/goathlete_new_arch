from django.urls import path
from .views import VenuePreRegisterView, VenueByExecutiveView, CourtCreateView

urlpatterns = [
    path('pre-register', VenuePreRegisterView.as_view(), name='venue-pre-register'),
    path('by-executive', VenueByExecutiveView.as_view(), name='venue-by-executive'),
    path('courts/', CourtCreateView.as_view(), name='court-create'),
]

