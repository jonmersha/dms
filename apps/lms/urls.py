from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LearningPlaylistViewSet, 
    LearningEpisodeViewSet, 
    QuizViewSet, 
    QuizQuestionViewSet, 
    QuizAnswerViewSet, 
    CertificateSettingsViewSet
)
# from .views import LearningMetricsView # if it exists

router = DefaultRouter()
router.register(r'learning-playlists', LearningPlaylistViewSet, basename='learning-playlists')
router.register(r'learning-episodes', LearningEpisodeViewSet, basename='learning-episodes')
router.register(r'quizzes', QuizViewSet, basename='quizzes')
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quiz-questions')
router.register(r'quiz-answers', QuizAnswerViewSet, basename='quiz-answers')
router.register(r'certificate-settings', CertificateSettingsViewSet, basename='certificate-settings')

urlpatterns = [
    path('', include(router.urls)),
    # path('metrics/', LearningMetricsView.as_view(), name='learning-metrics'),
]
