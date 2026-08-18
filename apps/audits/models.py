from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from users.models import Department

class AuditPeriod(models.Model):
    fiscal_year = models.CharField(
        _('fiscal year'),
        max_length=7,
        unique=True,
        help_text=_('Format: YYYY-YY (e.g., 2025-26)')
    )
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'))
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('audit period')
        verbose_name_plural = _('audit periods')
        ordering = ['-fiscal_year']
    
    def __str__(self):
        return self.fiscal_year
    
    def clean(self):
        """Validate fiscal year format and date ranges"""
        if self.fiscal_year:
            try:
                start_year = int(self.fiscal_year[:4])
                end_year_short = int(self.fiscal_year[5:])
                expected_end_year = start_year + 1
                
                if len(self.fiscal_year) != 7 or self.fiscal_year[4] != '-':
                    raise ValidationError({'fiscal_year': 'Fiscal year must be in format YYYY-YY (e.g., 2025-26)'})
                
                if end_year_short != expected_end_year % 100:
                    raise ValidationError({'fiscal_year': f'End year should be {expected_end_year % 100:02d} for start year {start_year}'})
                    
            except (ValueError, IndexError):
                raise ValidationError({'fiscal_year': 'Fiscal year must be in format YYYY-YY (e.g., 2025-26)'})
        
        # Validate that end date is after start date
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError({'end_date': 'End date must be after start date'})
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def year(self):
        """Backward compatibility - returns the start year of fiscal year"""
        return int(self.fiscal_year[:4])


class ChecklistTemplate(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    file_attachment = models.FileField(upload_to='audit_checklists/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AuditableEntity(models.Model):
    RISK_CHOICES = [
        ('HIGH', 'High Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('LOW', 'Low Risk'),
    ]
    ENTITY_TYPE_CHOICES = [
        ('BRANCH', 'Branch'),
        ('DEPARTMENT', 'Head Office Department'),
        ('IT_SYSTEM', 'IT System'),
        ('PROCESS', 'Business Process'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=255, unique=True)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES)
    sub_category = models.CharField(max_length=100, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='auditable_entities')
    risk_rating = models.CharField(max_length=10, choices=RISK_CHOICES, default='MEDIUM')
    description = models.TextField(blank=True, null=True)
    attached_checklists_templates = models.ManyToManyField(ChecklistTemplate, blank=True, related_name='entities')
    last_audited_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Auditable Entities'

    def __str__(self):
        return f"{self.name} ({self.get_entity_type_display()})"


class AnnualAuditPlan(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('APPROVED', 'Approved'),
        ('ARCHIVED', 'Archived'),
    ]
    
    audit_period = models.OneToOneField(AuditPeriod, on_delete=models.CASCADE, related_name='annual_plan')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    total_budgeted_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_annual_plans')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_annual_plans')
    approved_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class PlannedAudit(models.Model):
    QUARTER_CHOICES = [
        ('Q1', 'Quarter 1 (Jul-Sep)'),
        ('Q2', 'Quarter 2 (Oct-Dec)'),
        ('Q3', 'Quarter 3 (Jan-Mar)'),
        ('Q4', 'Quarter 4 (Apr-Jun)'),
    ]

    annual_plan = models.ForeignKey(AnnualAuditPlan, on_delete=models.CASCADE, related_name='planned_audits')
    entity = models.ForeignKey(AuditableEntity, on_delete=models.CASCADE, related_name='planned_audits')
    quarter_targeted = models.CharField(max_length=2, choices=QUARTER_CHOICES)
    budgeted_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    assigned_team = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_planned_audits')
    objectives = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('annual_plan', 'entity', 'quarter_targeted')

    def __str__(self):
        return f"{self.entity.name} - {self.annual_plan.audit_period.fiscal_year} {self.quarter_targeted}"


class AuditEngagement(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('FIELDWORK', 'Fieldwork'),
        ('REPORTING', 'Reporting'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]

    planned_audit = models.OneToOneField(PlannedAudit, on_delete=models.CASCADE, related_name='engagement')
    engagement_code = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    lead_auditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_engagements')
    auditors = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='assigned_engagements')
    scope = models.TextField(blank=True, null=True)
    actual_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    wbs = models.JSONField(default=list, blank=True, null=True, help_text="Work Breakdown Structure tasks")
    engagement_letter = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.engagement_code if self.engagement_code else f"Engagement: {self.planned_audit.entity.name}"

    def save(self, *args, **kwargs):
        if not self.engagement_code and self.planned_audit:
            count = AuditEngagement.objects.filter(planned_audit__annual_plan=self.planned_audit.annual_plan).count() + 1
            self.engagement_code = f"ENG-{self.planned_audit.annual_plan.audit_period.fiscal_year}-{count:03d}"
        super().save(*args, **kwargs)


class RiskControlMatrix(models.Model):
    engagement = models.ForeignKey(AuditEngagement, on_delete=models.CASCADE, related_name='rcm_entries')
    process_name = models.CharField(max_length=255)
    identified_risk = models.TextField()
    control_description = models.TextField()
    control_design_assessment = models.CharField(max_length=100, blank=True, null=True)
    control_operating_effectiveness = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"RCM: {self.process_name} - {self.engagement.engagement_code}"


class WorkPaper(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('IN_REVIEW', 'In Review'),
        ('APPROVED', 'Approved'),
        ('RETURNED', 'Returned'),
    ]

    engagement = models.ForeignKey(AuditEngagement, on_delete=models.CASCADE, related_name='work_papers')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    prepared_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='prepared_workpapers')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_workpapers')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    attachment = models.FileField(upload_to='workpapers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AuditFinding(models.Model):
    RISK_LEVEL_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('PENDING_FOLLOWUP', 'Pending Follow-up'),
    ]

    engagement = models.ForeignKey(AuditEngagement, on_delete=models.CASCADE, related_name='findings')
    title = models.CharField(max_length=255)
    condition = models.TextField(help_text="What is the current state?")
    criteria = models.TextField(help_text="What should be the state?")
    cause = models.TextField(help_text="Why did the condition occur?")
    effect = models.TextField(help_text="What is the impact/risk?")
    recommendation = models.TextField(help_text="What should be done to fix it?")
    root_cause = models.TextField(blank=True, null=True)
    loss_figures = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='MEDIUM')
    
    is_sent_to_auditees = models.BooleanField(default=False)
    management_response = models.TextField(blank=True, null=True)
    auditee_response = models.TextField(blank=True, null=True)
    action_plan_date = models.DateField(blank=True, null=True)
    
    rectification_validation_status = models.CharField(max_length=50, blank=True, null=True)
    sla_deadline = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.risk_level} Finding: {self.title}"


class EngagementReport(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('IN_REVIEW', 'In Review'),
        ('ISSUED', 'Issued'),
    ]

    engagement = models.OneToOneField(AuditEngagement, on_delete=models.CASCADE, related_name='report')
    executive_summary = models.TextField(blank=True, null=True)
    overall_rating = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Satisfactory, Needs Improvement")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    issue_date = models.DateField(blank=True, null=True)
    pdf_report = models.FileField(upload_to='audit_final_reports/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report for {self.engagement.engagement_code}"


class ComplianceControl(models.Model):
    STATUS_CHOICES = [
        ('COMPLIANT', 'Compliant'),
        ('PARTIAL', 'Partial'),
        ('NON_COMPLIANT', 'Non-Compliant'),
    ]
    regulation_type = models.CharField(max_length=100)
    directive_number = models.CharField(max_length=100)
    control_name = models.CharField(max_length=255)
    assessment_criteria = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='COMPLIANT')
    last_assessed_date = models.DateField(auto_now=True)
    mapped_entity = models.ForeignKey(AuditableEntity, on_delete=models.CASCADE, related_name='compliance_controls')

    def __str__(self):
        return f"{self.directive_number}: {self.control_name}"


class Escalation(models.Model):
    issue_type = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    source_unit = models.ForeignKey('users.Department', on_delete=models.CASCADE, related_name='outgoing_escalations')
    target_unit = models.ForeignKey('users.Department', on_delete=models.CASCADE, related_name='incoming_escalations')
    status = models.CharField(max_length=50, default='PENDING')
    escalated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_escalations')
    escalated_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_escalations')
    creation_date = models.DateTimeField(auto_now_add=True)
    decision_date = models.DateTimeField(blank=True, null=True)
    decision_notes = models.TextField(blank=True, null=True)
    decision_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='decided_escalations')

    def __str__(self):
        return self.title