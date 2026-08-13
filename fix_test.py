import re
with open('users/tests.py', 'r') as f:
    content = f.read()

content = content.replace(
    "self.client.patch('/api/auth/users/me/', payload)",
    "self.client.put('/api/auth/users/me/', payload)"
).replace(
    "self.client.patch('/api/auth/users/me/', {'last_name': 'Updated'})",
    "self.client.put('/api/auth/users/me/', {'last_name': 'Updated', 'first_name': 'Test', 'email': 'test@test.com', 'username': 'test'})"
)
with open('users/tests.py', 'w') as f:
    f.write(content)
