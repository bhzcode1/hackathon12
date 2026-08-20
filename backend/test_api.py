#!/usr/bin/env python3
"""
API test script for the Crime Reporting Backend.
This script tests the major endpoints of the API.
It assumes the API is running at http://localhost:8000
and that seed data has been loaded (via seed.py).
"""

import requests
import json
import os
import sys
from datetime import datetime

# Base URL of the API
BASE_URL = "http://localhost:8000/api/v1"

# Test user credentials (from seed data)
SUPERUSER_EMAIL = "user1@example.com"
SUPERUSER_PASSWORD = "password123"

# We'll also create a temporary user for testing registration and login
TEST_USER_EMAIL = f"testuser_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_FULL_NAME = "Test User"

def print_response(response, test_name):
    """Helper to print response details."""
    print(f"\n{test_name}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print("-" * 50)

def test_authentication():
    """Test authentication endpoints."""
    print("\n=== Testing Authentication ===")

    # Test login with superuser
    login_data = {
        "username": SUPERUSER_EMAIL,
        "password": SUPERUSER_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/auth/login/access-token", data=login_data)
    print_response(response, "Login (Superuser)")

    if response.status_code != 200:
        print("ERROR: Superuser login failed. Cannot proceed with tests that require authentication.")
        return None

    superuser_token = response.json()["access_token"]

    # Test user registration
    register_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "full_name": TEST_USER_FULL_NAME
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print_response(response, "Register New User")

    # Test login with new user
    login_data = {
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/auth/login/access-token", data=login_data)
    print_response(response, "Login (New User)")

    if response.status_code == 200:
        user_token = response.json()["access_token"]
    else:
        user_token = superuser_token  # Fallback to superuser token

    return {"superuser": superuser_token, "user": user_token}

def test_users_endpoints(token):
    """Test users CRUD endpoints."""
    print("\n=== Testing Users Endpoints ===")
    headers = {"Authorization": f"Bearer {token}"}

    # Get all users
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print_response(response, "Get All Users")

    # Get a specific user (we know the superuser has ID 1 from seed)
    response = requests.get(f"{BASE_URL}/users/1", headers=headers)
    print_response(response, "Get User by ID (ID=1)")

    # Update a user (update full name)
    update_data = {
        "full_name": "Updated Super User"
    }
    response = requests.put(f"{BASE_URL}/users/1", json=update_data, headers=headers)
    print_response(response, "Update User (ID=1)")

    # Get the user again to verify update
    response = requests.get(f"{BASE_URL}/users/1", headers=headers)
    print_response(response, "Get User After Update (ID=1)")

def test_evidence_endpoints(superuser_token, user_token):
    """Test evidence upload endpoints."""
    print("\n=== Testing Evidence Endpoints ===")
    # We'll test with the superuser token
    headers = {"Authorization": f"Bearer {superuser_token}"}

    # First, we need a crime report ID to attach evidence to.
    # We'll get a list of crime reports from the dashboard or by trying to get evidence for a report.
    # Since we don't have a crime reports endpoint, we'll try to get evidence for a report that we know exists from seed data.
    # We'll assume there is at least one crime report (ID=1) from the seed data.
    # If not, we'll skip the evidence tests.

    # Try to get evidence for report ID 1 (this will fail if the report doesn't exist, but we'll handle it)
    response = requests.get(f"{BASE_URL}/reports/1/evidence", headers=headers)
    if response.status_code == 200:
        evidences = response.json()
        if evidences:
            evidence_id = evidences[0]["id"]
            print(f"Found existing evidence ID {evidence_id} for report 1")
        else:
            evidence_id = None
            print("No existing evidence found for report 1, will create new evidence.")
    else:
        # If we can't get evidence for report 1, we'll try to create a new evidence for a report we know exists.
        # We'll assume report ID 1 exists (from seed data).
        evidence_id = None
        print("Could not retrieve evidence for report 1. Will attempt to create new evidence.")

    # Test uploading evidence (requires a file)
    # We'll create a dummy file for upload
    dummy_file_path = os.path.join(os.path.dirname(__file__), "dummy_upload.txt")
    with open(dummy_file_path, "w") as f:
        f.write("This is a dummy file for testing evidence upload.")

    # We need to upload to a specific report ID. We'll use report ID 1 (assuming it exists from seed data).
    report_id = 1
    files = {"file": open(dummy_file_path, "rb")}
    data = {"crime_report_id": report_id, "description": "Test evidence upload"}

    response = requests.post(f"{BASE_URL}/reports/{report_id}/upload", files=files, data=data, headers=headers)
    print_response(response, "Upload Evidence")

    # Clean up the dummy file
    os.remove(dummy_file_path)

    if response.status_code == 201:
        evidence_id = response.json()["id"]
        print(f"Successfully uploaded evidence with ID: {evidence_id}")

        # Test getting the specific evidence
        response = requests.get(f"{BASE_URL}/evidence/{evidence_id}", headers=headers)
        print_response(response, "Get Specific Evidence")

        # Test deleting the evidence
        response = requests.delete(f"{BASE_URL}/evidence/{evidence_id}", headers=headers)
        print_response(response, "Delete Evidence")
    else:
        print("Skipping further evidence tests due to upload failure.")

def test_dashboard_endpoints(token):
    """Test dashboard endpoints."""
    print("\n=== Testing Dashboard Endpoints ===")
    headers = {"Authorization": f"Bearer {token}"}

    endpoints = [
        "/dashboard/stats",
        "/dashboard/crime-types",
        "/dashboard/recent-reports",
        "/dashboard/hotspots"
    ]

    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        print_response(response, f"GET {endpoint}")

def test_heatmap_endpoint(token):
    """Test heatmap endpoint."""
    print("\n=== Testing Heatmap Endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}

    # Test with default precision
    response = requests.get(f"{BASE_URL}/reports/heatmap", headers=headers)
    print_response(response, "GET /reports/heatmap (default precision)")

    # Test with precision=2
    response = requests.get(f"{BASE_URL}/reports/heatmap?precision=2", headers=headers)
    print_response(response, "GET /reports/heatmap?precision=2")

def test_analytics_endpoints(token):
    """Test analytics endpoints."""
    print("\n=== Testing Analytics Endpoints ===")
    headers = {"Authorization": f"Bearer {token}"}

    endpoints = [
        "/analytics/crime-trends",
        "/analytics/severity-distribution",
        "/analytics/status-distribution"
    ]

    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        print_response(response, f"GET {endpoint}")

def test_ai_endpoint(token):
    """Test AI duplicate detection endpoint."""
    print("\n=== Testing AI Duplicate Detection Endpoint ===")
    headers = {"Authorization": f"Bearer {token}"}

    # Test data: a description and location that might match a seed report
    test_data = {
        "description": "Victim reported stolen property",
        "latitude": 40.7128,  # Approximate latitude for New York City
        "longitude": -74.0060  # Approximate longitude for New York City
    }

    response = requests.post(f"{BASE_URL}/ai/detect-duplicate", json=test_data, headers=headers)
    print_response(response, "POST /ai/detect-duplicate")

def main():
    """Main test function."""
    print("Starting API tests...")
    print(f"Testing API at {BASE_URL}")

    # Test authentication and get tokens
    tokens = test_authentication()
    if not tokens:
        print("Authentication failed. Exiting.")
        return

    superuser_token = tokens["superuser"]
    user_token = tokens["user"]

    # Run tests
    try:
        test_users_endpoints(superuser_token)
        test_evidence_endpoints(superuser_token, user_token)
        test_dashboard_endpoints(superuser_token)
        test_heatmap_endpoint(superuser_token)
        test_analytics_endpoints(superuser_token)
        test_ai_endpoint(superuser_token)
    except requests.exceptions.ConnectionError as e:
        print(f"\nERROR: Could not connect to the API at {BASE_URL}")
        print("Make sure the API is running (e.g., uvicorn app.main:app --reload)")
        print(f"Error details: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

    print("\nAPI tests completed.")

if __name__ == "__main__":
    main()