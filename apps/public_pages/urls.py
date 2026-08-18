from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentBlockViewSet

router = DefaultRouter()
router.register(r'content-blocks', ContentBlockViewSet, basename='content-blocks')

urlpatterns = [
    path('', include(router.urls)),
]
