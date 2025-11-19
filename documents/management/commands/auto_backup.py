# documents/management/commands/auto_backup.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from documents.models import BackupOperation
from documents.services.backup_service import BackupService

class Command(BaseCommand):
    help = 'Automated backup creation'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            default='FULL',
            choices=['FULL', 'INCREMENTAL', 'DOCUMENTS_ONLY', 'DATABASE_ONLY'],
            help='Type of backup to create'
        )
        parser.add_argument(
            '--encryption',
            action='store_true',
            help='Enable encryption for the backup'
        )

    def handle(self, *args, **options):
        backup_type = options['type']
        encryption = options['encryption']
        
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"auto_backup_{backup_type.lower()}_{timestamp}"
        
        self.stdout.write(f'Starting automated backup: {backup_name}')
        
        try:
            backup_operation = BackupOperation.objects.create(
                name=backup_name,
                backup_type=backup_type,
                include_files=True,
                include_database=True,
                compression=True,
                encryption_key=''  # You might want to store this securely
            )
            
            backup_service = BackupService(backup_operation)
            success = backup_service.create_backup()
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'Backup completed successfully: {backup_name}')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'Backup failed: {backup_name}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating backup: {str(e)}')
            )