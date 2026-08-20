import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
import json

User = get_user_model()
user = User.objects.filter(is_superuser=True).first() or User.objects.first()

client = APIClient(HTTP_HOST='localhost')
client.force_authenticate(user=user)

endpoints = [
    '/api/audits/findings/',
    '/api/audits/compliance-controls/',
    '/api/audits/universe/',
    '/api/audits/annual-plans/',
    '/api/audits/engagements/'
]

for ep in endpoints:
    response = client.get(ep)
    print(f"Endpoint: {ep} Status: {response.status_code}")
    if response.status_code == 400:
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.content)

