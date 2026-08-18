from rest_framework import serializers
from .models import (
    LearningPlaylist, LearningEpisode, 
    CourseEnrollment, LessonProgress, Quiz, QuizQuestion, QuizAnswer, UserQuizAttempt,
    CertificateSettings
)

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'text', 'is_correct']
        extra_kwargs = {'is_correct': {'write_only': True}} # Don't send answers to frontend!

class QuizQuestionSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    class Meta:
        model = QuizQuestion
        fields = ['id', 'text', 'order', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score', 'questions']

class AdminQuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = ['id', 'question', 'text', 'is_correct']

class AdminQuizQuestionSerializer(serializers.ModelSerializer):
    answers = AdminQuizAnswerSerializer(many=True, read_only=True)
    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'text', 'order', 'answers']

class AdminQuizSerializer(serializers.ModelSerializer):
    questions = AdminQuizQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'episode', 'title', 'description', 'passing_score', 'questions']

class LearningEpisodeSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()
    last_position = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningEpisode
        fields = ['id', 'title', 'content_type', 'video_url', 'content_text', 'order', 'quiz', 'is_completed', 'last_position', 'playlist']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # We can optimize this later with prefetch_related if needed
            return obj.progress.filter(user=request.user, is_completed=True).exists()
        return False

    def get_last_position(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.progress.filter(user=request.user).first()
            if progress:
                return progress.last_position
        return 0

class LearningPlaylistSerializer(serializers.ModelSerializer):
    episodes = LearningEpisodeSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = LearningPlaylist
        fields = ['id', 'title', 'description', 'main_url', 'playlist_id', 'order', 'episodes', 'created_at', 'updated_at', 'is_enrolled', 'progress_percentage', 'created_by']
        read_only_fields = ['created_by']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False
        
    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_episodes = obj.episodes.count()
            if total_episodes == 0:
                return 0
            completed_episodes = LessonProgress.objects.filter(
                user=request.user, 
                episode__playlist=obj, 
                is_completed=True
            ).count()
            return int((completed_episodes / total_episodes) * 100)
        return 0

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'enrolled_at', 'is_completed', 'completed_at']
        read_only_fields = ['id', 'enrolled_at', 'is_completed', 'completed_at']

class CertificateSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateSettings
        fields = ['background_image', 'signature_image', 'chief_auditor_name', 'organization_name', 'motto', 'tagline']
