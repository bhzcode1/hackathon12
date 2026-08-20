# Frontend API Contract

This document describes the API endpoints that the frontend should integrate with.

## Base URL
All endpoints are relative to the base URL of the backend API.

## Authentication
Most endpoints require authentication via a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```
The access token can be obtained by logging in at `/api/v1/auth/login/access-token`.

## Error Responses
All endpoints return errors in the following format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```
Common error codes:
- `VALIDATION_ERROR`: Invalid request parameters (422)
- `NOT_FOUND`: Resource not found (404)
- `INTERNAL_ERROR`: Unexpected server error (500)
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)

## Endpoints

### Get Reports List
Retrieve a paginated list of crime reports with filtering, search, and sorting.

**URL**: `GET /api/v1/reports`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| skip | integer | No | Number of items to skip (default: 0) |
| limit | integer | No | Number of items to return (default: 100, max: 100) |
| status | array of strings | No | Filter by status (e.g., `status=VERIFIED&status=PENDING`) |
| crime_type | array of strings | No | Filter by crime type (e.g., `crime_type=THEFT&crime_type=ASSAULT`) |
| severity | array of strings | No | Filter by severity (e.g., `severity=HIGH&severity=MEDIUM`) |
| search | string | No | Search in description and crime case-insensitive |
| sort | string | No | Sort order: `newest`, `oldest`, `nearest` (default: `newest`) |
| latitude | number | No* | Latitude for `nearest` sort (required if sort is `nearest`) |
| longitude | number | No* | Longitude for `nearest` sort (required if sort is `nearest`) |

*Latitude and longitude are required when `sort=nearest`.

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 123,
      "title": "Robbery at downtown",
      "description": "Someone stole my wallet",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "Downtown NYC",
      "status": "VERIFIED",
      "severity": "HIGH",
      "is_anonymous": false,
      "created_at": "2026-08-20T10:00:00Z",
      "updated_at": "2026-08-20T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "size": 100
}
```
- `items`: Array of crime report objects (see CrimeReportResponse schema)
- `total`: Total number of reports matching the filters
- `page`: Current page number (1-based)
- `size`: Number of items per page

### Get Nearby Reports
Retrieve crime reports within a given radius from a point, sorted by distance.

**URL**: `GET /api/v1/reports/nearby`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | number | Yes | Latitude of the center point (-90 to 90) |
| longitude | number | Yes | Longitude of the center point (-180 to 180) |
| radius_km | number | Yes | Radius in kilometers (> 0) |
| skip | integer | No | Number of items to skip (default: 0) |
| limit | integer | No | Number of items to return (default: 100, max: 100) |

**Response**:
```json
{
  "items": [
    {
      "report_id": 456,
      "crime_type": "THEFT",
      "status": "VERIFIED",
      "severity": "MEDIUM",
      "latitude": 40.7130,
      "longitude": -74.0050,
      "created_at": "2026-08-20T09:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "size": 100
}
```
- `items`: Array of nearby report objects (see NearbyReportResponse schema)
- `total`: Total number of reports within the radius
- `page`: Current page number (1-based)
- `size`: Number of items per page

### Get Map Reports
Retrieve simplified report data for map markers.

**URL**: `GET /api/v1/reports/map`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| skip | integer | No | Number of items to skip (default: 0) |
| limit | integer | No | Number of items to return (default: 100, max: 100) |

**Response**:
```json
{
  "items": [
    {
      "id": 789,
      "crime_type": "THEFT",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "status": "VERIFIED"
    }
  ],
  "total": 300,
  "page": 1,
  "size": 100
}
```
- `items`: Array of map report objects (see MapReportResponse schema)
- `total`: Total number of reports
- `page`: Current page number (1-based)
- `size`: Number of items per page

### Get Report by ID
Retrieve a single crime report by its ID.

**URL**: `GET /api/v1/reports/{report_id}`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| report_id | integer | Yes | The ID of the crime report |

**Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "title": "Robbery at downtown",
  "description": "Someone stole my wallet",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Downtown NYC",
  "status": "VERIFIED",
  "severity": "HIGH",
  "is_anonymous": false,
  "created_at": "2026-08-20T10:00:00Z",
  "updated_at": "2026-08-20T10:00:00Z"
}
```
See CrimeReportResponse schema for the full object structure.

### Create Report
Create a new crime report.

**URL**: `POST /api/v1/reports`

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "Robbery at downtown",
  "description": "Someone stole my wallet",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Downtown NYC",
  "status": "PENDING", // Optional, defaults to PENDING
  "severity": "HIGH"
}
```
See CrimeReportCreate schema for details.

**Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "title": "Robbery at downtown",
  "description": "Someone stole my wallet",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Downtown NYC",
  "status": "PENDING",
  "severity": "HIGH",
  "is_anonymous": false,
  "created_at": "2026-08-20T10:00:00Z",
  "updated_at": "2026-08-20T10:00:00Z"
}
```
See CrimeReportResponse schema.

### Update Report
Update an existing crime report.

**URL**: `PUT /api/v1/reports/{report_id}`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| report_id | integer | Yes | The ID of the crime report to update |

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "latitude": 40.7130,
  "longitude": -74.0055,
  "address": "Updated address",
  "status": "VERIFIED",
  "severity": "MEDIUM"
}
```
See CrimeReportUpdate schema for details (all fields optional).

**Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "title": "Updated title",
  "description": "Updated description",
  "latitude": 40.7130,
  "longitude": -74.0055,
  "address": "Updated address",
  "status": "VERIFIED",
  "severity": "MEDIUM",
  "is_anonymous": false,
  "created_at": "2026-08-20T10:00:00Z",
  "updated_at": "2026-08-20T10:30:00Z"
}
```
See CrimeReportResponse schema.

### Delete Report
Delete a crime report by its ID.

**URL**: `DELETE /api/v1/reports/{report_id}`

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| report_id | integer | Yes | The ID of the crime report to delete |

**Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "id": 123,
  "user_id": 456,
  "title": "Robbery at downtown",
  "description": "Someone stole my wallet",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Downtown NYC",
  "status": "PENDING",
  "severity": "HIGH",
  "is_anonymous": false,
  "created_at": "2026-08-20T10:00:00Z",
  "updated_at": "2026-08-20T10:00:00Z"
}
```
Returns the deleted report object (see CrimeReportResponse schema).

## Data Types

### Enums
The following enum values are used in the API:

**StatusEnum**:
- `PENDING`
- `UNDER_REVIEW`
- `VERIFIED`
- `REJECTED`
- `ASSIGNED`
- `RESOLVED`

**SeverityEnum**:
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Timestamps
All timestamps are in ISO 8601 format in UTC (e.g., `2026-08-20T10:00:00Z`).

## Pagination
Pagination is 0-based for `skip` and 1-based for the returned `page` field.
- `page = (skip // limit) + 1`
- To get the next page: `skip = page * limit`
- The `size` field indicates the number of items in the current page (may be less than `limit` on the last page).

## Rate Limiting
The API enforces a rate limit of 100 requests per minute per IP address.
If the limit is exceeded, the API returns a 429 status with a `Retry-After` header indicating the number of seconds to wait before making another request.