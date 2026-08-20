# Dashboard APIs Implementation

## Files Created

### 1. `app/schemas/dashboard.py`
- Defines Pydantic models for dashboard responses:
  - `StatItem`: status and count
  - `DashboardStats`: total reports and reports by status
  - `CrimeTypeCount`: crime type and count
  - `DashboardCrimeTypes`: list of crime type counts
  - `RecentReport`: individual report details (id, title, crime_type, status, created_at, latitude, longitude)
  - `DashboardRecentReports`: list of recent reports
  - `Hotspot`: latitude, longitude, and count
  - `DashboardHotspots`: list of hotspots

### 2. `app/crud/dashboard.py`
- Contains read-only database functions for dashboard data:
  - `get_dashboard_stats()`: Returns total report count and counts by status
  - `get_dashboard_crime_types()`: Returns counts by crime type
  - `get_dashboard_recent_reports()`: Returns latest reports (default limit 10)
  - `get_dashboard_hotspots()`: Returns hotspot coordinates with report counts (groups by rounded lat/lon to 3 decimal places by default)

### 3. `app/api/v1/endpoints/dashboard.py`
- FastAPI router with dashboard endpoints:
  - `GET /dashboard/stats`: Returns dashboard statistics
  - `GET /dashboard/crime-types`: Returns report counts by crime type
  - `GET /dashboard/recent-reports`: Returns latest reports
  - `GET /dashboard/hotspots`: Returns hotspot coordinates with report counts
- All endpoints require authentication (reuses existing JWT system via `get_current_user` dependency)
- Includes proper error handling (404 for missing reports, 401 for unauthenticated)

## Files Modified

### 1. `app/api/v1/api.py`
- Added dashboard router to main API:
  ```python
  from app.api.v1.endpoints import auth, users, evidence, dashboard
  api_router = APIRouter()
  api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
  api_router.include_router(users.router, prefix="/users", tags=["users"])
  api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
  api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
  ```

### 2. `app/schemas/__init__.py`
- Exported dashboard schemas:
  ```python
  from .dashboard import (
      StatItem, DashboardStats, CrimeTypeCount, DashboardCrimeTypes,
      RecentReport, DashboardRecentReports, Hotspot, DashboardHotspots
  )
  # Added to __all__ list
  ```

### 3. `app/crud/__init__.py`
- Exported dashboard CRUD functions:
  ```python
  from .dashboard import (
      get_dashboard_stats, get_dashboard_crime_types,
      get_dashboard_recent_reports, get_dashboard_hotspots
  )
  # Added to __all__ list
  ```

### 4. `app/api/v1/endpoints/__init__.py`
- Exported dashboard router:
  ```python
  from .dashboard import router as dashboard_router
  # Added to __all__ list
  ```

## Key Features

✅ **Authentication**: All endpoints require valid JWT token (reuses existing auth system)
✅ **Optimized Queries**: 
   - Uses SQL aggregation functions (COUNT, GROUP BY) for efficient statistics
   - Hotspots use database-level rounding to group nearby coordinates
   - Recent reports use simple ordering and limit
✅ **Data Validation**: 
   - Pydantic models ensure correct response formats
   - Enum validation for status values
✅ **Error Handling**: 
   - Proper HTTP status codes (401, 404, 500)
   - Descriptive error messages
✅ **File Support**: 
   - Works with existing CrimeReport model (assumes crime_type, latitude, longitude, status fields)
   - No modifications to existing models or authentication

## API Endpoints

All endpoints are available under `/api/v1/dashboard/`:
- `GET /api/v1/dashboard/stats`
- `GET /api/v1/dashboard/crime-types`
- `GET /api/v1/dashboard/recent-reports`
- `GET /api/v1/dashboard/hotspots`

## Assumptions

1. The `CrimeReport` model (from the crime reports module) includes:
   - `id`, `title`, `crime_type`, `status` (enum), `latitude`, `longitude`, `created_at`
2. The `ReportStatusEnum` is available from `app.models.crime_report`
3. The existing authentication system provides:
   - `security.decode_token()` function for JWT validation
   - User model with `id` field
4. The uploads directory for evidence is handled separately (not part of dashboard)

## Usage Examples

### Get Dashboard Statistics
```http
GET /api/v1/dashboard/stats
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "total_reports": 150,
  "reports_by_status": [
    {"status": "pending", "count": 45},
    {"status": "under_review", "count": 30},
    {"status": "verified", "count": 60},
    {"status": "rejected", "count": 10},
    {"status": "resolved", "count": 5}
  ]
}
```

### Get Crime Type Counts
```http
GET /api/v1/dashboard/crime-types
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "crime_types": [
    {"crime_type": "theft", "count": 50},
    {"crime_type": "assault", "count": 40},
    {"crime_type": "vandalism", "count": 35},
    {"crime_type": "fraud", "count": 25}
  ]
}
```

### Get Recent Reports
```http
GET /api/v1/dashboard/recent-reports?limit=5
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "recent_reports": [
    {
      "id": 1024,
      "title": "Suspicious activity near Main St",
      "crime_type": "suspicious_activity",
      "status": "pending",
      "created_at": "2026-08-20T14:30:00Z",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
    // ... up to 5 reports
  ]
}
```

### Get Hotspots
```http
GET /api/v1/dashboard/hotspots?precision=3
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "hotspots": [
    {
      "latitude": 40.713,
      "longitude": -74.006,
      "count": 12
    },
    {
      "latitude": 40.710,
      "longitude": -74.010,
      "count": 8
    }
    // ... additional hotspots
  ]
}
```

## Notes

- The dashboard module is read-only and does not modify any data
- All database operations use efficient SQL aggregation
- Authentication is required for all endpoints (returns 401 for invalid/missing tokens)
- The system is ready for immediate use once the crime reports module is deployed