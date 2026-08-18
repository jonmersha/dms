from django.urls import path, include
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
