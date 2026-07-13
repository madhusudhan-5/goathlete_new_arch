from rest_framework import serializers
from .models import Tournament, Team, TeamPlayer, Match, PerformanceStats, LocalTournament, LocalTournamentParticipant
from players.serializers import PlayerSerializer
from venues.serializers import VenueSerializer
from accounts.twilio_service import TwilioWhatsAppService



class TournamentSerializer(serializers.ModelSerializer):
    organizer = PlayerSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    organizer_id = serializers.IntegerField(write_only=True, required=False)
    venue_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Tournament
        fields = [
            'id', 'tournament_id', 'name', 'sport',
            'start_date', 'end_date', 'venue', 'venue_id', 'location',
            'organizer', 'organizer_id', 'max_teams', 'team_size', 'match_format',
            'scoring_config', 'status', 'total_matches', 'total_teams',
            'description', 'rules', 'prize_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['tournament_id', 'total_matches', 'total_teams', 'created_at', 'updated_at']


class TournamentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tournaments"""
    class Meta:
        model = Tournament
        fields = [
            'name', 'sport', 'start_date', 'end_date',
            'venue', 'location', 'max_teams', 'team_size', 'match_format',
            'scoring_config', 'description', 'rules', 'prize_details'
        ]
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class TournamentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing tournaments"""
    organizer_name = serializers.SerializerMethodField()
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    sport_name = serializers.CharField(source='sport.name', read_only=True)
    
    class Meta:
        model = Tournament
        fields = [
            'id', 'tournament_id', 'name', 'sport', 'sport_name',
            'start_date', 'end_date', 'venue_name', 'location',
            'organizer_name', 'status', 'total_teams', 'total_matches'
        ]
    
    def get_organizer_name(self, obj):
        return obj.organizer.user.get_full_name() or obj.organizer.user.email


class TeamSerializer(serializers.ModelSerializer):
    tournament = TournamentSerializer(read_only=True)
    captain = PlayerSerializer(read_only=True)
    tournament_id = serializers.IntegerField(write_only=True)
    captain_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'tournament', 'tournament_id', 'name',
            'captain', 'captain_id', 'logo',
            'matches_played', 'matches_won', 'matches_lost', 'matches_drawn', 'points',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['matches_played', 'matches_won', 'matches_lost', 'matches_drawn', 'points', 'created_at', 'updated_at']


class TeamCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating teams"""
    class Meta:
        model = Team
        fields = ['tournament', 'name', 'captain', 'logo']


class TeamListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing teams"""
    captain_name = serializers.SerializerMethodField()
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'tournament_name', 'captain_name',
            'matches_played', 'matches_won', 'points', 'logo'
        ]
    
    def get_captain_name(self, obj):
        return obj.captain.user.get_full_name() or obj.captain.user.email


class TeamPlayerSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)
    team_id = serializers.IntegerField(write_only=True)
    player_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TeamPlayer
        fields = [
            'id', 'team', 'team_id', 'player', 'player_id',
            'jersey_number', 'role', 'is_captain', 'is_vice_captain',
            'joined_at'
        ]
        read_only_fields = ['joined_at']


class TeamPlayerCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding players to team"""
    class Meta:
        model = TeamPlayer
        fields = ['team', 'player', 'jersey_number', 'role', 'is_captain', 'is_vice_captain']
    
    def validate(self, data):
        # Check if player already in team
        if TeamPlayer.objects.filter(team=data['team'], player=data['player']).exists():
            raise serializers.ValidationError("Player already in this team")
        
        # Check team size limit
        team = data['team']
        current_size = team.team_players.count()
        if current_size >= team.tournament.team_size:
            raise serializers.ValidationError(f"Team is full (max {team.tournament.team_size} players)")
        
        return data


class MatchSerializer(serializers.ModelSerializer):
    tournament = TournamentSerializer(read_only=True)
    team_a = TeamSerializer(read_only=True)
    team_b = TeamSerializer(read_only=True)
    winner = TeamSerializer(read_only=True)
    umpire = PlayerSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    
    tournament_id = serializers.IntegerField(write_only=True)
    team_a_id = serializers.IntegerField(write_only=True)
    team_b_id = serializers.IntegerField(write_only=True)
    winner_id = serializers.IntegerField(write_only=True, required=False)
    umpire_id = serializers.IntegerField(write_only=True, required=False)
    venue_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Match
        fields = [
            'id', 'match_id', 'tournament', 'tournament_id',
            'team_a', 'team_a_id', 'team_b', 'team_b_id',
            'match_number', 'match_date', 'match_time',
            'venue', 'venue_id', 'scorecard',
            'winner', 'winner_id', 'result_summary',
            'umpire', 'umpire_id', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['match_id', 'created_at', 'updated_at']


class MatchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating matches"""
    class Meta:
        model = Match
        fields = [
            'tournament', 'team_a', 'team_b', 'match_number',
            'match_date', 'match_time', 'venue', 'umpire'
        ]
    
    def validate(self, data):
        # Validate teams are from same tournament
        if data['team_a'].tournament != data['tournament']:
            raise serializers.ValidationError("Team A is not in this tournament")
        if data['team_b'].tournament != data['tournament']:
            raise serializers.ValidationError("Team B is not in this tournament")
        
        # Validate teams are different
        if data['team_a'] == data['team_b']:
            raise serializers.ValidationError("Teams must be different")
        
        return data


class MatchListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing matches"""
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    team_a_name = serializers.CharField(source='team_a.name', read_only=True)
    team_b_name = serializers.CharField(source='team_b.name', read_only=True)
    winner_name = serializers.CharField(source='winner.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'match_id', 'tournament_name',
            'team_a_name', 'team_b_name', 'match_number',
            'match_date', 'match_time', 'status',
            'winner_name', 'result_summary'
        ]


class MatchScorecardUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating match scorecard"""
    class Meta:
        model = Match
        fields = ['scorecard', 'status']


class MatchCompleteSerializer(serializers.ModelSerializer):
    """Serializer for completing a match"""
    class Meta:
        model = Match
        fields = ['winner', 'result_summary', 'scorecard']
    
    def validate(self, data):
        if not data.get('winner'):
            raise serializers.ValidationError("Winner is required to complete match")
        return data


class PerformanceStatsSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    match = MatchSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    
    player_id = serializers.IntegerField(write_only=True)
    match_id = serializers.IntegerField(write_only=True)
    team_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PerformanceStats
        fields = [
            'id', 'player', 'player_id', 'match', 'match_id',
            'team', 'team_id', 'stats', 'performance_rating',
            'is_man_of_match', 'created_at'
        ]
        read_only_fields = ['created_at']


class PerformanceStatsCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating performance stats"""
    class Meta:
        model = PerformanceStats
        fields = ['player', 'match', 'team', 'stats', 'performance_rating', 'is_man_of_match']


class LocalTournamentParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalTournamentParticipant
        fields = ['id', 'name', 'email', 'mobile', 'score', 'added_at']
        read_only_fields = ['added_at']


class LocalTournamentSerializer(serializers.ModelSerializer):
    participants = LocalTournamentParticipantSerializer(many=True, read_only=True)
    sport_name = serializers.CharField(source='sport.name', read_only=True)
    sport_icon = serializers.CharField(source='sport.icon', read_only=True)
    sport_code = serializers.CharField(source='sport.code', read_only=True)
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = LocalTournament
        fields = [
            'id', 'name', 'sport', 'sport_name', 'sport_icon', 'sport_code',
            'organizer_name', 'scoreboard', 'status', 'participants',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer_name', 'created_at', 'updated_at']

    def get_organizer_name(self, obj):
        return obj.organizer.user.get_full_name() or obj.organizer.user.email


class LocalTournamentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a local tournament with participants"""
    participants = LocalTournamentParticipantSerializer(many=True)

    class Meta:
        model = LocalTournament
        fields = ['name', 'sport', 'participants']

    def validate_participants(self, value):
        emails = [p['email'] for p in value if p.get('email')]
        if len(emails) != len(set(emails)):
            raise serializers.ValidationError("Duplicate participant emails are not allowed.")
        return value
        
    def validate(self, data):
        sport = data.get('sport')
        participants = data.get('participants', [])
        
        if sport and len(participants) < sport.min_players:
            raise serializers.ValidationError(f"At least {sport.min_players} participants are required for {sport.name}.")
            
        return data

    def create(self, validated_data):
        participants_data = validated_data.pop('participants')
        tournament = LocalTournament.objects.create(**validated_data)
        
        twilio_service = TwilioWhatsAppService()
        for participant_data in participants_data:
            LocalTournamentParticipant.objects.create(tournament=tournament, **participant_data)
            
            # Trigger WhatsApp invite
            mobile = participant_data.get('mobile')
            if mobile:
                twilio_service.send_tournament_invite(mobile, tournament.name)
                
        return tournament


class LocalTournamentScoreboardUpdateSerializer(serializers.ModelSerializer):
    """For updating the main scoreboard JSON"""
    class Meta:
        model = LocalTournament
        fields = ['scoreboard']
