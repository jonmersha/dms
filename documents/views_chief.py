from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, Http404, FileResponse, HttpResponseForbidden, JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, View, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.urls import reverse_lazy
from django.utils import timezone
from .models import Document, DocumentAuditLog, TemporaryAccess, DocumentVersion

class ManagerRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        # We will override this in the views that have access to the document object
        # or we just rely on explicit checks inside the view methods.
        return self.request.user.is_authenticated

class DocumentDetailView(LoginRequiredMixin, UserPassesTestMixin, DetailView):
    model = Document
    template_name = 'documents/document_detail.html'
    context_object_name = 'document'
    
    def test_func(self):
        document = self.get_object()
        return Document.objects.filter(id=document.id).accessible_by(self.request.user).exists()
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        document = self.get_object()
        context['versions'] = document.versions.all()
        
        context['can_manage'] = document.can_manage(self.request.user)
        context['can_edit'] = document.can_edit(self.request.user)
        
        if context['can_manage'] or context['can_edit']:
            context['audit_logs'] = document.audit_logs.all()
            
        if context['can_manage']:
            context['temporary_accesses'] = document.temporary_accesses.all()
            
        from .services import log_document_event
        log_document_event(
            document=document,
            user=self.request.user,
            action='VIEW',
            request=self.request,
            comments='Document details viewed.'
        )
        return context

class DocumentDeletionReviewView(LoginRequiredMixin, View):
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        if not document.can_manage(request.user):
            return HttpResponseForbidden("You do not have permission to manage this document.")
            
        action = request.POST.get('action')
        
        if action == 'APPROVE':
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='PERMANENT_DELETION',
                request=request,
                comments='Document permanently deleted.'
            )
            document.delete()
            messages.success(request, 'Document permanently deleted.')
        elif action == 'REJECT':
            document.deletion_requested = False
            document.is_deleted = False
            document.save()
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='DELETION_REJECTED',
                request=request,
                comments='Deletion request rejected.'
            )
            messages.success(request, 'Deletion request rejected.')
            
        return redirect('documents:document_list')

class TemporaryAccessManageView(LoginRequiredMixin, View):
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        if not document.can_manage(request.user):
            return HttpResponseForbidden("You do not have permission to manage this document.")
            
        action = request.POST.get('action')
        
        if action == 'GRANT':
            user_id = request.POST.get('user_id')
            start_date_str = request.POST.get('start_date')
            days = int(request.POST.get('days', 1))
            can_view = request.POST.get('can_view') == 'on'
            can_download = request.POST.get('can_download') == 'on'
            can_print = request.POST.get('can_print') == 'on'
            reason = request.POST.get('reason', '')
            
            start_date = timezone.now()
            if start_date_str:
                from django.utils.dateparse import parse_datetime
                parsed = parse_datetime(start_date_str)
                if parsed:
                    start_date = parsed
                    
            access = TemporaryAccess.objects.create(
                document=document,
                user_id=user_id,
                granted_by=request.user,
                start_date=start_date,
                expires_at=start_date + timezone.timedelta(days=days),
                can_view=can_view,
                can_download=can_download,
                can_print=can_print,
                reason=reason,
                status='ACTIVE'
            )
            
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='AUTHORIZATION_GRANTED',
                request=request,
                comments=f"Granted access to user {user_id}. Reason: {reason}"
            )
            messages.success(request, 'Temporary access granted.')
            
        elif action == 'REVOKE':
            access_id = request.POST.get('access_id')
            revocation_reason = request.POST.get('revocation_reason', '')
            
            access = get_object_or_404(TemporaryAccess, id=access_id)
            access.status = 'REVOKED'
            access.revoked_at = timezone.now()
            access.revoked_by = request.user
            access.revocation_reason = revocation_reason
            access.save()
            
            from .services import log_document_event
            log_document_event(
                document=document,
                user=request.user,
                action='AUTHORIZATION_REVOKED',
                request=request,
                comments=f"Revoked access ID {access_id}. Reason: {revocation_reason}"
            )
            messages.success(request, 'Temporary access revoked.')
            
        return redirect('documents:document_detail', pk=pk)

class DocumentApprovalView(LoginRequiredMixin, View):
    def post(self, request, pk):
        document = get_object_or_404(Document, pk=pk)
        
        if not document.can_manage(request.user):
            return HttpResponseForbidden("You do not have permission to manage this document.")
            
        action = request.POST.get('action')
        comments = request.POST.get('comments', '')
        
        if action == 'APPROVE':
            document.status = 'APPROVED'
            log_action = 'APPROVED'
            messages.success(request, 'Document approved successfully.')
        elif action == 'REJECT':
            document.status = 'REJECTED'
            log_action = 'REJECTED'
            messages.success(request, 'Document rejected.')
        elif action == 'RETURN':
            document.status = 'RETURNED'
            log_action = 'RETURNED_FOR_CORRECTION'
            messages.success(request, 'Document returned for correction.')
        else:
            return HttpResponseForbidden("Invalid action.")
            
        document.save()
        
        from .services import log_document_event
        log_document_event(
            document=document,
            user=request.user,
            action=log_action,
            request=request,
            comments=comments
        )
        
        return redirect('documents:document_detail', pk=pk)
