from rest_framework import serializers
from .models import (
    AuditPeriod,
    AuditableEntity,
    AnnualAuditPlan,
    PlannedAudit,
    AuditEngagement,
    RiskControlMatrix,
    WorkPaper,
    AuditFinding,
    EngagementReport,
    ChecklistTemplate,
    ComplianceControl,
    Escalation,
)

class AuditPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditPeriod
        fields = '__all__'

class ChecklistTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistTemplate
        fields = '__all__'

class AuditableEntitySerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='entity_type', required=False)
    subcategory = serializers.CharField(source='sub_category', required=False, allow_blank=True, allow_null=True)
    auditingUnit = serializers.CharField(source='department.name', read_only=True, default='')
    riskScore = serializers.SerializerMethodField()
    riskLevel = serializers.SerializerMethodField()
    templateId = serializers.SerializerMethodField()
    isDeleted = serializers.BooleanField(source='is_deleted', required=False)

    class Meta:
        model = AuditableEntity
        fields = ['id', 'name', 'description', 'category', 'subcategory', 'auditingUnit', 'riskScore', 'riskLevel', 'templateId', 'isDeleted', 'created_at']

    def get_riskScore(self, obj):
        mapping = {'HIGH': 90, 'MEDIUM': 60, 'LOW': 30}
        return mapping.get(obj.risk_rating, 60)
        
    def get_riskLevel(self, obj):
        return obj.risk_rating.capitalize() if obj.risk_rating else 'Medium'
        
    def get_templateId(self, obj):
        first_template = obj.attached_checklists_templates.first()
        return str(first_template.id) if first_template else None

class AnnualAuditPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnualAuditPlan
        fields = '__all__'

class PlannedAuditSerializer(serializers.ModelSerializer):
    auditYear = serializers.CharField(source='annual_plan.audit_period.fiscal_year', read_only=True, default='')
    entityId = serializers.CharField(source='entity.id', read_only=True)
    entityName = serializers.CharField(source='entity.name', read_only=True, default='')
    riskLevel = serializers.SerializerMethodField()
    riskScore = serializers.SerializerMethodField()
    targetQuarter = serializers.CharField(source='quarter_targeted', required=False)
    targetMonth = serializers.SerializerMethodField()
    assignedResources = serializers.SerializerMethodField()
    status = serializers.CharField(source='annual_plan.status', read_only=True, default='Draft')
    approvedBy = serializers.CharField(source='annual_plan.approved_by.username', read_only=True, default='')
    approvalDate = serializers.DateField(source='annual_plan.approved_date', read_only=True)

    class Meta:
        model = PlannedAudit
        fields = ['id', 'auditYear', 'entityId', 'entityName', 'riskLevel', 'riskScore', 'targetQuarter', 'targetMonth', 'assignedResources', 'status', 'approvedBy', 'approvalDate']

    def get_riskLevel(self, obj):
        return obj.entity.risk_rating.capitalize() if obj.entity and obj.entity.risk_rating else 'Medium'
        
    def get_riskScore(self, obj):
        mapping = {'HIGH': 90, 'MEDIUM': 60, 'LOW': 30}
        return mapping.get(obj.entity.risk_rating, 60) if obj.entity else 60
        
    def get_targetMonth(self, obj):
        mapping = {'Q1': 'July', 'Q2': 'October', 'Q3': 'January', 'Q4': 'April'}
        return mapping.get(obj.quarter_targeted, 'July')
        
    def get_assignedResources(self, obj):
        return 1

class AuditEngagementSerializer(serializers.ModelSerializer):
    entityId = serializers.CharField(source='planned_audit.entity.id', read_only=True)
    entityName = serializers.CharField(source='planned_audit.entity.name', read_only=True, default='')
    riskLevel = serializers.SerializerMethodField()
    auditYear = serializers.CharField(source='planned_audit.annual_plan.audit_period.fiscal_year', read_only=True, default='')
    targetQuarter = serializers.CharField(source='planned_audit.quarter_targeted', read_only=True, default='')
    budgetedHours = serializers.DecimalField(source='planned_audit.budgeted_hours', max_digits=8, decimal_places=2, read_only=True)
    actualHours = serializers.DecimalField(source='actual_hours', max_digits=8, decimal_places=2, required=False)
    startDate = serializers.DateField(source='start_date', required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', required=False, allow_null=True)
    leadAuditorId = serializers.CharField(source='lead_auditor.id', read_only=True, default='')

    class Meta:
        model = AuditEngagement
        fields = ['id', 'engagement_code', 'status', 'entityId', 'entityName', 'riskLevel', 'auditYear', 'targetQuarter', 'budgetedHours', 'actualHours', 'startDate', 'endDate', 'wbs', 'leadAuditorId', 'engagement_letter']
        
    def get_riskLevel(self, obj):
        return obj.planned_audit.entity.risk_rating.capitalize() if obj.planned_audit and obj.planned_audit.entity and obj.planned_audit.entity.risk_rating else 'Medium'

class RiskControlMatrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskControlMatrix
        fields = '__all__'

class WorkPaperSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.CharField(source='prepared_by.username', read_only=True, default='')

    class Meta:
        model = WorkPaper
        fields = '__all__'

class AuditFindingSerializer(serializers.ModelSerializer):
    riskLevel = serializers.SerializerMethodField()
    rectificationValidationStatus = serializers.CharField(source='rectification_validation_status', required=False, allow_null=True, allow_blank=True)
    expectedCompletionDate = serializers.DateField(source='action_plan_date', required=False, allow_null=True)
    entityName = serializers.CharField(source='engagement.planned_audit.entity.name', read_only=True, default='')
    
    class Meta:
        model = AuditFinding
        fields = '__all__'
        
    def get_riskLevel(self, obj):
        return obj.risk_level.capitalize() if obj.risk_level else 'Medium'

class EngagementReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngagementReport
        fields = '__all__'

class ComplianceControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceControl
        fields = '__all__'

class EscalationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escalation
        fields = '__all__'
