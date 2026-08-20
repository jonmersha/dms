from datetime import timedelta
from pathlib import Path
# settings.py
import os
import os
import sys

# Add the apps directory to the Python path
APPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR)


BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = False
SECRET_KEY = 'django-insecure-nr0t&gitkib8ayb3m+$!7*(&7%vjyo6qj^1rza6a55@j@x=d(d'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.8.6',
    '10.8.100.239',
    '192.168.0.105'
    
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

CORS_ALLOW_ALL_ORIGINS = True

# Backup settings
BACKUP_DIR = os.path.join(BASE_DIR, 'backups')
MAX_BACKUP_AGE_DAYS = 30  # Auto-delete backups older than 30 days

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'drf_spectacular',
    
    'djoser',
    # 'debug_toolbar',
    'corsheaders',  # Add this for CORS
    'users',
    'audits',
    'analytics',
    'documents',  # Fixed: changed from 'documents' to 'documents'
    'public_pages',
    'lms',
    'irregularities',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cap.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', BASE_DIR / 'front'],  # Add this line,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cap.wsgi.application'

# Database
# Temporarily reverted to SQLite to test app functionality after restructure
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
# PostgreSQL Configuration (Commented out until DB is provisioned)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('DB_NAME', 'dms_db'),
#         'USER': os.environ.get('DB_USER', 'postgres'),
#         'PASSWORD': os.environ.get('DB_PASSWORD', ''),
#         'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
#         'PORT': os.environ.get('DB_PORT', '5432'),
#     }
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'users.validators.ComplexPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / 'front',
]

WHITENOISE_ROOT = BASE_DIR / 'front'
WHITENOISE_AUTOREFRESH = True


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=12),
    'AUTH_HEADER_TYPES': ('JWT',),
}

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Email Configuration (Console for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'

# Djoser
DJOSER = {
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'ACTIVATION_URL': 'activate/{uid}/{token}',
    'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}',
    'SERIALIZERS': {
        'user_create': 'users.serializer.UserCreateSerializer',
        'current_user': 'users.serializer.UserSerializer',
    }
}

# Jazzmin
JAZZMIN_SETTINGS = {
    "site_title": "DSM Admin",
    "site_header": "DSM Administration",
    "welcome_sign": "Welcome to the DSM Admin Portal",
    "search_model": "users.User",  
    "show_sidebar": True,
    "user_avatar": None,
}

# Debug Toolbar
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
    '192.168.1.6',
    '10.11.246.192',
    '10.0.0.1',
]
# ==========================================
# Security & Session Hardening
# ==========================================
SESSION_COOKIE_AGE = 900  # 15 minutes (in seconds)
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Note: SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE 
# are intentionally left out or commented to allow local HTTP development.
