# documents/services/backup_service.py
import os
import zipfile
import json
import tempfile
import shutil
from datetime import datetime
from django.conf import settings
from django.core import serializers
from django.db import transaction
from django.utils import timezone
from documents.models import Document, BackupOperation, BackupLog
import cryptography
from cryptography.fernet import Fernet
import logging

logger = logging.getLogger('backup')

class BackupService:
    def __init__(self, backup_operation):
        self.backup_operation = backup_operation
        self.temp_dir = None
        self.fernet = None
        
        if backup_operation.encryption_key:
            self.fernet = Fernet(backup_operation.encryption_key.encode())
    
    def create_backup(self):
        """Main backup creation method"""
        try:
            self.backup_operation.status = 'RUNNING'
            self.backup_operation.started_at = timezone.now()
            self.backup_operation.save()
            
            self._log('INFO', 'Starting backup operation')
            
            # Create temporary directory for backup
            self.temp_dir = tempfile.mkdtemp()
            self._log('INFO', f'Created temporary directory: {self.temp_dir}')
            
            # Perform backup based on type
            if self.backup_operation.backup_type in ['FULL', 'DATABASE_ONLY']:
                self._backup_database()
            
            if self.backup_operation.backup_type in ['FULL', 'DOCUMENTS_ONLY']:
                self._backup_documents()
            
            # Create backup archive
            backup_path = self._create_archive()
            
            # Update backup operation
            self.backup_operation.backup_file.name = backup_path
            self.backup_operation.file_size = os.path.getsize(
                os.path.join(settings.MEDIA_ROOT, backup_path)
            )
            self.backup_operation.status = 'COMPLETED'
            self.backup_operation.completed_at = timezone.now()
            self.backup_operation.save()
            
            self._log('INFO', 'Backup completed successfully')
            
            return True
            
        except Exception as e:
            self._handle_error(f'Backup failed: {str(e)}')
            return False
            
        finally:
            # Cleanup temporary directory
            if self.temp_dir and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
    
    def _backup_database(self):
        """Backup database data"""
        self._log('INFO', 'Starting database backup')
        
        # Backup Document model
        documents = Document.objects.all()
        self.backup_operation.total_documents = documents.count()
        
        data = {
            'documents': json.loads(serializers.serialize('json', documents)),
            'metadata': {
                'backup_created': timezone.now().isoformat(),
                'total_documents': documents.count(),
                'django_version': settings.DJANGO_VERSION,
            }
        }
        
        # Save database backup
        db_backup_path = os.path.join(self.temp_dir, 'database.json')
        with open(db_backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        self._log('INFO', f'Database backup created: {db_backup_path}')
    
    def _backup_documents(self):
        """Backup document files"""
        self._log('INFO', 'Starting document files backup')
        
        documents_dir = os.path.join(self.temp_dir, 'documents')
        os.makedirs(documents_dir, exist_ok=True)
        
        documents = Document.objects.all()
        backed_up = 0
        failed = 0
        
        for document in documents:
            try:
                if document.pdf_file and document.pdf_file.name:
                    # Get the actual file path
                    file_path = document.pdf_file.path
                    
                    if os.path.exists(file_path):
                        # Create directory structure
                        doc_dir = os.path.join(
                            documents_dir,
                            str(document.category),
                            str(document.audit_period.fiscal_year),
                            document.quarter
                        )
                        os.makedirs(doc_dir, exist_ok=True)
                        
                        # Copy file
                        dest_path = os.path.join(doc_dir, os.path.basename(file_path))
                        shutil.copy2(file_path, dest_path)
                        
                        backed_up += 1
                    else:
                        self._log('WARNING', f'File not found: {file_path}')
                        failed += 1
                else:
                    self._log('WARNING', f'Document {document.id} has no file')
                    failed += 1
                    
            except Exception as e:
                self._log('ERROR', f'Failed to backup document {document.id}: {str(e)}')
                failed += 1
        
        # Update backup operation statistics
        self.backup_operation.backed_up_documents = backed_up
        self.backup_operation.failed_documents = failed
        self.backup_operation.save()
        
        self._log('INFO', f'Documents backup completed: {backed_up} succeeded, {failed} failed')
    
    def _create_archive(self):
        """Create compressed backup archive"""
        self._log('INFO', 'Creating backup archive')
        
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        archive_name = f"backup_{self.backup_operation.backup_type.lower()}_{timestamp}.zip"
        archive_path = os.path.join(settings.MEDIA_ROOT, 'backups', archive_name)
        
        # Ensure backups directory exists
        os.makedirs(os.path.dirname(archive_path), exist_ok=True)
        
        # Create zip archive
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add all files from temp directory
            for root, dirs, files in os.walk(self.temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.temp_dir)
                    zipf.write(file_path, arcname)
        
        self._log('INFO', f'Backup archive created: {archive_path}')
        
        return f'backups/{archive_name}'
    
    def _encrypt_file(self, file_path):
        """Encrypt a file if encryption is enabled"""
        if not self.fernet:
            return file_path
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            encrypted_data = self.fernet.encrypt(file_data)
            
            encrypted_path = file_path + '.encrypted'
            with open(encrypted_path, 'wb') as f:
                f.write(encrypted_data)
            
            os.remove(file_path)
            return encrypted_path
            
        except Exception as e:
            self._log('ERROR', f'Encryption failed: {str(e)}')
            return file_path
    
    def _log(self, level, message, details=None):
        """Add log entry"""
        BackupLog.objects.create(
            backup_operation=self.backup_operation,
            level=level,
            message=message,
            details=details
        )
        logger.log(
            getattr(logging, level),
            f'Backup {self.backup_operation.id}: {message}'
        )
    
    def _handle_error(self, error_message):
        """Handle backup errors"""
        self.backup_operation.status = 'FAILED'
        self.backup_operation.error_log = error_message
        self.backup_operation.completed_at = timezone.now()
        self.backup_operation.save()
        
        self._log('ERROR', error_message)