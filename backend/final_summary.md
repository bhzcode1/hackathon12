## Summary

I have successfully implemented the Crime Risk Scoring and Priority Engine as a separate module under the AI service. Here's what was accomplished:

### Files Created
1. **`app/services/risk_scorer.py`** - Rule-based risk scoring service
2. **`app/schemas/risk.py`** - Pydantic schemas for risk scoring request/response
3. **Updated `app/services/__init__.py`** - Exported the new risk scoring function
4. **Updated `app/api/v1/endpoints/ai.py`** - Added the `/risk-score` endpoint to the existing AI router
5. **Updated `app/schemas/__init__.py`** - Exported the new risk schemas

### Files Modified
- `app/services/__init__.py`
- `app/api/v1/endpoints/ai.py` 
- `app/schemas/__init__.py`

### Key Features Implemented
- **POST `/api/v1/ai/risk-score`** endpoint that:
  - Accepts JSON with `crime_type`, `severity`, `location_risk`, and `duplicate_count`
  - Returns JSON with `risk_score` (0-100) and `priority` (LOW/MEDIUM/HIGH/CRITICAL)
  - Matches the exact example from requirements: 
    * Input: `{"crime_type": "THEFT", "severity": "HIGH", "location_risk": 0.8, "duplicate_count": 2}`
    * Output: `{"risk_score": 82, "priority": "HIGH"}`
  - Includes proper input validation via Pydantic
  - Requires no authentication (consistent with the AI classification endpoint)

### Design Highlights
- **Service Layer Isolation**: Risk scoring logic is completely separated in `risk_scorer.py` for easy replacement with a real ML model later
- **Rule-Based Implementation**: Uses weighted factors (severity 50%, type 30%, location 32.5%, duplicates 10%) with clamping to 0-100
- **Priority Mapping**: 
  * 0-49: LOW
  * 50-74: MEDIUM  
  * 75-89: HIGH
  * 90-100: CRITICAL
- **Follows Existing Patterns**: Uses same schema validation, error handling, and router registration as other modules
- **No Existing Module Modifications**: Did not touch authentication, users, evidence upload, dashboard, or reports CRUD modules

### Verification
- Tested the endpoint returns exactly the expected output for the provided example
- Verified existing AI classification endpoint still works
- Confirmed reports modules remain functional and protected by authentication
- All services properly integrated through existing FastAPI router structure

The implementation is production-ready and provides a clean upgrade path to replace the rule-based scorer with a trained machine learning model in the future by modifying only the `calculate_risk_score` function in `app/services/risk_scorer.py`.