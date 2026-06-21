from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Venue, Court
from .serializers import VenuePreRegisterSerializer, VenueSerializer, CourtSerializer, SlotGenerationSerializer
from accounts.models import Executive
import json
from django.db import models


class VenuePreRegisterView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        # Verify user is an executive
        if request.user.role != 'EXECUTIVE':
            return Response(
                {'error': 'Only executives can pre-register venues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Parse courts JSON if it's a string
        data = request.data.copy()
        if 'courts' in data and isinstance(data['courts'], str):
            try:
                data['courts'] = json.loads(data['courts'])
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid courts data format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = VenuePreRegisterSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            venue = serializer.save()
            
            # Handle image uploads (optional, store separately if needed)
            images = request.FILES.getlist('images')
            if images:
                # Store images - implement your storage logic here
                # For now, we'll just acknowledge them
                pass
            
            return Response(
                VenueSerializer(venue).data,
                status=status.HTTP_201_CREATED
            )
        
        # Log the errors for debugging
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VenueByExecutiveView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Verify user is an executive
        if request.user.role != 'EXECUTIVE':
            return Response(
                {'error': 'Only executives can view their venues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            executive = request.user.executive_profile
            venues = Venue.objects.filter(executive=executive)
            serializer = VenueSerializer(venues, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Executive.DoesNotExist:
            return Response(
                {'error': 'Executive profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CourtCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Allow ADMIN and EXECUTIVE to create courts
        if request.user.role not in ['ADMIN', 'EXECUTIVE']:
            return Response(
                {'error': 'Only admins and executives can create courts'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CourtSerializer(data=request.data)
        if serializer.is_valid():
            # If executive, verify they own the venue
            if request.user.role == 'EXECUTIVE':
                venue_id = request.data.get('venue')
                try:
                    executive = request.user.executive_profile
                    venue = Venue.objects.get(id=venue_id, executive=executive)
                except (Executive.DoesNotExist, Venue.DoesNotExist):
                    return Response(
                        {'error': 'Venue not found or you do not have permission'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            court = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VenueCourtsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, venue_id):
        # Allow ADMIN and EXECUTIVE to view courts
        if request.user.role not in ['ADMIN', 'EXECUTIVE']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # If executive, verify they own the venue
            if request.user.role == 'EXECUTIVE':
                executive = request.user.executive_profile
                venue = Venue.objects.get(id=venue_id, executive=executive)
            else:
                venue = Venue.objects.get(id=venue_id)
                
            courts = Court.objects.filter(venue=venue)
            serializer = CourtSerializer(courts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except (Executive.DoesNotExist, Venue.DoesNotExist):
            return Response(
                {'error': 'Venue not found or permission denied'},
                status=status.HTTP_404_NOT_FOUND
            )


class VenueSlotGenerationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, venue_id):
        # Allow ADMIN and EXECUTIVE
        if request.user.role not in ['ADMIN', 'EXECUTIVE']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Check ownership
            if request.user.role == 'EXECUTIVE':
                executive = request.user.executive_profile
                venue = Venue.objects.get(id=venue_id, executive=executive)
            else:
                venue = Venue.objects.get(id=venue_id)
        except (Executive.DoesNotExist, Venue.DoesNotExist):
            return Response(
                {'error': 'Venue not found or permission denied'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SlotGenerationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Determine courts to generate for
            court_ids = data.get('court_ids', [])
            if court_ids:
                courts = Court.objects.filter(venue=venue, id__in=court_ids)
            else:
                courts = Court.objects.filter(venue=venue)
            
            if not courts.exists():
                return Response({'error': 'No courts found'}, status=status.HTTP_400_BAD_REQUEST)
            
            from datetime import datetime, timedelta, date, time
            from .models import CourtSlot
            
            created_count = 0
            
            # Helper to generate time slots
            def generate_time_slots(start, end, duration_mins):
                slots = []
                current = start
                while current < end:
                    # Calculate slot end time
                    # Convert to datetime to add duration
                    dummy_date = date.today()
                    dt_current = datetime.combine(dummy_date, current)
                    dt_end = dt_current + timedelta(minutes=duration_mins)
                    
                    # Convert back to time
                    slot_end = dt_end.time()
                    
                    # Stop if we exceed the end time
                    if slot_end > end and slot_end != time(0, 0): # handle midnight wrap if needed
                         break
                    
                    slots.append((current, slot_end))
                    current = slot_end
                return slots
            
            time_slots = generate_time_slots(data['start_time'], data['end_time'], data['duration_minutes'])
            days = data['days']
            base_price = data['base_price']
            
            peak_price = data.get('peak_price')
            peak_start = data.get('peak_start_time')
            peak_end = data.get('peak_end_time')
            
            # Delete existing slots for these courts/days
            CourtSlot.objects.filter(court__in=courts, day_of_week__in=days).delete()
            
            for court in courts:
                for day in days:
                    for slot_start, slot_end in time_slots:
                        price = base_price
                        
                        # Apply peak pricing
                        if peak_price and peak_start and peak_end:
                            # Simple check: if slot overlaps with peak hours
                            if peak_start <= slot_start < peak_end:
                                price = peak_price
                        
                        CourtSlot.objects.create(
                            court=court,
                            day_of_week=day,
                            start_time=slot_start,
                            end_time=slot_end,
                            price_per_hour=price,
                            is_active=True
                        )
                        created_count += 1
            
            return Response(
                {
                    'message': f'Successfully generated {created_count} slots across {courts.count()} courts.',
                    'total_slots': created_count
                },
                status=status.HTTP_201_CREATED
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VenueStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, venue_id):
        # Only ADMINs can update status
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Permission denied. Only admins can update venue status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            venue = Venue.objects.get(id=venue_id)
        except Venue.DoesNotExist:
            return Response(
                {'error': 'Venue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status not in ['REGISTERED', 'REJECTED']:
            return Response(
                {'error': 'Invalid status. Must be REGISTERED or REJECTED.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        venue.status = new_status
        venue.save()
        
        return Response(VenueSerializer(venue).data, status=status.HTTP_200_OK)


import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - float(lat1))
    dlon = math.radians(lon2 - float(lon1))
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(float(lat1))) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class VenueListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Venue.objects.filter(status='REGISTERED')
        
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(models.Q(name__icontains=search) | models.Q(city__icontains=search) | models.Q(address__icontains=search))
            
        sport = request.query_params.get('sport')
        if sport:
            qs = qs.filter(courts__sport_type__iexact=sport).distinct()
            
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 10))
        
        venues_list = []
        for venue in qs:
            data = VenueSerializer(venue).data
            if lat and lng and venue.latitude and venue.longitude:
                dist = haversine(venue.latitude, venue.longitude, float(lat), float(lng))
                if dist > radius:
                    continue
                data['distance'] = dist
            venues_list.append(data)
            
        if lat and lng:
            venues_list.sort(key=lambda x: x.get('distance', 9999))
            
        return Response(venues_list, status=status.HTTP_200_OK)

class VenueDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, venue_id):
        try:
            venue = Venue.objects.get(id=venue_id)
            return Response(VenueSerializer(venue).data, status=status.HTTP_200_OK)
        except Venue.DoesNotExist:
            return Response({'error': 'Venue not found'}, status=status.HTTP_404_NOT_FOUND)

