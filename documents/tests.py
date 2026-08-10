from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from documents.models import Document
from users.models import AuditDepartment
from audits.models import AuditPeriod
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class DocumentScopeTests(TestCase):
    def setUp(self):
        # Create hierarchy
        self.chief_dept = AuditDepartment.objects.create(name='Chief', level='CHIEF')
        self.dir_dept = AuditDepartment.objects.create(name='Directorate A', level='DIRECTORATE', parent=self.chief_dept)
        self.team_dept = AuditDepartment.objects.create(name='Team A1', level='TEAM', parent=self.dir_dept)
        
        self.dir_dept_b = AuditDepartment.objects.create(name='Directorate B', level='DIRECTORATE', parent=self.chief_dept)
        self.team_dept_b = AuditDepartment.objects.create(name='Team B1', level='TEAM', parent=self.dir_dept_b)
        
        # Create Users
        self.chief_user = User.objects.create_user(username='chief', email='chief@test.com', department=self.chief_dept, role='CHIEF')
        
        self.dir_a_user = User.objects.create_user(username='dira', email='dira@test.com', department=self.dir_dept, role='DIRECTOR')
        self.team_a_manager = User.objects.create_user(username='mgra', email='mgra@test.com', department=self.team_dept, role='TEAM_MANAGER')
        self.team_a_member = User.objects.create_user(username='memba', email='memba@test.com', department=self.team_dept, role='TEAM_MEMBER')
        
        self.dir_b_user = User.objects.create_user(username='dirb', email='dirb@test.com', department=self.dir_dept_b, role='DIRECTOR')
        
        # Audit period
        self.audit_period = AuditPeriod.objects.create(
            fiscal_year='2025-26',
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=365),
            is_active=True
        )
        
        # Create Documents
        # Team A document
        self.doc_team_a = Document.objects.create(
            title='Team A Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.team_a_member,
            restricted=True
        ) # Automatically gets department=team_dept
        
        # Directorate B document
        self.doc_dir_b = Document.objects.create(
            title='Dir B Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.dir_b_user,
            restricted=True
        )

    def test_chief_scope(self):
        # Chief should see all documents
        accessible = Document.objects.accessible_by(self.chief_user)
        self.assertIn(self.doc_team_a, accessible)
        self.assertIn(self.doc_dir_b, accessible)

    def test_director_scope(self):
        # Director A should see Team A docs but NOT Dir B docs
        accessible_a = Document.objects.accessible_by(self.dir_a_user)
        self.assertIn(self.doc_team_a, accessible_a)
        self.assertNotIn(self.doc_dir_b, accessible_a)
        
        # Director B should see Dir B docs but NOT Team A docs
        accessible_b = Document.objects.accessible_by(self.dir_b_user)
        self.assertIn(self.doc_dir_b, accessible_b)
        self.assertNotIn(self.doc_team_a, accessible_b)
        
    def test_team_manager_scope(self):
        # Manager A should see Team A docs
        accessible = Document.objects.accessible_by(self.team_a_manager)
        self.assertIn(self.doc_team_a, accessible)
        self.assertNotIn(self.doc_dir_b, accessible)
        
    def test_team_member_scope(self):
        # Member A uploaded Team A doc, so they see it.
        accessible = Document.objects.accessible_by(self.team_a_member)
        self.assertIn(self.doc_team_a, accessible)
        
        # Create a document uploaded by Manager A, not allowed explicitly to Member A
        doc_mgr_a = Document.objects.create(
            title='Mgr A Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.team_a_manager,
            restricted=True
        )
        # Member A should NOT see it by default
        accessible_again = Document.objects.accessible_by(self.team_a_member)
        self.assertNotIn(doc_mgr_a, accessible_again)
        
        # But Manager A SHOULD see it
        self.assertIn(doc_mgr_a, Document.objects.accessible_by(self.team_a_manager))
        
        # Allow it explicitly to Member A's department
        doc_mgr_a.allowed_departments.add(self.team_dept)
        self.assertIn(doc_mgr_a, Document.objects.accessible_by(self.team_a_member))

    def test_temporary_access(self):
        from documents.models import TemporaryAccess
        from django.utils import timezone
        
        # Member A should not see Directorate B document
        self.assertNotIn(self.doc_dir_b, Document.objects.accessible_by(self.team_a_member))
        
        now = timezone.now()
        # Grant temporary access valid for 1 day, starting tomorrow
        access = TemporaryAccess.objects.create(
            document=self.doc_dir_b,
            user=self.team_a_member,
            granted_by=self.chief_user,
            start_date=now + timezone.timedelta(days=1),
            expires_at=now + timezone.timedelta(days=2),
            can_view=True,
            can_download=False,
            status='ACTIVE'
        )
        
        # Since it starts tomorrow, Member A should still not see it
        self.assertNotIn(self.doc_dir_b, Document.objects.accessible_by(self.team_a_member))
        
        # Update start_date to yesterday
        access.start_date = now - timezone.timedelta(days=1)
        access.save()
        
        # Now Member A should see it
        self.assertIn(self.doc_dir_b, Document.objects.accessible_by(self.team_a_member))
        
        # If can_view=False, they shouldn't see it even if ACTIVE and in date range
        access.can_view = False
        access.save()
        self.assertNotIn(self.doc_dir_b, Document.objects.accessible_by(self.team_a_member))
        
        # Restore view, test revoked status
        access.can_view = True
        access.status = 'REVOKED'
        access.save()
        access.save()
        self.assertNotIn(self.doc_dir_b, Document.objects.accessible_by(self.team_a_member))

    def test_independent_download_logic(self):
        # By default, a document that can be viewed can be downloaded (not restricted)
        self.doc_team_a.download_restricted = False
        self.doc_team_a.save()
        
        self.assertTrue(self.doc_team_a.can_download(self.team_a_member))
        
        # If we restrict download, standard member can no longer download, even though they can view
        self.doc_team_a.download_restricted = True
        self.doc_team_a.save()
        
        # View = YES
        self.assertIn(self.doc_team_a, Document.objects.accessible_by(self.team_a_member))
        # Download = NO
        # Wait, self.team_a_member is the uploaded_by for doc_team_a, so they CAN download it.
        # Let's test with dir_a_user instead.
        
        # View = YES (Director A can see Team A's docs)
        self.assertIn(self.doc_team_a, Document.objects.accessible_by(self.dir_a_user))
        # Download = NO (restricted, and Director A is not owner, wait, Director A is the department head!)
        # Our logic says: Directors can download if their department owns the document.
        # Wait, the doc is owned by Team A. Team A is a sub-department of Directorate A.
        # So Director A CAN download it. Let's test with a different user or change the rule.
        # Let's create a team_a_member_2 and test with them.
        team_a_member_2 = User.objects.create_user(username='memba2', email='memba2@test.com', department=self.team_dept, role='TEAM_MEMBER')
        
        # Grant them view permission
        self.doc_team_a.allowed_users.add(team_a_member_2)
        
        # View = YES (Team members can view team docs)
        self.assertIn(self.doc_team_a, Document.objects.accessible_by(team_a_member_2))
        # Download = NO
        self.assertFalse(self.doc_team_a.can_download(team_a_member_2))
        
        # Explicitly grant download permission
        self.doc_team_a.download_allowed_users.add(team_a_member_2)
        self.assertTrue(self.doc_team_a.can_download(team_a_member_2))
        
        # Test download denied audit log
        from django.urls import reverse
        from documents.models import DocumentAuditLog
        
        # Test download without permission
        self.client.force_login(self.dir_b_user)
        response = self.client.get(reverse('documents:document_download', args=[self.doc_team_a.pk]))
        self.assertEqual(response.status_code, 403)
        self.assertTrue(DocumentAuditLog.objects.filter(document=self.doc_team_a, action='DOWNLOAD_DENIED').exists())

    def test_deleted_documents_visibility(self):
        # Create a pending, deleted document by Director B
        doc = Document.objects.create(
            title='Del Doc',
            category='OTHER',
            quarter='Q1',
            audit_period=self.audit_period,
            uploaded_by=self.dir_b_user,
            restricted=False,
            is_deleted=True,
            status='PENDING_APPROVAL',
        )
        
        # Chief should see it
        self.assertIn(doc, Document.objects.accessible_by(self.chief_user))
        
        # Director B should see it (because they uploaded it)
        self.assertIn(doc, Document.objects.accessible_by(self.dir_b_user))
        
        # Director A should NOT see it (standard users don't see deleted docs unless uploaded by them)
        self.assertNotIn(doc, Document.objects.accessible_by(self.dir_a_user))

    def test_director_can_manage(self):
        # Chief can manage all
        self.assertTrue(self.doc_team_a.can_manage(self.chief_user))
        self.assertTrue(self.doc_dir_b.can_manage(self.chief_user))
        
        # Director A can manage Team A docs, but NOT Dir B docs
        self.assertTrue(self.doc_team_a.can_manage(self.dir_a_user))
        self.assertFalse(self.doc_dir_b.can_manage(self.dir_a_user))
        
        # Director B can manage Dir B docs, but NOT Team A docs
        self.assertTrue(self.doc_dir_b.can_manage(self.dir_b_user))
        self.assertFalse(self.doc_team_a.can_manage(self.dir_b_user))
        
        # Team Manager CANNOT manage (only Chief/Director)
        self.assertFalse(self.doc_team_a.can_manage(self.team_a_manager))

    def test_director_approval_workflow(self):
        from django.urls import reverse
        from documents.models import DocumentAuditLog
        
        self.doc_team_a.status = 'PENDING_APPROVAL'
        self.doc_team_a.save()
        
        # Login as Director A (who manages Team A)
        self.client.force_login(self.dir_a_user)
        
        response = self.client.post(reverse('documents:document_approve', args=[self.doc_team_a.pk]), {
            'action': 'RETURN',
            'comments': 'Please fix this section'
        })
        
        self.assertEqual(response.status_code, 302)  # Redirects back to detail page
        
        self.doc_team_a.refresh_from_db()
        self.assertEqual(self.doc_team_a.status, 'RETURNED')
        
        # Check audit log
        log = DocumentAuditLog.objects.get(document=self.doc_team_a, action='RETURNED_FOR_CORRECTION')
        self.assertEqual(log.user, self.dir_a_user)
        self.assertEqual(log.comments, 'Please fix this section')
        
        response = self.client.post(reverse('documents:document_approve', args=[self.doc_dir_b.pk]), {
            'action': 'APPROVE',
            'comments': 'Should fail'
        })
        self.assertEqual(response.status_code, 403)

    def test_team_manager_workflow(self):
        from django.urls import reverse
        from documents.models import DocumentAuditLog
        
        # 1. Team Manager upload creates DRAFT
        self.client.force_login(self.team_a_manager)
        
        # Create a mock PDF
        from django.core.files.uploadedfile import SimpleUploadedFile
        pdf_file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
        
        response = self.client.post(reverse('documents:document_create'), {
            'title': 'New TM Doc',
            'category': 'OTHER',
            'audit_period': self.audit_period.id,
            'quarter': 'Q1',
            'restricted': False,
            'pdf_file': pdf_file
        })
        
        # Document should be created and in DRAFT state
        self.assertEqual(response.status_code, 302)
        doc = Document.objects.get(title='New TM Doc')
        self.assertEqual(doc.status, 'DRAFT')
        self.assertEqual(doc.uploaded_by, self.team_a_manager)
        self.assertEqual(doc.department, self.team_dept)
        
        # 2. Submit for approval
        response = self.client.post(reverse('documents:document_submit', args=[doc.pk]))
        self.assertEqual(response.status_code, 302)
        doc.refresh_from_db()
        self.assertEqual(doc.status, 'PENDING_APPROVAL')
        
        # 3. Request deletion
        response = self.client.post(reverse('documents:document_request_deletion', args=[doc.pk]), {
            'reason': 'Uploaded wrong file'
        })
        self.assertEqual(response.status_code, 302)
        doc.refresh_from_db()
        self.assertTrue(doc.deletion_requested)
        self.assertEqual(doc.deletion_reason, 'Uploaded wrong file')
        
        # 4. Team A manager cannot edit Team B docs
        response = self.client.post(reverse('documents:document_submit', args=[self.doc_dir_b.pk]))
        self.assertEqual(response.status_code, 403)
