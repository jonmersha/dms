from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.urls import reverse
from audits.models import AuditPeriod

# documents/models.py (add this to your existing models)
import json
from django.utils import timezone


def pdf_upload_path(instance, filename):
    """Generate upload path: reports/{category}/{fiscal_year}/{quarter}/{filename}"""
    return f"reports/{instance.category}/{instance.audit_period.fiscal_year}/{instance.quarter}/{filename}"

class Document(models.Model):
    # Audit Types
    AUDIT_TYPE_CHOICES = [
        ('BRANCH', 'Branch Audit'),
        ('IT', 'IT Audit'),
        ('INVESTIGATION', 'Investigation Audit'),
        ('HEAD_OFFICE', 'Head Office Organ Audit'),
        ('IFB', 'IFB Audit'),
    ]
    
    # Document Categories
    CATEGORY_CHOICES = [
        ('AUDIT_REPORTS', 'Audit Reports'),
        ('GUIDELINES', 'Guidelines'),
        ('CHARTERS', 'Charters'),
        ('FRAMEWORKS', 'Frameworks'),
        ('POLICIES', 'Policies'),
        ('PROCEDURES', 'Procedures'),
        ('MANUALS', 'Manuals'),
        ('TEMPLATES', 'Templates'),
        ('OTHER', 'Other Documents'),
    ]
    
    QUARTER_CHOICES = [
        ('Q1', 'Quarter 1 (Jul-Sep)'),
        ('Q2', 'Quarter 2 (Oct-Dec)'),
        ('Q3', 'Quarter 3 (Jan-Mar)'),
        ('Q4', 'Quarter 4 (Apr-Jun)'),
    ]
    
    title = models.CharField(max_length=255)
    
    # New fields for audit type and category
    audit_type = models.CharField(
        max_length=20,
        choices=AUDIT_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="Select audit type (for audit reports only)"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='AUDIT_REPORTS',
        help_text="Select document category"
    )
    
    audit_period = models.ForeignKey(
        AuditPeriod,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    quarter = models.CharField(
        max_length=2,
        choices=QUARTER_CHOICES,
        help_text="Select the quarter for this document"
    )
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_documents'
    )
    
    pdf_file = models.FileField(upload_to=pdf_upload_path)
    restricted = models.BooleanField(default=False)
    
    allowed_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='accessible_documents'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-category', '-audit_period__fiscal_year', '-quarter', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_category_display()}"

    def clean(self):
        """Validate document data"""
        if not self.audit_period:
            raise ValidationError({'audit_period': 'Audit period is required.'})
        
        if not self.quarter:
            raise ValidationError({'quarter': 'Quarter is required.'})
        
        if not self.audit_period.is_active:
            raise ValidationError({'audit_period': 'Cannot upload to inactive audit periods.'})
        
        # Audit type is required only for audit reports
        if self.category == 'AUDIT_REPORTS' and not self.audit_type:
            raise ValidationError({'audit_type': 'Audit type is required for audit reports.'})
        
        # Audit type should be empty for non-audit reports
        if self.category != 'AUDIT_REPORTS' and self.audit_type:
            raise ValidationError({'audit_type': 'Audit type should only be selected for audit reports.'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def get_display_category(self):
        """Get display category with audit type if applicable"""
        if self.category == 'AUDIT_REPORTS' and self.audit_type:
            return f"{self.get_audit_type_display()}"
        return self.get_category_display()
    
    def can_download(self, user):
        """Check if user can download this document"""
        if not self.restricted:
            return True
        return user.is_authenticated and (
            user == self.uploaded_by or 
            self.allowed_users.filter(id=user.id).exists() or
            user.is_superuser
        )
    
    def can_edit(self, user):
        """Check if user can edit this document"""
        return user.is_authenticated and (
            user == self.uploaded_by or 
            user.is_superuser or
            user.is_staff
        )
    
    def can_delete(self, user):
        """Check if user can delete this document"""
        return user.is_authenticated and (
            user == self.uploaded_by or 
            user.is_superuser
        )

class BackupOperation(models.Model):
    BACKUP_TYPE_CHOICES = [
        ('FULL', 'Full Backup'),
        ('INCREMENTAL', 'Incremental Backup'),
        ('DOCUMENTS_ONLY', 'Documents Only'),
        ('DATABASE_ONLY', 'Database Only'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('PARTIAL', 'Partial Success'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # File information
    backup_file = models.FileField(upload_to='backups/', blank=True, null=True)
    file_size = models.BigIntegerField(default=0)  # in bytes
    
    # Statistics
    total_documents = models.IntegerField(default=0)
    backed_up_documents = models.IntegerField(default=0)
    failed_documents = models.IntegerField(default=0)
    
    # Metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Backup configuration
    include_files = models.BooleanField(default=True)
    include_database = models.BooleanField(default=True)
    compression = models.BooleanField(default=True)
    encryption_key = models.TextField(blank=True)  # Store encrypted key
    
    # Error information
    error_log = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Backup Operation'
        verbose_name_plural = 'Backup Operations'
    
    def __str__(self):
        return f"{self.name} ({self.get_backup_type_display()}) - {self.get_status_display()}"
    
    @property
    def duration(self):
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None
    
    @property
    def success_rate(self):
        if self.total_documents > 0:
            return (self.backed_up_documents / self.total_documents) * 100
        return 0

class BackupLog(models.Model):
    LOG_LEVEL_CHOICES = [
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('DEBUG', 'Debug'),
    ]
    
    backup_operation = models.ForeignKey(BackupOperation, on_delete=models.CASCADE, related_name='logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=10, choices=LOG_LEVEL_CHOICES, default='INFO')
    message = models.TextField()
    details = models.JSONField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Backup Log'
        verbose_name_plural = 'Backup Logs'
    
    def __str__(self):
        return f"{self.timestamp} - {self.get_level_display()} - {self.message[:50]}"