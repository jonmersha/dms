from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import DocumentViewSet, TemporaryAccessViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='api-document')
router.register(r'access', TemporaryAccessViewSet, basename='api-access')

urlpatterns = [
    path('', include(router.urls)),
]
