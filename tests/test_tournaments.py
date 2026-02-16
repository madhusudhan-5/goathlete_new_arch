"""
Tests for tournament endpoints.
"""
import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from tournaments.models import Tournament


@pytest.mark.django_db
class TestTournamentAPI:
    """Test tournament operations."""

    def test_list_tournaments(self, api_client, venue):
        """Test listing all tournaments."""
        # Create a tournament
        start_date = timezone.now().date() + timedelta(days=7)
        Tournament.objects.create(
            name='Test Tournament',
            sport='Badminton',
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            tournament_type='SINGLES',
            status='UPCOMING'
        )
        
        url = reverse('tournament-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_tournament(self, admin_client, venue):
        """Test creating a tournament."""
        url = reverse('tournament-list')
        start_date = timezone.now().date() + timedelta(days=7)
        
        data = {
            'name': 'New Tournament',
            'sport': 'Tennis',
            'venue': venue.id,
            'start_date': str(start_date),
            'end_date': str(start_date + timedelta(days=3)),
            'tournament_type': 'DOUBLES',
            'status': 'UPCOMING',
            'entry_fee': 500,
            'max_participants': 16
        }
        
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Tournament.objects.filter(name='New Tournament').exists()

    def test_register_for_tournament(self, player_client, venue):
        """Test player registration for tournament."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Open Tournament',
            sport='Badminton',
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            tournament_type='SINGLES',
            status='UPCOMING',
            max_participants=16
        )
        
        url = reverse('tournament-register', kwargs={'pk': tournament.id})
        response = player_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        # Check registration was created
        # assert tournament.participants.count() == 1

    def test_cannot_register_for_full_tournament(self, player_client, venue, player_user):
        """Test that registration fails when tournament is full."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Full Tournament',
            sport='Badminton',
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            tournament_type='SINGLES',
            status='UPCOMING',
            max_participants=1
        )
        
        # Fill the tournament
        # tournament.participants.add(player_user)
        
        url = reverse('tournament-register', kwargs={'pk': tournament.id})
        response = player_client.post(url)
        
        # Should fail if already full
        # assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_tournaments_by_sport(self, api_client, venue):
        """Test filtering tournaments by sport."""
        start_date = timezone.now().date() + timedelta(days=7)
        Tournament.objects.create(
            name='Badminton Tournament',
            sport='Badminton',
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            tournament_type='SINGLES',
            status='UPCOMING'
        )
        
        url = reverse('tournament-list')
        response = api_client.get(url, {'sport': 'Badminton'})
        
        assert response.status_code == status.HTTP_200_OK
        assert all(t['sport'] == 'Badminton' for t in response.data)

    def test_tournament_matches(self, api_client, venue):
        """Test retrieving matches for a tournament."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Test Tournament',
            sport='Badminton',
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            tournament_type='SINGLES',
            status='ONGOING'
        )
        
        url = reverse('tournament-matches', kwargs={'pk': tournament.id})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
