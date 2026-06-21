from django.db import models
from players.models import Player
from venues.models import Venue

# Import scoreboard models (defined in scoreboard_models.py)
from .scoreboard_models import Sport, SportScoreboardTemplate, MatchScore, PlayerMatchStats, MatchEvent


class TournamentStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    UPCOMING = 'UPCOMING', 'Upcoming'
    ONGOING = 'ONGOING', 'Ongoing'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class Tournament(models.Model):
    """Tournament created by players"""
    tournament_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto-generated: TN20260201001"
    )
    name = models.CharField(max_length=255)
    
    # Sport (FK to Sport model for configurable scoreboard)
    sport = models.ForeignKey(
        Sport,
        on_delete=models.PROTECT,
        related_name='tournaments',
        help_text="Sport type - determines scoreboard template",
        null=True,
        blank=True
    )
    
    # Tournament details
    start_date = models.DateField()
    end_date = models.DateField()
    venue = models.ForeignKey(
        Venue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tournaments',
        help_text="Optional - venue where tournament is held"
    )
    location = models.CharField(max_length=255)
    
    # Organizer
    organizer = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='organized_tournaments'
    )
    
    # Tournament configuration
    max_teams = models.IntegerField(default=8)
    team_size = models.IntegerField(default=11, help_text="Players per team")
    match_format = models.CharField(
        max_length=100,
        help_text="e.g., '20 overs', '90 minutes', 'Best of 3'"
    )
    
    # Scoring configuration (JSON for sport-specific flexibility)
    scoring_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sport-specific configuration: {'overs': 20, 'players_per_side': 11, ...}"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=TournamentStatus.choices,
        default=TournamentStatus.DRAFT
    )
    
    # Stats (updated automatically)
    total_matches = models.IntegerField(default=0)
    total_teams = models.IntegerField(default=0)
    
    # Additional info
    description = models.TextField(blank=True)
    rules = models.TextField(blank=True)
    prize_details = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate tournament_id if not set
        if not self.tournament_id:
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_tournament = Tournament.objects.filter(
                tournament_id__startswith=f'TN{date_str}'
            ).order_by('-tournament_id').first()
            
            if last_tournament:
                last_num = int(last_tournament.tournament_id[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.tournament_id = f'TN{date_str}{new_num:03d}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tournament_id} - {self.name}"

    class Meta:
        verbose_name = "Tournament"
        verbose_name_plural = "Tournaments"
        ordering = ['-start_date']


class Team(models.Model):
    """Team participating in a tournament"""
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name='teams'
    )
    name = models.CharField(max_length=255)
    captain = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='captained_teams'
    )
    logo = models.TextField(blank=True, help_text="Base64 encoded image")
    
    # Stats (updated automatically)
    matches_played = models.IntegerField(default=0)
    matches_won = models.IntegerField(default=0)
    matches_lost = models.IntegerField(default=0)
    matches_drawn = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.tournament.name})"

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        ordering = ['-points', '-matches_won']
        unique_together = ['tournament', 'name']


class TeamPlayer(models.Model):
    """Players in a team"""
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_players'
    )
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='team_memberships'
    )
    jersey_number = models.IntegerField(null=True, blank=True)
    role = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g., Batsman, Bowler, All-rounder, Goalkeeper, etc."
    )
    is_captain = models.BooleanField(default=False)
    is_vice_captain = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player.user.get_full_name() or self.player.user.email} - {self.team.name}"

    class Meta:
        verbose_name = "Team Player"
        verbose_name_plural = "Team Players"
        unique_together = ['team', 'player']
        ordering = ['jersey_number']


class MatchStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    LIVE = 'LIVE', 'Live'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class Match(models.Model):
    """Match between two teams"""
    match_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto-generated: MT20260201001"
    )
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    
    # Teams
    team_a = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='matches_as_team_a'
    )
    team_b = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='matches_as_team_b'
    )
    
    # Match details
    match_number = models.IntegerField(help_text="Match 1, Match 2, etc.")
    match_date = models.DateField()
    match_time = models.TimeField()
    venue = models.ForeignKey(
        Venue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches'
    )
    
    # Scoring (sport-specific data stored as JSON)
    scorecard = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sport-specific scorecard data"
    )
    
    # Result
    winner = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='won_matches'
    )
    result_summary = models.CharField(
        max_length=255,
        blank=True,
        help_text="e.g., 'Team A won by 50 runs'"
    )
    
    # Umpire/Scorer
    umpire = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='umpired_matches'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=MatchStatus.choices,
        default=MatchStatus.SCHEDULED
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate match_id if not set
        if not self.match_id:
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_match = Match.objects.filter(
                match_id__startswith=f'MT{date_str}'
            ).order_by('-match_id').first()
            
            if last_match:
                last_num = int(last_match.match_id[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.match_id = f'MT{date_str}{new_num:03d}'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.match_id} - {self.team_a.name} vs {self.team_b.name}"

    class Meta:
        verbose_name = "Match"
        verbose_name_plural = "Matches"
        ordering = ['match_date', 'match_time']


class PerformanceStats(models.Model):
    """Player performance in a match"""
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='performance_stats'
    )
    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        related_name='player_performances'
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='player_performances'
    )
    
    # Generic stats (sport-specific stored in JSON)
    stats = models.JSONField(
        default=dict,
        help_text="Sport-specific stats: {'runs': 50, 'wickets': 2, 'goals': 1, ...}"
    )
    
    # Performance rating (0-10)
    performance_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Performance rating out of 10"
    )
    
    # Man of the match
    is_man_of_match = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        player_name = self.player.user.get_full_name() or self.player.user.email
        return f"{player_name} - {self.match.match_id}"

    class Meta:
        verbose_name = "Performance Stats"
        verbose_name_plural = "Performance Stats"
        unique_together = ['player', 'match']
        ordering = ['-created_at']


class LocalTournamentStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    COMPLETED = 'COMPLETED', 'Completed'


class LocalTournament(models.Model):
    """
    Informal, player-created tournament with guest players.
    Only one ACTIVE tournament allowed per organizer (and per participant email).
    Scorecard stored as JSON, keyed by sport-specific fields.
    """
    name = models.CharField(max_length=255)
    sport = models.ForeignKey(
        'tournaments.Sport',
        on_delete=models.PROTECT,
        related_name='local_tournaments'
    )
    organizer = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        related_name='organized_local_tournaments'
    )
    scoreboard = models.JSONField(
        default=dict,
        blank=True,
        help_text="Flexible sport-specific scoreboard: {teamA: {...}, teamB: {...}} or player scores"
    )
    status = models.CharField(
        max_length=20,
        choices=LocalTournamentStatus.choices,
        default=LocalTournamentStatus.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sport.name}) - {self.status}"

    class Meta:
        verbose_name = "Local Tournament"
        verbose_name_plural = "Local Tournaments"
        ordering = ['-created_at']


class LocalTournamentParticipant(models.Model):
    """
    Guest player in a LocalTournament — does not need a Player account.
    Email is used to check if this person already has an active tournament.
    """
    tournament = models.ForeignKey(
        LocalTournament,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    score = models.JSONField(
        default=dict,
        blank=True,
        help_text="Player-specific score data, structure depends on sport"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.tournament.name}"

    class Meta:
        verbose_name = "Local Tournament Participant"
        verbose_name_plural = "Local Tournament Participants"
        ordering = ['name']


class OpenMatch(models.Model):
    """
    PLAYO-style open matches where anyone can join and split the booking cost.
    """
    MATCH_STATUS = [
        ('OPEN', 'Open'),
        ('FULL', 'Full'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    sport = models.ForeignKey(Sport, on_delete=models.PROTECT, related_name='open_matches')
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='open_matches')
    creator = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='created_open_matches')
    
    date = models.DateField()
    start_time = models.TimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    
    total_spots = models.IntegerField()
    price_per_player = models.DecimalField(max_digits=8, decimal_places=2)
    
    skill_level = models.CharField(max_length=50, blank=True, help_text="e.g., Beginner, Intermediate, Advanced")
    status = models.CharField(max_length=20, choices=MATCH_STATUS, default='OPEN')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sport.name} Match at {self.venue.name} ({self.date})"
        
    @property
    def filled_spots(self):
        return self.players.count()

class OpenMatchPlayer(models.Model):
    match = models.ForeignKey(OpenMatch, on_delete=models.CASCADE, related_name='players')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='joined_open_matches')
    payment_status = models.CharField(max_length=20, default='PENDING')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['match', 'player']
        
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Check if full
        if self.match.filled_spots >= self.match.total_spots:
            self.match.status = 'FULL'
            self.match.save()
