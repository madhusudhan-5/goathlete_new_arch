from django.contrib import admin
from .models import Tournament, Team, TeamPlayer, Match, PerformanceStats
from .scoreboard_models import Sport, SportScoreboardTemplate, MatchScore, PlayerMatchStats, MatchEvent

@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'icon', 'is_active', 'created_at']
    search_fields = ['name', 'code']
    list_filter = ['is_active']


@admin.register(SportScoreboardTemplate)
class SportScoreboardTemplateAdmin(admin.ModelAdmin):
    list_display = ['sport', 'created_at', 'updated_at']
    search_fields = ['sport__name', 'sport__code']


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['tournament_id', 'name', 'sport', 'start_date', 'end_date', 'status_badge', 'total_teams', 'total_matches', 'organizer_email']
    list_filter = ['status', 'sport', 'start_date', 'created_at']
    search_fields = ['tournament_id', 'name', 'organizer__user__email', 'location']
    readonly_fields = ['tournament_id', 'total_matches', 'total_teams', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Tournament Information', {
            'fields': ('tournament_id', 'name', 'sport', 'organizer')
        }),
        ('Schedule & Location', {
            'fields': ('start_date', 'end_date', 'venue', 'location')
        }),
        ('Configuration', {
            'fields': ('max_teams', 'team_size', 'match_format', 'scoring_config')
        }),
        ('Status & Stats', {
            'fields': ('status', 'total_teams', 'total_matches')
        }),
        ('Additional Details', {
            'fields': ('description', 'rules', 'prize_details'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def organizer_email(self, obj):
        return obj.organizer.user.email
    organizer_email.short_description = 'Organizer'
    organizer_email.admin_order_field = 'organizer__user__email'
    
    def status_badge(self, obj):
        from django.utils.html import format_html
        colors = {
            'DRAFT': 'gray',
            'UPCOMING': 'blue',
            'ONGOING': 'green',
            'COMPLETED': 'purple',
            'CANCELLED': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'tournament_name', 'captain_name', 'matches_played', 'matches_won', 'points']
    list_filter = ['tournament__sport', 'created_at']
    search_fields = ['name', 'tournament__name', 'captain__user__email']
    readonly_fields = ['matches_played', 'matches_won', 'matches_lost', 'matches_drawn', 'points', 'created_at', 'updated_at']
    
    def tournament_name(self, obj):
        return obj.tournament.name
    tournament_name.short_description = 'Tournament'
    tournament_name.admin_order_field = 'tournament__name'
    
    def captain_name(self, obj):
        return obj.captain.user.get_full_name() or obj.captain.user.email
    captain_name.short_description = 'Captain'


@admin.register(TeamPlayer)
class TeamPlayerAdmin(admin.ModelAdmin):
    list_display = ['player_name', 'team_name', 'jersey_number', 'role', 'is_captain', 'is_vice_captain']
    list_filter = ['is_captain', 'is_vice_captain', 'team__tournament__sport']
    search_fields = ['player__user__email', 'team__name', 'role']
    
    def player_name(self, obj):
        return obj.player.user.get_full_name() or obj.player.user.email
    player_name.short_description = 'Player'
    
    def team_name(self, obj):
        return obj.team.name
    team_name.short_description = 'Team'


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['match_id', 'tournament_name', 'teams', 'match_date', 'match_time', 'status_badge', 'winner_name']
    list_filter = ['status', 'match_date', 'tournament__sport', 'created_at']
    search_fields = ['match_id', 'tournament__name', 'team_a__name', 'team_b__name']
    readonly_fields = ['match_id', 'created_at', 'updated_at']
    date_hierarchy = 'match_date'
    
    fieldsets = (
        ('Match Information', {
            'fields': ('match_id', 'tournament', 'match_number')
        }),
        ('Teams', {
            'fields': ('team_a', 'team_b')
        }),
        ('Schedule & Venue', {
            'fields': ('match_date', 'match_time', 'venue')
        }),
        ('Scoring', {
            'fields': ('scorecard', 'winner', 'result_summary', 'umpire')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def tournament_name(self, obj):
        return obj.tournament.name
    tournament_name.short_description = 'Tournament'
    
    def teams(self, obj):
        return f"{obj.team_a.name} vs {obj.team_b.name}"
    teams.short_description = 'Match'
    
    def winner_name(self, obj):
        return obj.winner.name if obj.winner else '-'
    winner_name.short_description = 'Winner'
    
    def status_badge(self, obj):
        from django.utils.html import format_html
        colors = {
            'SCHEDULED': 'blue',
            'LIVE': 'green',
            'COMPLETED': 'purple',
            'CANCELLED': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(PerformanceStats)
class PerformanceStatsAdmin(admin.ModelAdmin):
    list_display = ['player_name', 'match_id', 'team_name', 'performance_rating', 'is_man_of_match', 'created_at']
    list_filter = ['is_man_of_match', 'match__tournament__sport', 'created_at']
    search_fields = ['player__user__email', 'match__match_id', 'team__name']
    readonly_fields = ['created_at']
    
    def player_name(self, obj):
        return obj.player.user.get_full_name() or obj.player.user.email
    player_name.short_description = 'Player'
    
    def match_id(self, obj):
        return obj.match.match_id
    match_id.short_description = 'Match'
    
    def team_name(self, obj):
        return obj.team.name
    team_name.short_description = 'Team'


@admin.register(MatchScore)
class MatchScoreAdmin(admin.ModelAdmin):
    list_display = ['match_id', 'team', 'inning', 'is_batting', 'created_at']
    list_filter = ['inning', 'is_batting', 'created_at']
    search_fields = ['match__match_id', 'team__name']
    
    def match_id(self, obj):
        return obj.match.match_id


@admin.register(PlayerMatchStats)
class PlayerMatchStatsAdmin(admin.ModelAdmin):
    list_display = ['player', 'match', 'team', 'performance_rating', 'is_man_of_match']
    list_filter = ['is_man_of_match', 'created_at']
    search_fields = ['player__user__email', 'match__match_id', 'team__name']


@admin.register(MatchEvent)
class MatchEventAdmin(admin.ModelAdmin):
    list_display = ['match', 'event_type', 'match_time', 'sequence_number', 'timestamp']
    list_filter = ['event_type', 'timestamp']
    search_fields = ['match__match_id', 'event_type']
