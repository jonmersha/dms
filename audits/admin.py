from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import AuditPeriod

@admin.register(AuditPeriod)
class AuditPeriodAdmin(admin.ModelAdmin):
    list_display = [
        'fiscal_year', 
        'start_date', 
        'end_date', 
        'is_active', 
        'document_count',
        'duration_days'
    ]
    
    list_filter = ['is_active', 'start_date']
    search_fields = ['fiscal_year']
    list_editable = ['is_active']
    readonly_fields = ['document_count', 'duration_days']
    
    fieldsets = (
        ('Fiscal Year Information', {
            'fields': ('fiscal_year', 'is_active')
        }),
        ('Date Range', {
            'fields': ('start_date', 'end_date', 'duration_days')
        }),
    )
    
    def document_count(self, obj):
        count = obj.documents.count()
        url = (
            reverse("admin:documents_document_changelist") 
            + f"?audit_period__id__exact={obj.id}"
        )
        return format_html('<a href="{}">{}</a>', url, f"{count} documents")
    document_count.short_description = 'Documents'
    
    def duration_days(self, obj):
        if obj.start_date and obj.end_date:
            delta = obj.end_date - obj.start_date
            return f"{delta.days} days"
        return "N/A"
    duration_days.short_description = 'Duration'
    
    def save_model(self, request, obj, form, change):
        # You can track who created/modified audit periods if needed
        super().save_model(request, obj, form, change)