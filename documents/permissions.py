from rest_framework import permissions

class CanViewDocument(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.can_view(request.user)

class CanEditDocument(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.can_edit(request.user)

class CanManageDocument(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.can_manage(request.user)

class CanDeleteDocument(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.can_delete(request.user)

class CanDownloadDocument(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.can_download(request.user)
