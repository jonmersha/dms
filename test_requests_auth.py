import requests

login_url = "http://localhost:8000/auth/jwt/create/"
credentials = {"username": "admin", "password": "password"}

res = requests.post(login_url, json=credentials)
print("Login status:", res.status_code)
if res.status_code != 200:
    print(res.text)
    exit()

token = res.json().get('access')

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

