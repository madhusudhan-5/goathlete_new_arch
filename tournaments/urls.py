from rest_framework import routers
from django.urls import path, include
from .views import (
    TournamentViewSet, TeamViewSet, TeamPlayerViewSet,
    MatchViewSet, PerformanceStatsViewSet
)
from .scoreboard_views import (
    SportViewSet, MatchScoreViewSet, PlayerMatchStatsViewSet, MatchEventViewSet
)

router = routers.DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'team-players', TeamPlayerViewSet, basename='team-player')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'performance-stats', PerformanceStatsViewSet, basename='performance-stats')

# Scoreboard endpoints
router.register(r'sports', SportViewSet, basename='sport')
router.register(r'match-scores', MatchScoreViewSet, basename='match-score')
router.register(r'player-match-stats', PlayerMatchStatsViewSet, basename='player-match-stats')
router.register(r'match-events', MatchEventViewSet, basename='match-event')

urlpatterns = [
    path('', include(router.urls)),
]
