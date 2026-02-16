from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Booking, SlotBlock, BookingStatus
from .serializers import (
    BookingSerializer, BookingCreateSerializer, BookingListSerializer,
    SlotBlockSerializer, SlotBlockCreateSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking operations
    """
    queryset = Booking.objects.select_related('court', 'venue', 'player').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action == 'list':
            return BookingListSerializer
        return BookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Filter by role
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            pass  # Can see all
        elif user.role == 'VENDOR_ADMIN':
            from partners.models import VendorAdmin
            try:
                vendor_admin = VendorAdmin.objects.get(user=user)
                queryset = queryset.filter(venue=vendor_admin.venue)
            except VendorAdmin.DoesNotExist:
                return queryset.none()
        elif user.role == 'VENDOR_PARTNER':
            from partners.models import VendorPartner
            try:
                vendor_partner = VendorPartner.objects.get(user=user)
                queryset = queryset.filter(venue=vendor_partner.venue)
            except VendorPartner.DoesNotExist:
                return queryset.none()
        elif user.role == 'PLAYER':
            from players.models import Player
            try:
                player = Player.objects.get(user=user)
                queryset = queryset.filter(player=player)
            except Player.DoesNotExist:
                return queryset.none()
        else:
            return queryset.none()
        
        # Filter by query params
        booking_date = self.request.query_params.get('booking_date')
        if booking_date:
            queryset = queryset.filter(booking_date=booking_date)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-booking_date', '-start_time')
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Set created_by based on role
        if user.role == 'VENDOR_ADMIN':
            from partners.models import VendorAdmin
            vendor_admin = VendorAdmin.objects.get(user=user)
            serializer.save(created_by_admin=vendor_admin)
        elif user.role == 'VENDOR_PARTNER':
            from partners.models import VendorPartner
            vendor_partner = VendorPartner.objects.get(user=user)
            serializer.save(created_by_partner=vendor_partner)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking"""
        booking = self.get_object()
        booking.status = BookingStatus.CONFIRMED
        booking.save()
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        booking.status = BookingStatus.CANCELLED
        booking.save()
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed"""
        booking = self.get_object()
        booking.status = BookingStatus.COMPLETED
        booking.save()
        return Response(BookingSerializer(booking).data)


class SlotBlockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SlotBlock operations
    """
    queryset = SlotBlock.objects.select_related('court').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SlotBlockCreateSerializer
        return SlotBlockSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Filter by role
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            pass  # Can see all
        elif user.role == 'VENDOR_ADMIN':
            from partners.models import VendorAdmin
            try:
                vendor_admin = VendorAdmin.objects.get(user=user)
                queryset = queryset.filter(court__venue=vendor_admin.venue)
            except VendorAdmin.DoesNotExist:
                return queryset.none()
        elif user.role == 'VENDOR_PARTNER':
            from partners.models import VendorPartner
            try:
                vendor_partner = VendorPartner.objects.get(user=user)
                queryset = queryset.filter(court__venue=vendor_partner.venue)
            except VendorPartner.DoesNotExist:
                return queryset.none()
        else:
            return queryset.none()
        
        # Filter by query params
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-block_date', '-start_time')
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Set blocked_by based on role
        if user.role == 'VENDOR_ADMIN':
            from partners.models import VendorAdmin
            vendor_admin = VendorAdmin.objects.get(user=user)
            serializer.save(blocked_by_admin=vendor_admin)
        elif user.role == 'VENDOR_PARTNER':
            from partners.models import VendorPartner
            vendor_partner = VendorPartner.objects.get(user=user)
            serializer.save(blocked_by_partner=vendor_partner)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        """Unblock a slot"""
        slot_block = self.get_object()
        slot_block.is_active = False
        slot_block.save()
        return Response(SlotBlockSerializer(slot_block).data)
class BookingAnalyticsView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def reports(self, request):
        """
        Get analytics reports: revenue, booking counts, trends
        Query params: start_date, end_date, venue_id
        """
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate
        
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        venue_id = request.query_params.get('venue_id')
        
        # Base QuerySet
        queryset = Booking.objects.filter(status__in=[BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
        
        # Filter by Date
        if start_date:
            queryset = queryset.filter(booking_date__gte=start_date)
        else:
            # Default to last 30 days
            start_date = (timezone.now() - timezone.timedelta(days=30)).date()
            queryset = queryset.filter(booking_date__gte=start_date)
            
        if end_date:
            queryset = queryset.filter(booking_date__lte=end_date)
            
        # Filter by Venue/Role
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            if venue_id:
                queryset = queryset.filter(venue_id=venue_id)
        elif user.role == 'VENDOR_ADMIN':
            from partners.models import VendorAdmin
            try:
                vendor_admin = VendorAdmin.objects.get(user=user)
                # If venue_id provided, ensure it belongs to them (though for now VendorAdmin has 1 venue usually)
                queryset = queryset.filter(venue=vendor_admin.venue)
            except VendorAdmin.DoesNotExist:
                return Response({'error': 'Vendor Admin profile not found'}, status=status.HTTP_404_NOT_FOUND)
        elif user.role == 'VENDOR_PARTNER':
             # Partners might not have access or limited access
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        else:
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Aggregates
        total_revenue = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_bookings = queryset.count()
        
        # Daily Trends
        daily_trends = queryset.annotate(date=TruncDate('booking_date')) \
            .values('date') \
            .annotate(revenue=Sum('total_amount'), bookings=Count('id')) \
            .order_by('date')
            
        return Response({
            'total_revenue': total_revenue,
            'total_bookings': total_bookings,
            'trends': list(daily_trends)
        })
