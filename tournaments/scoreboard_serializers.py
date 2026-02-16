from rest_framework import serializers
from tournaments.scoreboard_models import (
    Sport, SportScoreboardTemplate, MatchScore, 
    PlayerMatchStats, MatchEvent
)


class SportSerializer(serializers.ModelSerializer):
    """Serializer for Sport"""
    class Meta:
        model = Sport
        fields = ['id', 'name', 'code', 'icon', 'description', 'is_active']


class SportScoreboardTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Sport Scoreboard Template"""
    sport = SportSerializer(read_only=True)
    
    class Meta:
        model = SportScoreboardTemplate
        fields = [
            'id', 'sport', 'player_roles', 'team_structure',
            'scoring_fields', 'player_stat_fields', 'match_event_types',
            'award_rules', 'ui_config', 'validation_rules'
        ]


class MatchScoreSerializer(serializers.ModelSerializer):
    """Serializer for Match Score"""
    team_name = serializers.CharField(source='team.name', read_only=True)
    match_id = serializers.CharField(source='match.match_id', read_only=True)
    
    class Meta:
        model = MatchScore
        fields = [
            'id', 'match', 'match_id', 'team', 'team_name',
            'team_stats', 'inning', 'is_batting', 'created_at', 'updated_at'
        ]


class MatchScoreCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Match Score"""
    class Meta:
        model = MatchScore
        fields = ['match', 'team', 'team_stats', 'inning', 'is_batting']


class PlayerMatchStatsSerializer(serializers.ModelSerializer):
    """Serializer for Player Match Stats"""
    player_name = serializers.SerializerMethodField()
    team_name = serializers.CharField(source='team.name', read_only=True)
    match_id = serializers.CharField(source='match.match_id', read_only=True)
    
    class Meta:
        model = PlayerMatchStats
        fields = [
            'id', 'match', 'match_id', 'player', 'player_name',
            'team', 'team_name', 'stats', 'performance_rating',
            'is_man_of_match', 'awards', 'created_at'
        ]
    
    def get_player_name(self, obj):
        return obj.player.user.get_full_name() or obj.player.user.email


class PlayerMatchStatsCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Player Match Stats"""
    class Meta:
        model = PlayerMatchStats
        fields = [
            'match', 'player', 'team', 'stats',
            'performance_rating', 'is_man_of_match', 'awards'
        ]


class MatchEventSerializer(serializers.ModelSerializer):
    """Serializer for Match Event"""
    team_name = serializers.CharField(source='team.name', read_only=True)
    player_name = serializers.SerializerMethodField()
    match_id = serializers.CharField(source='match.match_id', read_only=True)
    
    class Meta:
        model = MatchEvent
        fields = [
            'id', 'match', 'match_id', 'team', 'team_name',
            'player', 'player_name', 'event_type', 'event_data',
            'timestamp', 'match_time', 'sequence_number'
        ]
    
    def get_player_name(self, obj):
        if obj.player:
            return obj.player.user.get_full_name() or obj.player.user.email
        return None


class MatchEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Match Event"""
    class Meta:
        model = MatchEvent
        fields = [
            'match', 'team', 'player', 'event_type',
            'event_data', 'match_time', 'sequence_number'
        ]
