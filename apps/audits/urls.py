from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import (
    AuditPeriodViewSet,
    AuditableEntityViewSet,
    AnnualAuditPlanViewSet,
    PlannedAuditViewSet,
    AuditEngagementViewSet,
    RiskControlMatrixViewSet,
    WorkPaperViewSet,
    AuditFindingViewSet,
    EngagementReportViewSet,
    ChecklistTemplateViewSet,
    ComplianceControlViewSet,
    EscalationViewSet,
)

router = DefaultRouter()
router.register(r'periods', AuditPeriodViewSet, basename='audit-period')
router.register(r'checklist-templates', ChecklistTemplateViewSet, basename='checklist-template')
router.register(r'universe', AuditableEntityViewSet, basename='audit-universe')
router.register(r'annual-plans', PlannedAuditViewSet, basename='audit-annual-plans')
router.register(r'planned-audits', PlannedAuditViewSet, basename='audit-planned-audits')
router.register(r'engagements', AuditEngagementViewSet, basename='audit-engagements')
router.register(r'rcm', RiskControlMatrixViewSet, basename='audit-rcm')
router.register(r'workpapers', WorkPaperViewSet, basename='audit-workpapers')
router.register(r'findings', AuditFindingViewSet, basename='audit-findings')
router.register(r'reports', EngagementReportViewSet, basename='audit-reports')
router.register(r'compliance-controls', ComplianceControlViewSet, basename='audit-compliance-controls')
router.register(r'escalations', EscalationViewSet, basename='audit-escalations')

urlpatterns = [
    path('', include(router.urls)),
]
