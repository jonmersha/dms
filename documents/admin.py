from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django import forms
from .models import Document

class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove uploaded_by from the form since it's auto-set
        if 'uploaded_by' in self.fields:
            del self.fields['uploaded_by']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    form = DocumentForm
    list_display = [
        'title', 
        'get_display_category',
        'audit_period', 
        'quarter', 
        'uploaded_by', 
        'restricted', 
        'created_at', 
        'download_link'
    ]
    
    list_filter = [
        'category', 
        'audit_type',
        'audit_period__fiscal_year', 
        'quarter', 
        'restricted', 
        'created_at'
    ]
    
    search_fields = ['title']
    filter_horizontal = ['allowed_users']
    readonly_fields = ['created_at', 'updated_at', 'uploaded_by', 'download_link']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('title', 'category', 'audit_type', 'audit_period', 'quarter', 'pdf_file')
        }),
        ('Access Control', {
            'fields': ('restricted', 'allowed_users')
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'created_at', 'updated_at', 'download_link'),
            'classes': ('collapse',)
        }),
    )
    
    def get_display_category(self, obj):
        return obj.get_display_category()
    get_display_category.short_description = 'Category/Type'
    
    def download_link(self, obj):
        if obj.pk and obj.pdf_file:
            return format_html(
                '<a href="{}" target="_blank" style="background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; display: inline-block;">📥 Download</a>',
                reverse('admin_document_download', args=[obj.pk])
            )
        return "No file"
    download_link.short_description = "Download"
    
    def save_model(self, request, obj, form, change):
        # Auto-set the uploaded_by field to current user
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        # Show all documents to superusers, only own documents to others
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(uploaded_by=request.user)
    
    def has_change_permission(self, request, obj=None):
        # Allow changes only if user is superuser or document owner
        if obj is not None and not request.user.is_superuser:
            return obj.uploaded_by == request.user
        return super().has_change_permission(request, obj)
    
    def has_delete_permission(self, request, obj=None):
        # Allow deletion only if user is superuser or document owner
        if obj is not None and not request.user.is_superuser:
            return obj.uploaded_by == request.user
        return super().has_delete_permission(request, obj)