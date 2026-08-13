import re

filepath = 'users/views.py'
with open(filepath, 'r') as f:
    content = f.read()

# Add UserManagementPermission
if "from .permissions import UserManagementPermission" not in content:
    content = content.replace("from .models import User, AuditDepartment", "from .models import User, AuditDepartment\nfrom .permissions import UserManagementPermission")

# Modify UserViewSet
new_viewset = """
class UserViewSet(viewsets.ModelViewSet):
    \"\"\"
    ViewSet for managing users via the Admin Panel.
    \"\"\"
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
"""

content = re.sub(
    r'class UserViewSet\(viewsets.ModelViewSet\):.*?search_fields = \[\'username\', \'first_name\', \'last_name\', \'email\', \'employee_id\', \'phone\', \'job_title\', \'groups__name\', \'department__name\'\]',
    new_viewset.strip(),
    content,
    flags=re.DOTALL
)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated users/views.py get_queryset")
