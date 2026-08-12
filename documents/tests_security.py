from django.test import TestCase

def create_test_user(username, email, department, role):
    from django.contrib.auth.models import Group
    from users.models import User
    user = User.objects.create_user(username=username, email=email, department=department)
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)
    return user

from django.contrib.auth import get_user_model
from django.urls import reverse
from documents.models import Document, TemporaryAccess
from users.models import Department
from audits.models import AuditPeriod
from django.utils import timezone
from datetime import timedelta
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class SecurityVulnerabilityTests(TestCase):
    def setUp(self):
        # Create hierarchy
        self.chief_dept = Department.objects.create(name='Chief', level='ORGANIZATION')
        self.dir_dept = Department.objects.create(name='Directorate A', level='DIRECTORATE', parent=self.chief_dept)
        self.team_dept = Department.objects.create(name='Team A1', level='TEAM', parent=self.dir_dept)
        
        self.dir_dept_b = Department.objects.create(name='Directorate B', level='DIRECTORATE', parent=self.chief_dept)
        self.team_dept_b = Department.objects.create(name='Team B1', level='TEAM', parent=self.dir_dept_b)
        
        # Create Users
        self.chief_user = create_test_user(username='chief', email='chief@test.com', department=self.chief_dept, role='Chief')
        
        self.dir_a_user = create_test_user(username='dira', email='dira@test.com', department=self.dir_dept, role='Director')
        self.team_a_manager = create_test_user(username='mgra', email='mgra@test.com', department=self.team_dept, role='Team Manager')
        self.team_a_member = create_test_user(username='memba', email='memba@test.com', department=self.team_dept, role='Team Member')
        
        self.dir_b_user = create_test_user(username='dirb', email='dirb@test.com', department=self.dir_dept_b, role='Director')
        self.team_b_manager = create_test_user(username='mgrb', email='mgrb@test.com', department=self.team_dept_b, role='Team Manager')
        self.team_b_member = create_test_user(username='membb', email='membb@test.com', department=self.team_dept_b, role='Team Member')
        
        # Audit period
        self.audit_period = AuditPeriod.objects.create(
            fiscal_year='2025-26',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=365),
            is_active=True
        )
        
        # Create Mock PDF
        self.pdf_file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
        
        # Create Documents
        self.doc_team_a = Document.objects.create(
            title='Team A Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.team_a_manager,
            restricted=True,
            pdf_file=self.pdf_file
        )
        
        self.doc_dir_b = Document.objects.create(
            title='Dir B Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.dir_b_user,
            restricted=True,
            pdf_file=self.pdf_file
        )

    def test_department_scope_bypass(self):
        # Director A tries to view Director B's document via direct URL
        self.client.force_login(self.dir_a_user)
        response = self.client.get(reverse('documents:document_detail', args=[self.doc_dir_b.pk]))
        self.assertEqual(response.status_code, 403)

    def test_team_scope_bypass(self):
        # Team Manager A tries to view Team Manager B's document via URL
        doc_team_b = Document.objects.create(
            title='Team B Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.team_b_manager,
            restricted=True,
            pdf_file=self.pdf_file
        )
        self.client.force_login(self.team_a_manager)
        response = self.client.get(reverse('documents:document_detail', args=[doc_team_b.pk]))
        self.assertEqual(response.status_code, 403)

    def test_unauthorized_document_viewing_and_downloading(self):
        # View
        self.client.force_login(self.team_b_member)
        response = self.client.get(reverse('documents:document_detail', args=[self.doc_team_a.pk]))
        self.assertEqual(response.status_code, 403)
        
        # Download
        response = self.client.get(reverse('documents:document_download', args=[self.doc_team_a.pk]))
        self.assertEqual(response.status_code, 403)

    def test_download_permission_bypass(self):
        # Grant View but NOT Download to Team B Member
        self.doc_team_a.allowed_users.add(self.team_b_member)
        self.doc_team_a.download_restricted = True
        self.doc_team_a.save()
        
        self.client.force_login(self.team_b_member)
        # View should work
        response = self.client.get(reverse('documents:document_detail', args=[self.doc_team_a.pk]))
        self.assertEqual(response.status_code, 200)
        
        # Download should fail
        response = self.client.get(reverse('documents:document_download', args=[self.doc_team_a.pk]))
        self.assertEqual(response.status_code, 403)

    def test_expired_temporary_access_bypass(self):
        # Expired access
        TemporaryAccess.objects.create(
            document=self.doc_dir_b,
            user=self.team_a_member,
            granted_by=self.chief_user,
            start_date=timezone.now() - timedelta(days=5),
            expires_at=timezone.now() - timedelta(days=1), # Expired yesterday
            can_view=True,
            can_download=True,
            status='ACTIVE'
        )
        
        self.client.force_login(self.team_a_member)
        response = self.client.get(reverse('documents:document_detail', args=[self.doc_dir_b.pk]))
        self.assertEqual(response.status_code, 403)

    def test_revoked_access_bypass(self):
        # Revoked access
        TemporaryAccess.objects.create(
            document=self.doc_dir_b,
            user=self.team_a_member,
            granted_by=self.chief_user,
            start_date=timezone.now() - timedelta(days=5),
            expires_at=timezone.now() + timedelta(days=5),
            can_view=True,
            can_download=True,
            status='REVOKED'
        )
        
        self.client.force_login(self.team_a_member)
        response = self.client.get(reverse('documents:document_detail', args=[self.doc_dir_b.pk]))
        self.assertEqual(response.status_code, 403)

    def test_idor_unauthorized_metadata_modification(self):
        # Team Manager A tries to edit Team Manager B's document
        doc_team_b = Document.objects.create(
            title='Team B Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.team_b_manager,
            restricted=True,
            pdf_file=self.pdf_file,
            status='DRAFT'
        )
        self.client.force_login(self.team_a_manager)
        response = self.client.post(reverse('documents:document_update', args=[doc_team_b.pk]), {
            'title': 'Hacked Title',
        })
        self.assertEqual(response.status_code, 302) # Should redirect to document list with error
        doc_team_b.refresh_from_db()
        self.assertEqual(doc_team_b.title, 'Team B Doc') # Unchanged

    def test_privilege_escalation_approval(self):
        # Team Manager A tries to approve their own document (requires Director/Chief)
        self.doc_team_a.status = 'PENDING_APPROVAL'
        self.doc_team_a.save()
        
        self.client.force_login(self.team_a_manager)
        response = self.client.post(reverse('documents:document_approve', args=[self.doc_team_a.pk]), {
            'action': 'APPROVE',
            'comments': 'Self approval'
        })
        self.assertEqual(response.status_code, 403)
        self.doc_team_a.refresh_from_db()
        self.assertEqual(self.doc_team_a.status, 'PENDING_APPROVAL')

    def test_unauthorized_deletion_approval(self):
        # Team Manager A tries to approve a deletion
        self.doc_team_a.deletion_requested = True
        self.doc_team_a.save()
        
        self.client.force_login(self.team_a_manager)
        response = self.client.post(reverse('documents:review_deletion', args=[self.doc_team_a.pk]), {
            'action': 'APPROVE'
        })
        self.assertEqual(response.status_code, 403)
