"""
Sport Template Fixtures
Pre-configured templates for Cricket, Football, Badminton, and Kabaddi
"""

SPORT_TEMPLATES = {
    "cricket": {
        "sport": {
            "name": "Cricket",
            "code": "CRICKET",
            "icon": "🏏",
            "description": "Bat and ball game played between two teams"
        },
        "template": {
            "player_roles": [
                "Batsman",
                "Bowler",
                "All-rounder",
                "Wicket-keeper"
            ],
            "team_structure": {
                "players_per_team": 11,
                "innings": True,
                "substitutes_allowed": 1,
                "min_players": 11,
                "max_players": 15
            },
            "scoring_fields": [
                {"key": "runs", "label": "Runs", "type": "number"},
                {"key": "wickets", "label": "Wickets", "type": "number"},
                {"key": "overs", "label": "Overs", "type": "decimal"},
                {"key": "run_rate", "label": "Run Rate", "type": "decimal"}
            ],
            "player_stat_fields": [
                {"key": "runs", "label": "Runs", "type": "number"},
                {"key": "balls_faced", "label": "Balls Faced", "type": "number"},
                {"key": "fours", "label": "4s", "type": "number"},
                {"key": "sixes", "label": "6s", "type": "number"},
                {"key": "strike_rate", "label": "Strike Rate", "type": "decimal"},
                {"key": "wickets", "label": "Wickets", "type": "number"},
                {"key": "overs_bowled", "label": "Overs", "type": "decimal"},
                {"key": "runs_conceded", "label": "Runs Conceded", "type": "number"},
                {"key": "economy", "label": "Economy", "type": "decimal"},
                {"key": "catches", "label": "Catches", "type": "number"},
                {"key": "run_outs", "label": "Run Outs", "type": "number"}
            ],
            "match_event_types": [
                {"key": "run", "label": "Run", "icon": "🏃"},
                {"key": "four", "label": "Four", "icon": "4️⃣"},
                {"key": "six", "label": "Six", "icon": "6️⃣"},
                {"key": "wicket", "label": "Wicket", "icon": "🎯"},
                {"key": "wide", "label": "Wide", "icon": "↔️"},
                {"key": "no_ball", "label": "No Ball", "icon": "🚫"},
                {"key": "bye", "label": "Bye", "icon": "👋"},
                {"key": "leg_bye", "label": "Leg Bye", "icon": "🦵"}
            ],
            "award_rules": {
                "orange_cap": {
                    "name": "Orange Cap",
                    "description": "Most runs in tournament",
                    "stat": "runs",
                    "type": "max",
                    "icon": "🧢"
                },
                "purple_cap": {
                    "name": "Purple Cap",
                    "description": "Most wickets in tournament",
                    "stat": "wickets",
                    "type": "max",
                    "icon": "🎩"
                },
                "best_strike_rate": {
                    "name": "Best Strike Rate",
                    "description": "Highest strike rate (min 100 runs)",
                    "stat": "strike_rate",
                    "type": "max",
                    "min_qualifier": {"runs": 100},
                    "icon": "⚡"
                }
            },
            "ui_config": {
                "primary_color": "#1E3A8A",
                "secondary_color": "#F59E0B",
                "scoreboard_layout": "innings_based"
            }
        }
    },
    "football": {
        "sport": {
            "name": "Football",
            "code": "FOOTBALL",
            "icon": "⚽",
            "description": "Team sport played with a spherical ball"
        },
        "template": {
            "player_roles": [
                "Goalkeeper",
                "Defender",
                "Midfielder",
                "Forward"
            ],
            "team_structure": {
                "players_per_team": 11,
                "innings": False,
                "substitutes_allowed": 5,
                "min_players": 7,
                "max_players": 18
            },
            "scoring_fields": [
                {"key": "goals", "label": "Goals", "type": "number"},
                {"key": "possession", "label": "Possession %", "type": "number"},
                {"key": "shots", "label": "Shots", "type": "number"},
                {"key": "shots_on_target", "label": "Shots on Target", "type": "number"},
                {"key": "corners", "label": "Corners", "type": "number"}
            ],
            "player_stat_fields": [
                {"key": "goals", "label": "Goals", "type": "number"},
                {"key": "assists", "label": "Assists", "type": "number"},
                {"key": "shots", "label": "Shots", "type": "number"},
                {"key": "passes", "label": "Passes", "type": "number"},
                {"key": "pass_accuracy", "label": "Pass Accuracy %", "type": "number"},
                {"key": "tackles", "label": "Tackles", "type": "number"},
                {"key": "interceptions", "label": "Interceptions", "type": "number"},
                {"key": "yellow_cards", "label": "Yellow Cards", "type": "number"},
                {"key": "red_cards", "label": "Red Cards", "type": "number"},
                {"key": "saves", "label": "Saves (GK)", "type": "number"}
            ],
            "match_event_types": [
                {"key": "goal", "label": "Goal", "icon": "⚽"},
                {"key": "assist", "label": "Assist", "icon": "🎯"},
                {"key": "yellow_card", "label": "Yellow Card", "icon": "🟨"},
                {"key": "red_card", "label": "Red Card", "icon": "🟥"},
                {"key": "substitution", "label": "Substitution", "icon": "🔄"},
                {"key": "corner", "label": "Corner", "icon": "🚩"},
                {"key": "free_kick", "label": "Free Kick", "icon": "🦶"},
                {"key": "penalty", "label": "Penalty", "icon": "🎯"}
            ],
            "award_rules": {
                "golden_boot": {
                    "name": "Golden Boot",
                    "description": "Most goals in tournament",
                    "stat": "goals",
                    "type": "max",
                    "icon": "👢"
                },
                "golden_glove": {
                    "name": "Golden Glove",
                    "description": "Most clean sheets (GK)",
                    "stat": "clean_sheets",
                    "type": "max",
                    "icon": "🧤"
                },
                "most_assists": {
                    "name": "Most Assists",
                    "description": "Most assists in tournament",
                    "stat": "assists",
                    "type": "max",
                    "icon": "🎯"
                }
            },
            "ui_config": {
                "primary_color": "#10B981",
                "secondary_color": "#FFFFFF",
                "scoreboard_layout": "time_based"
            }
        }
    },
    "badminton": {
        "sport": {
            "name": "Badminton",
            "code": "BADMINTON",
            "icon": "🏸",
            "description": "Racquet sport played with a shuttlecock"
        },
        "template": {
            "player_roles": [
                "Singles Player",
                "Doubles Player"
            ],
            "team_structure": {
                "players_per_team": 1,  # Singles, can be 2 for doubles
                "innings": False,
                "substitutes_allowed": 0,
                "min_players": 1,
                "max_players": 2
            },
            "scoring_fields": [
                {"key": "points", "label": "Points", "type": "number"},
                {"key": "games_won", "label": "Games Won", "type": "number"}
            ],
            "player_stat_fields": [
                {"key": "points", "label": "Points", "type": "number"},
                {"key": "smashes", "label": "Smashes", "type": "number"},
                {"key": "drops", "label": "Drop Shots", "type": "number"},
                {"key": "clears", "label": "Clears", "type": "number"},
                {"key": "errors", "label": "Unforced Errors", "type": "number"},
                {"key": "aces", "label": "Aces", "type": "number"}
            ],
            "match_event_types": [
                {"key": "point", "label": "Point", "icon": "🎯"},
                {"key": "smash", "label": "Smash", "icon": "💥"},
                {"key": "drop", "label": "Drop Shot", "icon": "🪶"},
                {"key": "error", "label": "Error", "icon": "❌"},
                {"key": "ace", "label": "Ace", "icon": "⚡"}
            ],
            "award_rules": {
                "most_smashes": {
                    "name": "Smash King",
                    "description": "Most smashes in tournament",
                    "stat": "smashes",
                    "type": "max",
                    "icon": "💥"
                }
            },
            "ui_config": {
                "primary_color": "#EF4444",
                "secondary_color": "#FBBF24",
                "scoreboard_layout": "game_based"
            }
        }
    },
    "kabaddi": {
        "sport": {
            "name": "Kabaddi",
            "code": "KABADDI",
            "icon": "🤼",
            "description": "Contact team sport popular in South Asia"
        },
        "template": {
            "player_roles": [
                "Raider",
                "Defender",
                "All-rounder"
            ],
            "team_structure": {
                "players_per_team": 7,
                "innings": False,
                "substitutes_allowed": 5,
                "min_players": 7,
                "max_players": 12
            },
            "scoring_fields": [
                {"key": "points", "label": "Points", "type": "number"},
                {"key": "raid_points", "label": "Raid Points", "type": "number"},
                {"key": "tackle_points", "label": "Tackle Points", "type": "number"},
                {"key": "all_outs", "label": "All Outs", "type": "number"}
            ],
            "player_stat_fields": [
                {"key": "raid_points", "label": "Raid Points", "type": "number"},
                {"key": "successful_raids", "label": "Successful Raids", "type": "number"},
                {"key": "empty_raids", "label": "Empty Raids", "type": "number"},
                {"key": "tackle_points", "label": "Tackle Points", "type": "number"},
                {"key": "successful_tackles", "label": "Successful Tackles", "type": "number"},
                {"key": "super_raids", "label": "Super Raids", "type": "number"},
                {"key": "super_tackles", "label": "Super Tackles", "type": "number"}
            ],
            "match_event_types": [
                {"key": "raid_point", "label": "Raid Point", "icon": "🏃"},
                {"key": "tackle_point", "label": "Tackle Point", "icon": "🛡️"},
                {"key": "super_raid", "label": "Super Raid", "icon": "⚡"},
                {"key": "super_tackle", "label": "Super Tackle", "icon": "💪"},
                {"key": "all_out", "label": "All Out", "icon": "🎯"},
                {"key": "bonus_point", "label": "Bonus Point", "icon": "➕"}
            ],
            "award_rules": {
                "best_raider": {
                    "name": "Best Raider",
                    "description": "Most raid points in tournament",
                    "stat": "raid_points",
                    "type": "max",
                    "icon": "🏃"
                },
                "best_defender": {
                    "name": "Best Defender",
                    "description": "Most tackle points in tournament",
                    "stat": "tackle_points",
                    "type": "max",
                    "icon": "🛡️"
                }
            },
            "ui_config": {
                "primary_color": "#F97316",
                "secondary_color": "#14B8A6",
                "scoreboard_layout": "point_based"
            }
        }
    }
}


def get_sport_template(sport_code):
    """Get sport template by code"""
    return SPORT_TEMPLATES.get(sport_code.lower())


def get_all_sport_codes():
    """Get list of all sport codes"""
    return [template["sport"]["code"] for template in SPORT_TEMPLATES.values()]
