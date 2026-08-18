with open('apps/lms/views.py', 'r') as f:
    code = f.read()

old_code = """    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):"""

new_code = """    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in permissions.SAFE_METHODS:
            return
        if self.action in ['enroll', 'unenroll']:
            return
        if request.user.is_superuser or getattr(request.user, 'can_manage_public_content', False):"""

if old_code in code:
    code = code.replace(old_code, new_code)
    with open('apps/lms/views.py', 'w') as f:
        f.write(code)

