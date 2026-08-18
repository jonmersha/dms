with open('dms/settings.py', 'r') as f:
    code = f.read()

# 1. Update SIMPLE_JWT
old_jwt = """SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('JWT',),
}"""
new_jwt = """SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=12),
    'AUTH_HEADER_TYPES': ('JWT',),
}"""
if old_jwt in code:
    code = code.replace(old_jwt, new_jwt)

# 2. Add Security Settings at the end of the file
security_settings = """
# ==========================================
# Security & Session Hardening
# ==========================================
SESSION_COOKIE_AGE = 900  # 15 minutes (in seconds)
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Note: SECURE_SSL_REDIRECT, SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE 
# are intentionally left out or commented to allow local HTTP development.
"""
if 'SESSION_COOKIE_AGE' not in code:
    code += security_settings

with open('dms/settings.py', 'w') as f:
    f.write(code)
