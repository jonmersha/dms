from django.contrib import admin
from .models import (
    LearningPlaylist, LearningEpisode, Quiz, QuizQuestion, QuizAnswer, 
    CourseEnrollment, LessonProgress, UserQuizAttempt, CertificateSettings
)

admin.site.register(LearningPlaylist)
admin.site.register(LearningEpisode)
admin.site.register(Quiz)
admin.site.register(QuizQuestion)
admin.site.register(QuizAnswer)
admin.site.register(CourseEnrollment)
admin.site.register(LessonProgress)
admin.site.register(UserQuizAttempt)

@admin.register(CertificateSettings)
class CertificateSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'chief_auditor_name', 'organization_name')

    def has_add_permission(self, request):
        # We only want one settings instance, prevent creating more
        if CertificateSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False
