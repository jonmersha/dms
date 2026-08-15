import os
import zipfile
import json
import tempfile
import shutil
import logging
from django.conf import settings
from django.core.files import File
from django.utils import timezone
from documents.models import Document, BackupOperation, BackupLog
from users.models import Department
from django.db import transaction

logger = logging.getLogger('backup')

class RestoreService:
    def __init__(self, zip_file_path, user):
        self.zip_file_path = zip_file_path
        self.user = user
        self.temp_dir = None
        self.allowed_dept_ids = self._get_allowed_dept_ids()
        
    def _get_allowed_dept_ids(self):
        """Determine which departments this user can restore documents for."""
        if not self.user:
            return []
            
        role = getattr(self.user, 'role', None)
        if role in ['ADMIN', 'CHIEF'] or self.user.is_superuser:
            return ['ALL']
            
        if role == 'DIRECTOR' and getattr(self.user, 'department', None):
            return [d.id for d in self.user.department.get_all_sub_departments()]
            
        if role == 'TEAM_MANAGER' and getattr(self.user, 'department', None):
            return [self.user.department.id]
            
        return []
        
    def _is_allowed(self, document_dict):
        """Check if user is allowed to restore this specific document."""
        if 'ALL' in self.allowed_dept_ids:
            return True
            
        dept_id = document_dict['fields'].get('department')
        if not dept_id:
            # If document has no department, maybe only admins can restore? Or fallback to false.
            return False
            
        return dept_id in self.allowed_dept_ids

    def run_restore(self):
        """Main restore method"""
        try:
            self.temp_dir = tempfile.mkdtemp()
            
            # Extract ZIP
            with zipfile.ZipFile(self.zip_file_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_dir)
                
            db_file_path = os.path.join(self.temp_dir, 'database.json')
            if not os.path.exists(db_file_path):
                raise ValueError("database.json not found in backup archive.")
                
            with open(db_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            documents_data = data.get('documents', [])
            restored_count = 0
            skipped_count = 0
            
            with transaction.atomic():
                for doc_data in documents_data:
                    fields = doc_data['fields']
                    
                    if not self._is_allowed(doc_data):
                        skipped_count += 1
                        continue
                        
                    # Handle department foreign key
                    department = None
                    if fields.get('department'):
                        try:
                            department = Department.objects.get(pk=fields['department'])
                        except Department.DoesNotExist:
                            pass
                            
                    # Update or Create Document
                    doc, created = Document.objects.update_or_create(
                        pk=doc_data['pk'],
                        defaults={
                            'title': fields.get('title', ''),
                            'description': fields.get('description', ''),
                            'category': fields.get('category', 'OTHER'),
                            'audit_type': fields.get('audit_type'),
                            'quarter': fields.get('quarter', 'Q1'),
                            'status': fields.get('status', 'APPROVED'),
                            'department': department,
                            'audit_period_id': fields.get('audit_period')
                        }
                    )
                    
                    # File handling
                    old_file_path = fields.get('pdf_file')
                    if old_file_path:
                        # Extract just the filename and its category path
                        # zip stores it in documents/<category>/<fy>/<quarter>/<filename>
                        filename = os.path.basename(old_file_path)
                        zip_file_location = os.path.join(
                            self.temp_dir, 'documents', str(doc.category), 
                            str(doc.audit_period.fiscal_year if doc.audit_period else 'unknown'), 
                            str(doc.quarter), filename
                        )
                        
                        if os.path.exists(zip_file_location):
                            with open(zip_file_location, 'rb') as pdf_f:
                                doc.pdf_file.save(filename, File(pdf_f), save=True)
                                
                    restored_count += 1
                    
            return {
                'success': True,
                'restored': restored_count,
                'skipped': skipped_count
            }
            
        except Exception as e:
            logger.error(f'Restore failed: {str(e)}')
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            if self.temp_dir and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
