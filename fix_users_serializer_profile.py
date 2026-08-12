import re

filepath = 'users/serializer.py'
with open(filepath, 'r') as f:
    content = f.read()

# Make UserSerializer (used by current user API) fields read_only
if "extra_kwargs = {'password'" not in content.split("class UserSerializer")[1].split("class AuditDepartmentSerializer")[0]:
    new_meta = """
    class Meta(BaseUserSerializer.Meta):
        fields = [
            'id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 
            'phone', 'employee_id', 'job_title', 'full_name', 'role', 'role_display', 
            'organization', 'department', 'team', 'permissions', 'status', 
            'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'username', 'role', 'role_display', 'organization', 'department', 'team', 'permissions', 'status', 'is_staff', 'is_superuser']
"""
    content = re.sub(
        r'    class Meta\(BaseUserSerializer.Meta\):\n        fields = \[\n            \'id\', \'username\', \'email\', \'first_name\', \'middle_name\', \'last_name\', \n            \'phone\', \'employee_id\', \'job_title\', \'full_name\', \'role\', \'role_display\', \n            \'organization\', \'department\', \'team\', \'permissions\', \'status\', \n            \'is_staff\', \'is_superuser\'\n        \]',
        new_meta.strip('\n'),
        content,
        flags=re.DOTALL
    )

# Add update method to UserSerializer to log PROFILE_CHANGED
user_serializer_update = """
    def update(self, instance, validated_data):
        # Prevent any manual group/department injection
        validated_data.pop('groups', None)
        validated_data.pop('department', None)
        validated_data.pop('is_active', None)
        validated_data.pop('is_staff', None)
        validated_data.pop('is_superuser', None)
        
        has_changes = bool(validated_data)
        user = super().update(instance, validated_data)
        
        if has_changes:
            from .models import UserAuditLog
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=user,
                action='PROFILE_CHANGED',
                notes='User updated their own profile.'
            )
        return user
"""
if "def update(self, instance, validated_data):" not in content.split("class UserSerializer")[1].split("class AuditDepartmentSerializer")[0]:
    content = content.replace(
        "read_only_fields = ['id', 'username', 'role', 'role_display', 'organization', 'department', 'team', 'permissions', 'status', 'is_staff', 'is_superuser']",
        "read_only_fields = ['id', 'username', 'role', 'role_display', 'organization', 'department', 'team', 'permissions', 'status', 'is_staff', 'is_superuser']\n" + user_serializer_update
    )

# Also add PROFILE_CHANGED / PASSWORD_CHANGED to AdminUserSerializer
if "action='PROFILE_CHANGED'" not in content.split("class AdminUserSerializer")[1]:
    admin_update_addition = """
        # General profile check
        if validated_data:
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=performed_by,
                action='PROFILE_CHANGED',
                notes=f"Admin updated profile fields: {list(validated_data.keys())}"
            )
            
        if password:
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=performed_by,
                action='PASSWORD_CHANGED',
                notes="Admin changed password."
            )
"""
    content = content.replace("        return user", admin_update_addition.strip('\n') + "\n        return user")


with open(filepath, 'w') as f:
    f.write(content)

print("Updated users/serializer.py for profile security and extra auditing")
