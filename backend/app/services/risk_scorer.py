"""
Crime Risk Scoring Service Layer.

This module provides a rule-based risk scoring for crime reports based on multiple factors.
It is designed to be easily replaceable with a real ML model in the future.
"""

from typing import Tuple


def calculate_risk_score(
    crime_type: str,
    severity: str,
    location_risk: float,
    duplicate_count: int
) -> Tuple[int, str]:
    """
    Calculate a risk score (0-100) and priority level based on crime attributes.

    Args:
        crime_type: Type of crime (e.g., "THEFT", "ASSAULT", "CYBERCRIME", "VANDALISM", "OTHER")
        severity: Severity of crime (e.g., "LOW", "MEDIUM", "HIGH", "CRITICAL")
        location_risk: Risk score of the location (0.0 to 1.0)
        duplicate_count: Number of duplicate reports in the area (non-negative integer)

    Returns:
        Tuple[int, str]: (risk_score, priority_level)
            - risk_score: Integer between 0 and 100
            - priority_level: One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    Note:
        This is a simplified rule-based system. In a real scenario, this would be replaced by a trained ML model.
        The current implementation uses weighted factors:
          - Crime severity (50% weight)
          - Crime type (30% weight)
          - Location risk (32.5% weight, scaled to 0-100)
          - Duplicate count (10% weight per duplicate, up to 10 duplicates)
    """
    # Define base scores for severity and crime type (0-100 scale)
    SEVERITY_SCORES = {
        "LOW": 10,
        "MEDIUM": 30,
        "HIGH": 60,
        "CRITICAL": 90
    }

    TYPE_SCORES = {
        "THEFT": 20,
        "ASSAULT": 40,
        "CYBERCRIME": 30,
        "VANDALISM": 10,
        "OTHER": 15
    }

    # Validate inputs (in case the endpoint validation is bypassed)
    if severity not in SEVERITY_SCORES:
        raise ValueError(f"Invalid severity: {severity}")
    if crime_type not in TYPE_SCORES:
        raise ValueError(f"Invalid crime_type: {crime_type}")
    if not 0.0 <= location_risk <= 1.0:
        raise ValueError("location_risk must be between 0.0 and 1.0")
    if duplicate_count < 0:
        raise ValueError("duplicate_count must be non-negative")

    # Calculate base score from severity and crime type
    base_score = (
        0.5 * SEVERITY_SCORES[severity] +
        0.3 * TYPE_SCORES[crime_type]
    )

    # Calculate adjustments
    location_adjustment = 32.5 * location_risk  # 0-32.5
    duplicate_adjustment = 10.0 * min(duplicate_count, 10)  # 0-100

    # Combine and clamp to 0-100
    risk_score = base_score + location_adjustment + duplicate_adjustment
    risk_score = max(0, min(100, int(round(risk_score))))

    # Map risk score to priority level
    if risk_score < 50:
        priority = "LOW"
    elif risk_score < 75:
        priority = "MEDIUM"
    elif risk_score < 90:
        priority = "HIGH"
    else:
        priority = "CRITICAL"

    return risk_score, priority