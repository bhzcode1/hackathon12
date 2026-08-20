"""
Pydantic schemas for the AI Crime Classification module.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AIClassificationRequest(BaseModel):
    """
    Request body for classifying a crime report.
    """
    description: str = Field(..., min_length=1, description="The crime description provided by the user")


class AIClassificationResponse(BaseModel):
    """
    Response body for the AI classification.
    """
    predicted_crime_type: str = Field(..., description="The predicted crime type (e.g., THEFT, ASSAULT)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score between 0 and 1")
    severity: str = Field(..., description="The predicted severity (e.g., LOW, MEDIUM, HIGH, CRITICAL)")