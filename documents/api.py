from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
import os
from django.utils import timezone
from .models import Document, TemporaryAccess, DocumentAuditLog, BackupOperation, Announcement
from .serializers import DocumentSerializer, TemporaryAccessSerializer, BackupOperationSerializer, AnnouncementSerializer
from rest_framework.exceptions import PermissionDenied
from .permissions import CanViewDocument, CanEditDocument, CanManageDocument, CanDeleteDocument, CanDownloadDocument
from .services.audit_service import log_document_event
from .services.backup_service import BackupService
from .services.restore_service import RestoreService
import threading
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model

User = get_user_model()

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'draft': qs.filter(status='DRAFT').count(),
            'pending': qs.filter(status='PENDING_APPROVAL').count(),
            'approved': qs.filter(status='APPROVED').count(),
            'returned': qs.filter(status='RETURNED').count(),
            'deletion_requested': qs.filter(deletion_requested=True).count(),
        })

    @action(detail=False, methods=['get'])
    def chief_stats(self, request):
        if getattr(request.user, 'role', None) != 'CHIEF':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        from django.db.models import Count
        qs = Document.objects.all()
        
        dept_stats = qs.values('department__name').annotate(count=Count('id'))
        cat_stats = qs.values('category').annotate(count=Count('id'))
        recent_activity = DocumentAuditLog.objects.all().order_by('-timestamp')[:10]
        
        from .serializers import DocumentAuditLogSerializer
        return Response({
            'by_department': [{'name': d['department__name'] or 'Unassigned', 'value': d['count']} for d in dept_stats],
            'by_category': [{'name': d['category'], 'value': d['count']} for d in cat_stats],
            'recent_activity': DocumentAuditLogSerializer(recent_activity, many=True).data
        })

    @action(detail=False, methods=['get'])
    def chief_action_items(self, request):
        if getattr(request.user, 'role', None) != 'CHIEF':
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        from .serializers import DocumentSerializer, TemporaryAccessSerializer
        from users.models import Department
        from django.db.models import Count, Q
        
        pending_docs = Document.objects.filter(status='PENDING_APPROVAL').order_by('-updated_at')
        deletion_reqs = Document.objects.filter(deletion_requested=True).order_by('-updated_at')
        access_reqs = TemporaryAccess.objects.filter(status='PENDING').order_by('-created_at')
        
        departments = Department.objects.annotate(
            total_docs=Count('documents'),
            pending_docs=Count('documents', filter=Q(documents__status='PENDING_APPROVAL')),
            approved_docs=Count('documents', filter=Q(documents__status='APPROVED'))
        ).values('id', 'name', 'level', 'total_docs', 'pending_docs', 'approved_docs')
        
        return Response({
            'pending_documents': DocumentSerializer(pending_docs, many=True, context={'request': request}).data,
            'deletion_requests': DocumentSerializer(deletion_reqs, many=True, context={'request': request}).data,
            'access_requests': TemporaryAccessSerializer(access_reqs, many=True, context={'request': request}).data,
            'departments_overview': list(departments)
        })

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
            department=user.department
        )
        if user.role in ['CHIEF', 'DIRECTOR']:
            doc.status = 'APPROVED'
            doc.save()
        log_document_event(
            user=user,
            action='CREATED',
            document=doc,
            result='SUCCESS',
            request=self.request
        )

    def perform_update(self, serializer):
        user = self.request.user
        doc = self.get_object()
        
        old_values = {
            'title': doc.title,
            'category': doc.category,
        }
        
        has_new_file = 'pdf_file' in self.request.FILES
        
        updated_doc = serializer.save()
        
        if has_new_file:
            from .models import DocumentVersion
            version_number = updated_doc.versions.count() + 1
            DocumentVersion.objects.create(
                document=updated_doc,
                pdf_file=updated_doc.pdf_file,
                version_number=version_number,
                uploaded_by=user
            )
        
        new_values = {
            'title': updated_doc.title,
            'category': updated_doc.category,
        }
        
        log_document_event(
            user=user,
            action='METADATA_UPDATED',
            document=updated_doc,
            result='SUCCESS',
            previous_values=old_values,
            new_values=new_values,
            request=self.request
        )

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.save()
        log_document_event(
            user=self.request.user,
            action='DELETED',
            document=instance,
            result='SUCCESS',
            request=self.request
        )

    @action(detail=False, methods=['get'])
    def recycle_bin(self, request):
        """Get all deleted documents accessible by user"""
        user = self.request.user
        queryset = Document.objects.accessible_by(user, include_deleted=True).filter(is_deleted=True)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManageDocument])
    def restore(self, request, pk=None):
        """Restore a soft-deleted document"""
        # Need to fetch it explicitly since get_object() uses the standard queryset which hides deleted docs
        document = get_object_or_404(Document.objects.accessible_by(request.user, include_deleted=True), pk=pk)
        
        document.is_deleted = False
        document.save()
        
        log_document_event(
            user=request.user,
            action='RESTORED',
            document=document,
            result='SUCCESS',
            request=request
        )
        return Response({'status': 'restored'})

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, CanDeleteDocument])
    def permanent_delete(self, request, pk=None):
        """Hard delete document and its file"""
        document = get_object_or_404(Document.objects.accessible_by(request.user, include_deleted=True), pk=pk)
        
        # Log before deletion
        title = document.title
        # Delete file from storage
        if document.pdf_file:
            document.pdf_file.delete(save=False)
            
        # Hard delete from DB
        document.delete()
        
        # Log after deletion
        log_document_event(
            user=request.user,
            action='DELETED',
            document=None,
            result='PERMANENTLY_DELETED',
            comments=f"Deleted document: {title}",
            request=request
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly, CanDownloadDocument])
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
            request=request
        )
            
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly, CanViewDocument])
    def preview(self, request, pk=None):
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
            action='PREVIEWED',
            document=document,
            result='SUCCESS',
            request=request
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
            request=request
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
            request=request
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
            request=request
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
            request=request
        )
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def grant_access(self, request, pk=None):
        document = self.get_object()
        
        if not document.can_request_access(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        target_user = get_object_or_404(User, pk=request.data.get('user'))
        
        # Team Managers can only request access for Auditors, Auditees and Visitors
        if request.user.role == 'TEAM_MANAGER' and target_user.role not in ['AUDITOR', 'AUDITEE', 'VISITOR']:
            return Response({'error': 'Team Managers can only grant access to Auditors, Auditees and Visitors'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Manually validate since we're not in a ModelViewSet for TemporaryAccess
        serializer = TemporaryAccessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Team Manager requests start as PENDING and require an authorizer
        initial_status = 'PENDING' if request.user.role == 'TEAM_MANAGER' else 'ACTIVE'
        
        authorizer_id = request.data.get('authorizer')
        if request.user.role == 'TEAM_MANAGER' and not authorizer_id:
            return Response({'error': 'An Authorizer must be selected.'}, status=status.HTTP_400_BAD_REQUEST)
            
        authorizer = None
        if authorizer_id:
            authorizer = get_object_or_404(User, pk=authorizer_id)

        grant = serializer.save(document=document, granted_by=request.user, status=initial_status, authorizer=authorizer)
        
        log_document_event(
            user=request.user,
            action='ACCESS_REQUESTED' if initial_status == 'PENDING' else 'ACCESS_GRANTED',
            document=document,
            comments=f"{'Requested' if initial_status == 'PENDING' else 'Granted'} access for {grant.user.username} until {grant.expires_at}",
            result='SUCCESS',
            request=request
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review_access(self, request, pk=None):
        document = self.get_object()
        
        access_id = request.data.get('access_id')
        if not access_id:
            return Response({'error': 'access_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        grant = get_object_or_404(TemporaryAccess, pk=access_id, document=document)
        
        # Only Chiefs or Directors can review
        if request.user.role not in ['CHIEF', 'DIRECTOR']:
            return Response({'error': 'Not authorized to review access'}, status=status.HTTP_403_FORBIDDEN)
            
        # If an authorizer was specified, only that authorizer (or a Chief) can review
        if grant.authorizer and grant.authorizer != request.user and request.user.role != 'CHIEF':
            return Response({'error': f'Only {grant.authorizer.get_full_name()} can authorize this request.'}, status=status.HTTP_403_FORBIDDEN)
            
        # Must have management access to the document
        if not document.can_manage(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        action_type = request.data.get('action')
        reason = request.data.get('reason', '')
        
        if action_type == 'APPROVE':
            grant.status = 'ACTIVE'
            log_action = 'ACCESS_GRANTED'
            comments = f"Approved access for {grant.user.username} until {grant.expires_at}"
        elif action_type == 'REJECT':
            grant.status = 'REVOKED'
            grant.reason = reason
            log_action = 'ACCESS_REVOKED'
            comments = f"Rejected access for {grant.user.username}. Reason: {reason}"
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
        grant.save()
        
        log_document_event(
            user=request.user,
            action=log_action,
            document=document,
            comments=comments,
            result='SUCCESS',
            request=request
        )
        return Response({'status': grant.status})



    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def revoke_access(self, request, pk=None):
        document = self.get_object()
        
        access_id = request.data.get('access_id')
        if not access_id:
            return Response({'error': 'access_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        grant = get_object_or_404(TemporaryAccess, pk=access_id, document=document)
        
        if not document.can_manage(request.user):
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        reason = request.data.get('reason', '')
        grant.status = 'REVOKED'
        grant.save()
        
        log_document_event(
            user=request.user,
            action='ACCESS_REVOKED',
            document=document,
            comments=f"Revoked access for {grant.user.username}. Reason: {reason}",
            result='SUCCESS',
            request=request
        )
        return Response({'status': 'revoked'})

class AccessReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for listing accesses across all documents.
    """
    serializer_class = TemporaryAccessSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'CHIEF':
            # Chiefs can see all accesses globally
            return TemporaryAccess.objects.all().order_by('-start_date')
            
        elif user.role == 'DIRECTOR':
            # Directors can see all accesses for documents in their department
            return TemporaryAccess.objects.filter(
                document__department=user.department
            ).order_by('-start_date')
            
        elif user.role == 'TEAM_MANAGER':
            # Team Managers can see accesses they granted, or accesses to documents uploaded by them
            from django.db.models import Q
            return TemporaryAccess.objects.filter(
                Q(granted_by=user) | Q(document__uploaded_by=user)
            ).order_by('-start_date')
            
        else:
            # Regular users can only see accesses granted to them
            return TemporaryAccess.objects.filter(user=user).order_by('-start_date')

from rest_framework.permissions import IsAdminUser
from .serializers import DocumentAuditLogSerializer

class DocumentAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentAuditLog.objects.all().select_related('user', 'document').order_by('-timestamp')
    serializer_class = DocumentAuditLogSerializer
    permission_classes = [IsAdminUser]


class BackupOperationViewSet(viewsets.ModelViewSet):
    serializer_class = BackupOperationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)
        
        if role in ['ADMIN', 'CHIEF'] or user.is_superuser:
            return BackupOperation.objects.all().order_by('-started_at')
        
        if role in ['DIRECTOR', 'TEAM_MANAGER']:
            return BackupOperation.objects.filter(created_by=user).order_by('-started_at')
            
        return BackupOperation.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', None)
        if role not in ['ADMIN', 'CHIEF', 'DIRECTOR', 'TEAM_MANAGER'] and not user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to create backups.")
            
        backup = serializer.save(
            created_by=user,
            name=f"Backup_{user.username}_{timezone.now().strftime('%Y%m%d%H%M%S')}"
        )
        
        # Run backup in background
        def run_backup_async():
            service = BackupService(backup)
            service.create_backup()
            
        thread = threading.Thread(target=run_backup_async)
        thread.daemon = True
        thread.start()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        backup = self.get_object()
        
        if not backup.backup_file:
            return Response({'error': 'No backup file available for download.'}, status=status.HTTP_404_NOT_FOUND)
            
        file_path = backup.backup_file.path
        if not os.path.exists(file_path):
            return Response({'error': 'File missing.'}, status=status.HTTP_404_NOT_FOUND)
            
        response = FileResponse(open(file_path, 'rb'), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{backup.name}.zip"'
        return response

    @action(detail=False, methods=['post'])
    def restore(self, request):
        user = request.user
        role = getattr(user, 'role', None)
        if role not in ['ADMIN', 'CHIEF', 'DIRECTOR', 'TEAM_MANAGER'] and not user.is_superuser:
            return Response({'error': 'Not authorized to restore.'}, status=status.HTTP_403_FORBIDDEN)
            
        zip_file = request.FILES.get('file')
        if not zip_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        import tempfile
        import shutil
        
        # Save uploaded file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, zip_file.name)
        with open(temp_path, 'wb+') as dest:
            for chunk in zip_file.chunks():
                dest.write(chunk)
                
        try:
            service = RestoreService(temp_path, user)
            result = service.run_restore()
            
            if result.get('success'):
                return Response({
                    'status': 'success', 
                    'restored': result.get('restored'), 
                    'skipped': result.get('skipped')
                })
            else:
                return Response({'error': result.get('error')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            shutil.rmtree(temp_dir)

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        qs = Announcement.objects.all()
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_published=True)
        return qs
        
    def perform_create(self, serializer):
        if getattr(self.request.user, 'role', None) not in ['CHIEF', 'DIRECTOR']:
            raise PermissionDenied("Only Chief or Director can create announcements.")
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if getattr(self.request.user, 'role', None) not in ['CHIEF', 'DIRECTOR']:
            raise PermissionDenied("Only Chief or Director can update announcements.")
        serializer.save()

    def perform_destroy(self, instance):
        if getattr(self.request.user, 'role', None) not in ['CHIEF', 'DIRECTOR']:
            raise PermissionDenied("Only Chief or Director can delete announcements.")
        instance.delete()


class PublicDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for non-restricted, APPROVED documents.
    No authentication required — used by the public Publications / Internal Standards page.
    """
    serializer_class = DocumentSerializer
    permission_classes = []  # No auth required
    authentication_classes = []  # Skip JWT parsing for this endpoint

    def get_queryset(self):
        qs = Document.objects.filter(
            restricted=False,
            status='APPROVED',
            is_deleted=False
        ).select_related('department', 'uploaded_by', 'audit_period').prefetch_related('versions').order_by('-created_at')

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        return qs

