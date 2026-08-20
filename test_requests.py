import requests

# We need a valid JWT token. We can get one by hitting the login endpoint
login_url = "http://localhost:8000/auth/jwt/create/"
credentials = {"username": "admin", "password": "password"} # Assuming default credentials, or we can just skip auth if it's 400 before auth.
# Actually, let's just make the request without auth and see if it returns 401 or 400.
# If it returns 401, then the 400 the user sees is AFTER auth.
# If it returns 400, then we found the issue!

url = "http://localhost:8000/api/audits/findings/"
headers = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "http://localhost:5173",
    "Referer": "http://localhost:5173/"
}

r = requests.get(url, headers=headers)
print("Status without Auth:", r.status_code)
print(r.text[:200])

