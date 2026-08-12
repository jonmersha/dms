from django.db import models
from django.db.models import Q
from django.utils import timezone

class DocumentQuerySet(models.QuerySet):
    def accessible_by(self, user, include_deleted=False):
        """
        Filter documents based on strict organizational scope and permissions.
        - CHIEF: Organization-wide access (sees all statuses and deletions)
        - DIRECTOR: Department-wide access
        - TEAM_MANAGER: Team-wide access
        - TEAM_MEMBER: Only documents permitted by system permissions
        """
        if not user.is_authenticated:
            return self.filter(restricted=False, status='APPROVED', is_deleted=False)
            
        # 1. Start with the base query
        queryset = self.all()
        user_groups = user.groups.values_list('name', flat=True) if user.pk else []
        if not include_deleted:
            # Users can still see their own deleted documents
            queryset = queryset.filter(Q(is_deleted=False) | Q(uploaded_by=user))
        # 2. ADMIN or superuser cannot view any documents
        if getattr(user, 'is_superuser', False) or 'System Administrator' in user_groups:
            return self.none()

        # CHIEF sees everything
        if 'Chief' in user_groups:
            return self.all()

            
        # 3. Base visibility starts with explicit permissions and ownership
        visibility_query = Q(uploaded_by=user) | Q(allowed_users=user) | Q(allowed_groups__in=user.groups.all())
        
        # 4. Internal audit staff (not Auditees/Visitors) can see all unrestricted documents
        if 'Auditor' not in user_groups:
            visibility_query |= Q(restricted=False)
        
        if getattr(user, 'department', None):
            user_depts = [d.id for d in user.department.get_all_sub_departments()]
            visibility_query |= Q(allowed_departments__in=user_depts)
            
            if ('Director' in user_groups or 'Team Manager' in user_groups):
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
        
        # Standard users only see APPROVED documents unless they uploaded them
        validity_query = Q(status='APPROVED') | Q(uploaded_by=user)
        
        return queryset.filter(visibility_query).filter(validity_query).distinct()
