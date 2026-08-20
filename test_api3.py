import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()
user = User.objects.filter(is_superuser=True).first() or User.objects.first()

client = Client(HTTP_HOST='localhost')
client.force_login(user)

response1 = client.get('/api/admin/users/')
print(f"Users Status: {response1.status_code}")
if response1.status_code == 400:
    try:
        print(json.dumps(response1.json(), indent=2))
    except:
        print(response1.content)

response2 = client.get('/api/audits/findings/')
print(f"Findings Status: {response2.status_code}")
if response2.status_code == 400:
    try:
        print(json.dumps(response2.json(), indent=2))
    except:
        print(response2.content)

