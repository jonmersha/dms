import requests

session = requests.Session()
res = session.post('http://localhost:8000/auth/jwt/create/', json={
    'username': 'akebede',
    'password': 'password123'
})
print("Login status:", res.status_code)
if res.status_code == 200:
    token = res.json().get('access')
    headers = {'Authorization': f'JWT {token}'}
    res2 = session.post('http://localhost:8000/api/audits/periods/', json={
        "fiscal_year": "2026-27",
        "start_date": "2026-07-08",
        "end_date": "2027-07-07",
        "is_active": True
    }, headers=headers)
    print("Create status:", res2.status_code)
    print("Create response:", res2.text)
else:
    print(res.text)
