from rest_framework import permissions

class UserManagementPermission(permissions.BasePermission):
    """
    Custom permission for user management.
    - System Administrator: Full access.
    - Chief: Full access within organization.
    - Director: Full access within department.
    - Team Manager: Full access within team.
    - Auditor: Read-only access.
    - Others: No access.
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        user_groups = request.user.groups.values_list('name', flat=True)
        
        if request.user.is_superuser or 'System Administrator' in user_groups:
            return True
            
        if 'Auditor' in user_groups:
            # Auditors have read-only access to the management endpoint
            return request.method in permissions.SAFE_METHODS
            
        if any(role in user_groups for role in ['Chief', 'Director', 'Team Manager']):
            return True
            
        return False

    def has_object_permission(self, request, view, obj):
        # We handle object visibility entirely via get_queryset
        return True
