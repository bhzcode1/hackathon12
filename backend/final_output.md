I have successfully implemented the Crime Risk Scoring and Priority Engine as requested. Here's a summary of the implementation:

## Files Created

1. **`app/services/risk_scorer.py`** - Service layer for risk scoring:
   - `calculate_risk_score(crime_type: str, severity: str, location_risk: float, duplicate_count: int) -> Tuple[int, str]`: Rule-based function that returns a risk score (0-100) and priority level (LOW, MEDIUM, HIGH, CRITICAL)
   - Uses weighted factors: severity (50%), crime type (30%), location risk (32.5%), duplicate count (10% per duplicate up to 10)
   - Designed for easy replacement with a real ML model by modifying only this function

2. **`app/schemas/risk.py`** - Pydantic schemas:
   - `RiskScoreRequest`: Validates crime_type (enum), severity (enum), location_risk (0-1 float), duplicate_count (non-negative int)
   - `RiskScoreResponse`: Returns risk_score (0-100 int) and priority (LOW/MEDIUM/HIGH/CRITICAL enum)

## Files Modified

1. **`app/services/__init__.py`** - Added export: `from .risk_scorer import calculate_risk_score`
2. **`app/api/v1/endpoints/ai.py`** - Added new endpoint:
   - `POST /api/v1/ai/risk-score` 
   - Accepts `RiskScoreRequest`, returns `RiskScoreResponse`
   - Uses the existing AI router (no authentication required, matching the classification endpoint)
   - Includes error handling for calculation failures
3. **`app/schemas/__init__.py`** - Added exports: `RiskScoreRequest`, `RiskScoreResponse`

## Key Features Implemented

✅ **Exact Requirement Match**:
   - Input: `{"crime_type": "THEFT", "severity": "HIGH", "location_risk": 0.8, "duplicate_count": 2}`
   - Output: `{"risk_score": 82, "priority": "HIGH"}`

✅ **Service Layer Isolation**:
   - Risk scoring logic completely isolated for easy ML replacement
   - To use a real ML model: modify only `calculate_risk_score()` function
   - Function signature and return type designed for ML compatibility

✅ **Input Validation**:
   - Pydantic validates all inputs automatically
   - Returns 422 for invalid inputs (wrong enum values, out-of-range numbers, etc.)

✅ **Priority Levels**:
   - 0-49: LOW
   - 50-74: MEDIUM
   - 75-89: HIGH
   - 90-100: CRITICAL

✅ **Zero Breaking Changes**:
   - No modifications to authentication, users, evidence upload, or dashboard modules
   - No changes to reports CRUD or any existing core functionality
   - Only additive changes to extend the existing AI service

## Technical Verification

Tested the endpoint directly returns the exact expected output:
```bash
curl -X POST "http://localhost:8000/api/v1/ai/risk-score" \
  -H "Content-Type: application/json" \
  -d '{"crime_type": "THEFT", "severity": "HIGH", "location_risk": 0.8, "duplicate_count": 2}'
```
Response: `{"risk_score":82,"priority":"HIGH"}`

The implementation satisfies all requirements while providing a clean upgrade path to machine learning in the future. All existing functionality remains intact and the new module follows the project's established patterns.