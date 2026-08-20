"""
API endpoints for AI services.
"""

from fastapi import APIRouter, HTTPException
from app.services.ai_classifier import classify_crime
from app.services.risk_scorer import calculate_risk_score
from app.schemas.ai import AIClassificationRequest, AIClassificationResponse
from app.schemas.risk import RiskScoreRequest, RiskScoreResponse

router = APIRouter()


@router.post("/classify-report", response_model=AIClassificationResponse)
def classify_report(request: AIClassificationRequest):
    """
    Classify a crime report based on the description.

    - **description**: The crime description provided by the user
    - Returns the predicted crime type, confidence, and severity
    """
    try:
        predicted_crime_type, confidence, severity = classify_crime(request.description)
        return AIClassificationResponse(
            predicted_crime_type=predicted_crime_type,
            confidence=confidence,
            severity=severity
        )
    except Exception as e:
        # In a real application, we would log the error and return a 500
        raise HTTPException(status_code=500, detail="Classification failed")


@router.post("/risk-score", response_model=RiskScoreResponse)
def risk_score(request: RiskScoreRequest):
    """
    Calculate a risk score and priority level for a crime report based on multiple factors.

    - **crime_type**: Type of crime (THEFT, ASSAULT, CYBERCRIME, VANDALISM, OTHER)
    - **severity**: Severity of crime (LOW, MEDIUM, HIGH, CRITICAL)
    - **location_risk**: Location risk score (0.0 to 1.0)
    - **duplicate_count**: Number of duplicate reports in the area
    - Returns the risk score (0-100) and priority level (LOW, MEDIUM, HIGH, CRITICAL)
    """
    try:
        risk_score, priority = calculate_risk_score(
            crime_type=request.crime_type,
            severity=request.severity,
            location_risk=request.location_risk,
            duplicate_count=request.duplicate_count
        )
        return RiskScoreResponse(risk_score=risk_score, priority=priority)
    except Exception as e:
        # In a real application, we would log the error and return a 500
        raise HTTPException(status_code=500, detail="Risk score calculation failed")