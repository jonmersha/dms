from django.db import models
from django.conf import settings

class LearningPlaylist(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    main_url = models.URLField(max_length=500, help_text="The main iframe src URL for the playlist or video")
    playlist_id = models.CharField(max_length=100, blank=True, help_text="YouTube Playlist ID for fetching episodes")
    order = models.IntegerField(default=0, help_text="Order in which playlists appear on the page")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_playlists')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        db_table = 'public_pages_learningplaylist' # Preserve old data

    def __str__(self):
        return self.title

class LearningEpisode(models.Model):
    CONTENT_TYPE_CHOICES = (
        ('video', 'Video Only'),
        ('text', 'Text Only'),
        ('mixed', 'Video and Text'),
        ('quiz', 'Quiz'),
    )
    
    playlist = models.ForeignKey(LearningPlaylist, on_delete=models.CASCADE, related_name='episodes')
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPE_CHOICES, default='video')
    video_url = models.URLField(max_length=500, blank=True, help_text="YouTube URL if applicable")
    content_text = models.TextField(blank=True, help_text="Text content or instructions")
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
        db_table = 'public_pages_learningepisode' # Preserve old data

    def __str__(self):
        return f"{self.playlist.title} - {self.title}"


# LMS Feature Models
class CourseEnrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(LearningPlaylist, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-enrolled_at']
        db_table = 'public_pages_courseenrollment'

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    episode = models.ForeignKey(LearningEpisode, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_position = models.IntegerField(default=0, help_text="Last watched position in seconds")

    class Meta:
        unique_together = ('user', 'episode')
        db_table = 'public_pages_lessonprogress'

    def __str__(self):
        return f"{self.user.username} - {self.episode.title} - {'Completed' if self.is_completed else 'In Progress'}"

class Quiz(models.Model):
    episode = models.OneToOneField(LearningEpisode, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    passing_score = models.IntegerField(default=70, help_text="Percentage required to pass")

    class Meta:
        db_table = 'public_pages_quiz'

    def __str__(self):
        return f"Quiz for: {self.episode.title}"

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        db_table = 'public_pages_quizquestion'

    def __str__(self):
        return self.text

class QuizAnswer(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'public_pages_quizanswer'

    def __str__(self):
        return self.text

class UserQuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score_percentage = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'public_pages_userquizattempt'

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - Score: {self.score_percentage}%"

class CertificateSettings(models.Model):
    background_image = models.ImageField(upload_to='certificates/', blank=True, null=True, help_text="Background artistic image for certificates")
    signature_image = models.ImageField(upload_to='certificates/', blank=True, null=True, help_text="Signature image for Chief Internal Auditor")
    chief_auditor_name = models.CharField(max_length=255, default="Chief Internal Auditor")
    organization_name = models.CharField(max_length=255, default="Coop Bank Internal Audit Excellence Center")
    motto = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. Excellence in Auditing")
    tagline = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. Empowering Trust")

    class Meta:
        db_table = 'public_pages_certificatesettings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass # Prevent deletion

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Certificate Settings"
