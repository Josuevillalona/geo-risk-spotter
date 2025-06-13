import requests
import json

url = "http://127.0.0.1:8000/api/analyze"
data = {
    "zip_code": "10001",
    "RiskScore": 85.0,
    "DIABETES_CrudePrev": 10.5,
    "OBESITY_CrudePrev": 12.3,
    "LPA_CrudePrev": 20.1,
    "CSMOKING_CrudePrev": 18.7,
    "BPHIGH_CrudePrev": 25.5,
    "FOODINSECU_CrudePrev": 15.2,
    "ACCESS2_CrudePrev": 5.9
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
    print("Status Code:", response.status_code)
    print("Response Body:", response.json())
except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
