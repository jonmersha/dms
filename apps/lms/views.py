from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Avg
from .models import (
    LearningPlaylist, LearningEpisode,
    CourseEnrollment, LessonProgress, Quiz, QuizQuestion, QuizAnswer, UserQuizAttempt,
    CertificateSettings
)
from .serializers import (
    LearningPlaylistSerializer, LearningEpisodeSerializer,
    QuizSerializer, CertificateSettingsSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser


class IsContentManager(permissions.BasePermission):
    """
    Custom permission to only allow content managers or superusers to edit.
    Now allows CHIEF, DIRECTOR, and TEAM_MANAGER to create learning courses.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
            
        allowed_roles = ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER']
        
        return (
            request.user.is_superuser or 
            getattr(request.user, 'can_manage_public_content', False) or 
            getattr(request.user, 'is_staff', False) or
            (hasattr(request.user, 'role') and request.user.role in allowed_roles)
        )

class CertificateSettingsViewSet(viewsets.ModelViewSet):
    queryset = CertificateSettings.objects.all()
    serializer_class = CertificateSettingsSerializer
    permission_classes = [IsContentManager]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return CertificateSettings.load()

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


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

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['enroll', 'unenroll']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):
            return
        if obj.created_by == request.user:
            return
        self.permission_denied(request, "You do not have permission to edit or delete this course.")

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

    @action(detail=True, methods=['get'])
    def certificate(self, request, pk=None):
        course = self.get_object()
        
        # Verify 100% completion
        total_episodes = course.episodes.count()
        if total_episodes == 0:
            return Response({'error': 'Course has no episodes'}, status=status.HTTP_400_BAD_REQUEST)
            
        completed_episodes = LessonProgress.objects.filter(
            user=request.user,
            episode__playlist=course,
            is_completed=True
        ).count()
        
        if completed_episodes < total_episodes:
            return Response({'error': 'Course not fully completed'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Generate PDF
        import io
        from django.http import HttpResponse
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import landscape, A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from datetime import date
        from reportlab.lib.utils import ImageReader
        from .models import CertificateSettings
        
        settings = CertificateSettings.load()

        buffer = io.BytesIO()
        width = 16 * inch
        height = 9 * inch
        c = canvas.Canvas(buffer, pagesize=(width, height))
        
        # Background Image
        if settings.background_image:
            try:
                bg_img = ImageReader(settings.background_image.path)
                c.drawImage(bg_img, 0, 0, width=width, height=height, preserveAspectRatio=False, mask='auto')
            except Exception as e:
                print(f"Failed to load background image: {e}")

        # Header
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor('#1E3A8A')) # Blue 900
        c.drawCentredString(width / 2.0, height - 3.2*inch, settings.organization_name or "Coop Bank Internal Audit Excellence Center")
        
        # Motto
        if settings.motto:
            c.setFont("Helvetica-Oblique", 14)
            c.setFillColor(colors.HexColor('#475569')) # Slate 600
            c.drawCentredString(width / 2.0, height - 3.6*inch, settings.motto)
        
        # Title
        c.setFont("Helvetica-Bold", 36)
        c.setFillColor(colors.HexColor('#000000'))
        c.drawCentredString(width / 2.0, height - 4.5*inch, "Certificate of Completion")
        
        # Subtitle
        c.setFont("Helvetica", 16)
        c.drawCentredString(width / 2.0, height - 5.1*inch, "This is to certify that")
        
        # Student Name
        c.setFont("Helvetica-Oblique", 30)
        c.setFillColor(colors.HexColor('#059669'))
        student_name = request.user.get_full_name() or request.user.username
        c.drawCentredString(width / 2.0, height - 5.7*inch, student_name.upper())
        
        # Course Detail
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor('#000000'))
        c.drawCentredString(width / 2.0, height - 6.4*inch, "has successfully completed the course:")
        
        # Course Name
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(width / 2.0, height - 6.9*inch, course.title)
        
        # Tagline
        if settings.tagline:
            c.setFont("Helvetica-Oblique", 12)
            c.setFillColor(colors.HexColor('#64748B')) # Slate 500
            c.drawCentredString(width / 2.0, height - 7.5*inch, settings.tagline)
        
        # Date and Signature
        c.setFont("Helvetica", 12)
        today_str = date.today().strftime("%B %d, %Y")
        c.drawString(2.5*inch, 2.0*inch, f"Date: {today_str}")
        c.line(2.5*inch, 2.2*inch, 4.5*inch, 2.2*inch)
        
        # Signature Line
        auditor_name = settings.chief_auditor_name or "Chief Internal Auditor"
        
        # Signature Image
        if settings.signature_image:
            try:
                sig_img = ImageReader(settings.signature_image.path)
                # Reduced size and centered over the 3-inch line (from width-5.5 to width-2.5)
                c.drawImage(sig_img, width - 4.9*inch, 2.25*inch, width=1.8*inch, height=0.7*inch, preserveAspectRatio=True, mask='auto')
            except Exception as e:
                print(f"Failed to load signature image: {e}")
        else:
            c.setFont("Times-Italic", 20)
            c.setFillColor(colors.HexColor('#0F172A'))
            c.drawString(width - 5.0*inch, 2.3*inch, auditor_name)
        
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.line(width - 5.5*inch, 2.2*inch, width - 2.5*inch, 2.2*inch)
        
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(width - 4.0*inch, 2.0*inch, "Chief Internal Auditor")
        c.setFont("Helvetica", 11)
        c.drawCentredString(width - 4.0*inch, 1.8*inch, auditor_name)
        
        c.showPage()
        c.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate_{course.id}.pdf"'
        return response

    @action(detail=False, methods=['post'])
    def import_youtube_playlist(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        import subprocess
        import json
        import re

        try:
            # Run yt-dlp to get playlist info
            import sys
            result = subprocess.run(
                [sys.executable, '-m', 'yt_dlp', '--flat-playlist', '--dump-json', url],
                capture_output=True,
                text=True,
                check=True
            )
            
            videos = []
            for line in result.stdout.splitlines():
                if line.strip():
                    videos.append(json.loads(line))
                    
            if not videos:
                return Response({'error': 'No videos found in playlist'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Try to get playlist title from URL or metadata
            match = re.search(r'list=([a-zA-Z0-9_-]+)', url)
            playlist_id = match.group(1) if match else 'Unknown'
            
            # Create playlist
            playlist, created = LearningPlaylist.objects.get_or_create(
                playlist_id=playlist_id,
                defaults={
                    'title': f"Imported Playlist {playlist_id}",
                    'description': "Course imported from YouTube.",
                    'main_url': videos[0].get('url', ''),
                    'order': 10,
                    'created_by': request.user
                }
            )
            
            if not created:
                playlist.episodes.all().delete()
                # Also update creator if someone else re-imports?
                # Maybe leave creator as is.
                
            order = 1
            chunk_size = 10
            subsection_num = 1

            for i in range(0, len(videos), chunk_size):
                chunk = videos[i:i + chunk_size]
                
                # Add video episodes
                for video in chunk:
                    LearningEpisode.objects.create(
                        playlist=playlist,
                        title=f"Section {subsection_num}: {video.get('title', 'Video')}",
                        content_type='video',
                        video_url=video.get('url', ''),
                        order=order
                    )
                    order += 1

                # Add subsection quiz
                quiz_episode = LearningEpisode.objects.create(
                    playlist=playlist,
                    title=f"Subsection {subsection_num} Quiz",
                    content_type='quiz',
                    content_text=f"Test your knowledge on Subsection {subsection_num}",
                    order=order
                )
                order += 1

                quiz = Quiz.objects.create(
                    episode=quiz_episode,
                    title=f"Quiz: Subsection {subsection_num}",
                    description=f"5 questions covering Subsection {subsection_num} topics.",
                    passing_score=80
                )

                for q_num in range(1, 6): # Max 5 questions
                    question = QuizQuestion.objects.create(
                        quiz=quiz,
                        text=f"Sample Question {q_num} for Subsection {subsection_num}?",
                        order=q_num
                    )
                    for a_num, is_correct in [(1, True), (2, False), (3, False), (4, False)]:
                        QuizAnswer.objects.create(
                            question=question,
                            text=f"Option {a_num}",
                            is_correct=is_correct
                        )
                
                subsection_num += 1

            # Add final quiz with 10 questions
            final_quiz_episode = LearningEpisode.objects.create(
                playlist=playlist,
                title="Final Course Assessment",
                content_type='quiz',
                content_text="Final assessment covering all topics.",
                order=order
            )

            final_quiz = Quiz.objects.create(
                episode=final_quiz_episode,
                title="Final Assessment",
                description="10 questions covering the entire course.",
                passing_score=80
            )

            for q_num in range(1, 11):
                question = QuizQuestion.objects.create(
                    quiz=final_quiz,
                    text=f"Final Assessment Question {q_num}?",
                    order=q_num
                )
                for a_num, is_correct in [(1, False), (2, True), (3, False), (4, False)]:
                    QuizAnswer.objects.create(
                        question=question,
                        text=f"Option {a_num}",
                        is_correct=is_correct
                    )

            return Response({'status': 'success', 'playlist_id': playlist.id})
            
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            return Response({'error': f'Failed to fetch playlist: {error_msg}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LearningEpisodeViewSet(viewsets.ModelViewSet):
    queryset = LearningEpisode.objects.all()
    serializer_class = LearningEpisodeSerializer
    permission_classes = [IsContentManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['complete', 'save_progress']:
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]
        
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['complete', 'save_progress']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):
            return
        if obj.playlist.created_by == request.user:
            return
        self.permission_denied(request, "You do not have permission to edit or delete this episode.")

    def perform_create(self, serializer):
        episode = serializer.save()
        if episode.content_type == 'quiz' and not hasattr(episode, 'quiz'):
            Quiz.objects.create(
                episode=episode,
                title=f"Quiz for {episode.title}",
                description="Please update this quiz description.",
                passing_score=80
            )
            
    def perform_update(self, serializer):
        episode = serializer.save()
        if episode.content_type == 'quiz' and not hasattr(episode, 'quiz'):
            Quiz.objects.create(
                episode=episode,
                title=f"Quiz for {episode.title}",
                description="Please update this quiz description.",
                passing_score=80
            )


    @action(detail=True, methods=['post'])
    def save_progress(self, request, pk=None):
        episode = self.get_object()
        position = request.data.get('position', 0)
        try:
            position = int(float(position))
        except ValueError:
            return Response({'error': 'Invalid position'}, status=status.HTTP_400_BAD_REQUEST)
            
        progress, created = LessonProgress.objects.get_or_create(user=request.user, episode=episode)
        progress.last_position = position
        progress.save()
        
        return Response({'status': 'saved', 'position': position})

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
        
    def get_serializer_class(self):
        if self.request and self.request.user and self.request.user.is_authenticated and (self.request.user.is_superuser or self.request.user.can_manage_public_content):
            if self.action in ['retrieve', 'list', 'admin_details', 'update', 'partial_update', 'create']:
                from .serializers import AdminQuizSerializer
                return AdminQuizSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['get'])
    def admin_details(self, request, pk=None):
        quiz = self.get_object()
        from .serializers import AdminQuizSerializer
        serializer = AdminQuizSerializer(quiz)
        return Response(serializer.data)
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['enroll', 'unenroll']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):
            return
        if obj.episode and obj.episode.playlist.created_by == request.user:
            return
        self.permission_denied(request, "You do not have permission to edit or delete this quiz.")

class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    permission_classes = [IsContentManager]
    from .serializers import AdminQuizQuestionSerializer
    serializer_class = AdminQuizQuestionSerializer

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['enroll', 'unenroll']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):
            return
        if obj.quiz.episode and obj.quiz.episode.playlist.created_by == request.user:
            return
        self.permission_denied(request, "You do not have permission to edit or delete this question.")

class QuizAnswerViewSet(viewsets.ModelViewSet):
    queryset = QuizAnswer.objects.all()
    permission_classes = [IsContentManager]
    from .serializers import AdminQuizAnswerSerializer
    serializer_class = AdminQuizAnswerSerializer

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['enroll', 'unenroll']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):
            return
        if obj.question.quiz.episode and obj.question.quiz.episode.playlist.created_by == request.user:
            return
        self.permission_denied(request, "You do not have permission to edit or delete this answer.")

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


class LearningMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from users.models import User
        
        if user.department:
            dept_users = User.objects.filter(department=user.department)
        else:
            dept_users = User.objects.filter(id=user.id)

        # 1. Total Courses
        total_courses = LearningPlaylist.objects.filter(created_by__in=dept_users).count()
        if total_courses == 0: 
            total_courses = LearningPlaylist.objects.count()

        # 2. Employees Trained
        trained_employees = LessonProgress.objects.filter(
            user__in=dept_users,
            is_completed=True
        ).values('user').distinct().count()

        # 3. Average Completion
        enrollments = CourseEnrollment.objects.filter(user__in=dept_users)
        total_completion_percentage = 0
        if enrollments.exists():
            for e in enrollments:
                total_episodes = LearningEpisode.objects.filter(playlist=e.course).count()
                if total_episodes > 0:
                    completed_eps = LessonProgress.objects.filter(
                        user=e.user,
                        episode__playlist=e.course,
                        is_completed=True
                    ).count()
                    total_completion_percentage += (completed_eps / total_episodes) * 100
            avg_completion = total_completion_percentage / enrollments.count()
        else:
            avg_completion = 0

        # 4. Learning Hours (assumes 1 hr per lesson)
        completed_lessons = LessonProgress.objects.filter(
            user__in=dept_users,
            is_completed=True
        ).count()
        learning_hours = completed_lessons * 1

        return Response({
            'total_courses': total_courses,
            'employees_trained': trained_employees,
            'avg_completion': round(avg_completion, 1),
            'learning_hours': learning_hours
        })
