from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.text import slugify
from .models import Document

class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = 'documents/document_list.html'
    context_object_name = 'documents'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Filter by audit period if provided
        audit_period = self.request.GET.get('audit_period')
        if audit_period:
            queryset = queryset.filter(audit_period__fiscal_year=audit_period)
        
        # Filter by quarter if provided
        quarter = self.request.GET.get('quarter')
        if quarter:
            queryset = queryset.filter(quarter=quarter)
        
        # Only show documents user can access
        accessible_docs = []
        for doc in queryset:
            if doc.can_download(self.request.user):
                accessible_docs.append(doc.id)
        
        return Document.objects.filter(id__in=accessible_docs).select_related('audit_period', 'uploaded_by')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['audit_periods'] = Document.objects.values_list(
            'audit_period__fiscal_year', flat=True
        ).distinct()
        context['quarters'] = Document.QUARTER_CHOICES
        return context

class DocumentDownloadView(LoginRequiredMixin, ListView):
    model = Document
    
    def get(self, request, *args, **kwargs):
        document = get_object_or_404(Document, pk=kwargs['pk'])
        
        # Check if user can download
        if not document.can_download(request.user):
            raise Http404("You don't have permission to download this document.")
        
        return self.serve_document(document)
    
    def serve_document(self, document):
        """Serve the document file for download"""
        if not document.pdf_file:
            raise Http404("Document file not found.")
        
        response = HttpResponse(document.pdf_file, content_type='application/pdf')
        filename = f"{slugify(document.title)}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

def document_download_admin(request, pk):
    """Admin download view - no permission checks for admin access"""
    document = get_object_or_404(Document, pk=pk)
    
    if not document.pdf_file:
        raise Http404("Document file not found.")
    
    response = HttpResponse(document.pdf_file, content_type='application/pdf')
    filename = f"{slugify(document.title)}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response