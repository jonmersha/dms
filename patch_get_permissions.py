with open('apps/lms/views.py', 'r') as f:
    code = f.read()

old_code = """    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'complete':
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]"""

new_code = """    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['complete', 'save_progress']:
            return [permissions.IsAuthenticated()]
        return [IsContentManager()]"""

if old_code in code:
    code = code.replace(old_code, new_code)
    with open('apps/lms/views.py', 'w') as f:
        f.write(code)

