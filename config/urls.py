"""
URL configuration for GoAthlete project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  # Includes both auth and admin endpoints
    path('api/venues/', include('venues.urls')),
    path('api/partners/', include('partners.urls')),
    path('api/players/', include('players.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/tournaments/', include('tournaments.urls')),
]

