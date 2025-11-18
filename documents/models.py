from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.urls import reverse
from audits.models import AuditPeriod

def pdf_upload_path(instance, filename):
    """Generate upload path: reports/{fiscal_year}/{quarter}/{filename}"""
    return f"reports/{instance.audit_period.fiscal_year}/{instance.quarter}/{filename}"

class Document(models.Model):
    QUARTER_CHOICES = [
        ('Q1', 'Quarter 1 (Jul-Sep)'),
        ('Q2', 'Quarter 2 (Oct-Dec)'),
        ('Q3', 'Quarter 3 (Jan-Mar)'),
        ('Q4', 'Quarter 4 (Apr-Jun)'),
    ]
    
    title = models.CharField(max_length=255)
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

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-audit_period__fiscal_year', '-quarter', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.audit_period.fiscal_year} {self.quarter}"

    def clean(self):
        """Validate document data"""
        if not self.audit_period:
            raise ValidationError({'audit_period': 'Audit period is required.'})
        
        if not self.quarter:
            raise ValidationError({'quarter': 'Quarter is required.'})
        
        if not self.audit_period.is_active:
            raise ValidationError({'audit_period': 'Cannot upload to inactive audit periods.'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def can_download(self, user):
        """Check if user can download this document"""
        if not self.restricted:
            return True
        return user.is_authenticated and (
            user == self.uploaded_by or 
            self.allowed_users.filter(id=user.id).exists() or
            user.is_superuser
        )