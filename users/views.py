from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializer import AdminUserSerializer, DepartmentSerializer
from .models import User, Department
from .permissions import UserManagementPermission


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users via the Admin Panel.
    """
    serializer_class = AdminUserSerializer
    permission_classes = [UserManagementPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'employee_id', 'phone', 'job_title', 'groups__name', 'department__name']

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all().order_by('-date_joined')
        
        if user.is_superuser:
            return queryset
            
        user_groups = user.groups.values_list('name', flat=True)
        
        if 'System Administrator' in user_groups or 'Chief' in user_groups or 'Auditor' in user_groups:
            return queryset
            
        if 'Director' in user_groups or 'Team Manager' in user_groups:
            if user.department:
                # Can only see users in their own department/team hierarchy
                sub_depts = [d.id for d in user.department.get_all_sub_departments()]
                return queryset.filter(department__in=sub_depts)
            return queryset.none()
            
        return queryset.none()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_active:
            instance.is_active = False
            instance.save()
            
            from .models import UserAuditLog
            UserAuditLog.objects.create(
                target_user=instance,
                performed_by=request.user,
                action='SUSPENDED',
                notes="User soft-deleted (deactivated) to preserve audit trails."
            )
            
        from rest_framework.response import Response
        from rest_framework import status
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        instance = self.get_object()
        if not instance.is_active:
            instance.is_active = True
            instance.save()
            from .models import UserAuditLog
            UserAuditLog.objects.create(target_user=instance, performed_by=request.user, action='ACTIVATED', notes='Activated via API endpoint.')
        return Response({'status': 'User activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        instance = self.get_object()
        if instance.is_active:
            instance.is_active = False
            instance.save()
            from .models import UserAuditLog
            UserAuditLog.objects.create(target_user=instance, performed_by=request.user, action='SUSPENDED', notes='Deactivated via API endpoint.')
        return Response({'status': 'User deactivated'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        # Maps to deactivate natively
        return self.deactivate(request)

    @action(detail=True, methods=['get'])
    def roles(self, request, pk=None):
        instance = self.get_object()
        from .serializer import RoleSerializer
        serializer = RoleSerializer(instance.groups.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        instance = self.get_object()
        from django.contrib.auth.models import Permission
        from .serializer import PermissionSerializer
        perms = Permission.objects.filter(group__user=instance).distinct()
        serializer = PermissionSerializer(perms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        instance = self.get_object()
        from .serializer import UserAuditLogSerializer
        logs = instance.audit_logs.all().order_by('-timestamp')
        serializer = UserAuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        instance = self.get_object()
        from documents.models import Document
        # Inline serialization to avoid circular imports if any, or use existing
        docs = Document.objects.filter(uploaded_by=instance).values('id', 'title', 'document_number', 'status', 'created_at')
        return Response(docs)



class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Audit Departments (Organizational Units).
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'employee_id', 'phone', 'job_title', 'groups__name', 'department__name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

from .serializer import UserSerializer

class UserDirectoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only directory of users for populating dropdowns.
    Accessible to authenticated users.
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

from django.contrib.auth.models import Group, Permission
from .serializer import RoleSerializer, PermissionSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = RoleSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by('content_type__app_label', 'codename')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'content_type__model']

from .models import UserAuditLog
from .serializer import UserAuditLogSerializer

class UserAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserAuditLog.objects.all()
    serializer_class = UserAuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'employee_id', 'phone', 'job_title', 'groups__name', 'department__name']
