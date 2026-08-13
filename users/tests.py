from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import Group
from .models import User, Department, UserAuditLog
import json

class UserManagementComprehensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # 1. Create Organizational Hierarchy
        self.org = Department.objects.create(name="HQ", level="ORGANIZATION")
        self.dept_a = Department.objects.create(name="Dept A", level="DIRECTORATE", parent=self.org)
        self.team_a = Department.objects.create(name="Team A", level="TEAM", parent=self.dept_a)
        self.dept_b = Department.objects.create(name="Dept B", level="DIRECTORATE", parent=self.org)
        
        # 2. Create Roles (Groups)
        self.sysadmin_group, _ = Group.objects.get_or_create(name='System Administrator')
        self.chief_group, _ = Group.objects.get_or_create(name='Chief')
        self.director_group, _ = Group.objects.get_or_create(name='Director')
        self.manager_group, _ = Group.objects.get_or_create(name='Team Manager')
        self.member_group, _ = Group.objects.get_or_create(name='Team Member')
        self.auditor_group, _ = Group.objects.get_or_create(name='Auditor')

        # 3. Create Users
        self.sysadmin = self.create_user("sysadmin", self.sysadmin_group)
        self.sysadmin.is_superuser = True
        self.sysadmin.save()
        
        self.chief = self.create_user("chief", self.chief_group, self.org)
        self.director_a = self.create_user("director_a", self.director_group, self.dept_a)
        self.manager_a = self.create_user("manager_a", self.manager_group, self.team_a)
        self.member_a = self.create_user("member_a", self.member_group, self.team_a)
        self.director_b = self.create_user("director_b", self.director_group, self.dept_b)
        self.auditor = self.create_user("auditor", self.auditor_group)

    def create_user(self, username, group, department=None):
        user = User.objects.create_user(
            username=username, 
            email=f"{username}@example.com", 
            password="password123", 
            department=department
        )
        user.groups.add(group)
        return user

    # ---------------------------------------------------------
    # Authentication & Password Management
    # ---------------------------------------------------------
    def test_jwt_authentication(self):
        response = self.client.post('/auth/jwt/create/', {
            'username': 'sysadmin',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_password_change(self):
        self.client.force_authenticate(user=self.member_a)
        response = self.client.post('/auth/users/set_password/', {
            'new_password': 'newpassword123',
            'current_password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify JWT login with new password
        login_resp = self.client.post('/auth/jwt/create/', {
            'username': 'member_a',
            'password': 'newpassword123'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_password_reset_trigger(self):
        # Trigger reset
        response = self.client.post('/auth/users/reset_password/', {
            'email': 'member_a@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # ---------------------------------------------------------
    # Organizational Scope & User Listing
    # ---------------------------------------------------------
    def test_sysadmin_can_see_all(self):
        self.client.force_authenticate(user=self.sysadmin)
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 7)

    def test_chief_can_see_all(self):
        self.client.force_authenticate(user=self.chief)
        response = self.client.get('/api/admin/users/')
        self.assertEqual(len(response.data), 7)

    def test_director_sees_only_department(self):
        self.client.force_authenticate(user=self.director_a)
        response = self.client.get('/api/admin/users/')
        users = [u['id'] for u in response.data]
        self.assertIn(self.director_a.id, users)
        self.assertIn(self.manager_a.id, users)
        self.assertNotIn(self.director_b.id, users)

    def test_team_manager_sees_only_team(self):
        self.client.force_authenticate(user=self.manager_a)
        response = self.client.get('/api/admin/users/')
        users = [u['id'] for u in response.data]
        self.assertIn(self.manager_a.id, users)
        self.assertIn(self.member_a.id, users)
        self.assertNotIn(self.director_a.id, users)

    def test_auditor_is_readonly(self):
        self.client.force_authenticate(user=self.auditor)
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response = self.client.post(f'/api/admin/users/{self.member_a.id}/deactivate/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_team_member_no_admin_access(self):
        self.client.force_authenticate(user=self.member_a)
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # User Creation & Assignments
    # ---------------------------------------------------------
    def test_user_creation(self):
        self.client.force_authenticate(user=self.sysadmin)
        payload = {
            'username': 'new_user',
            'email': 'new@example.com',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'User',
            'groups': [self.member_group.id],
            'department': self.team_a.id
        }
        response = self.client.post('/api/admin/users/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['department'], self.team_a.id)

    def test_role_department_team_assignment(self):
        self.client.force_authenticate(user=self.director_a)
        # Update existing user to new role & dept
        payload = {
            'groups': [self.manager_group.id],
            'department': self.dept_a.id
        }
        response = self.client.patch(f'/api/admin/users/{self.member_a.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member_a.refresh_from_db()
        self.assertTrue(self.member_a.groups.filter(name='Team Manager').exists())
        self.assertEqual(self.member_a.department.id, self.dept_a.id)

    # ---------------------------------------------------------
    # User Updates & Activation
    # ---------------------------------------------------------
    def test_user_activation_deactivation_suspension(self):
        self.client.force_authenticate(user=self.director_a)
        # Deactivate
        resp1 = self.client.post(f'/api/admin/users/{self.member_a.id}/deactivate/')
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        self.member_a.refresh_from_db()
        self.assertFalse(self.member_a.is_active)
        
        # Activate
        resp2 = self.client.post(f'/api/admin/users/{self.member_a.id}/activate/')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.member_a.refresh_from_db()
        self.assertTrue(self.member_a.is_active)
        
        # Suspend (alias for deactivate)
        resp3 = self.client.post(f'/api/admin/users/{self.member_a.id}/suspend/')
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.member_a.refresh_from_db()
        self.assertFalse(self.member_a.is_active)

    def test_privilege_escalation_blocked(self):
        self.client.force_authenticate(user=self.member_a)
        # Try to patch own profile via user endpoint (not admin)
        payload = {
            'first_name': 'Hacked',
            'is_superuser': True,
            'is_staff': True,
            'department': self.dept_b.id
        }
        # In Djoser, user edits go to PUT /auth/users/me/
        # Or standard PATCH if viewset allows. Let's use standard Admin endpoint to prove 403
        response_admin = self.client.patch(f'/api/admin/users/{self.member_a.id}/', payload)
        self.assertEqual(response_admin.status_code, status.HTTP_403_FORBIDDEN)

    # ---------------------------------------------------------
    # Audit Logging
    # ---------------------------------------------------------
    def test_audit_logging_login(self):
        # We perform a standard Django test client login to trigger signals
        self.client.login(
            username='member_a',
            password='password123'
        )
        log = UserAuditLog.objects.filter(target_user=self.member_a, action='LOGIN').first()
        self.assertIsNotNone(log)

    def test_audit_logging_failed_login(self):
        self.client.login(
            username='member_a',
            password='wrong'
        )
        log = UserAuditLog.objects.filter(target_user=self.member_a, action='FAILED_LOGIN').first()
        self.assertIsNotNone(log)

    def test_audit_logging_admin_update(self):
        self.client.force_authenticate(user=self.director_a)
        self.client.patch(f'/api/admin/users/{self.member_a.id}/', {'last_name': 'Changed'})
        log = UserAuditLog.objects.filter(target_user=self.member_a, action='PROFILE_CHANGED').first()
        self.assertIsNotNone(log)

