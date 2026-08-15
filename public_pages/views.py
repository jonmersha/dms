from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    ContentBlock, LearningPlaylist, LearningEpisode,
    CourseEnrollment, LessonProgress, Quiz, QuizQuestion, QuizAnswer, UserQuizAttempt
)
from .serializers import (
    ContentBlockSerializer, BulkContentBlockUpdateSerializer,
    LearningPlaylistSerializer, LearningEpisodeSerializer,
    QuizSerializer
)

class IsContentManager(permissions.BasePermission):
    """
    Custom permission to only allow content managers or superusers to edit.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.can_manage_public_content
        )

class ContentBlockViewSet(viewsets.ModelViewSet):
    queryset = ContentBlock.objects.all()
    serializer_class = ContentBlockSerializer
    permission_classes = [IsContentManager]

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Expects a list of blocks: [{'page': '...', 'section_key': '...', 'content': '...'}, ...]
        """
        blocks_data = request.data.get('blocks', [])
        if not isinstance(blocks_data, list):
            return Response({'error': 'Expected a list of blocks'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_blocks = []
        for block_data in blocks_data:
            page = block_data.get('page')
            section_key = block_data.get('section_key')
            content = block_data.get('content', '')
            
            if not page or not section_key:
                continue
                
            block, created = ContentBlock.objects.update_or_create(
                page=page,
                section_key=section_key,
                defaults={
                    'content': content,
                    'updated_by': request.user
                }
            )
            updated_blocks.append(block)
            
        serializer = self.get_serializer(updated_blocks, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsContentManager()]

class LearningPlaylistViewSet(viewsets.ModelViewSet):
    queryset = LearningPlaylist.objects.all()
    serializer_class = LearningPlaylistSerializer
    permission_classes = [IsContentManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['enroll', 'unenroll']:
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = CourseEnrollment.objects.get_or_create(user=request.user, course=course)
        if created:
            return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already enrolled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        course = self.get_object()
        CourseEnrollment.objects.filter(user=request.user, course=course).delete()
        # Optionally, delete LessonProgress as well? Usually kept for history.
        return Response({'status': 'unenrolled'}, status=status.HTTP_200_OK)

class LearningEpisodeViewSet(viewsets.ModelViewSet):
    queryset = LearningEpisode.objects.all()
    serializer_class = LearningEpisodeSerializer
    permission_classes = [IsContentManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'complete':
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        episode = self.get_object()
        # Verify enrollment first? For now, let any authenticated user mark complete.
        progress, created = LessonProgress.objects.get_or_create(user=request.user, episode=episode)
        progress.is_completed = True
        progress.save()
        return Response({'status': 'completed'}, status=status.HTTP_200_OK)

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsContentManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'submit':
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        answers_data = request.data.get('answers', {}) # Dict of {question_id: answer_id}
        
        correct_count = 0
        total_questions = quiz.questions.count()
        
        if total_questions == 0:
            return Response({'error': 'No questions in quiz'}, status=status.HTTP_400_BAD_REQUEST)
            
        for question in quiz.questions.all():
            submitted_answer_id = answers_data.get(str(question.id))
            if submitted_answer_id:
                try:
                    answer = QuizAnswer.objects.get(id=submitted_answer_id, question=question)
                    if answer.is_correct:
                        correct_count += 1
                except QuizAnswer.DoesNotExist:
                    pass
                    
        score_percentage = (correct_count / total_questions) * 100
        passed = score_percentage >= quiz.passing_score
        
        # Save attempt
        attempt = UserQuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score_percentage=score_percentage,
            passed=passed
        )
        
        # If passed, automatically mark the episode as completed!
        if passed and quiz.episode:
            LessonProgress.objects.update_or_create(
                user=request.user,
                episode=quiz.episode,
                defaults={'is_completed': True}
            )
            
        return Response({
            'score': score_percentage,
            'passed': passed,
            'correct_count': correct_count,
            'total_questions': total_questions
        })

