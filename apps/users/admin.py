from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, SubsystemAccessAnalytics
from django.template.response import TemplateResponse

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'parent')
    list_filter = ('level',)
    search_fields = ('name',)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Internal Audit Structure', {'fields': ('department',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'department', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    ) 
    list_display = BaseUserAdmin.list_display + ('department',)


@admin.register(SubsystemAccessAnalytics)
class SubsystemAccessAnalyticsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False
        
    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request):
        # Ensure the module appears in the sidebar for staff
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        # Ensure the model appears in the sidebar for staff
        return request.user.is_staff

    def changelist_view(self, request, extra_context=None):
        # Calculate analytics metrics
        total_users = User.objects.filter(is_active=True).count()
        dms_users = User.objects.filter(is_active=True, has_dms_access=True).count()
        audit_users = User.objects.filter(is_active=True, has_audit_access=True).count()
        irreg_users = User.objects.filter(is_active=True, has_irregularity_access=True).count()
        analytics_users = User.objects.filter(is_active=True, has_analytics_access=True).count()
        lms_users = User.objects.filter(is_active=True, can_create_lms_course=True).count()

        context = {
            **self.admin_site.each_context(request),
            'title': 'Subsystem Access Analytics',
            'total_users': total_users,
            'dms_users': dms_users,
            'audit_users': audit_users,
            'irreg_users': irreg_users,
            'analytics_users': analytics_users,
            'lms_users': lms_users,
            'opts': self.model._meta,
            'has_view_permission': True,
        }
        
        return TemplateResponse(
            request, 
            'admin/users/subsystemaccessanalytics/change_list.html', 
            context
        )
