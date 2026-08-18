from rest_framework import viewsets, permissions
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
from .serializers import (
    AuditPeriodSerializer,
    AuditableEntitySerializer,
    AnnualAuditPlanSerializer,
    PlannedAuditSerializer,
    AuditEngagementSerializer,
    RiskControlMatrixSerializer,
    WorkPaperSerializer,
    AuditFindingSerializer,
    EngagementReportSerializer,
    ChecklistTemplateSerializer,
    ComplianceControlSerializer,
    EscalationSerializer,
)

class ChecklistTemplateViewSet(viewsets.ModelViewSet):
    queryset = ChecklistTemplate.objects.all().order_by('-created_at')
    serializer_class = ChecklistTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

class AuditPeriodViewSet(viewsets.ModelViewSet):
    queryset = AuditPeriod.objects.all().order_by('-fiscal_year')
    serializer_class = AuditPeriodSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class AuditableEntityViewSet(viewsets.ModelViewSet):
    queryset = AuditableEntity.objects.all().order_by('name')
    serializer_class = AuditableEntitySerializer
    permission_classes = [permissions.IsAuthenticated]

class AnnualAuditPlanViewSet(viewsets.ModelViewSet):
    queryset = AnnualAuditPlan.objects.all().order_by('-created_at')
    serializer_class = AnnualAuditPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlannedAuditViewSet(viewsets.ModelViewSet):
    queryset = PlannedAudit.objects.all().order_by('quarter_targeted')
    serializer_class = PlannedAuditSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['annual_plan', 'quarter_targeted']

class AuditEngagementViewSet(viewsets.ModelViewSet):
    queryset = AuditEngagement.objects.all().order_by('-created_at')
    serializer_class = AuditEngagementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']

class RiskControlMatrixViewSet(viewsets.ModelViewSet):
    queryset = RiskControlMatrix.objects.all()
    serializer_class = RiskControlMatrixSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['engagement']

class WorkPaperViewSet(viewsets.ModelViewSet):
    queryset = WorkPaper.objects.all()
    serializer_class = WorkPaperSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['engagement']

class AuditFindingViewSet(viewsets.ModelViewSet):
    queryset = AuditFinding.objects.all()
    serializer_class = AuditFindingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['engagement', 'risk_level', 'status']

class EngagementReportViewSet(viewsets.ModelViewSet):
    queryset = EngagementReport.objects.all()
    serializer_class = EngagementReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['engagement', 'status']

class ComplianceControlViewSet(viewsets.ModelViewSet):
    queryset = ComplianceControl.objects.all()
    serializer_class = ComplianceControlSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['mapped_entity', 'status']

class EscalationViewSet(viewsets.ModelViewSet):
    queryset = Escalation.objects.all().order_by('-creation_date')
    serializer_class = EscalationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'source_unit', 'target_unit', 'escalated_by', 'escalated_to']
