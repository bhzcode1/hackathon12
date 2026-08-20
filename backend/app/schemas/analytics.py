from pydantic import BaseModel
from typing import List, Dict
from app.models.crime_report import SeverityEnum, ReportStatusEnum


class TrendItem(BaseModel):
    period: str
    count: int


class CrimeTrendsResponse(BaseModel):
    by_day: List[TrendItem]
    by_week: List[TrendItem]
    by_month: List[TrendItem]


class SeverityDistributionResponse(BaseModel):
    LOW: int
    MEDIUM: int
    HIGH: int
    CRITICAL: int


class StatusDistributionResponse(BaseModel):
    PENDING: int
    UNDER_REVIEW: int
    VERIFIED: int
    REJECTED: int
    RESOLVED: int