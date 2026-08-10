from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
import os
from .models import Document, TemporaryAccess, DocumentAuditLog
from .serializers import DocumentSerializer, TemporaryAccessSerializer
from .permissions import CanViewDocument, CanEditDocument, CanManageDocument, CanDeleteDocument, CanDownloadDocument
from .services.audit_service import log_document_event

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.accessible_by(user).select_related('department', 'uploaded_by').prefetch_related('versions')
        
        # Filtering
        department_id = self.request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
            
        team_id = self.request.query_params.get('team')
        if team_id:
            queryset = queryset.filter(team_id=team_id)
            
        doc_status = self.request.query_params.get('status')
        if doc_status:
            queryset = queryset.filter(status=doc_status)
            
        owner_id = self.request.query_params.get('owner')
        if owner_id:
            queryset = queryset.filter(uploaded_by_id=owner_id)
            
        return queryset

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), CanEditDocument()]
        if self.action == 'destroy':
            return [IsAuthenticated(), CanDeleteDocument()]
        if self.action == 'retrieve':
            return [IsAuthenticated(), CanViewDocument()]
        return super().get_permissions()

    def perform_create(self, serializer):
        user = self.request.user
        doc = serializer.save(
            uploaded_by=user,
            department=user.department,
            team=user.team
        )
        if user.role in ['CHIEF', 'DIRECTOR']:
            doc.status = 'APPROVED'
            doc.save()
        log_document_event(
            user=user,
            action='CREATED',
            document=doc,
            result='SUCCESS',
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT')
        )

    def perform_update(self, serializer):
        user = self.request.user
        doc = self.get_object()
        
        old_values = {
            'title': doc.title,
            'description': doc.description,
            'document_type': doc.document_type,
            'category': doc.category,
        }
        
        updated_doc = serializer.save()
        
        new_values = {
            'title': updated_doc.title,
            'description': updated_doc.description,
            'document_type': updated_doc.document_type,
            'category': updated_doc.category,
        }
        
        log_document_event(
            user=user,
            action='METADATA_UPDATED',
            document=updated_doc,
            result='SUCCESS',
            previous_values=old_values,
            new_values=new_values,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT')
        )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, CanDownloadDocument])
    def download(self, request, pk=None):
        document = self.get_object()
        
        # Determine which file to serve
        version_id = request.query_params.get('version')
        if version_id:
            version = get_object_or_404(document.versions.all(), id=version_id)
            file_path = version.pdf_file.path
        else:
            file_path = document.pdf_file.path
            
        if not os.path.exists(file_path):
            raise Http404("Document file not found.")
            
        log_document_event(
            user=request.user,
            action='DOWNLOAD',
            document=document,
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
            
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        return response

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanEditDocument])
    def submit(self, request, pk=None):
        document = self.get_object()
        if document.status not in ['DRAFT', 'RETURNED']:
            return Response({'error': 'Document cannot be submitted'}, status=status.HTTP_400_BAD_REQUEST)
            
        document.status = 'PENDING_APPROVAL'
        document.save()
        
        log_document_event(
            user=request.user,
            action='APPROVAL_REQUESTED',
            document=document,
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({'status': 'submitted'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManageDocument])
    def approve(self, request, pk=None):
        document = self.get_object()
        action_type = request.data.get('action')
        comments = request.data.get('comments', '')
        
        if document.status != 'PENDING_APPROVAL':
            return Response({'error': 'Document not pending approval'}, status=status.HTTP_400_BAD_REQUEST)
            
        if action_type == 'APPROVE':
            document.status = 'APPROVED'
            log_action = 'APPROVED'
        elif action_type == 'REJECT':
            document.status = 'REJECTED'
            log_action = 'REJECTED'
        elif action_type == 'RETURN':
            document.status = 'RETURNED'
            log_action = 'RETURNED_FOR_CORRECTION'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
        document.save()
        
        log_document_event(
            user=request.user,
            action=log_action,
            document=document,
            comments=comments,
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({'status': document.status})

    @action(detail=True, methods=['post'])
    def request_deletion(self, request, pk=None):
        document = self.get_object()
        # Custom permission check inside action since it uses a model method
        if not document.can_request_deletion(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        reason = request.data.get('reason', '')
        if not reason:
            return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        document.deletion_requested = True
        document.deletion_reason = reason
        document.save()
        
        log_document_event(
            user=request.user,
            action='DELETION_REQUESTED',
            document=document,
            comments=f"Reason: {reason}",
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({'status': 'deletion_requested'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManageDocument])
    def review_deletion(self, request, pk=None):
        document = self.get_object()
        action_type = request.data.get('action')
        
        if not document.deletion_requested:
            return Response({'error': 'No deletion requested'}, status=status.HTTP_400_BAD_REQUEST)
            
        if action_type == 'APPROVE':
            document.is_deleted = True
            document.deletion_requested = False
            log_action = 'DELETION_APPROVED'
        elif action_type == 'REJECT':
            document.deletion_requested = False
            document.deletion_reason = ''
            log_action = 'DELETION_REJECTED'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
        document.save()
        
        log_document_event(
            user=request.user,
            action=log_action,
            document=document,
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({'status': document.is_deleted})

class TemporaryAccessViewSet(viewsets.ModelViewSet):
    serializer_class = TemporaryAccessSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['CHIEF', 'DIRECTOR']:
            if user.role == 'CHIEF':
                return TemporaryAccess.objects.all()
            return TemporaryAccess.objects.filter(document__department=user.department)
        return TemporaryAccess.objects.none()

    def create(self, request):
        doc_id = request.data.get('document')
        document = get_object_or_404(Document, pk=doc_id)
        if not document.can_manage(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        grant = serializer.save(granted_by=request.user)
        
        log_document_event(
            user=request.user,
            action='ACCESS_GRANTED',
            document=document,
            comments=f"Granted to {grant.user.username} until {grant.expires_at}",
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        grant = self.get_object()
        if not grant.document.can_manage(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        reason = request.data.get('reason', '')
        grant.status = 'REVOKED'
        grant.save()
        
        log_document_event(
            user=request.user,
            action='ACCESS_REVOKED',
            document=grant.document,
            comments=f"Revoked access for {grant.user.username}. Reason: {reason}",
            result='SUCCESS',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        return Response({'status': 'revoked'})
