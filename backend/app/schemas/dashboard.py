from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.crime_report import ReportStatusEnum  # Assuming this exists in the crime_report model


class StatItem(BaseModel):
    status: ReportStatusEnum
    count: int


class DashboardStats(BaseModel):
    total_reports: int
    reports_by_status: List[StatItem]


class CrimeTypeCount(BaseModel):
    crime_type: str
    count: int


class DashboardCrimeTypes(BaseModel):
    crime_types: List[CrimeTypeCount]


class RecentReport(BaseModel):
    id: int
    title: str
    crime_type: str
    status: ReportStatusEnum
    created_at: datetime
    latitude: float
    longitude: float


class DashboardRecentReports(BaseModel):
    recent_reports: List[RecentReport]


class Hotspot(BaseModel):
    latitude: float
    longitude: float
    count: int


class DashboardHotspots(BaseModel):
    hotspots: List[Hotspot]