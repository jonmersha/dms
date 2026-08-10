from documents.models import DocumentAuditLog

def log_document_event(document, user, action, request=None, result='SUCCESS', comments='', previous_values=None, new_values=None):
    """
    Unified helper to log document lifecycle events.
    Automatically extracts request context and user organizational context.
    """
    ip_address = None
    user_agent = ''
    if request:
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:255]
        
    username = user.username if user else ''
    role = getattr(user, 'role', '') if user else ''
    dept = getattr(user, 'department', None)
    department_name = dept.name if dept else ''
    team_name = ''
    
    if dept:
        if dept.level == 'TEAM':
            team_name = dept.name
            department_name = dept.parent.name if dept.parent else ''
        else:
            team_name = ''

    return DocumentAuditLog.objects.create(
        document=document,
        document_title=document.title if document else '',
        user=user,
        user_username=username,
        role=role,
        department=department_name,
        team=team_name,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        result=result,
        comments=comments,
        previous_values=previous_values,
        new_values=new_values
    )
