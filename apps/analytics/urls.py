from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import (
    DataSourceViewSet,
    AuditScriptViewSet,
    ScriptExecutionViewSet,
    AnalyticsExceptionViewSet,
)

router = DefaultRouter()
router.register(r'sources', DataSourceViewSet, basename='analytics-source')
router.register(r'scripts', AuditScriptViewSet, basename='analytics-script')
router.register(r'executions', ScriptExecutionViewSet, basename='analytics-execution')
router.register(r'exceptions', AnalyticsExceptionViewSet, basename='analytics-exception')

urlpatterns = [
    path('', include(router.urls)),
]
