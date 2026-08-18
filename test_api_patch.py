import os
import django
from django.test.client import Client
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from users.models import User
from rest_framework_simplejwt.tokens import AccessToken

admin = User.objects.filter(is_superuser=True).first()
target = User.objects.exclude(id=admin.id).first()

if not admin or not target:
    print("Need at least 2 users")
    exit(1)

token = AccessToken.for_user(admin)
client = Client(SERVER_NAME='localhost')
response = client.patch(
    f'/api/admin/users/{target.id}/',
    data=json.dumps({'password': 'newpass123', 'username': target.username}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'JWT {token}'
)

print("Response Status:", response.status_code)
print("Response Data:", response.data if hasattr(response, 'data') else response.content)

target.refresh_from_db()
print("Password changed:", target.check_password('newpass123'))
