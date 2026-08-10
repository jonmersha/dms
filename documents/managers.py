from django.db import models
from django.db.models import Q
from django.utils import timezone

class DocumentQuerySet(models.QuerySet):
    def accessible_by(self, user):
        """
        Filter documents based on strict organizational scope and permissions.
        - CHIEF: Organization-wide access (sees all statuses and deletions)
        - DIRECTOR: Department-wide access
        - TEAM_MANAGER: Team-wide access
        - TEAM_MEMBER: Only documents permitted by system permissions
        """
        if not user.is_authenticated:
            return self.filter(restricted=False, status='APPROVED', is_deleted=False)
            
        if user.is_superuser or getattr(user, 'role', None) == 'CHIEF':
            return self.all()
            
        visibility_query = Q(restricted=False) | Q(uploaded_by=user) | Q(allowed_users=user) | Q(allowed_groups__in=user.groups.all())
        
        if getattr(user, 'department', None):
            user_depts = [d.id for d in user.department.get_all_sub_departments()]
            visibility_query |= Q(allowed_departments__in=user_depts)
            
            if getattr(user, 'role', None) in ['DIRECTOR', 'TEAM_MANAGER']:
                visibility_query |= Q(department__in=user_depts)
                
        # Also include documents where the user has active temporary access that grants view permission
        now = timezone.now()
        visibility_query |= Q(
            temporary_accesses__user=user, 
            temporary_accesses__status='ACTIVE',
            temporary_accesses__can_view=True,
            temporary_accesses__start_date__lte=now,
            temporary_accesses__expires_at__gt=now
        )
        
        # Standard users only see APPROVED and non-deleted documents unless they uploaded them
        validity_query = (Q(status='APPROVED') & Q(is_deleted=False)) | Q(uploaded_by=user)
        
        return self.filter(visibility_query).filter(validity_query).distinct()
