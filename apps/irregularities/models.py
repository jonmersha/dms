from django.db import models
from django.conf import settings
from audits.models import AuditableEntity

class IncidentCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class IncidentSystem(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ResponsibleOrgan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class OrganizationalUnit(models.Model):
    UNIT_TYPE_CHOICES = [
        ('BRANCH', 'Branch'),
        ('DISTRICT_OFFICE', 'District Office'),
        ('REGIONAL_OFFICE', 'Regional Office'),
        ('HEAD_OFFICE', 'Head Office'),
        ('DEPARTMENT', 'Department'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True, blank=True, null=True)
    unit_type = models.CharField(max_length=30, choices=UNIT_TYPE_CHOICES, default='BRANCH')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['unit_type', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_unit_type_display()})"

class IrregularityReport(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('INVESTIGATING', 'Under Investigation'),
        ('ESCALATED', 'Escalated'),
        ('RESOLVED', 'Resolved'),
    ]

    branch = models.ForeignKey(AuditableEntity, on_delete=models.CASCADE, related_name='irregularities', limit_choices_to={'entity_type': 'BRANCH'})
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reported_irregularities')
    
    # New Dynamic Foreign Keys (falling back to SET_NULL if a category is deleted)
    category = models.ForeignKey(IncidentCategory, on_delete=models.SET_NULL, null=True)
    involved_system = models.ForeignKey(IncidentSystem, on_delete=models.SET_NULL, blank=True, null=True)
    responsible_organ = models.ForeignKey(ResponsibleOrgan, on_delete=models.SET_NULL, null=True)
    
    case_description = models.TextField()
    discovery_time = models.DateTimeField()
    amount_involved = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    recommended_action = models.TextField()
    escalation_procedure = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        cat_name = self.category.name if self.category else "Uncategorized"
        return f"Irregularity at {self.branch.name} - {cat_name}"

class ResidentAuditFinding(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('REPORTED', 'Reported'),
        ('RESPONSE_REQUIRED', 'Management Response Required'),
        ('ACTION_PLAN_SUBMITTED', 'Action Plan Submitted'),
        ('UNDER_RECTIFICATION', 'Under Rectification'),
        ('EVIDENCE_SUBMITTED', 'Evidence Submitted'),
        ('PENDING_VERIFICATION', 'Pending Auditor Verification'),
        ('CLOSED', 'Verified and Closed'),
        ('RETURNED', 'Rejected/Returned for Further Action'),
        ('OVERDUE', 'Overdue'),
        ('ESCALATED', 'Escalated'),
    ]

    RISK_CHOICES = [
        ('FINANCIAL', 'Financial'),
        ('OPERATIONAL', 'Operational'),
        ('COMPLIANCE', 'Compliance'),
        ('CUSTOMER', 'Customer'),
        ('FRAUD', 'Fraud'),
        ('TECHNOLOGY', 'Technology'),
        ('REPUTATIONAL', 'Reputational'),
    ]

    reference_number = models.CharField(max_length=50, unique=True)
    audit_area = models.CharField(max_length=100)
    date_identified = models.DateField()
    description = models.TextField()
    applicable_procedure = models.TextField(blank=True, null=True)
    risk_impact = models.CharField(max_length=50, choices=RISK_CHOICES)
    root_cause = models.TextField(blank=True, null=True)
    required_corrective_action = models.TextField()
    target_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='DRAFT')
    
    branch = models.ForeignKey(AuditableEntity, on_delete=models.CASCADE, related_name='resident_findings', limit_choices_to={'entity_type': 'BRANCH'})
    auditor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='auditor_findings')
    responsible_officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_findings')
    
    management_response = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.reference_number} - {self.branch.name}"

class FindingEvidence(models.Model):
    finding = models.ForeignKey(ResidentAuditFinding, on_delete=models.CASCADE, related_name='evidences')
    description = models.CharField(max_length=255)
    file = models.FileField(upload_to='audit_evidence/%Y/%m/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_management_evidence = models.BooleanField(default=False, help_text="True if uploaded by management as proof of rectification")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.finding.reference_number}"

class FindingAuditTrail(models.Model):
    finding = models.ForeignKey(ResidentAuditFinding, on_delete=models.CASCADE, related_name='audit_trail')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.finding.reference_number} - {self.action}"
