import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()
user = User.objects.filter(is_superuser=True).first() or User.objects.first()

client = Client()
client.force_login(user)

response1 = client.get('/api/admin/users/')
print(f"Users Status: {response1.status_code}")

response2 = client.get('/api/audits/findings/')
print(f"Findings Status: {response2.status_code}")

