from django.db import models
from django.core.validators import MinValueValidator


class Sport(models.Model):
    """Master table for all sports"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Unique sport code (e.g., CRICKET, FOOTBALL)")
    icon = models.CharField(max_length=50, help_text="Emoji or icon identifier")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.icon} {self.name}"

    class Meta:
        verbose_name = "Sport"
        verbose_name_plural = "Sports"
        ordering = ['name']


class SportScoreboardTemplate(models.Model):
    """
    Configurable scoreboard template for each sport.
    This drives the entire UI and scoring logic.
    """
    sport = models.OneToOneField(
        Sport,
        on_delete=models.CASCADE,
        related_name='scoreboard_template'
    )
    
    # Player roles for this sport
    player_roles = models.JSONField(
        default=list,
        help_text="List of player roles: ['batsman', 'bowler', 'allrounder', 'wicketkeeper']"
    )
    
    # Team structure
    team_structure = models.JSONField(
        default=dict,
        help_text="Team config: {'players_per_team': 11, 'innings': true, 'substitutes_allowed': 3}"
    )
    
    # Scoring fields (what gets displayed on scoreboard)
    scoring_fields = models.JSONField(
        default=list,
        help_text="Main scoring fields: ['runs', 'wickets', 'overs'] or ['goals', 'assists']"
    )
    
    # Player stat fields (individual player stats)
    player_stat_fields = models.JSONField(
        default=list,
        help_text="Player stats: ['runs', 'balls', 'fours', 'sixes', 'wickets'] or ['goals', 'assists', 'yellow_cards']"
    )
    
    # Match event types (actions that can happen during match)
    match_event_types = models.JSONField(
        default=list,
        help_text="Events: ['run', 'wicket', 'wide', 'no_ball'] or ['goal', 'foul', 'corner']"
    )
    
    # Award rules (how to calculate awards)
    award_rules = models.JSONField(
        default=dict,
        help_text="Award definitions: {'orange_cap': {'stat': 'runs', 'type': 'max'}, 'purple_cap': {'stat': 'wickets', 'type': 'max'}}"
    )
    
    # UI configuration
    ui_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="UI-specific config: colors, layouts, display order"
    )
    
    # Validation rules
    validation_rules = models.JSONField(
        default=dict,
        blank=True,
        help_text="Validation rules for scoring: min/max values, dependencies"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Scoreboard Template: {self.sport.name}"

    class Meta:
        verbose_name = "Sport Scoreboard Template"
        verbose_name_plural = "Sport Scoreboard Templates"


class MatchScore(models.Model):
    """
    Flexible score storage using key-value pairs.
    Works for any sport based on its template.
    """
    match = models.ForeignKey(
        'tournaments.Match',
        on_delete=models.CASCADE,
        related_name='scores'
    )
    team = models.ForeignKey(
        'tournaments.Team',
        on_delete=models.CASCADE,
        related_name='match_scores'
    )
    
    # Team-level stats (JSON for flexibility)
    team_stats = models.JSONField(
        default=dict,
        help_text="Team stats: {'runs': 185, 'wickets': 6, 'overs': 20} or {'goals': 3, 'possession': 65}"
    )
    
    # Inning number (for sports with innings)
    inning = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    
    is_batting = models.BooleanField(
        default=False,
        help_text="For cricket: is this team batting?"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.match.match_id} - {self.team.name} (Inning {self.inning})"

    class Meta:
        verbose_name = "Match Score"
        verbose_name_plural = "Match Scores"
        unique_together = ['match', 'team', 'inning']
        ordering = ['match', 'inning', 'team']


class PlayerMatchStats(models.Model):
    """
    Individual player statistics in a match.
    Flexible JSON storage based on sport template.
    """
    match = models.ForeignKey(
        'tournaments.Match',
        on_delete=models.CASCADE,
        related_name='player_stats'
    )
    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        related_name='match_stats'
    )
    team = models.ForeignKey(
        'tournaments.Team',
        on_delete=models.CASCADE,
        related_name='player_match_stats'
    )
    
    # Player stats (JSON for flexibility)
    stats = models.JSONField(
        default=dict,
        help_text="Player stats: {'runs': 75, 'balls': 45, 'fours': 8, 'sixes': 3} or {'goals': 2, 'assists': 1}"
    )
    
    # Performance rating
    performance_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Performance rating out of 10"
    )
    
    # Awards
    is_man_of_match = models.BooleanField(default=False)
    awards = models.JSONField(
        default=list,
        blank=True,
        help_text="List of awards: ['best_batsman', 'best_bowler']"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        player_name = self.player.user.get_full_name() or self.player.user.email
        return f"{player_name} - {self.match.match_id}"

    class Meta:
        verbose_name = "Player Match Stats"
        verbose_name_plural = "Player Match Stats"
        unique_together = ['match', 'player']
        ordering = ['-created_at']


class MatchEvent(models.Model):
    """
    Individual events during a match (runs, wickets, goals, fouls, etc.)
    Stored for detailed match timeline and replay.
    """
    match = models.ForeignKey(
        'tournaments.Match',
        on_delete=models.CASCADE,
        related_name='events'
    )
    team = models.ForeignKey(
        'tournaments.Team',
        on_delete=models.CASCADE,
        related_name='match_events'
    )
    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='match_events'
    )
    
    # Event details
    event_type = models.CharField(
        max_length=50,
        help_text="Event type from sport template: 'run', 'wicket', 'goal', 'foul', etc."
    )
    event_data = models.JSONField(
        default=dict,
        help_text="Event-specific data: {'runs': 4, 'ball_number': 15} or {'minute': 45, 'assist_by': 'player_id'}"
    )
    
    # Timing
    timestamp = models.DateTimeField(auto_now_add=True)
    match_time = models.CharField(
        max_length=50,
        blank=True,
        help_text="Match time: '12.3 overs' or '45:30 minutes'"
    )
    
    # Sequence
    sequence_number = models.IntegerField(
        default=0,
        help_text="Event sequence in match"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match.match_id} - {self.event_type} at {self.match_time}"

    class Meta:
        verbose_name = "Match Event"
        verbose_name_plural = "Match Events"
        ordering = ['match', 'sequence_number']
        indexes = [
            models.Index(fields=['match', 'sequence_number']),
            models.Index(fields=['event_type']),
        ]
