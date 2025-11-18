from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from documents.views import document_download_admin
from dms.cd import CreateAdminUserView

def home_view(request):
    return HttpResponse("""
    <html>
        <head>
            <title>Document Management System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                a { color: #007bff; text-decoration: none; margin: 10px 0; display: inline-block; }
                a:hover { text-decoration: underline; }
                .links { margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>Document Management System</h1>
            <div class="links">
                <p><a href="/admin/">📊 Go to Admin Panel</a></p>
                <p><a href="/documents/">📁 View Documents</a></p>
                <p><a href="/auth/users/me/">👤 User Profile (API)</a></p>
                <p><a href="/auth/token/login/">🔑 Get JWT Token</a></p>
                <p><a href="/cd/">🔧 Create Admin User</a></p>
            </div>
        </body>
    </html>
    """)

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    # Admin document download
    path('admin/document/<int:pk>/download/', document_download_admin, name='admin_document_download'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('documents/', include('documents.urls')),
    path('cd/', CreateAdminUserView.as_view(), name="create-admin"),
]

# Debug Toolbar
if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site
admin.site.site_header = 'Coop Audit Admin'
admin.site.site_title = 'Audit Admin'
admin.site.index_title = 'Site Administration'