import requests

url = "http://localhost:8000/auth/jwt/refresh/"
data = {"refresh": "invalid_refresh_token_string"}

r = requests.post(url, json=data)
print("Refresh Status:", r.status_code)
print(r.text)

