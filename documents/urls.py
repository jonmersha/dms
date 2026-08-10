# documents/urls.py
from django.urls import path
from . import views
from . import views_backup  # Add this import
from . import views_chief

app_name = 'documents'

urlpatterns = [
    path('', views.DocumentListView.as_view(), name='document_list'),
    path('teams/', views.DepartmentTeamsView.as_view(), name='department_teams'),
    path('create/', views.DocumentCreateView.as_view(), name='document_create'),
    path('<int:pk>/update/', views.DocumentUpdateView.as_view(), name='document_update'),
    path('<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document_delete'),
    path('<int:pk>/submit/', views.DocumentSubmitView.as_view(), name='document_submit'),
    path('<int:pk>/request-deletion/', views.DocumentRequestDeletionView.as_view(), name='document_request_deletion'),
    path('<int:pk>/download/', views.document_download, name='document_download'),
    # Alternative download view using class-based view:
    # path('<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document_download'),
    
    path('<int:pk>/', views_chief.DocumentDetailView.as_view(), name='document_detail'),
    path('<int:pk>/review-deletion/', views_chief.DocumentDeletionReviewView.as_view(), name='review_deletion'),
    path('<int:pk>/manage-access/', views_chief.TemporaryAccessManageView.as_view(), name='manage_access'),
    path('<int:pk>/approve/', views_chief.DocumentApprovalView.as_view(), name='document_approve'),


    # Backup URLs
    path('backup/', views_backup.backup_dashboard, name='backup_dashboard'),
    path('backup/create/', views_backup.create_backup, name='create_backup'),
    path('backup/<int:backup_id>/download/', views_backup.download_backup, name='download_backup'),
    path('backup/<int:backup_id>/delete/', views_backup.delete_backup, name='delete_backup'),
    path('backup/<int:backup_id>/status/', views_backup.backup_status, name='backup_status'),
    path('backup/<int:backup_id>/logs/', views_backup.backup_logs, name='backup_logs'),
]