import os
import shutil
import re

APPS_DIR = 'apps'
if not os.path.exists(APPS_DIR):
    os.makedirs(APPS_DIR)

app_folders = [
    'analytics',
    'audits',
    'documents',
    'irregularities',
    'lms',
    'public_pages',
    'users'
]

# 1. Move folders
for app in app_folders:
    if os.path.exists(app) and os.path.isdir(app):
        shutil.move(app, os.path.join(APPS_DIR, app))

# Path injection code
path_code = """import os
import sys

# Add the apps directory to the Python path
APPS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR)
"""

settings_path_code = """import os
import sys

# Add the apps directory to the Python path
APPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR)
"""

# 2. Patch manage.py
with open('manage.py', 'r') as f:
    manage = f.read()

if 'sys.path.insert(0, APPS_DIR)' not in manage:
    manage = manage.replace('import sys', f"import sys\n{path_code}")
    with open('manage.py', 'w') as f:
        f.write(manage)

# 3. Patch cap/wsgi.py
if os.path.exists('cap/wsgi.py'):
    with open('cap/wsgi.py', 'r') as f:
        wsgi = f.read()

    if 'sys.path.insert(0, APPS_DIR)' not in wsgi:
        wsgi = wsgi.replace('import os', f"import os\n{settings_path_code}")
        with open('cap/wsgi.py', 'w') as f:
            f.write(wsgi)

# 4. Patch cap/asgi.py
if os.path.exists('cap/asgi.py'):
    with open('cap/asgi.py', 'r') as f:
        asgi = f.read()

    if 'sys.path.insert(0, APPS_DIR)' not in asgi:
        asgi = asgi.replace('import os', f"import os\n{settings_path_code}")
        with open('cap/asgi.py', 'w') as f:
            f.write(asgi)

# 5. Patch cap/settings.py
with open('cap/settings.py', 'r') as f:
    settings = f.read()

if 'sys.path.insert(0, APPS_DIR)' not in settings:
    settings = settings.replace('import os', f"import os\n{settings_path_code}")
    with open('cap/settings.py', 'w') as f:
        f.write(settings)

