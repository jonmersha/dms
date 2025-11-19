from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from documents.views import document_download_admin
from dms.cd import CreateAdminUserView
from .views import custom_login, custom_logout, profile_view

urlpatterns = [
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    
    # Custom admin URLs must come BEFORE admin.site.urls
    path('admin/document/<int:pk>/download/', document_download_admin, name='admin_document_download'),
    
    # Now include the admin URLs
    path('admin/', admin.site.urls),
    
    path('login/', custom_login, name='login'),
    path('logout/', custom_logout, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('documents/', include('documents.urls')),
    path('cd/', CreateAdminUserView.as_view(), name="create-admin"),
]

if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = 'Audit Document Library'
admin.site.site_title = 'Library'
admin.site.index_title = 'Site Administration'