from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentBlockViewSet, LearningPlaylistViewSet, LearningEpisodeViewSet, QuizViewSet, QuizQuestionViewSet, QuizAnswerViewSet, CertificateSettingsViewSet

router = DefaultRouter()
router.register(r'content-blocks', ContentBlockViewSet, basename='content-blocks')
router.register(r'learning-playlists', LearningPlaylistViewSet, basename='learning-playlists')
router.register(r'learning-episodes', LearningEpisodeViewSet, basename='learning-episodes')
router.register(r'quizzes', QuizViewSet, basename='quizzes')
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quiz-questions')
router.register(r'quiz-answers', QuizAnswerViewSet, basename='quiz-answers')
router.register(r'certificate-settings', CertificateSettingsViewSet, basename='certificate-settings')

urlpatterns = [
    path('', include(router.urls)),
]
