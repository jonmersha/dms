from django.db import models
from django.contrib.auth.models import AbstractUser

class Department(models.Model):
    LEVEL_CHOICES = [
        ('ORGANIZATION', 'Organization'),
        ('DIVISION', 'Division / Executive'),
        ('DIRECTORATE', 'Directorate / Department'),
        ('TEAM', 'Team'),
    ]
    name = models.CharField(max_length=255)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_departments'
    )

    class Meta:
        verbose_name = 'Audit Department'
        verbose_name_plural = 'Audit Departments'

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"

    def get_all_sub_departments(self):
        """Recursively get this department and all its children"""
        departments = [self]
        for sub in self.sub_departments.all():
            departments.extend(sub.get_all_sub_departments())
        return departments

    def get_all_parent_departments(self):
        """Recursively get this department and all its parents up to Chief"""
        departments = [self]
        if self.parent:
            departments.extend(self.parent.get_all_parent_departments())
        return departments

class User(AbstractUser):
    email = models.EmailField(unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users'
    )    
    # Profile fields
    middle_name = models.CharField(max_length=100, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    can_manage_public_content = models.BooleanField(default=False)
    
    # Audit Flow Fields
    reports_to = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates'
    )
    qualifications = models.JSONField(default=list, blank=True, null=True)
    expertise = models.JSONField(default=list, blank=True, null=True)

    @property
    def role(self):
        if not self.pk:
            return None
        group_names = [g.name for g in self.groups.all()]
        if 'Chief' in group_names: return 'CHIEF'
        if 'Director' in group_names: return 'DIRECTOR'
        if 'Team Manager' in group_names: return 'TEAM_MANAGER'
        if 'Team Member' in group_names: return 'TEAM_MEMBER'
        if 'System Administrator' in group_names: return 'ADMIN'
        if 'Auditor' in group_names: return 'AUDITOR'
        if 'Auditee' in group_names: return 'AUDITEE'
        if 'Visitor' in group_names: return 'VISITOR'
        return None

    def clean(self):
        from django.core.exceptions import ValidationError
        super().clean()
        
        if self.employee_id == "":
            self.employee_id = None
        
        # Validate organizational assignments based on Groups
        if self.department:
            groups = self.groups.values_list('name', flat=True) if self.pk else []
            
            if 'Chief' in groups and self.department.level != 'ORGANIZATION':
                raise ValidationError("A Chief must be assigned to an Organization-level department.")
            
            if 'Director' in groups and self.department.level != 'DIRECTORATE':
                raise ValidationError("A Director must be assigned to a Directorate-level department.")
                
            if ('Team Manager' in groups or 'Team Member' in groups) and self.department.level != 'TEAM':
                raise ValidationError("A Team Manager or Member must be assigned to a Team-level department.")
                
    def save(self, *args, **kwargs):
        if self.pk:
            groups = self.groups.values_list('name', flat=True)
            if 'System Administrator' in groups:
                self.is_staff = True
                self.is_superuser = True
        super().save(*args, **kwargs)

class UserAuditLog(models.Model):
    ACTION_CHOICES = [
        ('ACTIVATED', 'Activated'),
        ('SUSPENDED', 'Suspended'),
        ('ROLE_CHANGED', 'Role Changed'),
        ('DEPT_CHANGED', 'Department Changed'),
        ('PROFILE_CHANGED', 'Profile Changed'),
        ('PASSWORD_CHANGED', 'Password Changed'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('FAILED_LOGIN', 'Failed Login'),
        ('CREATED', 'Created'),
    ]
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performed_user_actions')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.target_user.username} - {self.action} at {self.timestamp}"

class DepartmentPerformancePlan(models.Model):
    PLAN_TYPES = (
        ('ANNUAL', 'Annual Plan'),
        ('ENGAGEMENT', 'Specific Engagement Plan')
    )
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='performance_plans')
    year = models.IntegerField()
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='ANNUAL')
    title = models.CharField(max_length=255, blank=True, help_text="Required for Engagement Plans")
    
    # For Annual Plan
    annual_target_audits = models.IntegerField(default=0, blank=True, null=True)
    q1_target = models.IntegerField(default=0, blank=True, null=True)
    q2_target = models.IntegerField(default=0, blank=True, null=True)
    q3_target = models.IntegerField(default=0, blank=True, null=True)
    q4_target = models.IntegerField(default=0, blank=True, null=True)

    # For Specific Engagement Plan
    engagement_activities = models.JSONField(default=list, blank=True)

    # Legacy fields
    long_term_plan = models.TextField(blank=True, null=True, help_text="Long-term strategic vision and plan.")
    short_term_plan = models.TextField(blank=True, null=True, help_text="Short-term objectives and execution plan.")
    performance_execution = models.TextField(blank=True, null=True, help_text="Detailed achievements and execution metrics.")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_performance_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', 'department__name']

    def __str__(self):
        type_label = dict(self.PLAN_TYPES).get(self.plan_type, '')
        return f"{self.department.name} - {type_label} {self.year}"
