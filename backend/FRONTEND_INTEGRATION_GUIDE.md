# Frontend Integration Guide for Crime Reporting Backend

This guide provides all the necessary information for frontend developers to integrate with the Crime Reporting Backend API.

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Error Responses](#error-responses)
3. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Evidence](#evidence)
   - [Dashboard](#dashboard)
   - [Heatmap](#heatmap)
   - [Analytics](#analytics)
   - [AI](#ai)
4. [Frontend Data Models (TypeScript)](#frontend-data-models-typescript)

---

## Authentication Flow

The backend uses JWT (JSON Web Token) for authentication. All protected endpoints require a valid token in the `Authorization` header.

### Login
To obtain a token, send a POST request to `/api/v1/auth/login/access-token` with form data:
- `username`: user's email
- `password`: user's password

**Example Request:**
```http
POST /api/v1/auth/login/access-token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Token
Include the token in the `Authorization` header of subsequent requests:
```
Authorization: Bearer <access_token>
```

### Token Expiration
Tokens expire after the duration specified in `ACCESS_TOKEN_EXPIRE_MINUTES` (default 30 minutes). After expiration, the client must log in again to obtain a new token.

### Registration
New users can register via `/api/v1/auth/register` (POST) with a JSON body:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "New User"
}
```
Returns the created user object (without password).

---

## Error Responses

The API returns consistent error responses with appropriate HTTP status codes.

### Common Error Responses
| Status Code | Error Key       | Description                              |
|-------------|-----------------|------------------------------------------|
| 400         | `detail`        | Bad Request (validation error, etc.)     |
| 401         | `detail`        | Unauthorized (missing/invalid token)     |
| 403         | `detail`        | Forbidden (insufficient permissions)     |
| 404         | `detail`        | Not Found                                |
| 409         | `detail`        | Conflict (e.g., duplicate email)         |
| 413         | `detail`        | Payload Too Large (file upload)          |
| 422         | `detail`        | Unprocessable Entity (validation error)  |
| 500         | `detail`        | Internal Server Error                    |

**Example Error Response (401):**
```json
{
  "detail": "Could not validate credentials"
}
```

**Example Error Response (400):**
```json
{
  "detail": "The user with this email already exists in the system."
}
```

**Example Error Response (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
Endpoints for authentication and user registration.

| Method | Endpoint                          | Description                          | Auth Required |
|--------|-----------------------------------|--------------------------------------|---------------|
| POST   | `/auth/login/access-token`        | Login and get access token           | No            |
| POST   | `/auth/register`                  | Register a new user                  | No            |

#### POST `/auth/login/access-token`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Parameters**:
  - `username` (string, required): User's email
  - `password` (string, required): User's password
- **Success Response (200)**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```

#### POST `/auth/register`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "email": "string, required",
    "password": "string, required (min 8 chars)",
    "full_name": "string, optional"
  }
  ```
- **Success Response (200)**: Returns the created user object (see [User Model](#usermodel)).

---

### Users
Endpoints for managing users. Requires authentication.

| Method | Endpoint                  | Description                     | Auth Required |
|--------|---------------------------|---------------------------------|---------------|
| GET    | `/users/`                 | List users (paginated)          | Yes           |
| POST   | `/users/`                 | Create a new user               | Yes           |
| GET    | `/users/{user_id}`        | Get a specific user             | Yes           |
| PUT    | `/users/{user_id}`        | Update a user                   | Yes           |
| DELETE | `/users/{user_id}`        | Delete a user                   | Yes           |

#### GET `/users/`
- **Query Parameters**:
  - `skip` (integer, optional, default 0): Number of records to skip
  - `limit` (integer, optional, default 100): Maximum number of records to return
- **Success Response (200)**: Array of [User Objects](#usermodel)

#### POST `/users/`
- **Content-Type**: `application/json`
- **Body**: Same as [UserCreate](#usercreate) (see [Schemas](#schemas))
- **Success Response (200)**: Created [User Object](#usermodel)

#### GET `/users/{user_id}`
- **Path Parameters**:
  - `user_id` (integer, required): ID of the user to retrieve
- **Success Response (200)**: [User Object](#usermodel)

#### PUT `/users/{user_id}`
- **Content-Type**: `application/json`
- **Body**: [UserUpdate](#userupdate) (see [Schemas](#schemas))
- **Success Response (200)**: Updated [User Object](#usermodel)

#### DELETE `/users/{user_id}`
- **Success Response (200)**: Deleted [User Object](#usermodel)

---

### Evidence
Endpoints for managing evidence files attached to crime reports. Requires authentication.

| Method | Endpoint                                 | Description                                  | Auth Required |
|--------|------------------------------------------|----------------------------------------------|---------------|
| POST   | `/reports/{report_id}/upload`            | Upload evidence for a specific report        | Yes           |
| GET    | `/reports/{report_id}/evidence`          | Get all evidence for a specific report       | Yes           |
| GET    | `/evidence/{evidence_id}`                | Get a specific evidence by ID                | Yes           |
| DELETE | `/evidence/{evidence_id}`                | Delete a specific evidence by ID             | Yes           |

#### POST `/reports/{report_id}/upload`
- **Content-Type**: `multipart/form-data`
- **Path Parameters**:
  - `report_id` (integer, required): ID of the crime report to attach evidence to
- **Form Data**:
  - `file` (file, required): The file to upload (jpg, jpeg, png, mp4, mov; max 20 MB)
  - `crime_report_id` (integer, required): Must match the `report_id` in the path
  - `description` (string, optional): Description of the evidence
- **Success Response (201)**: Created [Evidence Object](#evidencemodel)

#### GET `/reports/{report_id}/evidence`
- **Path Parameters**:
  - `report_id` (integer, required): ID of the crime report
- **Success Response (200)**: Array of [Evidence Objects](#evidencemodel)

#### GET `/evidence/{evidence_id}`
- **Path Parameters**:
  - `evidence_id` (integer, required): ID of the evidence to retrieve
- **Success Response (200)**: [Evidence Object](#evidencemodel)

#### DELETE `/evidence/{evidence_id}`
- **Path Parameters**:
  - `evidence_id` (integer, required): ID of the evidence to delete
- **Success Response (200)**: Deleted [Evidence Object](#evidencemodel)

---

### Dashboard
Endpoints for dashboard statistics and visualizations. Requires authentication.

| Method | Endpoint                          | Description                              | Auth Required |
|--------|-----------------------------------|------------------------------------------|---------------|
| GET    | `/dashboard/stats`                | Get overall statistics                   | Yes           |
| GET    | `/dashboard/crime-types`          | Get report counts by crime type          | Yes           |
| GET    | `/dashboard/recent-reports`       | Get latest reports                       | Yes           |
| GET    | `/dashboard/hotspots`             | Get hotspot coordinates with report counts | Yes           |

#### GET `/dashboard/stats`
- **Success Response (200)**: [DashboardStats Object](#dashboardstatsmodel)

#### GET `/dashboard/crime-types`
- **Success Response (200)**: [DashboardCrimeTypes Object](#dashboardcrimetypesmodel)

#### GET `/dashboard/recent-reports`
- **Query Parameters**:
  - `limit` (integer, optional, default 10): Number of recent reports to return
- **Success Response (200)**: [DashboardRecentReports Object](#dashboardrecentreportsmodel)

#### GET `/dashboard/hotspots`
- **Query Parameters**:
  - `precision` (integer, optional, default 3): Decimal precision for grouping coordinates (higher = more granular)
- **Success Response (200)**: [DashboardHotspots Object](#dashboardhotspotsmodel)

---

### Heatmap
Endpoints for heatmap visualization data. Requires authentication.

| Method | Endpoint                   | Description                | Auth Required |
|--------|----------------------------|----------------------------|---------------|
| GET    | `/reports/heatmap`         | Get heatmap data           | Yes           |

#### GET `/reports/heatmap`
- **Query Parameters**:
  - `precision` (integer, optional, default 3): Decimal precision for grouping coordinates
- **Success Response (200)**: Array of [HeatmapPoint Objects](#heatmappointmodel)

---

### Analytics
Endpoints for analytical data. Requires authentication.

| Method | Endpoint                             | Description                             | Auth Required |
|--------|--------------------------------------|-----------------------------------------|---------------|
| GET    | `/analytics/crime-trends`            | Get crime trends by day, week, month    | Yes           |
| GET    | `/analytics/severity-distribution`   | Get distribution by severity            | Yes           |
| GET    | `/analytics/status-distribution`     | Get distribution by status              | Yes           |

#### GET `/analytics/crime-trends`
- **Success Response (200)**: [CrimeTrendsResponse Object](#crimetrendsresponsemodel)

#### GET `/analytics/severity-distribution`
- **Success Response (200)**: [SeverityDistributionResponse Object](#severitydistributionresponsemodel)

#### GET `/analytics/status-distribution`
- **Success Response (200)**: [StatusDistributionResponse Object](#statusdistributionresponsemodel)

---

### AI
Endpoints for AI-powered features. Requires authentication.

| Method | Endpoint                      | Description                     | Auth Required |
|--------|-------------------------------|---------------------------------|---------------|
| POST   | `/ai/detect-duplicate`        | Detect duplicate crime reports  | Yes           |

#### POST `/ai/detect-duplicate`
- **Content-Type**: `application/json`
- **Body**: [DuplicateCheckRequest](#duplicatecheckrequest)
- **Success Response (200)**: [DuplicateCheckResponse](#duplicatecheckresponse)

---

## Frontend Data Models (TypeScript)

Below are TypeScript interfaces representing the data models used by the API. These can be used directly in a TypeScript frontend application.

### Core Enums
```typescript
export enum ReportStatusEnum {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  VERIFIED = "verified",
  REJECTED = "rejected",
  RESOLVED = "resolved"
}

export enum SeverityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum FileTypeEnum {
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  MP4 = "mp4",
  MOV = "mov"
}
```

### User Models
```typescript
export interface UserBase {
  email: string;
  full_name?: string | null;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string | null;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserInDBBase extends UserBase {
  id: number;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string; // ISO date string
}

export interface UserInDB extends UserInDBBase {
  hashed_password: string;
}

export interface User extends UserInDBBase { }

// Authentication
export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenPayload {
  sub?: string | null;
}

export interface TokenData {
  user_id?: number | null;
}
```

### Evidence Models
```typescript
export interface EvidenceBase {
  file_name: string;
  file_path: string;
  file_type: FileTypeEnum;
}

export interface EvidenceCreate extends EvidenceBase {
  report_id: number;
}

export interface EvidenceUpdate {
  file_name?: string;
  file_path?: string;
  file_type?: FileTypeEnum;
}

export interface EvidenceInDBBase extends EvidenceBase {
  id: number;
  report_id: number;
  uploaded_at: string; // ISO date string
}

export interface Evidence extends EvidenceInDBBase { }
```

### Dashboard Models
```typescript
export interface StatItem {
  status: ReportStatusEnum;
  count: number;
}

export interface DashboardStats {
  total_reports: number;
  reports_by_status: StatItem[];
}

export interface CrimeTypeCount {
  crime_type: string;
  count: number;
}

export interface DashboardCrimeTypes {
  crime_types: CrimeTypeCount[];
}

export interface RecentReport {
  id: number;
  title: string;
  crime_type: string;
  status: ReportStatusEnum;
  created_at: string; // ISO date string
  latitude: number;
  longitude: number;
}

export interface DashboardRecentReports {
  recent_reports: RecentReport[];
}

export interface Hotspot {
  latitude: number;
  longitude: number;
  count: number;
}

export interface DashboardHotspots {
  hotspots: Hotspot[];
}
```

### Heatmap Models
```typescript
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}
```

### Analytics Models
```typescript
export interface TrendItem {
  period: string;
  count: number;
}

export interface CrimeTrendsResponse {
  by_day: TrendItem[];
  by_week: TrendItem[];
  by_month: TrendItem[];
}

export interface SeverityDistributionResponse {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

export interface StatusDistributionResponse {
  PENDING: number;
  UNDER_REVIEW: number;
  VERIFIED: number;
  REJECTED: number;
  RESOLVED: number;
}
```

### AI Models
```typescript
export interface DuplicateCheckRequest {
  description: string;
  latitude: number;
  longitude: number;
}

export interface DuplicateCheckResponse {
  is_duplicate: boolean;
  similarity_score: number; // 0 to 1
  matched_report_id?: number | null;
}
```

### Crime Report Models (Referenced)
*Note: The crime reports module is being implemented in another branch/session. These models are included for completeness based on the existing schema.*

```typescript
export interface CrimeReportBase {
  crime_type: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  severity: SeverityEnum;
  status?: ReportStatusEnum; // Will be set to PENDING by default if not provided
}

export interface CrimeReportCreate extends CrimeReportBase { }

export interface CrimeReportUpdate {
  crime_type?: string;
  description?: string | null;
  latitude?: number;
  longitude?: number;
  severity?: SeverityEnum;
  status?: ReportStatusEnum;
}

export interface CrimeReportInDBBase extends CrimeReportBase {
  id: number;
  user_id: number;
  created_at: string; // ISO date string
  updated_at?: string | null; // ISO date string
}

export interface CrimeReportResponse extends CrimeReportInDBBase { }

export interface NearbyReportResponse {
  report_id: number;
  crime_type: string;
  status: string;
  severity: string;
  latitude: number;
  longitude: number;
  created_at: string; // ISO date string
}

export interface MapReportResponse {
  id: number;
  crime_type: string;
  latitude: number;
  longitude: number;
  status: string;
}
```

---

## How to Use This Guide

1. **Authentication**: Start by logging in to obtain an access token, then include it in the `Authorization` header for all subsequent requests.
2. **Explore Endpoints**: Use the tables above to find the endpoint you need, noting the required parameters and expected responses.
3. **Data Models**: Use the TypeScript interfaces to type your API requests and responses in your frontend code.
4. **Error Handling**: Always check for non-2xx status codes and handle the `detail` field in error responses appropriately.
5. **Testing**: The backend provides interactive API documentation at `/api/v1/docs` (Swagger UI) and `/api/v1/redoc` (ReDoc) when running.

---

*Last updated: August 20, 2026*