from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department

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

# class TaggedItemInline(GenericStackedInline):
#     autocomplete_fields = ['tag']
#     model = TaggedItem
# class CustomProductAdmin(ProductAdmin):
#         inlines = [TaggedItemInline]  
# admin.site.unregister(Product)
# admin.site.register(Product, CustomProductAdmin)



