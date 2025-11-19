# documents/urls.py
from django.urls import path
from . import views
from . import views_backup  # Add this import

app_name = 'documents'

urlpatterns = [
    path('', views.DocumentListView.as_view(), name='document_list'),
    path('create/', views.DocumentCreateView.as_view(), name='document_create'),
    path('<int:pk>/update/', views.DocumentUpdateView.as_view(), name='document_update'),
    path('<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document_delete'),
    path('<int:pk>/download/', views.document_download, name='document_download'),
    # Alternative download view using class-based view:
    # path('<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document_download'),


    # Backup URLs
    path('backup/', views_backup.backup_dashboard, name='backup_dashboard'),
    path('backup/create/', views_backup.create_backup, name='create_backup'),
    path('backup/<int:backup_id>/download/', views_backup.download_backup, name='download_backup'),
    path('backup/<int:backup_id>/delete/', views_backup.delete_backup, name='delete_backup'),
    path('backup/<int:backup_id>/status/', views_backup.backup_status, name='backup_status'),
    path('backup/<int:backup_id>/logs/', views_backup.backup_logs, name='backup_logs'),
]