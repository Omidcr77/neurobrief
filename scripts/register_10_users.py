import requests

# Base URL for your auth routes (note the /api prefix)
BASE_URL = "http://localhost:5000/api/auth"
DEFAULT_PASSWORD = "Password123!"
OUTPUT_FILE = "registered_users.txt"

def register_user(name: str, email: str, password: str):
    """
    Sends a POST to /api/auth/register with the given credentials.
    """
    url = f"{BASE_URL}/register"
    payload = {
        "name": name,
        "email": email,
        "password": password
    }
    try:
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        print(f"[ERROR] {email}: {resp.status_code} – {resp.text}")
        return False

    data = resp.json()
    token = data.get("token")
    print(f"[OK]    {email} → token: {token}")
    return True

def main():
    # Open the output file once; overwrite if it already exists
    with open(OUTPUT_FILE, 'w') as f:
        for i in range(1, 11):
            name  = f"Test{i}"
            email = f"test{i}@example.com"
            success = register_user(name, email, DEFAULT_PASSWORD)
            if success:
                # Write email and password for each successfully registered user
                f.write(f"{email}:{DEFAULT_PASSWORD}\n")

    print(f"\n✅ All done! Credentials written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
