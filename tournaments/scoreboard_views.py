from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from tournaments.scoreboard_models import (
    Sport, SportScoreboardTemplate, MatchScore,
    PlayerMatchStats, MatchEvent
)
from .scoreboard_serializers import (
    SportSerializer, SportScoreboardTemplateSerializer,
    MatchScoreSerializer, MatchScoreCreateSerializer,
    PlayerMatchStatsSerializer, PlayerMatchStatsCreateSerializer,
    MatchEventSerializer, MatchEventCreateSerializer
)


class SportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Sport (read-only)
    Lists all available sports and their configurations
    """
    queryset = Sport.objects.filter(is_active=True)
    serializer_class = SportSerializer
    permission_classes = [AllowAny]  # Public endpoint
    
    @action(detail=True, methods=['get'])
    def template(self, request, pk=None):
        """Get scoreboard template for a sport"""
        sport = self.get_object()
        try:
            template = sport.scoreboard_template
            serializer = SportScoreboardTemplateSerializer(template)
            return Response(serializer.data)
        except SportScoreboardTemplate.DoesNotExist:
            return Response(
                {'error': 'Scoreboard template not found for this sport'},
                status=status.HTTP_404_NOT_FOUND
            )


class MatchScoreViewSet(viewsets.ModelViewSet):
    """ViewSet for Match Score"""
    queryset = MatchScore.objects.select_related('match', 'team').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MatchScoreCreateSerializer
        return MatchScoreSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by match
        match_id = self.request.query_params.get('match')
        if match_id:
            queryset = queryset.filter(match_id=match_id)
        
        return queryset.order_by('match', 'inning')


class PlayerMatchStatsViewSet(viewsets.ModelViewSet):
    """ViewSet for Player Match Stats"""
    queryset = PlayerMatchStats.objects.select_related('match', 'player', 'team').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PlayerMatchStatsCreateSerializer
        return PlayerMatchStatsSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by match
        match_id = self.request.query_params.get('match')
        if match_id:
            queryset = queryset.filter(match_id=match_id)
        
        # Filter by player
        player_id = self.request.query_params.get('player')
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        
        return queryset.order_by('-created_at')


class MatchEventViewSet(viewsets.ModelViewSet):
    """ViewSet for Match Events (live scoring)"""
    queryset = MatchEvent.objects.select_related('match', 'team', 'player').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MatchEventCreateSerializer
        return MatchEventSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by match
        match_id = self.request.query_params.get('match')
        if match_id:
            queryset = queryset.filter(match_id=match_id)
        
        return queryset.order_by('match', 'sequence_number')
    
    @action(detail=False, methods=['get'])
    def live_feed(self, request):
        """Get live event feed for a match"""
        match_id = request.query_params.get('match')
        if not match_id:
            return Response(
                {'error': 'match parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        events = self.queryset.filter(match_id=match_id).order_by('-sequence_number')[:20]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
