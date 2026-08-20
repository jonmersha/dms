from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.urls import reverse
from audits.models import AuditPeriod
from django.contrib.auth.models import Group
from users.models import Department

# documents/models.py (add this to your existing models)
import json
from django.utils import timezone
from .managers import DocumentQuerySet


def pdf_upload_path(instance, filename):
    """Generate upload path. Reports go in a structured path; generic docs go in /generic/category/."""
    if instance.category == 'AUDIT_REPORTS' and instance.audit_period and instance.quarter:
        return f"reports/{instance.category}/{instance.audit_period.fiscal_year}/{instance.quarter}/{filename}"
    return f"documents/{instance.category}/{filename}"

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
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING_APPROVAL', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('RETURNED', 'Returned for Correction'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True, help_text="Optional document description")
    
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
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        help_text="Required for Audit Reports only"
    )
    
    quarter = models.CharField(
        max_length=2,
        choices=QUARTER_CHOICES,
        blank=True,
        null=True,
        help_text="Required for Audit Reports only"
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
    
    allowed_groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name='accessible_documents'
    )
    
    allowed_departments = models.ManyToManyField(
        Department,
        blank=True,
        related_name='accessible_documents_by_dept'
    )
    
    download_restricted = models.BooleanField(default=False, help_text="If true, only explicitly allowed users can download this document.")
    
    download_allowed_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='downloadable_documents'
    )
    
    download_allowed_groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name='downloadable_documents'
    )
    
    download_allowed_departments = models.ManyToManyField(
        Department,
        blank=True,
        related_name='downloadable_documents_by_dept'
    )
    
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_documents',
        help_text="The internal audit structure department that owns this document"
    )
    
    objects = DocumentQuerySet.as_manager()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPROVED')
    deletion_requested = models.BooleanField(default=False)
    deletion_reason = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at', '-category']

    def __str__(self):
        return f"{self.title} - {self.get_category_display()}"

    def clean(self):
        """Validate document data"""
        is_report = (self.category == 'AUDIT_REPORTS')

        if is_report:
            # Audit Reports must have period, quarter, and audit type
            if not self.audit_period:
                raise ValidationError({'audit_period': 'Audit period is required for audit reports.'})
            if not self.quarter:
                raise ValidationError({'quarter': 'Quarter is required for audit reports.'})
            if self.audit_period and not self.audit_period.is_active:
                raise ValidationError({'audit_period': 'Cannot upload to inactive audit periods.'})
            if not self.audit_type:
                raise ValidationError({'audit_type': 'Audit type is required for audit reports.'})
        else:
            # Generic documents must NOT have audit-specific fields
            if self.audit_type:
                raise ValidationError({'audit_type': 'Audit type should only be selected for audit reports.'})

    def save(self, *args, **kwargs):
        if not self.department and self.uploaded_by and getattr(self.uploaded_by, 'department', None):
            self.department = self.uploaded_by.department
        self.clean()
        super().save(*args, **kwargs)
    
    def get_display_category(self):
        """Get display category with audit type if applicable"""
        if self.category == 'AUDIT_REPORTS' and self.audit_type:
            return f"{self.get_audit_type_display()}"
        return self.get_category_display()
        
    def can_view(self, user):
        """Check if user can view this document"""
        return Document.objects.accessible_by(user, include_deleted=True).filter(id=self.id).exists()
    
    def can_download(self, user):
        """Check if user can download this document"""
        from django.utils import timezone

        # Anonymous users: only allow unrestricted, approved, public docs
        if not getattr(user, 'is_authenticated', False):
            return (
                not self.restricted
                and not self.download_restricted
                and self.status == 'APPROVED'
                and not self.is_deleted
            )

        # 1. Admin/Superuser cannot download any documents
        if getattr(user, 'is_superuser', False) or getattr(user, 'role', None) == 'ADMIN':
            return False

        # 2. Must have VIEW permission first (authentication, status, etc)
        if not Document.objects.filter(id=self.id).accessible_by(user).exists():
            return False

            
        # 3. Chiefs and Owners bypass download restrictions
        if getattr(user, 'role', None) == 'CHIEF':
            return True

        if self.uploaded_by == user:
            return True
            
        # 3. By default, only CHIEF, DIRECTOR, and TEAM_MANAGER can download.
        # Other roles (like AUDITOR, AUDITEE, VISITOR) must rely on explicit permissions below.
        if not self.download_restricted:
            if getattr(user, 'role', None) in ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER']:
                return True
            
        # 4. Check explicit standard permissions for download
        if self.download_allowed_users.filter(id=user.id).exists():
            return True
        if self.download_allowed_groups.filter(id__in=user.groups.all()).exists():
            return True
            
        # Check department scope
        if getattr(user, 'department', None):
            user_depts = [d.id for d in user.department.get_all_sub_departments()]
            if self.download_allowed_departments.filter(id__in=user_depts).exists():
                return True
            # Directors/Managers can download if their department owns the document
            if getattr(user, 'role', None) in ['DIRECTOR', 'TEAM_MANAGER']:
                if self.department_id in user_depts:
                    return True
                    
        # 5. Check Temporary Authorization
        now = timezone.now()
        has_temp = self.temporary_accesses.filter(
            user=user,
            status='ACTIVE',
            start_date__lte=now,
            expires_at__gt=now,
            can_download=True
        ).exists()
        
        return has_temp
        
    def can_manage(self, user):
        """Check if user has DMS Admin oversight of this document"""
        if not user.is_authenticated:
            return False
            
        system_roles = getattr(user, 'system_roles', [])
            
        if user.is_superuser or 'DMS_ADMIN' in system_roles:
            return True
                
        return False
        
    def can_request_access(self, user):
        """Check if user can request/grant temporary access"""
        if self.can_manage(user):
            return True
            
        system_roles = getattr(user, 'system_roles', [])
        if 'DMS_VIEWER' in system_roles:
            return True
        return False
    
    def can_edit(self, user):
        """Check if user can edit this document"""
        if not user.is_authenticated:
            return False
        if user.is_superuser or user.is_staff:
            return True
        if user == self.uploaded_by:
            return True
            
        system_roles = getattr(user, 'system_roles', [])
        if 'DMS_ADMIN' in system_roles or 'DMS_UPLOADER' in system_roles:
            return True
        return False
    
    def can_delete(self, user):
        """Check if user can hard-delete this document"""
        system_roles = getattr(user, 'system_roles', [])
        return user.is_authenticated and (
            user == self.uploaded_by or 
            user.is_superuser or
            'DMS_ADMIN' in system_roles
        )
        
    def can_request_deletion(self, user):
        """Check if user can request deletion"""
        return self.can_edit(user) and not self.is_deleted and not self.deletion_requested

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

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    pdf_file = models.FileField(upload_to=pdf_upload_path)
    version_number = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-version_number']



class TemporaryAccess(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('ACTIVE', 'Active'),
        ('REVOKED', 'Revoked'),
        ('EXPIRED', 'Expired'),
    ]
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='temporary_accesses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='temporary_grants')
    granted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='granted_accesses')
    authorizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='authorized_access_requests')
    start_date = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    can_view = models.BooleanField(default=True)
    can_download = models.BooleanField(default=False)
    can_print = models.BooleanField(default=False)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='revoked_accesses')
    revocation_reason = models.TextField(blank=True)

    @property
    def is_active(self):
        now = timezone.now()
        return self.status == 'ACTIVE' and self.start_date <= now <= self.expires_at

class DocumentAuditLog(models.Model):
    ACTION_CHOICES = [
        # Access
        ('VIEW', 'Viewed'),
        ('DOWNLOAD', 'Downloaded'),
        ('DOWNLOAD_DENIED', 'Download Denied'),
        # Creation / Modification
        ('CREATED', 'Created'),
        ('UPLOADED', 'Uploaded'),
        ('METADATA_UPDATED', 'Metadata Updated'),
        ('VERSION_CREATED', 'Version Created'),
        # Approval Workflow
        ('APPROVAL_REQUESTED', 'Approval Requested'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('RETURNED_FOR_CORRECTION', 'Returned for Correction'),
        # Authorization
        ('AUTHORIZATION_GRANTED', 'Authorization Granted'),
        ('AUTHORIZATION_REVOKED', 'Authorization Revoked'),
        ('AUTHORIZATION_EXPIRED', 'Authorization Expired'),
        # Deletion & Archive Lifecycle
        ('DELETION_REQUESTED', 'Deletion Requested'),
        ('DELETION_APPROVED', 'Deletion Approved'),
        ('DELETION_REJECTED', 'Deletion Rejected'),
        ('PERMANENT_DELETION', 'Permanent Deletion'),
        ('ARCHIVED', 'Archived'),
        ('RESTORED', 'Restored'),
    ]

    document = models.ForeignKey('Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    document_title = models.CharField(max_length=255, blank=True)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_username = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    team = models.CharField(max_length=100, blank=True)
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    
    result = models.CharField(max_length=50, blank=True)  # e.g., SUCCESS, DENIED
    comments = models.TextField(blank=True)
    
    previous_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Document Audit Log'
        verbose_name_plural = 'Document Audit Logs'
        
    def __str__(self):
        return f"[{self.timestamp}] {self.user_username} - {self.action} on '{self.document_title}'"
from django.db.models.signals import post_delete
from django.dispatch import receiver
import os

@receiver(post_delete, sender=Document)
def auto_delete_file_on_delete_document(sender, instance, **kwargs):
    """
    Deletes physical file from filesystem
    when corresponding `Document` object is deleted.
    """
    if instance.pdf_file:
        if os.path.isfile(instance.pdf_file.path):
            os.remove(instance.pdf_file.path)

@receiver(post_delete, sender=DocumentVersion)
def auto_delete_file_on_delete_documentversion(sender, instance, **kwargs):
    """
    Deletes physical file from filesystem
    when corresponding `DocumentVersion` object is deleted.
    """
    if instance.pdf_file:
        if os.path.isfile(instance.pdf_file.path):
            os.remove(instance.pdf_file.path)

@receiver(post_delete, sender=BackupOperation)
def auto_delete_file_on_delete_documentbackup(sender, instance, **kwargs):
    """
    Deletes physical file from filesystem
    when corresponding `BackupOperation` object is deleted.
    """
    if instance.backup_file:
        if os.path.isfile(instance.backup_file.path):
            os.remove(instance.backup_file.path)

class Announcement(models.Model):
    CATEGORY_CHOICES = [
        ('INTERNAL_AUDIT', 'Internal Audit News'),
        ('RISK', 'Risk Insights'),
        ('EMERGING_RISK', 'Emerging Risks'),
        ('GENERAL', 'General News'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField(help_text="Content of the announcement (Markdown or Plain Text)")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='GENERAL')
    is_published = models.BooleanField(default=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='announcements')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        
    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"
