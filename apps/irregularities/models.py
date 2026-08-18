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
