import re

with open('dms/settings.py', 'r') as f:
    settings = f.read()

# Add python-dotenv import and load
if 'from dotenv import load_dotenv' not in settings:
    settings = settings.replace(
        "import os\nfrom pathlib import Path",
        "import os\nfrom pathlib import Path\nfrom dotenv import load_dotenv\n\nload_dotenv()"
    )

# Replace DATABASES block
old_db = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}"""

new_db = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'dms_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}"""

if 'django.db.backends.sqlite3' in settings:
    settings = settings.replace(old_db, new_db)

with open('dms/settings.py', 'w') as f:
    f.write(settings)

# Write default .env file
env_content = """# PostgreSQL Database Configuration
DB_NAME=dms_db
DB_USER=postgres
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=5432
"""
import os
if not os.path.exists('.env'):
    with open('.env', 'w') as f:
        f.write(env_content)
