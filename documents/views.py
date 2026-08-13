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

from users.models import Department

class DepartmentTeamsView(LoginRequiredMixin, ListView):
    template_name = 'documents/department_teams.html'
    context_object_name = 'teams'
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.department:
            return Department.objects.none()
            
        # Get all sub-departments for the user's department
        sub_depts = user.department.get_all_sub_departments()
        return Department.objects.filter(id__in=[d.id for d in sub_depts if d.level == 'TEAM'])
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add pending document count for each team
        for team in context['teams']:
            team.pending_docs = Document.objects.filter(
                department=team, 
                status='PENDING_APPROVAL',
                is_deleted=False
            ).count()
        return context

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
        status = self.request.GET.get('status')
        owner = self.request.GET.get('owner')
        department = self.request.GET.get('department')

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
        if status:
            queryset = queryset.filter(status=status)
        if owner:
            queryset = queryset.filter(uploaded_by_id=owner)
        if department:
            queryset = queryset.filter(department_id=department)

        # Apply visibility restrictions via centralized manager
        queryset = queryset.accessible_by(self.request.user)

        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add choices for filters
        context['category_choices'] = Document.CATEGORY_CHOICES
        context['audit_type_choices'] = Document.AUDIT_TYPE_CHOICES
        context['quarter_choices'] = Document.QUARTER_CHOICES
        context['audit_periods'] = AuditPeriod.objects.all()
        context['status_choices'] = Document.STATUS_CHOICES
        
        from users.models import Department
        from django.contrib.auth import get_user_model
        User = get_user_model()
        context['departments'] = Department.objects.all()
        context['users'] = User.objects.filter(is_active=True).order_by('username')
        
        # Add statistics
        context['total_documents'] = Document.objects.count()
        context['audit_reports_count'] = Document.objects.filter(category='AUDIT_REPORTS').count()
        context['restricted_count'] = Document.objects.filter(restricted=True).count()
        
        # Add user-specific statistics
        if self.request.user.is_authenticated:
            context['user_uploaded_count'] = Document.objects.filter(uploaded_by=self.request.user).count()
            
            # Count documents accessible to user (public + restricted they have access to)
            context['accessible_count'] = Document.objects.accessible_by(self.request.user).count()
        
        return context

class DocumentCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Document
    template_name = 'documents/document_form.html'
    fields = ['title', 'category', 'audit_type', 'audit_period', 'quarter', 'pdf_file', 'restricted', 'allowed_users', 'allowed_groups', 'allowed_departments']
    success_url = reverse_lazy('documents:document_list')  # FIXED: document_list not document-list
    login_url = '/login/'
    
    def test_func(self):
        # Allow staff or Team Managers to create documents
        return self.request.user.is_staff or getattr(self.request.user, 'role', None) == 'TEAM_MANAGER'
    
    def handle_no_permission(self):
        messages.error(self.request, "You do not have permission to upload documents.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def form_valid(self, form):
        form.instance.uploaded_by = self.request.user
        if not (self.request.user.is_superuser or getattr(self.request.user, 'role', None) in ['CHIEF', 'DIRECTOR']):
            form.instance.status = 'DRAFT'
        response = super().form_valid(form)
        
        from .services import log_document_event
        log_document_event(
            document=self.object,
            user=self.request.user,
            action='CREATED',
            request=self.request,
            comments='Document uploaded and created.'
        )
        
        messages.success(self.request, 'Document uploaded successfully!')
        return response
    
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
    fields = ['title', 'category', 'audit_type', 'audit_period', 'quarter', 'pdf_file', 'restricted', 'allowed_users', 'allowed_groups', 'allowed_departments']
    success_url = reverse_lazy('documents:document_list')  # FIXED: document_list not document-list
    login_url = '/login/'
    
    def test_func(self):
        document = self.get_object()
        if not document.can_edit(self.request.user):
            return False
        # If user can edit, they can only do so if it's DRAFT or RETURNED, unless they are a manager
        if document.status in ['DRAFT', 'RETURNED']:
            return True
        if document.can_manage(self.request.user):
            return True
        return False
    
    def handle_no_permission(self):
        messages.error(self.request, "You don't have permission to edit this document or it is locked for approval.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def form_valid(self, form):
        # Capture old values if we want to diff, though we can just do a simple metadata updated event
        changed_data = form.changed_data
        
        previous_values = {}
        new_values = {}
        for field in changed_data:
            if field not in ['pdf_file', 'allowed_users', 'allowed_groups', 'allowed_departments']:
                previous_values[field] = str(form.initial.get(field, ''))
                new_values[field] = str(form.cleaned_data.get(field, ''))
                
        response = super().form_valid(form)
        
        from .services import log_document_event
        if 'pdf_file' in changed_data:
            log_document_event(
                document=self.object,
                user=self.request.user,
                action='VERSION_CREATED',
                request=self.request,
                comments='New document file uploaded.'
            )
            
        if previous_values or new_values or any(f in changed_data for f in ['allowed_users', 'allowed_groups', 'allowed_departments']):
            log_document_event(
                document=self.object,
                user=self.request.user,
                action='METADATA_UPDATED',
                request=self.request,
                previous_values=previous_values,
                new_values=new_values
            )
            
        messages.success(self.request, 'Document updated successfully!')
        return response
    
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
        return document.can_delete(self.request.user)
    
    def handle_no_permission(self):
        messages.error(self.request, "You don't have permission to hard-delete this document.")
        return redirect('documents:document_list')  # FIXED: document_list not document-list
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Document deleted successfully!')
        return super().delete(request, *args, **kwargs)

class DocumentSubmitView(LoginRequiredMixin, View):
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        if not document.can_edit(request.user):
            return HttpResponseForbidden("You do not have permission to submit this document.")
            
        if document.status not in ['DRAFT', 'RETURNED']:
            messages.error(request, 'Document cannot be submitted from its current status.')
            return redirect('documents:document_detail', pk=pk)
            
        document.status = 'PENDING_APPROVAL'
        document.save()
        
        from .services import log_document_event
        log_document_event(
            document=document,
            user=request.user,
            action='APPROVAL_REQUESTED',
            request=request,
            comments='Submitted for approval.'
        )
        
        messages.success(request, 'Document submitted for approval.')
        return redirect('documents:document_detail', pk=pk)

class DocumentRequestDeletionView(LoginRequiredMixin, View):
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        if not document.can_request_deletion(request.user):
            return HttpResponseForbidden("You do not have permission to request deletion.")
            
        reason = request.POST.get('reason', '')
        document.deletion_requested = True
        document.deletion_reason = reason
        document.save()
        
        from .services import log_document_event
        log_document_event(
            document=document,
            user=request.user,
            action='DELETION_REQUESTED',
            request=request,
            comments=reason
        )
        
        messages.success(request, 'Document deletion requested.')
        return redirect('documents:document_detail', pk=pk)

class DocumentDownloadView(LoginRequiredMixin, View):
    def get(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        if not document.pdf_file:
            raise Http404("Document file not found.")
        
        # Check if user has permission to download using unified logic
        if not document.can_download(request.user):
            if request.user.is_authenticated:
                from .services import log_document_event
                log_document_event(
                    document=document,
                    user=request.user,
                    action='DOWNLOAD_DENIED',
                    request=request,
                    result='DENIED',
                    comments='Unauthorized download attempt.'
                )
            return HttpResponseForbidden("You don't have permission to download this document.")
            
        if request.user.is_authenticated:
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='DOWNLOAD',
                request=request
            )
            
        response = FileResponse(document.pdf_file.open(), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.pdf_file.name)}"'
        return response

def protected_media_view(request, file_path):
    """
    Intercept direct media requests to enforce document permissions.
    """
    from .models import DocumentAccessLog
    
    # Try to find the document by its file path
    document = Document.objects.filter(pdf_file=file_path).first()
    
    if not document:
        # Not a protected document, or doesn't exist
        raise Http404("File not found")
        
    # Check permission using our strict method
    if not document.can_download(request.user):
        if request.user.is_authenticated:
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='DOWNLOAD_DENIED',
                request=request,
                result='DENIED',
                comments='Unauthorized direct media access.'
            )
        return HttpResponseForbidden("You don't have permission to download this document.")
        
    # Allowed
    if request.user.is_authenticated:
        from .services import log_document_event
        log_document_event(
            document=document,
            user=request.user,
            action='DOWNLOAD',
            request=request
        )
        
    response = FileResponse(document.pdf_file.open(), as_attachment=True)
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(document.pdf_file.name)}"'
    return response

def document_download(request, pk):
    document = get_object_or_404(Document, pk=pk)
    
    # Check if user has permission to download using unified logic
    if not document.can_download(request.user):
        if request.user.is_authenticated:
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='DOWNLOAD_DENIED',
                request=request,
                result='DENIED',
                comments='Unauthorized download attempt.'
            )
        return HttpResponseForbidden("You don't have permission to download this document.")
    
    if request.user.is_authenticated:
        from .services import log_document_event
        log_document_event(
            document=document,
            user=request.user,
            action='DOWNLOAD',
            request=request
        )
    
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