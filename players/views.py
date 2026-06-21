from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Avg

from .models import Player, Badge, PlayerBadge
from .serializers import (
    PlayerSerializer, PlayerCreateSerializer, PlayerProfileUpdateSerializer,
    PlayerFitnessUpdateSerializer, BadgeSerializer, PlayerBadgeSerializer
)


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player operations
    """
    queryset = Player.objects.select_related('user').all()
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'register':
            return PlayerCreateSerializer
        elif self.action == 'update_profile':
            return PlayerProfileUpdateSerializer
        elif self.action == 'update_fitness':
            return PlayerFitnessUpdateSerializer
        return PlayerSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return self.queryset.none()
        
        # Super admin and admin can see all
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return self.queryset
        
        # Players can only see themselves
        if user.role == 'PLAYER':
            return self.queryset.filter(user=user)
        
        return self.queryset.none()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new player"""
        serializer = PlayerCreateSerializer(data=request.data)
        if serializer.is_valid():
            player = serializer.save()
            return Response(
                PlayerSerializer(player).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current player profile"""
        try:
            player = Player.objects.select_related('user').get(user=request.user)
            serializer = self.get_serializer(player)
            return Response(serializer.data)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update player profile"""
        try:
            player = Player.objects.get(user=request.user)
            serializer = PlayerProfileUpdateSerializer(player, data=request.data, partial=True)
            if serializer.is_valid():
                player = serializer.save()
                return Response(PlayerSerializer(player).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_fitness(self, request):
        """Update fitness profile"""
        try:
            player = Player.objects.get(user=request.user)
            serializer = PlayerFitnessUpdateSerializer(player, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(PlayerSerializer(player).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get player statistics — returns all field name variants for frontend compat"""
        try:
            player = Player.objects.get(user=request.user)

            from tournaments.models import PerformanceStats, LocalTournament, LocalTournamentParticipant

            avg_rating = PerformanceStats.objects.filter(
                player=player
            ).aggregate(avg=Avg('performance_rating'))['avg'] or 0

            man_of_match_count = PerformanceStats.objects.filter(
                player=player,
                is_man_of_match=True
            ).count()

            total_wins = player.total_wins
            total_matches = player.total_matches
            win_rate = round((total_wins / total_matches * 100), 1) if total_matches > 0 else 0

            # Local tournaments stats
            local_as_organizer = LocalTournament.objects.filter(organizer=player).count()
            local_as_participant = LocalTournamentParticipant.objects.filter(
                email=player.user.email
            ).count()

            return Response({
                # Legacy field names
                'total_matches': total_matches,
                'total_tournaments': player.total_tournaments,
                'total_wins': total_wins,
                'average_rating': round(float(avg_rating), 2),
                'man_of_match_awards': man_of_match_count,
                'badges_earned': len(player.badges),
                # Frontend-expected field names
                'matches_played': total_matches,
                'tournaments_played': player.total_tournaments,
                'matches_won': total_wins,
                'win_rate': win_rate,
                'city_rank': 0,  # Placeholder — requires leaderboard logic
                'total_bookings': 0,  # Populated by bookings app
                # Local tournament extras
                'local_tournaments_organized': local_as_organizer,
                'local_tournaments_participated': local_as_participant,
            })
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def sport_stats(self, request):
        """Get per-sport aggregate career statistics for the current player"""
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'error': 'Player profile not found'}, status=status.HTTP_404_NOT_FOUND)

        from tournaments.models import PerformanceStats, LocalTournamentParticipant

        # Formal tournament per-sport stats
        perf_stats = PerformanceStats.objects.filter(
            player=player
        ).select_related('match__tournament__sport')

        sport_map = {}
        for ps in perf_stats:
            sport = ps.match.tournament.sport
            if not sport:
                continue
            code = sport.code
            if code not in sport_map:
                sport_map[code] = {
                    'sport_name': sport.name,
                    'sport_code': code,
                    'sport_icon': sport.icon,
                    'matches': 0,
                    'aggregate_stats': {},
                }
            sport_map[code]['matches'] += 1
            for k, v in (ps.stats or {}).items():
                try:
                    sport_map[code]['aggregate_stats'][k] = (
                        sport_map[code]['aggregate_stats'].get(k, 0) + float(v)
                    )
                except (ValueError, TypeError):
                    pass

        # Local tournament per-sport stats
        local_parts = LocalTournamentParticipant.objects.filter(
            email=player.user.email
        ).select_related('tournament__sport')

        for lp in local_parts:
            sport = lp.tournament.sport
            code = sport.code
            if code not in sport_map:
                sport_map[code] = {
                    'sport_name': sport.name,
                    'sport_code': code,
                    'sport_icon': sport.icon,
                    'matches': 0,
                    'aggregate_stats': {},
                }
            sport_map[code]['matches'] += 1
            for k, v in (lp.score or {}).items():
                try:
                    sport_map[code]['aggregate_stats'][k] = (
                        sport_map[code]['aggregate_stats'].get(k, 0) + float(v)
                    )
                except (ValueError, TypeError):
                    pass

        return Response(list(sport_map.values()))

    @action(detail=False, methods=['get'])
    def performance_history(self, request):
        """Get chronological match-by-match performance history for the player"""
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'error': 'Player profile not found'}, status=status.HTTP_404_NOT_FOUND)

        from tournaments.models import PerformanceStats, LocalTournamentParticipant

        history = []

        # Formal matches
        perf_stats = PerformanceStats.objects.filter(
            player=player
        ).select_related('match__tournament__sport', 'team').order_by('-match__match_date')

        for ps in perf_stats:
            match = ps.match
            sport = match.tournament.sport
            history.append({
                'type': 'formal',
                'match_id': match.match_id,
                'tournament_name': match.tournament.name,
                'sport_name': sport.name if sport else 'Unknown',
                'sport_icon': sport.icon if sport else '🏆',
                'match_date': str(match.match_date),
                'team_name': ps.team.name,
                'stats': ps.stats,
                'performance_rating': float(ps.performance_rating) if ps.performance_rating else None,
                'is_man_of_match': ps.is_man_of_match,
                'result': 'Win' if ps.team == match.winner else 'Loss' if match.winner else 'Draw',
            })

        # Local tournaments (as participant)
        local_parts = LocalTournamentParticipant.objects.filter(
            email=player.user.email
        ).select_related('tournament__sport').order_by('-tournament__created_at')

        for lp in local_parts:
            sport = lp.tournament.sport
            history.append({
                'type': 'local',
                'tournament_id': lp.tournament.id,
                'tournament_name': lp.tournament.name,
                'sport_name': sport.name,
                'sport_icon': sport.icon,
                'match_date': str(lp.tournament.created_at.date()),
                'stats': lp.score,
                'status': lp.tournament.status,
            })

        # Sort all by date descending
        history.sort(key=lambda x: x.get('match_date', ''), reverse=True)
        return Response(history)


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Badge operations (read-only)
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]


class PlayerBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for PlayerBadge operations (read-only)
    """
    queryset = PlayerBadge.objects.select_related('player', 'badge').all()
    serializer_class = PlayerBadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Super admin and admin can see all
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return self.queryset
        
        # Players can only see their own badges
        if user.role == 'PLAYER':
            try:
                player = Player.objects.get(user=user)
                return self.queryset.filter(player=player)
            except Player.DoesNotExist:
                return self.queryset.none()
        
        return self.queryset.none()
