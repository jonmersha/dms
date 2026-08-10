from rest_framework import serializers
from .models import Document, DocumentVersion, TemporaryAccess, DocumentAuditLog
from users.models import User

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'role_display']

class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = DocumentVersion
        fields = ['id', 'version_number', 'pdf_file', 'uploaded_by', 'created_at']

class TemporaryAccessSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    granted_by_details = UserSerializer(source='granted_by', read_only=True)
    
    class Meta:
        model = TemporaryAccess
        fields = '__all__'

class DocumentAuditLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = DocumentAuditLog
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    
    # Nested fields for detail view
    audit_logs = serializers.SerializerMethodField()
    temporary_accesses = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_download = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['status', 'uploaded_by', 'department', 'is_deleted', 'deletion_requested', 'deletion_reason']

    def get_audit_logs(self, obj):
        request = self.context.get('request')
        if request and obj.can_manage(request.user):
            logs = obj.audit_logs.all().order_by('-timestamp')
            return DocumentAuditLogSerializer(logs, many=True).data
        return []
        
    def get_temporary_accesses(self, obj):
        request = self.context.get('request')
        if request and obj.can_manage(request.user):
            accesses = obj.temporary_accesses.all().order_by('-start_date')
            return TemporaryAccessSerializer(accesses, many=True).data
        return []

    def get_can_edit(self, obj):
        request = self.context.get('request')
        return obj.can_edit(request.user) if request else False

    def get_can_manage(self, obj):
        request = self.context.get('request')
        return obj.can_manage(request.user) if request else False
        
    def get_can_delete(self, obj):
        request = self.context.get('request')
        return obj.can_delete(request.user) if request else False
        
    def get_can_download(self, obj):
        request = self.context.get('request')
        return obj.can_download(request.user) if request else False
