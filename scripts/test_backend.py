import requests
import json
import random
import string
import time
from faker import Faker
import os
import base64

# Initialize Faker for realistic test data
fake = Faker()
BASE_URL = "http://localhost:5000/api"  # Base API URL

# Generate random user data
def generate_random_user():
    return {
        "email": fake.email(),
        "password": ''.join(random.choices(string.ascii_letters + string.digits, k=10)),
        "name": fake.name()
    }

# Generate random admin user
def generate_admin_user():
    return {
        "email": "admin@" + fake.domain_name(),
        "password": ''.join(random.choices(string.ascii_letters + string.digits, k=12)),
        "name": fake.name(),
        "role": "admin"
    }

# Generate random article text
def generate_random_article():
    return fake.paragraph(nb_sentences=random.randint(15, 30))

# API test helper
def test_api(endpoint, method="GET", data=None, headers=None, files=None, description=""):
    url = f"{BASE_URL}{endpoint}"
    try:
        start_time = time.time()
        if method.upper() == "POST":
            if files:
                # Handle file uploads separately
                response = requests.post(url, files=files, data=data, headers=headers)
            else:
                response = requests.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        elif method.upper() == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        else:
            response = requests.get(url, headers=headers)
        
        elapsed = (time.time() - start_time) * 1000
        
        print(f"\n⮞ TEST: {description} ({method} {endpoint})")
        print(f"⏱️  Response: {response.status_code} ({elapsed:.2f}ms)")
        
        try:
            json_data = response.json()
            print("📦 Response:", json.dumps(json_data, indent=2)[:500] + ("..." if len(str(json_data)) > 500 else ""))
            return response
        except:
            print("📦 Response:", response.text[:200])
            return response
    except requests.exceptions.ConnectionError:
        print(f"🔴 Connection failed: {url}")
        return None

# Create a mock PDF file
def create_mock_pdf():
    # This is a minimal PDF file content
    pdf_content = b"%PDF-1.1\n1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n3 0 obj\n<</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] /Contents 4 0 R>>\nendobj\n4 0 obj\n<</Length 44>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000054 00000 n \n0000000100 00000 n \n0000000178 00000 n \ntrailer\n<</Size 5 /Root 1 0 R>>\nstartxref\n242\n%%EOF"
    return pdf_content

# Main test sequence
def run_tests():
    # Generate test data
    test_user = generate_random_user()
    admin_user = generate_admin_user()
    article_text = generate_random_article()
    test_url = "https://www.bbc.com/news/world-us-canada-56953143"  # Sample news URL
    
    # ========================
    # PUBLIC ENDPOINTS TESTS
    # ========================
    print("\n" + "="*60)
    print("🔓 TESTING PUBLIC ENDPOINTS")
    print("="*60)
    
    # 1. Test demo token
    demo_response = test_api(
        "/demo/token",
        "GET",
        description="Get Demo Token"
    )
    
    # 2. Test registration
    reg_response = test_api(
        "/auth/register",
        "POST",
        data=test_user,
        description="User Registration"
    )
    
    # 3. Test login
    login_response = test_api(
        "/auth/login",
        "POST",
        data={"email": test_user["email"], "password": test_user["password"]},
        description="User Login"
    )
    
    # Extract JWT token
    token = login_response.json().get("token") if login_response else None
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    if not token:
        print("🔴 Aborting tests - no authentication token received")
        return
    
    # ========================
    # AUTHENTICATED USER TESTS
    # ========================
    print("\n" + "="*60)
    print("🔐 TESTING AUTHENTICATED USER ENDPOINTS")
    print("="*60)
    
    # 4. Test profile access
    test_api(
        "/auth/profile",
        "GET",
        headers=headers,
        description="Get User Profile"
    )
    
    # 5. Test profile update
    test_api(
        "/auth/profile",
        "PUT",
        headers=headers,
        data={"name": "Updated " + fake.first_name()},
        description="Update User Profile"
    )
    
    # 6. Test password change
    new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    test_api(
        "/auth/password",
        "PUT",
        headers=headers,
        data={
            "currentPassword": test_user["password"],
            "newPassword": new_password
        },
        description="Change Password"
    )
    
    # Update password for subsequent logins
    test_user["password"] = new_password
    
    # ========================
    # SUMMARIZATION TESTS
    # ========================
    print("\n" + "="*60)
    print("📝 TESTING SUMMARIZATION ENDPOINTS")
    print("="*60)
    
    # 7. Text summarization - with options
    text_response = test_api(
        "/summarize/text",
        "POST",
        data={
            "text": article_text,
            "summaryType": "abstractive",
            "summaryLength": "medium",
            "focus": "key points"
        },
        headers=headers,
        description="Text Summarization with Options"
    )
    
    # Get summary ID correctly
    summary_id = None
    if text_response and text_response.status_code == 200:
        response_data = text_response.json()
        summary_id = response_data.get("id")
        if summary_id:
            print(f"📝 Summary ID: {summary_id}")
        else:
            print("⚠️ No summary ID in response")
    else:
        print("🔴 Text summarization failed")
    
    # 8. URL summarization
    url_response = test_api(
        "/summarize/url",
        "POST",
        data={"url": test_url},
        headers=headers,
        description="URL Summarization"
    )
    
    # 9. PDF summarization
    pdf_content = create_mock_pdf()
    pdf_file = {"file": ("test.pdf", pdf_content, "application/pdf")}
    pdf_response = test_api(
        "/summarize/pdf",
        "POST",
        headers=headers,
        files=pdf_file,
        data={},  # Additional data if needed
        description="PDF Summarization"
    )
    
    # ========================
    # HISTORY TESTS
    # ========================
    print("\n" + "="*60)
    print("🕰️  TESTING HISTORY ENDPOINTS")
    print("="*60)
    
    if summary_id:
        # 10. Get all summaries
        test_api(
            "/summaries",
            headers=headers,
            description="Get All Summaries"
        )
        
        # 11. Get specific summary
        test_api(
            f"/summaries/{summary_id}",
            headers=headers,
            description="Get Specific Summary"
        )
        
        # 12. Delete summary
        test_api(
            f"/summaries/{summary_id}",
            "DELETE",
            headers=headers,
            description="Delete Summary"
        )
    else:
        print("⚠️ Skipping history tests - no valid summary ID")
    
    # ========================
    # ADMIN TESTS (requires admin user setup)
    # ========================
    print("\n" + "="*60)
    print("👑 TESTING ADMIN ENDPOINTS (requires admin setup)")
    print("="*60)
    
    # Note: These will only work if you have an admin user setup
    test_api(
        "/admin/users",
        headers=headers,
        description="List Users (Admin)"
    )
    
    test_api(
        "/admin/metrics",
        headers=headers,
        description="Get Admin Metrics"
    )

if __name__ == "__main__":
    run_tests()
    print("\n✅ All tests completed!")