import re

# 1. Update models.py
models_code = """from django.db import models
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
"""
with open('irregularities/models.py', 'w') as f:
    f.write(models_code)

# 2. Update serializers.py
serializers_code = """from rest_framework import serializers
from .models import IrregularityReport, IncidentCategory, IncidentSystem, ResponsibleOrgan
from audits.models import AuditableEntity

class IncidentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentCategory
        fields = '__all__'

class IncidentSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentSystem
        fields = '__all__'

class ResponsibleOrganSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponsibleOrgan
        fields = '__all__'

class IrregularityReportSerializer(serializers.ModelSerializer):
    branchId = serializers.PrimaryKeyRelatedField(queryset=AuditableEntity.objects.filter(entity_type='BRANCH'), source='branch', required=False)
    branchName = serializers.CharField(source='branch.name', read_only=True)
    reportedByName = serializers.CharField(source='reported_by.full_name', read_only=True)
    
    categoryId = serializers.PrimaryKeyRelatedField(queryset=IncidentCategory.objects.all(), source='category', allow_null=True)
    categoryName = serializers.CharField(source='category.name', read_only=True)
    
    involvedSystemId = serializers.PrimaryKeyRelatedField(queryset=IncidentSystem.objects.all(), source='involved_system', allow_null=True, required=False)
    involvedSystemName = serializers.CharField(source='involved_system.name', read_only=True)
    
    responsibleOrganId = serializers.PrimaryKeyRelatedField(queryset=ResponsibleOrgan.objects.all(), source='responsible_organ', allow_null=True)
    responsibleOrganName = serializers.CharField(source='responsible_organ.name', read_only=True)
    
    caseDescription = serializers.CharField(source='case_description')
    discoveryTime = serializers.DateTimeField(source='discovery_time')
    amountInvolved = serializers.DecimalField(source='amount_involved', max_digits=15, decimal_places=2, required=False, allow_null=True)
    recommendedAction = serializers.CharField(source='recommended_action')
    escalationProcedure = serializers.CharField(source='escalation_procedure')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = IrregularityReport
        fields = [
            'id', 'branchId', 'branchName', 'reportedByName', 'caseDescription', 
            'categoryId', 'categoryName', 'discoveryTime', 
            'responsibleOrganId', 'responsibleOrganName', 
            'involvedSystemId', 'involvedSystemName',
            'amountInvolved', 'recommendedAction', 'escalationProcedure', 
            'status', 'createdAt', 'updatedAt'
        ]
        
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['reported_by'] = request.user
        return super().create(validated_data)
"""
with open('irregularities/serializers.py', 'w') as f:
    f.write(serializers_code)

# 3. Update views.py
views_code = """from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import IrregularityReport, IncidentCategory, IncidentSystem, ResponsibleOrgan
from .serializers import (
    IrregularityReportSerializer,
    IncidentCategorySerializer,
    IncidentSystemSerializer,
    ResponsibleOrganSerializer
)

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.is_superuser or request.user.role == 'ADMIN'

class IncidentCategoryViewSet(viewsets.ModelViewSet):
    queryset = IncidentCategory.objects.all().order_by('name')
    serializer_class = IncidentCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class IncidentSystemViewSet(viewsets.ModelViewSet):
    queryset = IncidentSystem.objects.all().order_by('name')
    serializer_class = IncidentSystemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class ResponsibleOrganViewSet(viewsets.ModelViewSet):
    queryset = ResponsibleOrgan.objects.all().order_by('name')
    serializer_class = ResponsibleOrganSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class IrregularityReportViewSet(viewsets.ModelViewSet):
    queryset = IrregularityReport.objects.select_related('branch', 'reported_by', 'category', 'involved_system', 'responsible_organ').all().order_by('-created_at')
    serializer_class = IrregularityReportSerializer
    permission_classes = [IsAuthenticated]
"""
with open('irregularities/views.py', 'w') as f:
    f.write(views_code)

# 4. Update urls.py
urls_code = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IrregularityReportViewSet,
    IncidentCategoryViewSet,
    IncidentSystemViewSet,
    ResponsibleOrganViewSet
)

router = DefaultRouter()
router.register(r'reports', IrregularityReportViewSet, basename='irregularity-reports')
router.register(r'categories', IncidentCategoryViewSet, basename='irregularity-categories')
router.register(r'systems', IncidentSystemViewSet, basename='irregularity-systems')
router.register(r'organs', ResponsibleOrganViewSet, basename='irregularity-organs')

urlpatterns = [
    path('', include(router.urls)),
]
"""
with open('irregularities/urls.py', 'w') as f:
    f.write(urls_code)

