from rest_framework import permissions


class SuperAdminPermission(permissions.BasePermission):
    """
    Restricts access to Super Admins only:
    - Django superusers (is_superuser=True)
    - Members of the 'System Administrator' group

    This is used for all sensitive system management endpoints:
    - User management
    - Department management
    - Role/group assignments
    - Audit logs
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        user_groups = request.user.groups.values_list('name', flat=True)
        return 'System Administrator' in user_groups

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


# Keep backward-compatible alias for any existing usage
class UserManagementPermission(SuperAdminPermission):
    """Alias kept for backward compatibility."""
    pass
