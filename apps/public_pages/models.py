from django.db import models
from django.conf import settings

class ContentBlock(models.Model):
    page = models.CharField(max_length=100, db_index=True)
    section_key = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='updated_content_blocks')

    class Meta:
        unique_together = ('page', 'section_key')
        ordering = ['page', 'section_key']

    def __str__(self):
        return f"{self.page} - {self.section_key}"


