from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, DepartmentViewSet, RoleViewSet, PermissionViewSet, UserAuditLogViewSet, DepartmentPerformancePlanViewSet
from documents.api import DocumentAuditLogViewSet
from lms.views import LearningMetricsView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='admin-user')
router.register(r'departments', DepartmentViewSet, basename='admin-department')
router.register(r'performance-plans', DepartmentPerformancePlanViewSet, basename='admin-performance-plans')
router.register(r'logs', DocumentAuditLogViewSet, basename='admin-logs')
router.register(r'roles', RoleViewSet, basename='admin-role')
router.register(r'permissions', PermissionViewSet, basename='admin-permission')
router.register(r'user-logs', UserAuditLogViewSet, basename='admin-user-logs')

urlpatterns = [
    path('learning-metrics/', LearningMetricsView.as_view(), name='learning-metrics'),
    path('', include(router.urls)),
]
