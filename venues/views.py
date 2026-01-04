from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Venue, Court
from .serializers import VenuePreRegisterSerializer, VenueSerializer, CourtSerializer
from accounts.models import Executive
import json


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

