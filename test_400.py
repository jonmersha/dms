import requests

url = "http://localhost:8000/api/audits/universe/"
# sending a list where a dict is expected to trigger 400
headers = {"Content-Type": "application/json"}
try:
    r = requests.post(url, json=[{"name": "test"}], headers=headers)
    print("Status:", r.status_code)
    print("Response:", r.text)
except Exception as e:
    print("Error:", str(e))
