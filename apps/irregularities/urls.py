from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IrregularityReportViewSet,
    IncidentCategoryViewSet,
    IncidentSystemViewSet,
    ResponsibleOrganViewSet,
    OrganizationalUnitViewSet,
    ResidentAuditFindingViewSet,
    FindingEvidenceViewSet
)

router = DefaultRouter()
router.register(r'reports', IrregularityReportViewSet, basename='irregularity-reports')
router.register(r'categories', IncidentCategoryViewSet, basename='irregularity-categories')
router.register(r'systems', IncidentSystemViewSet, basename='irregularity-systems')
router.register(r'organs', ResponsibleOrganViewSet, basename='irregularity-organs')
router.register(r'organizational-units', OrganizationalUnitViewSet, basename='org-units')
router.register(r'resident-findings', ResidentAuditFindingViewSet, basename='resident-findings')
router.register(r'finding-evidence', FindingEvidenceViewSet, basename='finding-evidence')

urlpatterns = [
    path('', include(router.urls)),
]
