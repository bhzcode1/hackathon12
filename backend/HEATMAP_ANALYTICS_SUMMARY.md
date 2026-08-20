# Heatmap and Analytics APIs Implementation

## Files Created

### 1. `app/schemas/heatmap.py`
- `HeatmapPoint`: latitude (float), longitude (float), weight (int)

### 2. `app/schemas/analytics.py`
- `TrendItem`: period (str), count (int)
- `CrimeTrendsResponse`: by_day (List[TrendItem]), by_week (List[TrendItem]), by_month (List[TrendItem])
- `SeverityDistributionResponse`: LOW (int), MEDIUM (int), HIGH (int), CRITICAL (int)
- `StatusDistributionResponse`: PENDING (int), UNDER_REVIEW (int), VERIFIED (int), REJECTED (int), RESOLVED (int)

### 3. `app/crud/heatmap.py`
- `get_heatmap_data(db: Session, precision: int = 3)`: Groups crime reports by rounded latitude and longitude and returns a list of dictionaries with latitude, longitude, and weight (count).

### 4. `app/crud/analytics.py`
- `get_crime_trends(db: Session)`: Returns crime trends by day, week, and month.
- `get_severity_distribution(db: Session)`: Returns distribution of reports by severity.
- `get_status_distribution(db: Session)`: Returns distribution of reports by status.

### 5. `app/api/v1/endpoints/heatmap.py`
- Router for heatmap endpoints:
  - `GET /reports/heatmap`: Returns heatmap data (requires authentication)

### 6. `app/api/v1/endpoints/analytics.py`
- Router for analytics endpoints:
  - `GET /analytics/crime-trends`: Returns crime trends by day, week, and month
  - `GET /analytics/severity-distribution`: Returns severity distribution
  - `GET /analytics/status-distribution`: Returns status distribution
  - All endpoints require authentication

## Files Modified

### 1. `app/api/v1/api.py`
- Added imports for heatmap and analytics routers
- Included heatmap router with prefix="" (so endpoints are at root, e.g., /reports/heatmap)
- Included analytics router with prefix="/analytics"

### 2. `app/schemas/__init__.py`
- Exported heatmap and analytics schemas in the `__all__` list

### 3. `app/crud/__init__.py`
- Exported heatmap and analytics CRUD functions in the `__all__` list

### 4. `app/api/v1/endpoints/__init__.py`
- Exported heatmap and analytics routers in the `__all__` list

## Key Features

✅ **Heatmap Endpoint**:
   - Groups nearby incidents into hotspots using rounded coordinates (default precision 3 decimal places)
   - Returns weight (count) per hotspot
   - Response format: Array of objects with latitude, longitude, weight

✅ **Analytics Endpoints**:
   - Crime trends: Returns counts by day, week, and month
   - Severity distribution: Returns counts for each severity level (LOW, MEDIUM, HIGH, CRITICAL)
   - Status distribution: Returns counts for each status (PENDING, UNDER_REVIEW, VERIFIED, REJECTED, RESOLVED)

✅ **Authentication**:
   - All endpoints require valid JWT token
   - Reuses existing authentication system (no modifications to auth code)
   - Uses existing `security.decode_token()` function and User model

✅ **Optimized Queries**:
   - Uses SQL aggregation functions (COUNT, GROUP BY) for efficient data retrieval
   - Heatmap uses database-level rounding to group nearby coordinates
   - Trends use date/trunc and formatting functions for efficient grouping

✅ **Validation**:
   - Pydantic models ensure correct request/response formats
   - Proper HTTP status codes (401 for unauthenticated, 500 for server errors)

## API Endpoints

### Heatmap
- `GET /api/v1/reports/heatmap`
  - Query parameter: `precision` (integer, default 3)
  - Response: `[ { "latitude": float, "longitude": float, "weight": int } ]`

### Analytics
- `GET /api/v1/analytics/crime-trends`
  - Response: 
    {
      "by_day": [ { "period": str, "count": int }, ... ],
      "by_week": [ { "period": str, "count": int }, ... ],
      "by_month": [ { "period": str, "count": int }, ... ]
    }

- `GET /api/v1/analytics/severity-distribution`
  - Response: { "LOW": int, "MEDIUM": int, "HIGH": int, "CRITICAL": int }

- `GET /api/v1/analytics/status-distribution`
  - Response: { "PENDING": int, "UNDER_REVIEW": int, "VERIFIED": int, "REJECTED": int, "RESOLVED": int }

## Assumptions

1. The `CrimeReport` model (from the crime reports module) includes:
   - `latitude` (Float)
   - `longitude` (Float)
   - `severity` (Enum: LOW, MEDIUM, HIGH, CRITICAL)
   - `status` (Enum: PENDING, UNDER_REVIEW, VERIFIED, REJECTED, RESOLVED)
   - `created_at` (DateTime)

2. The existing authentication system provides:
   - `security.decode_token()` function for JWT validation
   - User model with `id` field

3. The uploads directory for evidence is handled separately (not part of heatmap/analytics)

## Usage Examples

### Get Heatmap Data
```http
GET /api/v1/reports/heatmap?precision=3
Authorization: Bearer <jwt_token>
```

Response:
```json
[
  {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "weight": 15
  },
  {
    "latitude": 12.9720,
    "longitude": 77.5950,
    "weight": 8
  }
]
```

### Get Crime Trends
```http
GET /api/v1/analytics/crime-trends
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "by_day": [
    { "period": "2026-08-20", "count": 10 },
    { "period": "2026-08-19", "count": 8 }
  ],
  "by_week": [
    { "period": "2026-W34", "count": 50 },
    { "period": "2026-W33", "count": 45 }
  ],
  "by_month": [
    { "period": "2026-08", "count": 120 },
    { "period": "2026-07", "count": 100 }
  ]
}
```

### Get Severity Distribution
```http
GET /api/v1/analytics/severity-distribution
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "LOW": 20,
  "MEDIUM": 50,
  "HIGH": 15,
  "CRITICAL": 5
}
```

### Get Status Distribution
```http
GET /api/v1/analytics/status-distribution
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "PENDING": 45,
  "UNDER_REVIEW": 30,
  "VERIFIED": 60,
  "REJECTED": 10,
  "RESOLVED": 5
}
```