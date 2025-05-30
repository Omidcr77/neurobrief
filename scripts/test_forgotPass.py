import requests
import json

# Server configuration
SERVER_URL = "http://localhost:5000"  # Update if your server runs on a different port
ENDPOINT = "/api/auth/forgot-password"

# Test user data
TEST_EMAIL = "omidscsp@gmail.com"  # Use an email that exists in your database

def test_forgot_password():
    url = f"{SERVER_URL}{ENDPOINT}"
    headers = {"Content-Type": "application/json"}
    payload = {"email": TEST_EMAIL}
    
    print(f"Sending POST request to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        print("\nResponse:")
        print(f"Status Code: {response.status_code}")
        print("Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        try:
            print("Body:")
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print("Response body is not JSON:")
            print(response.text)
            
        print("\nCheck your server logs for the reset link!")
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_forgot_password()