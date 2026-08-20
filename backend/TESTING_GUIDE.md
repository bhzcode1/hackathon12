# API Testing Guide for Crime Reporting Backend

This guide explains how to test the Crime Reporting Backend API using various methods:
1. Using the provided test script (`test_api.py`)
2. Using the Postman collection (`postman_collection.json`)
3. Manual testing with curl or HTTP clients

## Prerequisites

Before testing, ensure that:
1. The backend API is running (e.g., `uvicorn app.main:app --reload`)
2. Seed data has been generated (run `python seed.py` to populate the database)
3. You have the necessary dependencies installed (requests, etc.)

## 1. Using the Test Script

The `test_api.py` script automates testing of the major API endpoints.

### Steps:
1. Make sure the API is running on `http://localhost:8000`
2. Run the script:
   ```bash
   python test_api.py
   ```
3. The script will:
   - Test authentication (login and register)
   - Test users CRUD operations
   - Test evidence upload, retrieval, and deletion
   - Test dashboard endpoints (stats, crime types, recent reports, hotspots)
   - Test heatmap endpoint
   - Test analytics endpoints (crime trends, severity distribution, status distribution)
   - Test AI duplicate detection endpoint

### Expected Output:
The script will print the status code and response body for each test. Look for status codes in the 2xx range for successful operations.

## 2. Using Postman Collection

The `postman_collection.json` file can be imported into Postman for interactive testing.

### Steps:
1. Open Postman
2. Click "Import" -> "Upload Files" -> select `postman_collection.json`
3. The collection will appear in your Postman sidebar with folders for each API module
4. Set up environment variables:
   - Create a new environment (or use an existing one)
   - Add variable `base_url` with value `http://localhost:8000/api/v1`
   - Add variable `access_token` (this will be automatically set after login)
5. Start with the "Auth" -> "Login" request to obtain an access token
6. Proceed through the folders in order, using the access token from the login response

### Tips:
- The collection uses a pre-request script to set the base URL if not already set
- The collection uses a test script to automatically save the access token from login responses
- For the evidence upload request, you'll need to select a file to upload (any small file will work)

## 3. Manual Testing with curl

You can also test individual endpoints using curl or similar tools.

### Examples:

#### Login (to get access token)
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login/access-token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user1@example.com&password=password123"
```

#### Get Dashboard Stats
```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/stats" \
  -H "Authorization: Bearer <your_access_token_here>"
```

#### Upload Evidence
```bash
curl -X POST "http://localhost:8000/api/v1/reports/1/upload" \
  -H "Authorization: Bearer <your_access_token_here>" \
  -F "file=@/path/to/your/file.jpg" \
  -F "crime_report_id=1" \
  -F "description=Test evidence"
```

#### Get Heatmap Data
```bash
curl -X GET "http://localhost:8000/api/v1/reports/heatmap?precision=3" \
  -H "Authorization: Bearer <your_access_token_here>"
```

## 4. Testing Specific Scenarios

Refer to `DEMO_FLOW.md` for guided demo scenarios that showcase key features of the system.

## 5. Troubleshooting

### Common Issues:
- **Connection refused**: Make sure the API is running and accessible at the specified URL
- **401 Unauthorized**: Check that you're including a valid Bearer token in the Authorization header
- **422 Unprocessable Entity**: Validate your request body against the expected schema (check API docs at `/docs`)
- **500 Internal Server Error**: Check the server logs for details

### Getting Help:
- Interactive API documentation is available at `http://localhost:8000/api/v1/docs` (Swagger UI)
- Alternative documentation at `http://localhost:8000/api/v1/redoc` (ReDoc)

## 6. Test Data

The seed data generator (`seed.py`) creates:
- 50 users (including a superuser at `user1@example.com` / `password123`)
- 200 crime reports with various statuses, severities, crime types, and locations
- Evidence files attached to approximately 40% of the reports

You can modify the seed data generator to create different quantities or types of data as needed for your tests.

---

*Last updated: August 20, 2026*