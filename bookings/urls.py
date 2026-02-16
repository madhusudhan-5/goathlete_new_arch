from rest_framework import routers
from django.urls import path, include
from .views import BookingViewSet, SlotBlockViewSet, BookingAnalyticsView

router = routers.DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'slot-blocks', SlotBlockViewSet, basename='slot-block')
router.register(r'analytics', BookingAnalyticsView, basename='booking-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
