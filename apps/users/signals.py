from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserAuditLog

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    UserAuditLog.objects.create(
        target_user=user,
        performed_by=user,
        action='LOGIN',
        notes="User successfully logged in."
    )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    if user:
        UserAuditLog.objects.create(
            target_user=user,
            performed_by=user,
            action='LOGOUT',
            notes="User logged out."
        )

@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    username = credentials.get('username', None)
    if username:
        user = User.objects.filter(username=username).first()
        if user:
                ip_addr = request.META.get('REMOTE_ADDR') if request else 'Unknown'
                UserAuditLog.objects.create(
                    target_user=user,
                    performed_by=None,
                    action='FAILED_LOGIN',
                    notes=f"Failed login attempt from IP {ip_addr}."
                )

@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    if created:
        UserAuditLog.objects.create(
            target_user=instance,
            performed_by=None, # Usually created by admin, could be anonymous if self-registered
            action='CREATED',
            notes="User account initially created."
        )
