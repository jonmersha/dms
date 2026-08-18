import re
import os

# 1. Update settings.py
with open('cap/settings.py', 'r') as f:
    settings_content = f.read()
if "'irregularities'" not in settings_content:
    settings_content = settings_content.replace("'lms',", "'lms',\n    'irregularities',")
    with open('cap/settings.py', 'w') as f:
        f.write(settings_content)

# 2. Update urls.py
with open('cap/urls.py', 'r') as f:
    urls_content = f.read()
if "'api/irregularities/'" not in urls_content:
    urls_content = urls_content.replace("path('api/lms/', include('lms.urls')),", "path('api/lms/', include('lms.urls')),\n    path('api/irregularities/', include('irregularities.urls')),")
    with open('cap/urls.py', 'w') as f:
        f.write(urls_content)

# 3. Write models.py
models_code = """from django.db import models
from audits.models import AuditableEntity
from users.models import CustomUser

class IrregularityReport(models.Model):
    CATEGORY_CHOICES = [
        ('CASH_SHORTAGE', 'Cash Shortage'),
        ('FORGERY', 'Forgery'),
        ('THEFT', 'Theft'),
        ('SYSTEM_GLITCH', 'System Glitch / IT Failure'),
        ('PROCESS_VIOLATION', 'Process Violation'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('INVESTIGATING', 'Under Investigation'),
        ('ESCALATED', 'Escalated'),
        ('RESOLVED', 'Resolved'),
    ]

    branch = models.ForeignKey(AuditableEntity, on_delete=models.CASCADE, related_name='irregularities', limit_choices_to={'entity_type': 'BRANCH'})
    reported_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='reported_irregularities')
    case_description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    discovery_time = models.DateTimeField()
    responsible_organ = models.CharField(max_length=255)
    involved_system = models.CharField(max_length=100, blank=True, null=True)
    amount_involved = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    recommended_action = models.TextField()
    escalation_procedure = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Irregularity at {self.branch.name} - {self.get_category_display()}"
"""
with open('irregularities/models.py', 'w') as f:
    f.write(models_code)

# 4. Write serializers.py
serializers_code = """from rest_framework import serializers
from .models import IrregularityReport
from audits.models import AuditableEntity

class IrregularityReportSerializer(serializers.ModelSerializer):
    branchId = serializers.PrimaryKeyRelatedField(queryset=AuditableEntity.objects.filter(entity_type='BRANCH'), source='branch', required=False)
    branchName = serializers.CharField(source='branch.name', read_only=True)
    reportedByName = serializers.CharField(source='reported_by.full_name', read_only=True)
    caseDescription = serializers.CharField(source='case_description')
    discoveryTime = serializers.DateTimeField(source='discovery_time')
    responsibleOrgan = serializers.CharField(source='responsible_organ')
    involvedSystem = serializers.CharField(source='involved_system', required=False, allow_blank=True)
    amountInvolved = serializers.DecimalField(source='amount_involved', max_digits=15, decimal_places=2, required=False, allow_null=True)
    recommendedAction = serializers.CharField(source='recommended_action')
    escalationProcedure = serializers.CharField(source='escalation_procedure')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = IrregularityReport
        fields = [
            'id', 'branchId', 'branchName', 'reportedByName', 'caseDescription', 
            'category', 'discoveryTime', 'responsibleOrgan', 'involvedSystem',
            'amountInvolved', 'recommendedAction', 'escalationProcedure', 
            'status', 'createdAt', 'updatedAt'
        ]
        
    def create(self, validated_data):
        # Automatically set reported_by to the current user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['reported_by'] = request.user
        return super().create(validated_data)
"""
with open('irregularities/serializers.py', 'w') as f:
    f.write(serializers_code)

# 5. Write views.py
views_code = """from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import IrregularityReport
from .serializers import IrregularityReportSerializer

class IrregularityReportViewSet(viewsets.ModelViewSet):
    queryset = IrregularityReport.objects.select_related('branch', 'reported_by').all().order_by('-created_at')
    serializer_class = IrregularityReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If user is a branch controller, they might only see their own branch's irregularities.
        # But for this implementation, we'll let all authenticated users see them, or filter by role later.
        return super().get_queryset()
"""
with open('irregularities/views.py', 'w') as f:
    f.write(views_code)

# 6. Write urls.py
urls_code = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IrregularityReportViewSet

router = DefaultRouter()
router.register(r'reports', IrregularityReportViewSet, basename='irregularity-reports')

urlpatterns = [
    path('', include(router.urls)),
]
"""
with open('irregularities/urls.py', 'w') as f:
    f.write(urls_code)

