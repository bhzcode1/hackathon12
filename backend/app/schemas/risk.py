"""
Pydantic schemas for the Crime Risk Scoring module.
"""

from pydantic import BaseModel, Field, confloat, conint
from typing import Literal


class RiskScoreRequest(BaseModel):
    """
    Request body for calculating crime risk score.
    """
    crime_type: Literal["THEFT", "ASSAULT", "CYBERCRIME", "VANDALISM", "OTHER"] = Field(
        ..., description="Type of crime"
    )
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(
        ..., description="Severity of crime"
    )
    location_risk: confloat(ge=0.0, le=1.0) = Field(
        ..., description="Location risk score (0.0 to 1.0)"
    )
    duplicate_count: conint(ge=0) = Field(
        ..., description="Number of duplicate reports in the area"
    )


class RiskScoreResponse(BaseModel):
    """
    Response body for the risk score calculation.
    """
    risk_score: int = Field(..., ge=0, le=100, description="Calculated risk score (0-100)")
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(
        ..., description="Priority level based on risk score"
    )