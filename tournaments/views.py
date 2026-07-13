from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import (
    Tournament, Team, TeamPlayer, Match, PerformanceStats,
    TournamentStatus, MatchStatus,
    LocalTournament, LocalTournamentParticipant, LocalTournamentStatus
)
from .serializers import (
    TournamentSerializer, TournamentCreateSerializer, TournamentListSerializer,
    TeamSerializer, TeamCreateSerializer, TeamListSerializer,
    TeamPlayerSerializer, TeamPlayerCreateSerializer,
    MatchSerializer, MatchCreateSerializer, MatchListSerializer,
    MatchScorecardUpdateSerializer, MatchCompleteSerializer,
    PerformanceStatsSerializer, PerformanceStatsCreateSerializer,
    LocalTournamentSerializer, LocalTournamentCreateSerializer,
    LocalTournamentScoreboardUpdateSerializer, LocalTournamentParticipantSerializer
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

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register the current player for this tournament"""
        from players.models import Player
        tournament = self.get_object()
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'detail': 'Player profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if tournament.status != TournamentStatus.UPCOMING:
            return Response({'detail': 'Registration is only available for upcoming tournaments.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already registered (as a TeamPlayer in any team of this tournament)
        from .models import TeamPlayer
        already = TeamPlayer.objects.filter(player=player, team__tournament=tournament).exists()
        if already:
            return Response({'detail': 'You are already registered for this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Registration noted. An admin will assign you to a team shortly.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-tournaments')
    def my_tournaments(self, request):
        """Get tournaments the current player has participated in"""
        from players.models import Player
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response([])

        # Tournaments where player is the organizer or in a team
        from .models import TeamPlayer
        team_player_ids = TeamPlayer.objects.filter(player=player).values_list('team__tournament_id', flat=True)
        organized_ids = Tournament.objects.filter(organizer=player).values_list('id', flat=True)
        all_ids = list(set(list(team_player_ids) + list(organized_ids)))

        tournaments = Tournament.objects.filter(id__in=all_ids).select_related('organizer', 'venue', 'sport').order_by('-start_date')
        return Response(TournamentListSerializer(tournaments, many=True).data)


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


class LocalTournamentViewSet(viewsets.ModelViewSet):
    """ViewSet for player-created informal tournaments with guest participants."""
    permission_classes = [IsAuthenticated]
    queryset = LocalTournament.objects.prefetch_related('participants').select_related('sport', 'organizer')

    def get_serializer_class(self):
        if self.action == 'create':
            return LocalTournamentCreateSerializer
        if self.action == 'update_scoreboard':
            return LocalTournamentScoreboardUpdateSerializer
        return LocalTournamentSerializer

    def get_queryset(self):
        from players.models import Player
        user = self.request.user
        try:
            player = Player.objects.get(user=user)
        except Player.DoesNotExist:
            return LocalTournament.objects.none()
        return LocalTournament.objects.filter(organizer=player).prefetch_related('participants').select_related('sport', 'organizer')

    def perform_create(self, serializer):
        from players.models import Player
        player = Player.objects.get(user=self.request.user)

        # Block if organizer already has an active tournament
        if LocalTournament.objects.filter(organizer=player, status=LocalTournamentStatus.ACTIVE).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have an active tournament. Close it before creating a new one.")

        # Block if any participant email matches the organizer's email
        participant_mobiles = [p.get('mobile') for p in self.request.data.get('participants', []) if p.get('mobile')]
        
        # Check if any participant is already in an active tournament
        active_tournaments = LocalTournament.objects.filter(
            status__in=['scheduled', 'live'],
            participants__mobile__in=participant_mobiles
        ).distinct()
        
        if active_tournaments.exists():
            # Find exactly which participants
            blocked_mobiles = set()
            for t in active_tournaments:
                for p in t.participants.all():
                    if p.mobile in participant_mobiles:
                        blocked_mobiles.add(p.mobile)
            
            if blocked_mobiles:
                from rest_framework import serializers
                raise serializers.ValidationError(
                    f"The following participants already have an active tournament: {', '.join(blocked_mobiles)}"
                )

        serializer.save(organizer=player)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Check if the current user has an active local tournament."""
        from players.models import Player
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'active': False, 'tournament': None})

        tournament = LocalTournament.objects.filter(
            organizer=player,
            status=LocalTournamentStatus.ACTIVE
        ).prefetch_related('participants').select_related('sport').first()

        if tournament:
            return Response({
                'active': True,
                'tournament': LocalTournamentSerializer(tournament).data
            })

        # Also check if user is a participant in any active tournament
        user_email = request.user.email
        as_participant = LocalTournamentParticipant.objects.filter(
            email=user_email,
            tournament__status=LocalTournamentStatus.ACTIVE
        ).select_related('tournament__sport').first()

        if as_participant:
            return Response({
                'active': True,
                'as_participant': True,
                'tournament': LocalTournamentSerializer(as_participant.tournament).data
            })

        return Response({'active': False, 'tournament': None})

    @action(detail=True, methods=['patch'])
    def update_scoreboard(self, request, pk=None):
        """Update the main scoreboard JSON for the tournament."""
        tournament = self.get_object()
        serializer = LocalTournamentScoreboardUpdateSerializer(tournament, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(LocalTournamentSerializer(tournament).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='participant/(?P<participant_id>[^/.]+)/score')
    def update_participant_score(self, request, pk=None, participant_id=None):
        """Update individual participant score."""
        tournament = self.get_object()
        try:
            participant = tournament.participants.get(id=participant_id)
        except LocalTournamentParticipant.DoesNotExist:
            return Response({'detail': 'Participant not found.'}, status=status.HTTP_404_NOT_FOUND)
        score_data = request.data.get('score', {})
        participant.score = score_data
        participant.save()
        return Response(LocalTournamentParticipantSerializer(participant).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a local tournament (only organizer can close it)."""
        tournament = self.get_object()
        from players.models import Player
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'detail': 'Player not found.'}, status=status.HTTP_403_FORBIDDEN)

        if tournament.organizer != player:
            return Response({'detail': 'Only the organizer can close this tournament.'}, status=status.HTTP_403_FORBIDDEN)

        tournament.status = LocalTournamentStatus.COMPLETED
        tournament.save()
        return Response(LocalTournamentSerializer(tournament).data)

