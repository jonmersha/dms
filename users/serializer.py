from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer, UserSerializer as BaseUserSerializer
from django.contrib.auth.models import Group

# from store import serializers

class UserCreateSerializer(BaseUserCreateSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), write_only=True, required=False)
    
    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'email', 'username', 'password', 'first_name', 'last_name', 'employee_id', 'phone', 'department', 'role']

    def validate(self, attrs):
        role = attrs.pop('role', None)
        validated_attrs = super().validate(attrs)
        if role:
            validated_attrs['role'] = role
        return validated_attrs
        
    def create(self, validated_data):
        role = validated_data.pop('role', None)
        user = super().create(validated_data)
        user.is_active = False
        if role:
            user.groups.add(role)
        user.save()
        # The UserAuditLog 'CREATED' signal will capture this automatically.
        return user

from django.contrib.auth.models import Permission
from .models import Department, User

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

from .models import UserAuditLog

class UserAuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    target_user_name = serializers.CharField(source='target_user.get_full_name', read_only=True)
    
    class Meta:
        model = UserAuditLog
        fields = ['id', 'target_user', 'target_user_name', 'performed_by', 'performed_by_name', 'action', 'timestamp', 'notes']

class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(many=True, queryset=Permission.objects.all(), required=False)
    permission_details = PermissionSerializer(source='permissions', many=True, read_only=True)
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_details']

class UserSerializer(BaseUserSerializer):
    role = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField() # Keep for backwards compatibility
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    organization = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    team = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    def get_role_display(self, obj):
        return ', '.join(obj.groups.values_list('name', flat=True))

    def get_role(self, obj):
        # Return the internal role code (e.g. 'TEAM_MANAGER') used for permission checks
        return obj.role  # Uses the User.role property which maps group names to codes

    def get_permissions(self, obj):
        from django.contrib.auth.models import Permission
        perms = Permission.objects.filter(group__user=obj).distinct()
        return list(perms.values_list('codename', flat=True))

    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'

    def _get_node_at_level(self, obj, level_type):
        if not obj.department:
            return None
        # Walk up the tree to find the requested level
        current = obj.department
        while current:
            if current.level == level_type:
                return {'id': current.id, 'name': current.name}
            current = current.parent
        return None

    def get_organization(self, obj):
        return self._get_node_at_level(obj, 'ORGANIZATION')

    def get_department(self, obj):
        return self._get_node_at_level(obj, 'DIRECTORATE')

    def get_team(self, obj):
        return self._get_node_at_level(obj, 'TEAM')

    class Meta(BaseUserSerializer.Meta):
        fields = [
            'id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 
            'phone', 'employee_id', 'job_title', 'full_name', 'role', 'role_display', 
            'organization', 'department', 'team', 'permissions', 'status', 
            'is_staff', 'is_superuser', 'can_manage_public_content'
        ]
        read_only_fields = ['id', 'username', 'role', 'role_display', 'organization', 'department', 'team', 'permissions', 'status', 'is_staff', 'is_superuser', 'can_manage_public_content']

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


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class AdminUserSerializer(serializers.ModelSerializer):
    role_display = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=Group.objects.all(), required=False)

    def get_role_display(self, obj):
        return ', '.join(obj.groups.values_list('name', flat=True))

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role_display', 'groups', 'full_name', 'is_staff', 'is_superuser', 'can_manage_public_content', 'is_active', 'department', 'password', 'job_title', 'employee_id', 'phone', 'profile_photo', 'middle_name']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # Ensure user is inactive until they click the email confirmation link
        validated_data['is_active'] = False
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
            
        # Send Djoser activation email
        try:
            from djoser import email
            context = {'user': user}
            to = [user.email]
            email.ActivationEmail(self.context.get('request'), context).send(to)
        except Exception as e:
            # Handle if email backend fails (e.g., SMTP not configured)
            pass

        # The UserAuditLog 'CREATED' signal will capture this automatically.
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Track previous state for auditing
        prev_is_active = instance.is_active
        prev_department_id = instance.department_id
        prev_groups = set(instance.groups.values_list('id', flat=True))
        
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
            
        request = self.context.get('request')
        performed_by = request.user if request and request.user.is_authenticated else None

        # Audit logging for activation/suspension
        if prev_is_active != user.is_active:
            action = 'ACTIVATED' if user.is_active else 'SUSPENDED'
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=performed_by,
                action=action,
                notes=f"User status automatically logged via admin panel."
            )
            
        # Audit logging for Department changes
        if prev_department_id != user.department_id:
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=performed_by,
                action='DEPT_CHANGED',
                notes=f"Department changed from {prev_department_id} to {user.department_id}"
            )
            
        # Audit logging for Role/Group changes
        curr_groups = set(user.groups.values_list('id', flat=True))
        if prev_groups != curr_groups:
            UserAuditLog.objects.create(
                target_user=user,
                performed_by=performed_by,
                action='ROLE_CHANGED',
                notes=f"Roles changed. Added: {curr_groups - prev_groups}, Removed: {prev_groups - curr_groups}"
            )
            
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
        return user
