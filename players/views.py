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
                serializer.save()
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
        """Get player statistics"""
        try:
            player = Player.objects.get(user=request.user)
            
            from tournaments.models import PerformanceStats
            
            avg_rating = PerformanceStats.objects.filter(
                player=player
            ).aggregate(avg=Avg('performance_rating'))['avg'] or 0
            
            man_of_match_count = PerformanceStats.objects.filter(
                player=player,
                is_man_of_match=True
            ).count()
            
            return Response({
                'total_matches': player.total_matches,
                'total_tournaments': player.total_tournaments,
                'total_wins': player.total_wins,
                'average_rating': round(float(avg_rating), 2),
                'man_of_match_awards': man_of_match_count,
                'badges_earned': len(player.badges)
            })
        except Player.DoesNotExist:
            return Response(
                {'error': 'Player profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


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
