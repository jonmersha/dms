from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import DocumentViewSet, AccessReadOnlyViewSet, BackupOperationViewSet, AnnouncementViewSet
from users.views import UserDirectoryViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='api-document')
router.register(r'access', AccessReadOnlyViewSet, basename='api-access')
router.register(r'directory/users', UserDirectoryViewSet, basename='api-users')
router.register(r'backups', BackupOperationViewSet, basename='api-backups')
router.register(r'announcements', AnnouncementViewSet, basename='api-announcements')

urlpatterns = [
    path('', include(router.urls)),
]
