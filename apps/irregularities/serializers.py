from rest_framework import serializers
from .models import (
    IrregularityReport, IncidentCategory, IncidentSystem, ResponsibleOrgan,
    OrganizationalUnit,
    ResidentAuditFinding, FindingEvidence, FindingAuditTrail
)
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

class OrganizationalUnitSerializer(serializers.ModelSerializer):
    unit_type_display = serializers.CharField(source='get_unit_type_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)

    class Meta:
        model = OrganizationalUnit
        fields = ['id', 'name', 'code', 'unit_type', 'unit_type_display', 'parent', 'parent_name', 'is_active', 'created_at']

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


class FindingEvidenceSerializer(serializers.ModelSerializer):
    uploadedByName = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)
    isManagementEvidence = serializers.BooleanField(source='is_management_evidence', required=False)

    class Meta:
        model = FindingEvidence
        fields = [
            'id', 'finding', 'description', 'file', 'uploaded_by', 'uploadedByName',
            'isManagementEvidence', 'uploadedAt'
        ]
        read_only_fields = ['uploaded_by']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        return super().create(validated_data)

class FindingAuditTrailSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.full_name', read_only=True)
    timestampStr = serializers.DateTimeField(source='timestamp', read_only=True)

    class Meta:
        model = FindingAuditTrail
        fields = ['id', 'finding', 'user', 'userName', 'action', 'timestampStr']

class ResidentAuditFindingSerializer(serializers.ModelSerializer):
    branchId = serializers.PrimaryKeyRelatedField(queryset=AuditableEntity.objects.filter(entity_type='BRANCH'), source='branch')
    branchName = serializers.CharField(source='branch.name', read_only=True)
    auditorName = serializers.CharField(source='auditor.full_name', read_only=True)
    responsibleOfficerName = serializers.CharField(source='responsible_officer.full_name', read_only=True)
    
    evidences = FindingEvidenceSerializer(many=True, read_only=True)
    audit_trail = FindingAuditTrailSerializer(many=True, read_only=True)

    referenceNumber = serializers.CharField(source='reference_number')
    auditArea = serializers.CharField(source='audit_area')
    dateIdentified = serializers.DateField(source='date_identified')
    applicableProcedure = serializers.CharField(source='applicable_procedure', allow_null=True, required=False)
    riskImpact = serializers.CharField(source='risk_impact')
    rootCause = serializers.CharField(source='root_cause', allow_null=True, required=False)
    requiredCorrectiveAction = serializers.CharField(source='required_corrective_action')
    targetDate = serializers.DateField(source='target_date', allow_null=True, required=False)
    managementResponse = serializers.CharField(source='management_response', allow_null=True, required=False)
    
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = ResidentAuditFinding
        fields = [
            'id', 'referenceNumber', 'auditArea', 'dateIdentified', 'description',
            'applicableProcedure', 'riskImpact', 'rootCause', 'requiredCorrectiveAction',
            'targetDate', 'status', 'branchId', 'branchName', 'auditor', 'auditorName',
            'responsible_officer', 'responsibleOfficerName', 'managementResponse',
            'createdAt', 'updatedAt', 'evidences', 'audit_trail'
        ]
        read_only_fields = ['auditor']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['auditor'] = request.user
        finding = super().create(validated_data)
        
        # Initial Audit Trail log
        if request and hasattr(request, 'user'):
            FindingAuditTrail.objects.create(
                finding=finding,
                user=request.user,
                action="Created Draft Finding" if finding.status == 'DRAFT' else f"Created Finding with status {finding.get_status_display()}"
            )
        return finding
