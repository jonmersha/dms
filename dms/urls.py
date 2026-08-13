from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from documents.views import document_download_admin, protected_media_view
from dms.cd import CreateAdminUserView
from .views import custom_login, custom_logout, profile_view
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
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
    path('api/', include('documents.api_urls')),
    path('api/admin/', include('dms.api_admin_urls')),
    path('cd/', CreateAdminUserView.as_view(), name="create-admin"),
    
    # Swagger API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Intercept direct media access
    path('media/<path:file_path>', protected_media_view, name='protected_media'),
    
    # Catch-all route for React SPA
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
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