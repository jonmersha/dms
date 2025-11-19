# documents/views_backup.py
import os
import json
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.conf import settings
from .models import BackupOperation, Document
from .services.backup_service import BackupService
from cryptography.fernet import Fernet

def staff_required(function=None):
    """Decorator to check if user is staff member"""
    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and u.is_staff,
        login_url='/login/',
        redirect_field_name='next'
    )
    if function:
        return actual_decorator(function)
    return actual_decorator

@login_required
@staff_required
def backup_dashboard(request):
    """Backup management dashboard"""
    backups = BackupOperation.objects.all()[:10]  # Show last 10 backups
    total_documents = Document.objects.count()
    
    context = {
        'backups': backups,
        'total_documents': total_documents,
        'backup_types': BackupOperation.BACKUP_TYPE_CHOICES,
    }
    return render(request, 'documents/backup_dashboard.html', context)

@login_required
@staff_required
@require_http_methods(["POST"])
def create_backup(request):
    """Create a new backup"""
    try:
        backup_type = request.POST.get('backup_type', 'FULL')
        include_files = request.POST.get('include_files', 'true') == 'true'
        include_database = request.POST.get('include_database', 'true') == 'true'
        compression = request.POST.get('compression', 'true') == 'true'
        encryption = request.POST.get('encryption', 'false') == 'true'
        
        # Generate backup name
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{backup_type.lower()}_{timestamp}"
        
        # Create backup operation
        backup_operation = BackupOperation.objects.create(
            name=backup_name,
            backup_type=backup_type,
            include_files=include_files,
            include_database=include_database,
            compression=compression,
            created_by=request.user,
        )
        
        # Generate encryption key if enabled
        if encryption:
            key = Fernet.generate_key()
            backup_operation.encryption_key = key.decode()
            backup_operation.save()
        
        # Start backup in background (you might want to use Celery for this)
        backup_service = BackupService(backup_operation)
        success = backup_service.create_backup()
        
        if success:
            messages.success(request, 'Backup created successfully!')
        else:
            messages.error(request, 'Backup creation failed. Check the logs for details.')
        
        return redirect('documents:backup_dashboard')
        
    except Exception as e:
        messages.error(request, f'Error creating backup: {str(e)}')
        return redirect('documents:backup_dashboard')

@login_required
@staff_required
def download_backup(request, backup_id):
    """Download backup file"""
    backup = get_object_or_404(BackupOperation, id=backup_id)
    
    if not backup.backup_file:
        messages.error(request, 'No backup file available for download.')
        return redirect('documents:backup_dashboard')
    
    file_path = backup.backup_file.path
    if os.path.exists(file_path):
        response = HttpResponse(backup.backup_file.read(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{backup.name}.zip"'
        return response
    else:
        messages.error(request, 'Backup file not found.')
        return redirect('documents:backup_dashboard')

@login_required
@staff_required
@require_http_methods(["POST"])
def delete_backup(request, backup_id):
    """Delete backup operation and file"""
    backup = get_object_or_404(BackupOperation, id=backup_id)
    
    try:
        # Delete the actual file
        if backup.backup_file:
            backup.backup_file.delete(save=False)
        
        # Delete the database record
        backup.delete()
        
        messages.success(request, 'Backup deleted successfully!')
    except Exception as e:
        messages.error(request, f'Error deleting backup: {str(e)}')
    
    return redirect('documents:backup_dashboard')

@login_required
@staff_required
def backup_status(request, backup_id):
    """Get backup status (AJAX)"""
    backup = get_object_or_404(BackupOperation, id=backup_id)
    
    data = {
        'id': backup.id,
        'name': backup.name,
        'status': backup.status,
        'status_display': backup.get_status_display(),
        'backed_up_documents': backup.backed_up_documents,
        'total_documents': backup.total_documents,
        'failed_documents': backup.failed_documents,
        'success_rate': backup.success_rate,
        'file_size': backup.file_size,
        'started_at': backup.started_at.isoformat() if backup.started_at else None,
        'completed_at': backup.completed_at.isoformat() if backup.completed_at else None,
        'duration': str(backup.duration) if backup.duration else None,
    }
    
    return JsonResponse(data)

@login_required
@staff_required
def backup_logs(request, backup_id):
    """View backup logs"""
    backup = get_object_or_404(BackupOperation, id=backup_id)
    logs = backup.logs.all()
    
    context = {
        'backup': backup,
        'logs': logs,
    }
    return render(request, 'documents/backup_logs.html', context)