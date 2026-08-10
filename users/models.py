from django.db import models
from django.contrib.auth.models import AbstractUser

class AuditDepartment(models.Model):
    LEVEL_CHOICES = [
        ('CHIEF', 'Chief Internal Audit'),
        ('DIRECTORATE', 'Directorate'),
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
    ROLE_CHOICES = [
        ('CHIEF', 'Chief Internal Audit'),
        ('DIRECTOR', 'Director / Department Head'),
        ('TEAM_MANAGER', 'Team Manager'),
        ('TEAM_MEMBER', 'Team Member'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TEAM_MEMBER')
    email = models.EmailField(unique=True)
    department = models.ForeignKey(
        AuditDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='users'
    )