from django.core.management.base import BaseCommand
from audits.models import AuditPeriod
from datetime import date

class Command(BaseCommand):
    help = 'Generate audit periods for fiscal years starting July'

    def add_arguments(self, parser):
        parser.add_argument('--start-year', type=int, help='Start year for generation')
        parser.add_argument('--end-year', type=int, help='End year for generation')

    def handle(self, *args, **options):
        start_year = options.get('start_year') or 2020
        end_year = options.get('end_year') or 2030
        
        # Quarters starting from July
        quarters = [
            ('Q1', (7, 1), (9, 30)),   # Jul 1 - Sep 30
            ('Q2', (10, 1), (12, 31)), # Oct 1 - Dec 31
            ('Q3', (1, 1), (3, 31)),   # Jan 1 - Mar 31 (next year)
            ('Q4', (4, 1), (6, 30)),   # Apr 1 - Jun 30 (next year)
        ]
        
        created_count = 0
        for year in range(start_year, end_year + 1):
            fiscal_year = f"{year}-{(year + 1) % 100:02d}"
            
            for quarter, (start_month, start_day), (end_month, end_day) in quarters:
                # Adjust years for quarters that span calendar years
                if quarter in ['Q1', 'Q2']:
                    # Q1 and Q2 are in the same calendar year
                    start_date = date(year, start_month, start_day)
                    end_date = date(year, end_month, end_day)
                else:
                    # Q3 and Q4 are in the next calendar year
                    start_date = date(year + 1, start_month, start_day)
                    end_date = date(year + 1, end_month, end_day)
                
                obj, created = AuditPeriod.objects.get_or_create(
                    fiscal_year=fiscal_year,
                    quarter=quarter,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created {fiscal_year} {quarter} ({start_date} to {end_date})')
                    )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} audit periods')
        )