from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import enum


class SeverityEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class StatusEnum(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"


class CrimeReportBase(BaseModel):
    crime_type: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    severity: SeverityEnum
    status: Optional[StatusEnum] = None  # Will be set to PENDING by default in the model if not provided


class CrimeReportCreate(CrimeReportBase):
    pass


class CrimeReportUpdate(BaseModel):
    crime_type: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    severity: Optional[SeverityEnum] = None
    status: Optional[StatusEnum] = None


class CrimeReportInDBBase(CrimeReportBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class CrimeReportResponse(CrimeReportInDBBase):
    pass


class NearbyReportResponse(BaseModel):
    report_id: int
    crime_type: str
    status: str
    severity: str
    latitude: float
    longitude: float
    created_at: datetime

    class Config:
        orm_mode = True


class MapReportResponse(BaseModel):
    id: int
    crime_type: str
    latitude: float
    longitude: float
    status: str

    class Config:
        orm_mode = True