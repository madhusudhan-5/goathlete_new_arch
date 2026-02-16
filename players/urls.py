from rest_framework import routers
from django.urls import path, include
from .views import PlayerViewSet, BadgeViewSet, PlayerBadgeViewSet

router = routers.DefaultRouter()
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'player-badges', PlayerBadgeViewSet, basename='player-badge')

urlpatterns = [
    path('', include(router.urls)),
]
