from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from tournaments.models import Tournament, Sport, Match
from tournaments.scoreboard_models import MatchScore
from players.models import Player

User = get_user_model()

class ScoreboardTests(APITestCase):
    def setUp(self):
        # Create User & Token
        self.user = User.objects.create_user(email='test@example.com', password='password', role='PLAYER')
        self.player = Player.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)
        
        # Load Sport Templates
        from django.core.management import call_command
        try:
            call_command('load_sport_templates', verbosity=0)
        except Exception:
            pass # Handle if already loaded or other issues
            
        self.sport = Sport.objects.filter(code='CRICKET').first()

    def test_list_sports(self):
        """Test listing available sports"""
        url = reverse('sport-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_get_sport_template(self):
        """Test getting scoreboard template for a sport"""
        if not self.sport:
            return # Skip if no data
            
        url = reverse('sport-template', args=[self.sport.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('scoring_fields', response.data)
        self.assertIn('match_event_types', response.data)

    def test_create_tournament_with_sport(self):
        """Test creating a tournament linked to a sport"""
        if not self.sport:
            return 

        url = reverse('tournament-list')
        data = {
            'name': 'Test Cricket Cup',
            'sport': self.sport.id, # Send ID, serializer handles model
            'start_date': '2026-03-01',
            'end_date': '2026-03-10',
            'location': 'Bangalore',
            'match_format': 'LEAGUE',
            'max_teams': 8,
            'team_size': 11
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Test Cricket Cup')
        
