# Duplicate Crime Report Detection API Implementation

## Files Created

### 1. `app/schemas/ai.py`
- `DuplicateCheckRequest`: description (str), latitude (float), longitude (float)
- `DuplicateCheckResponse`: is_duplicate (bool), similarity_score (float 0-1), matched_report_id (Optional[int])

### 2. `app/services/duplicate_detection.py`
- `DuplicateDetector` class with TF-IDF + cosine similarity for text, Gaussian kernel for location distance, exponential decay for time difference.
- Combines similarities with configurable weights (default: text 0.5, location 0.3, time 0.2).
- Threshold for duplicate detection (default 0.7).
- Factory function `get_duplicate_detector()`.

### 3. `app/services/__init__.py`
- Makes `app.services` a package.

### 4. `app/api/v1/endpoints/ai.py`
- POST `/ai/detect-duplicate` endpoint.
- Requires authentication (reuses existing JWT token via `get_current_user` dependency).
- Uses the duplicate detector service to check against existing crime reports.
- Returns DuplicateCheckResponse.

### 5. `__init__.py` updates for exposure
- `app/schemas/__init__.py`: Added `DuplicateCheckRequest`, `DuplicateCheckResponse` to `__all__`.
- `app/api/v1/endpoints/__init__.py`: Added `ai_router` to `__all__`.

## Files Modified

### 1. `requirements.txt`
- Added `scikit-learn==1.5.0` and `numpy==2.0.0`.

### 2. `app/schemas/crime_report.py`
- Fixed typo: `enum.enum.Enum` → `enum.Enum` in `StatusEnum` definition.

### 3. `app/api/v1/api.py`
- Added import: `from app.api.v1.endpoints import ai`
- Added: `api_router.include_router(ai.router, prefix="/ai", tags=["ai"])`

## Key Features

✅ **Endpoint**: `POST /api/v1/ai/detect-duplicate`
   - Input: JSON with `description`, `latitude`, `longitude`
   - Output: `{ "is_duplicate": bool, "similarity_score": float, "matched_report_id": int|null }`

✅ **Similarity Components**:
   - **Text**: TF-IDF vectorization + cosine similarity
   - **Location**: Haversine distance converted to similarity via Gaussian kernel (sigma=1km)
   - **Time**: Exponential decay based on time difference (tau=1 day for half-life)

✅ **Authentication**: Requires valid JWT token (reuses existing auth system, no modifications to auth code).

✅ **Extensibility**: The `DuplicateDetector` class can be easily replaced or extended with a different ML model (e.g., sentence transformers) by modifying the `_compute_text_similarity` method or replacing the class entirely.

✅ **Optimization**: For simplicity, loads all existing reports on each request. In production, one could cache the TF-IDF matrix or use a vector database.

## Assumptions

1. The `CrimeReport` model (from the crime reports module) includes:
   - `id` (Integer)
   - `description` (String)
   - `latitude` (Float)
   - `longitude` (Float)
   - `created_at` (DateTime)
2. The existing authentication system provides:
   - `security.decode_token()` function for JWT validation
   - User model with `id` field
3. The uploads directory for evidence is handled separately (not part of duplicate detection).

## Usage Example

```http
POST /api/v1/ai/detect-duplicate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "description": "Someone stole my phone near the bus stand",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

Response if duplicate:
```json
{
  "is_duplicate": true,
  "similarity_score": 0.88,
  "matched_report_id": 15
}
```

Response if not duplicate:
```json
{
  "is_duplicate": false,
  "similarity_score": 0.32,
  "matched_report_id": null
}
```