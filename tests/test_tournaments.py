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

    def test_list_tournaments(self, player_client, venue, player, sport):
        """Test listing all tournaments."""
        # Create a tournament
        start_date = timezone.now().date() + timedelta(days=7)
        Tournament.objects.create(
            name='Test Tournament',
            sport=sport,
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            location='Test Location',
            organizer=player,
            match_format='Best of 3',
            status='UPCOMING'
        )
        
        url = reverse('tournament-list')
        response = player_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_create_tournament(self, player_client, venue, sport, player):
        """Test creating a tournament."""
        url = reverse('tournament-list')
        start_date = timezone.now().date() + timedelta(days=7)
        
        data = {
            'name': 'New Tournament',
            'sport': sport.id,
            'venue': venue.id,
            'start_date': str(start_date),
            'end_date': str(start_date + timedelta(days=3)),
            'location': 'New Location',
            'max_teams': 8,
            'team_size': 11,
            'match_format': 'Best of 3',
        }
        
        response = player_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Tournament.objects.filter(name='New Tournament').exists()

    def test_register_for_tournament(self, player_client, venue, player, sport):
        """Test player registration for tournament."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Open Tournament',
            sport=sport,
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            location='Test Location',
            organizer=player,
            match_format='Best of 3',
            status='UPCOMING'
        )
        
        url = reverse('tournament-register', kwargs={'pk': tournament.id})
        response = player_client.post(url)
        assert response.status_code == status.HTTP_200_OK

    def test_cannot_register_twice_for_tournament(self, player_client, venue, player, sport):
        """Test that registering twice fails."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Open Tournament',
            sport=sport,
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            location='Test Location',
            organizer=player,
            match_format='Best of 3',
            status='UPCOMING'
        )
        
        # Create a team and add player to it so they are "already registered"
        from tournaments.models import Team, TeamPlayer
        team = Team.objects.create(tournament=tournament, name='Team A', captain=player)
        TeamPlayer.objects.create(team=team, player=player, jersey_number=10)

        url = reverse('tournament-register', kwargs={'pk': tournament.id})
        response = player_client.post(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_tournaments_by_status(self, player_client, venue, player, sport):
        """Test filtering tournaments by status."""
        start_date = timezone.now().date() + timedelta(days=7)
        Tournament.objects.create(
            name='Badminton Tournament',
            sport=sport,
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            location='Test Location',
            organizer=player,
            match_format='Best of 3',
            status='UPCOMING'
        )
        
        url = reverse('tournament-list')
        response = player_client.get(url, {'status': 'UPCOMING'})
        
        assert response.status_code == status.HTTP_200_OK
        assert all(t['status'] == 'UPCOMING' for t in response.data)

    def test_tournament_matches(self, player_client, venue, player, sport):
        """Test retrieving matches for a tournament."""
        start_date = timezone.now().date() + timedelta(days=7)
        tournament = Tournament.objects.create(
            name='Test Tournament',
            sport=sport,
            venue=venue,
            start_date=start_date,
            end_date=start_date + timedelta(days=2),
            location='Test Location',
            organizer=player,
            match_format='Best of 3',
            status='ONGOING'
        )
        
        url = reverse('match-list')
        response = player_client.get(url, {'tournament': tournament.id})
        assert response.status_code == status.HTTP_200_OK

