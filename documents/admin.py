from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        'title', 
        'audit_period', 
        'quarter', 
        'uploaded_by', 
        'restricted', 
        'created_at', 
        'download_link'
    ]
    
    list_filter = ['audit_period__fiscal_year', 'quarter', 'restricted', 'created_at']
    search_fields = ['title']
    filter_horizontal = ['allowed_users']
    readonly_fields = ['created_at', 'download_link']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('title', 'audit_period', 'quarter', 'pdf_file')
        }),
        ('Access Control', {
            'fields': ('restricted', 'allowed_users')
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'created_at', 'download_link'),
            'classes': ('collapse',)
        }),
    )
    
    def download_link(self, obj):
        if obj.pk and obj.pdf_file:
            return format_html(
                '<a href="{}" target="_blank" style="background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; display: inline-block;">📥 Download</a>',
                reverse('admin_document_download', args=[obj.pk])
            )
        return "No file"
    download_link.short_description = "Download"
    
    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)