from rest_framework import serializers
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
