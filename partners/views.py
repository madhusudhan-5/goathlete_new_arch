from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import VendorAdmin, VendorPartner
from .serializers import (
    VendorAdminSerializer, VendorAdminCreateSerializer,
    VendorPartnerSerializer, VendorPartnerCreateSerializer
)


class VendorAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vendor Admin operations
    """
    queryset = VendorAdmin.objects.select_related('user', 'venue').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VendorAdminCreateSerializer
        return VendorAdminSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Super admin and admin can see all
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return self.queryset
        
        # Vendor admin can only see themselves
        if user.role == 'VENDOR_ADMIN':
            return self.queryset.filter(user=user)
        
        return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current vendor admin profile"""
        try:
            vendor_admin = VendorAdmin.objects.select_related('user', 'venue').get(user=request.user)
            serializer = self.get_serializer(vendor_admin)
            return Response(serializer.data)
        except VendorAdmin.DoesNotExist:
            return Response(
                {'error': 'Vendor admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for vendor admin"""
        try:
            vendor_admin = VendorAdmin.objects.get(user=request.user)
            venue = vendor_admin.venue
            
            from bookings.models import Booking, BookingStatus
            from venues.models import Court
            
            today = timezone.now().date()
            
            # Get stats
            total_courts = Court.objects.filter(venue=venue).count()
            
            today_bookings = Booking.objects.filter(
                venue=venue,
                booking_date=today,
                status__in=[BookingStatus.CONFIRMED, BookingStatus.PENDING]
            ).count()
            
            today_earnings = Booking.objects.filter(
                venue=venue,
                booking_date=today,
                status=BookingStatus.CONFIRMED,
                is_paid=True
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            active_partners = VendorPartner.objects.filter(
                venue=venue,
                is_active=True
            ).count()
            
            # Upcoming bookings (next 7 days)
            upcoming_bookings = Booking.objects.filter(
                venue=venue,
                booking_date__gte=today,
                booking_date__lte=today + timedelta(days=7),
                status__in=[BookingStatus.CONFIRMED, BookingStatus.PENDING]
            ).count()
            
            return Response({
                'total_courts': total_courts,
                'today_bookings': today_bookings,
                'today_earnings': float(today_earnings),
                'active_partners': active_partners,
                'upcoming_bookings': upcoming_bookings,
                'venue_name': venue.name,
                'venue_status': venue.status
            })
        except VendorAdmin.DoesNotExist:
            return Response(
                {'error': 'Vendor admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VendorPartnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vendor Partner operations
    """
    queryset = VendorPartner.objects.select_related('user', 'venue', 'admin').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VendorPartnerCreateSerializer
        return VendorPartnerSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Super admin and admin can see all
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            return self.queryset
        
        # Vendor admin can see their partners
        if user.role == 'VENDOR_ADMIN':
            try:
                vendor_admin = VendorAdmin.objects.get(user=user)
                return self.queryset.filter(admin=vendor_admin)
            except VendorAdmin.DoesNotExist:
                return self.queryset.none()
        
        # Vendor partner can only see themselves
        if user.role == 'VENDOR_PARTNER':
            return self.queryset.filter(user=user)
        
        return self.queryset.none()
    
    def perform_create(self, serializer):
        # Set admin to current user's vendor admin profile
        if self.request.user.role == 'VENDOR_ADMIN':
            vendor_admin = VendorAdmin.objects.get(user=self.request.user)
            serializer.save(admin=vendor_admin, venue=vendor_admin.venue)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current vendor partner profile"""
        try:
            vendor_partner = VendorPartner.objects.select_related('user', 'venue', 'admin').get(user=request.user)
            serializer = self.get_serializer(vendor_partner)
            return Response(serializer.data)
        except VendorPartner.DoesNotExist:
            return Response(
                {'error': 'Vendor partner profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for vendor partner"""
        try:
            vendor_partner = VendorPartner.objects.get(user=request.user)
            venue = vendor_partner.venue
            
            from bookings.models import Booking, BookingStatus
            
            today = timezone.now().date()
            
            # Get today's stats
            today_bookings = Booking.objects.filter(
                venue=venue,
                booking_date=today,
                status__in=[BookingStatus.CONFIRMED, BookingStatus.PENDING]
            ).count()
            
            my_bookings = Booking.objects.filter(
                venue=venue,
                created_by_partner=vendor_partner,
                booking_date=today
            ).count()
            
            return Response({
                'today_bookings': today_bookings,
                'my_bookings_today': my_bookings,
                'venue_name': venue.name
            })
        except VendorPartner.DoesNotExist:
            return Response(
                {'error': 'Vendor partner profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
