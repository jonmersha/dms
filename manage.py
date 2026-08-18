#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import os
import sys

# Add the apps directory to the Python path
APPS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR)



def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
