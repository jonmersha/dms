import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from users.models import User
from users.serializer import AdminUserSerializer

# Create a test user
user, _ = User.objects.get_or_create(username='test_pass_user', defaults={'email': 'test@example.com'})
user.set_password('oldpass')
user.save()

# Update using serializer
serializer = AdminUserSerializer(user, data={'password': 'newpass123'}, partial=True)
if serializer.is_valid():
    serializer.save()
    print("Update successful.")
    
    # Verify
    user.refresh_from_db()
    print("Password changed:", user.check_password('newpass123'))
else:
    print("Validation failed:", serializer.errors)
