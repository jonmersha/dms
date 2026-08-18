from rest_framework import serializers
from .models import Document, Announcement, DocumentVersion, TemporaryAccess, DocumentAuditLog, BackupOperation
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
    document_title = serializers.CharField(source='document.title', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    granted_by_details = UserSerializer(source='granted_by', read_only=True)
    authorizer_details = UserSerializer(source='authorizer', read_only=True)
    
    class Meta:
        model = TemporaryAccess
        fields = '__all__'
        extra_kwargs = {
            'granted_by': {'read_only': True},
            'document': {'read_only': True}
        }

class DocumentAuditLogSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = DocumentAuditLog
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    audit_period_name = serializers.CharField(source='audit_period.fiscal_year', read_only=True)
    quarter_display = serializers.CharField(source='get_quarter_display', read_only=True)
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    
    # Nested fields for detail view
    audit_logs = serializers.SerializerMethodField()
    temporary_accesses = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()
    can_request_access = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_download = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['status', 'uploaded_by', 'is_deleted', 'deletion_requested', 'deletion_reason']

    def validate(self, data):
        category = data.get('category', getattr(self.instance, 'category', None))
        audit_type = data.get('audit_type', getattr(self.instance, 'audit_type', None))
        audit_period = data.get('audit_period', getattr(self.instance, 'audit_period', None))

        is_report = (category == 'AUDIT_REPORTS')

        # --- Rules that only apply to Audit Reports ---
        if is_report:
            if not audit_period:
                raise serializers.ValidationError({'audit_period': 'Audit period is required for audit reports.'})
            if not data.get('quarter', getattr(self.instance, 'quarter', None)):
                raise serializers.ValidationError({'quarter': 'Quarter is required for audit reports.'})
            if not audit_type:
                raise serializers.ValidationError({'audit_type': 'Audit type is required for audit reports.'})
            if audit_period and not audit_period.is_active:
                raise serializers.ValidationError({'audit_period': 'Cannot upload to inactive audit periods.'})
        else:
            # Non-report categories must NOT have audit-specific fields
            if audit_type:
                raise serializers.ValidationError({'audit_type': 'Audit type should only be selected for audit reports.'})
            # Clear period/quarter for non-reports so they are not stored
            data.pop('audit_period', None)
            data.pop('quarter', None)

        return data

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
        
    def get_can_request_access(self, obj):
        request = self.context.get('request')
        return obj.can_request_access(request.user) if request else False
        
    def get_can_delete(self, obj):
        request = self.context.get('request')
        return obj.can_delete(request.user) if request else False
        
    def get_can_download(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        user = getattr(request, 'user', None)
        if not user:
            return False
        return obj.can_download(user)


class PublicDocumentSerializer(serializers.ModelSerializer):
    """
    Lightweight, auth-free serializer for public document listings.
    Only exposes safe, non-sensitive fields.
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    audit_period_name = serializers.CharField(source='audit_period.fiscal_year', read_only=True)
    quarter_display = serializers.CharField(source='get_quarter_display', read_only=True)
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'audit_type', 'audit_type_display', 'audit_period_name',
            'quarter', 'quarter_display', 'department_name',
            'uploaded_by_name', 'pdf_file', 'created_at', 'updated_at',
        ]

class BackupOperationSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    backup_type_display = serializers.CharField(source='get_backup_type_display', read_only=True)
    
    class Meta:
        model = BackupOperation
        fields = '__all__'
        read_only_fields = [
            'status', 'backup_file', 'file_size', 'total_documents', 
            'backed_up_documents', 'failed_documents', 'started_at', 
            'completed_at', 'error_log', 'created_by', 'name'
        ]

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'category', 'is_published', 'author', 'author_name', 'author_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
