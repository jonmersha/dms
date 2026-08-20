import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from django.contrib.auth.models import Group

subsystems = ['DMS', 'Incident', 'Audit', 'Analytics']
base_roles = ['Chief', 'Director', 'Manager', 'Auditor', 'Viewer']

for sub in subsystems:
    for role in base_roles:
        group_name = f"{sub}_{role}"
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            print(f"Created group: {group_name}")
        else:
            print(f"Group already exists: {group_name}")
