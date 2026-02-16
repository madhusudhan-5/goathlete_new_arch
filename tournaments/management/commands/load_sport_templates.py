"""
Management command to load sport templates into database
Usage: python manage.py load_sport_templates
"""
from django.core.management.base import BaseCommand
from tournaments.models import Sport, SportScoreboardTemplate
from tournaments.sport_templates import SPORT_TEMPLATES


class Command(BaseCommand):
    help = 'Load sport templates (Cricket, Football, Badminton, Kabaddi) into database'

    def handle(self, *args, **options):
        self.stdout.write('Loading sport templates...')
        
        for sport_code, data in SPORT_TEMPLATES.items():
            sport_data = data['sport']
            template_data = data['template']
            
            # Create or update Sport
            sport, created = Sport.objects.update_or_create(
                code=sport_data['code'],
                defaults={
                    'name': sport_data['name'],
                    'icon': sport_data['icon'],
                    'description': sport_data['description'],
                    'is_active': True
                }
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'{action} sport: {sport.icon} {sport.name}')
            )
            
            # Create or update SportScoreboardTemplate
            template, created = SportScoreboardTemplate.objects.update_or_create(
                sport=sport,
                defaults={
                    'player_roles': template_data['player_roles'],
                    'team_structure': template_data['team_structure'],
                    'scoring_fields': template_data['scoring_fields'],
                    'player_stat_fields': template_data['player_stat_fields'],
                    'match_event_types': template_data['match_event_types'],
                    'award_rules': template_data['award_rules'],
                    'ui_config': template_data['ui_config']
                }
            )
            
            action = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(f'  {action} scoreboard template for {sport.name}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Successfully loaded {len(SPORT_TEMPLATES)} sport templates!')
        )
