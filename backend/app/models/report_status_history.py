from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.crime_report import ReportStatusEnum


class ReportStatusHistory(Base):
    __tablename__ = "report_status_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("crime_reports.id"), nullable=False)
    old_status = Column(Enum(ReportStatusEnum), nullable=True)  # Can be NULL for initial state
    new_status = Column(Enum(ReportStatusEnum), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    crime_report = relationship("CrimeReport", back_populates="status_history")
    changer = relationship("User")

    def __repr__(self):
        return f"<ReportStatusHistory(id={self.id}, report_id={self.report_id}, old_status='{self.old_status}', new_status='{self.new_status}', changed_by={self.changed_by})>"