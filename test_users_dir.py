import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
# Get a non-superuser if possible, or just any user
user = User.objects.filter(is_superuser=False).first()
if not user:
    user = User.objects.first()

client = APIClient(HTTP_HOST='localhost')
client.force_authenticate(user=user)

r = client.get('/api/directory/users/')
print("Status:", r.status_code)
