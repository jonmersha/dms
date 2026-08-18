with open('apps/lms/models.py', 'r') as f:
    code = f.read()

old_code = """class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    episode = models.ForeignKey(LearningEpisode, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)"""

new_code = """class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    episode = models.ForeignKey(LearningEpisode, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_position = models.IntegerField(default=0, help_text="Last watched position in seconds")"""

if old_code in code:
    code = code.replace(old_code, new_code)
    with open('apps/lms/models.py', 'w') as f:
        f.write(code)

