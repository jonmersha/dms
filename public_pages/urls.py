from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentBlockViewSet, LearningPlaylistViewSet, LearningEpisodeViewSet, QuizViewSet

router = DefaultRouter()
router.register(r'content-blocks', ContentBlockViewSet, basename='content-blocks')
router.register(r'learning-playlists', LearningPlaylistViewSet, basename='learning-playlists')
router.register(r'learning-episodes', LearningEpisodeViewSet, basename='learning-episodes')
router.register(r'quizzes', QuizViewSet, basename='quizzes')

urlpatterns = [
    path('', include(router.urls)),
]
