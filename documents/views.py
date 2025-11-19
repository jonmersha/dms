from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, Http404, FileResponse, HttpResponseForbidden
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.urls import reverse_lazy
from django.utils.text import slugify
from django.db.models import Q
import os
from .models import Document, AuditPeriod

def staff_required(function=None):
    """Decorator to check if user is staff member"""
    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and u.is_staff,
        login_url='/login/',
        redirect_field_name='next'
    )
    if function:
        return actual_decorator(function)
    return actual_decorator

class DocumentListView(ListView):
    model = Document
    template_name = 'documents/document-list.html'
    context_object_name = 'documents'
    paginate_by = 12

    def get_queryset(self):
        queryset = super().get_queryset().select_related('audit_period', 'uploaded_by')
        
        # Get filter parameters from request
        category = self.request.GET.get('category')
        audit_type = self.request.GET.get('audit_type')
        audit_period = self.request.GET.get('audit_period')
        quarter = self.request.GET.get('quarter')
        restricted = self.request.GET.get('restricted')
        date_from = self.request.GET.get('date_from')
        date_to = self.request.GET.get('date_to')
        search = self.request.GET.get('search')

        # Apply filters
        if category:
            queryset = queryset.filter(category=category)
        if audit_type:
            queryset = queryset.filter(audit_type=audit_type)
        if audit_period:
            queryset = queryset.filter(audit_period_id=audit_period)
        if quarter:
            queryset = queryset.filter(quarter=quarter)
        if restricted:
            if restricted == 'true':
                queryset = queryset.filter(restricted=True)
            elif restricted == 'false':
                queryset = queryset.filter(restricted=False)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add choices for filters
        context['category_choices'] = Document.CATEGORY_CHOICES
        context['audit_type_choices'] = Document.AUDIT_TYPE_CHOICES
        context['quarter_choices'] = Document.QUARTER_CHOICES
        context['audit_periods'] = AuditPeriod.objects.all()
        
        # Add statistics
        context['total_documents'] = Document.objects.count()
        context['audit_reports_count'] = Document.objects.filter(category='AUDIT_REPORTS').count()
        context['restricted_count'] = Document.objects.filter(restricted=True).count()
        
        # Add user-specific statistics
        if self.request.user.is_authenticated:
            context['user_uploaded_count'] = Document.objects.filter(uploaded_by=self.request.user).count()
            
            # Count documents accessible to user (public + restricted they have access to)
            accessible_docs = Document.objects.filter(
                Q(restricted=False) |
                Q(restricted=True, allowed_users=self.request.user) |
                Q(restricted=True, uploaded_by=self.request.user) |
                Q(restricted=True) & Q(uploaded_by__is_superuser=True)
            ).distinct().count()
            context['user_accessible_count'] = accessible_docs
        
        return context

class DocumentCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Document
    template_name = 'documents/document_form.html'
    fields = ['title', 'category', 'audit_type', 'audit_period', 'quarter', 'pdf_file', 'restricted', 'allowed_users']
    success_url = reverse_lazy('documents:document_list')  # FIXED: document_list not document-list
    login_url = '/login/'
    
    def test_func(self):
        # Only allow staff members to create documents
        return self.request.user.is_staff
    
    def handle_no_permission(self):
        messages.error(self.request, "Only staff members can upload documents.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def form_valid(self, form):
        form.instance.uploaded_by = self.request.user
        messages.success(self.request, 'Document uploaded successfully!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['audit_periods'] = AuditPeriod.objects.filter(is_active=True)
        return context
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['allowed_users'].queryset = form.fields['allowed_users'].queryset.exclude(
            id=self.request.user.id
        )
        return form

class DocumentUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Document
    template_name = 'documents/document_form.html'
    fields = ['title', 'category', 'audit_type', 'audit_period', 'quarter', 'pdf_file', 'restricted', 'allowed_users']
    success_url = reverse_lazy('documents:document_list')  # FIXED: document_list not document-list
    login_url = '/login/'
    
    def test_func(self):
        # Only allow document owner (who must be staff) or superuser to edit
        document = self.get_object()
        return self.request.user.is_staff and (document.uploaded_by == self.request.user or self.request.user.is_superuser)
    
    def handle_no_permission(self):
        messages.error(self.request, "You don't have permission to edit this document.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def form_valid(self, form):
        messages.success(self.request, 'Document updated successfully!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['audit_periods'] = AuditPeriod.objects.filter(is_active=True)
        return context
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['allowed_users'].queryset = form.fields['allowed_users'].queryset.exclude(
            id=self.request.user.id
        )
        return form

class DocumentDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Document
    template_name = 'documents/document_confirm_delete.html'
    success_url = reverse_lazy('documents:document_list')  # FIXED: document_list not document-list
    login_url = '/login/'
    
    def test_func(self):
        # Only allow document owner (who must be staff) or superuser to delete
        document = self.get_object()
        return self.request.user.is_staff and (document.uploaded_by == self.request.user or self.request.user.is_superuser)
    
    def handle_no_permission(self):
        messages.error(self.request, "You don't have permission to delete this document.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Document deleted successfully!')
        return super().delete(request, *args, **kwargs)

class DocumentDownloadView(LoginRequiredMixin, View):
    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        
        # Check if user has permission to download
        if not document.can_download(request.user):
            return HttpResponseForbidden("You don't have permission to download this document.")
        
        # Serve the file
        response = FileResponse(document.pdf_file.open(), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.pdf_file.name)}"'
        return response

def document_download(request, pk):
    document = get_object_or_404(Document, pk=pk)
    
    # Check if user has permission to download
    if document.restricted:
        if not request.user.is_authenticated:
            return HttpResponseForbidden("Authentication required.")
        if (not request.user.is_superuser and 
            request.user != document.uploaded_by and 
            not document.allowed_users.filter(id=request.user.id).exists()):
            return HttpResponseForbidden("You don't have permission to download this document.")
    
    # Serve the file
    response = FileResponse(document.pdf_file.open(), as_attachment=True)
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.pdf_file.name)}"'
    return response

@login_required(login_url='/login/')
def document_download_admin(request, pk):
    """Admin download view - no permission checks for admin access"""
    document = get_object_or_404(Document, pk=pk)
    
    if not document.pdf_file:
        raise Http404("Document file not found.")
    
    response = HttpResponse(document.pdf_file, content_type='application/pdf')
    filename = f"{slugify(document.title)}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response