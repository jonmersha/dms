import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
import requests

User = get_user_model()
user = User.objects.filter(is_active=True).first()

if not user:
    print("No active users found!")
    exit(1)

token = str(AccessToken.for_user(user))

url = "http://localhost:8000/api/audits/findings/"
headers = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "http://localhost:5173",
    "Referer": "http://localhost:5173/",
    "Authorization": f"JWT {token}"
}

r = requests.get(url, headers=headers)
print("Auth Request Status:", r.status_code)
print(r.text[:200])

