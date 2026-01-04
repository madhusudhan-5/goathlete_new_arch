from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from accounts.models import User, Executive
from venues.models import Venue
from .admin_serializers import (
    AdminExecutiveSerializer,
    AdminExecutiveCreateSerializer,
    AdminExecutiveUpdateSerializer
)


class AdminOnlyPermission(IsAuthenticated):
    """Custom permission to only allow admins"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'ADMIN'


class AdminExecutiveListCreateView(APIView):
    permission_classes = [AdminOnlyPermission]

    def get(self, request):
        """Get all executives"""
        executives = Executive.objects.select_related('user').all()
        serializer = AdminExecutiveSerializer(executives, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create new executive"""
        serializer = AdminExecutiveCreateSerializer(data=request.data)
        if serializer.is_valid():
            executive = serializer.save()
            return Response(
                AdminExecutiveSerializer(executive).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminExecutiveDetailView(APIView):
    permission_classes = [AdminOnlyPermission]

    def get_object(self, pk):
        try:
            return Executive.objects.select_related('user').get(pk=pk)
        except Executive.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get executive by ID"""
        executive = self.get_object(pk)
        if not executive:
            return Response(
                {'error': 'Executive not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AdminExecutiveSerializer(executive)
        return Response(serializer.data)

    def put(self, request, pk):
        """Update executive"""
        executive = self.get_object(pk)
        if not executive:
            return Response(
                {'error': 'Executive not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminExecutiveUpdateSerializer(executive, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(AdminExecutiveSerializer(executive).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete executive"""
        executive = self.get_object(pk)
        if not executive:
            return Response(
                {'error': 'Executive not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = executive.user
        executive.delete()
        user.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminExecutiveStatusView(APIView):
    permission_classes = [AdminOnlyPermission]

    def patch(self, request, pk):
        """Toggle executive active status"""
        try:
            executive = Executive.objects.select_related('user').get(pk=pk)
        except Executive.DoesNotExist:
            return Response(
                {'error': 'Executive not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        is_active = request.data.get('is_active', None)
        if is_active is None:
            return Response(
                {'error': 'is_active field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        executive.user.is_active = is_active
        executive.user.save()
        
        return Response(AdminExecutiveSerializer(executive).data)


class AdminVenueListView(APIView):
    permission_classes = [AdminOnlyPermission]

    def get(self, request):
        """Get all venues"""
        venues = Venue.objects.select_related(
            'executive__user'
        ).annotate(
            courts_count=Count('courts')
        ).all()
        
        data = []
        for venue in venues:
            data.append({
                'id': venue.id,
                'name': venue.name,
                'address': venue.address,
                'city': venue.city,
                'state': venue.state,
                'pincode': venue.pincode,
                'phone': venue.phone,
                'email': venue.email,
                'status': venue.status,
                'executive': {
                    'user': {
                        'email': venue.executive.user.email,
                        'first_name': venue.executive.user.first_name,
                        'last_name': venue.executive.user.last_name,
                    }
                },
                'courts_count': venue.courts_count,
                'created_at': venue.created_at,
                'updated_at': venue.updated_at,
            })
        
        return Response(data)


class AdminVenueStatusView(APIView):
    permission_classes = [AdminOnlyPermission]

    def patch(self, request, pk):
        """Update venue status"""
        try:
            venue = Venue.objects.get(pk=pk)
        except Venue.DoesNotExist:
            return Response(
                {'error': 'Venue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status not in ['PRE_REGISTERED', 'REGISTERED']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        venue.status = new_status
        venue.save()
        
        return Response({'message': 'Status updated successfully'})


class AdminAnalyticsView(APIView):
    permission_classes = [AdminOnlyPermission]

    def get(self, request):
        """Get dashboard analytics"""
        total_executives = Executive.objects.count()
        active_executives = Executive.objects.filter(user__is_active=True).count()
        pre_registered_venues = Venue.objects.filter(status='PRE_REGISTERED').count()
        registered_venues = Venue.objects.filter(status='REGISTERED').count()
        
        total_venues = pre_registered_venues + registered_venues
        conversion_rate = 0
        if total_venues > 0:
            conversion_rate = round((registered_venues / total_venues) * 100, 1)
        
        return Response({
            'totalExecutives': total_executives,
            'activeExecutives': active_executives,
            'preRegisteredVenues': pre_registered_venues,
            'registeredVenues': registered_venues,
            'meetingsScheduled': 234,  # Mock data - implement actual logic
            'conversionRate': conversion_rate,
        })

