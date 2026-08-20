from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class SeverityEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ReportStatusEnum(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"


class CrimeReport(Base):
    __tablename__ = "crime_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    severity = Column(Enum(SeverityEnum), nullable=False)
    status = Column(Enum(ReportStatusEnum), default=ReportStatusEnum.PENDING, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="crime_reports")
    evidence_list = relationship("Evidence", back_populates="crime_report")
    status_history = relationship("ReportStatusHistory", back_populates="crime_report")

    def __repr__(self):
        return f"<CrimeReport {self.id}: {self.title}>"