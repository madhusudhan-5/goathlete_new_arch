from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Tournament, Team, TeamPlayer, Match, PerformanceStats, TournamentStatus, MatchStatus
from .serializers import (
    TournamentSerializer, TournamentCreateSerializer, TournamentListSerializer,
    TeamSerializer, TeamCreateSerializer, TeamListSerializer,
    TeamPlayerSerializer, TeamPlayerCreateSerializer,
    MatchSerializer, MatchCreateSerializer, MatchListSerializer,
    MatchScorecardUpdateSerializer, MatchCompleteSerializer,
    PerformanceStatsSerializer, PerformanceStatsCreateSerializer
)


class TournamentViewSet(viewsets.ModelViewSet):
    """ViewSet for Tournament operations"""
    queryset = Tournament.objects.select_related('organizer', 'venue').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TournamentCreateSerializer
        elif self.action == 'list':
            return TournamentListSerializer
        return TournamentSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Players can see all tournaments or filter by their own
        if user.role == 'PLAYER':
            my_tournaments = self.request.query_params.get('my_tournaments')
            if my_tournaments == 'true':
                from players.models import Player
                try:
                    player = Player.objects.get(user=user)
                    queryset = queryset.filter(organizer=player)
                except Player.DoesNotExist:
                    return queryset.none()
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-start_date')
    
    def perform_create(self, serializer):
        # Set organizer to current player
        from players.models import Player
        player = Player.objects.get(user=self.request.user)
        serializer.save(organizer=player)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a tournament"""
        tournament = self.get_object()
        tournament.status = TournamentStatus.ONGOING
        tournament.save()
        return Response(TournamentSerializer(tournament).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a tournament"""
        tournament = self.get_object()
        tournament.status = TournamentStatus.COMPLETED
        tournament.save()
        return Response(TournamentSerializer(tournament).data)


class TeamViewSet(viewsets.ModelViewSet):
    """ViewSet for Team operations"""
    queryset = Team.objects.select_related('tournament', 'captain').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        elif self.action == 'list':
            return TeamListSerializer
        return TeamSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by tournament
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)
        
        return queryset.order_by('-points', '-matches_won')


class TeamPlayerViewSet(viewsets.ModelViewSet):
    """ViewSet for TeamPlayer operations"""
    queryset = TeamPlayer.objects.select_related('team', 'player').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeamPlayerCreateSerializer
        return TeamPlayerSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by team
        team_id = self.request.query_params.get('team')
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        
        return queryset.order_by('jersey_number')


class MatchViewSet(viewsets.ModelViewSet):
    """ViewSet for Match operations"""
    queryset = Match.objects.select_related('tournament', 'team_a', 'team_b', 'winner', 'venue').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MatchCreateSerializer
        elif self.action == 'list':
            return MatchListSerializer
        elif self.action == 'update_scorecard':
            return MatchScorecardUpdateSerializer
        elif self.action == 'complete':
            return MatchCompleteSerializer
        return MatchSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by tournament
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            queryset = queryset.filter(tournament_id=tournament_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('match_date', 'match_time')
    
    @action(detail=True, methods=['put', 'patch'])
    def update_scorecard(self, request, pk=None):
        """Update match scorecard"""
        match = self.get_object()
        serializer = MatchScorecardUpdateSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(MatchSerializer(match).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a match"""
        match = self.get_object()
        match.status = MatchStatus.LIVE
        match.save()
        return Response(MatchSerializer(match).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a match"""
        match = self.get_object()
        serializer = MatchCompleteSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            match.status = MatchStatus.COMPLETED
            serializer.save()
            
            # Update team stats
            winner = match.winner
            loser = match.team_b if winner == match.team_a else match.team_a
            
            winner.matches_played += 1
            winner.matches_won += 1
            winner.points += 3  # Adjust based on sport
            winner.save()
            
            loser.matches_played += 1
            loser.matches_lost += 1
            loser.save()
            
            # Update tournament stats
            tournament = match.tournament
            tournament.total_matches = tournament.matches.count()
            tournament.save()
            
            return Response(MatchSerializer(match).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerformanceStatsViewSet(viewsets.ModelViewSet):
    """ViewSet for PerformanceStats operations"""
    queryset = PerformanceStats.objects.select_related('player', 'match', 'team').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PerformanceStatsCreateSerializer
        return PerformanceStatsSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Filter by player
        if user.role == 'PLAYER':
            from players.models import Player
            try:
                player = Player.objects.get(user=user)
                queryset = queryset.filter(player=player)
            except Player.DoesNotExist:
                return queryset.none()
        
        # Filter by match
        match_id = self.request.query_params.get('match')
        if match_id:
            queryset = queryset.filter(match_id=match_id)
        
        return queryset.order_by('-created_at')
