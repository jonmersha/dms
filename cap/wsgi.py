"""
WSGI config for dms project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import os
import sys

# Add the apps directory to the Python path
APPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR)


from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')

application = get_wsgi_application()
