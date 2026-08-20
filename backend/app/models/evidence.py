from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class FileTypeEnum(str, enum.Enum):
    JPG = "jpg"
    JPEG = "jpeg"
    PNG = "png"
    MP4 = "mp4"
    MOV = "mov"


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("crime_reports.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Relative to uploads directory or absolute path
    file_type = Column(Enum(FileTypeEnum), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to CrimeReport (we don't modify CrimeReport model, but we can define the relationship here for querying)
    # Note: We cannot modify the CrimeReport model to add a backref, but we can still define this relationship for querying from Evidence to CrimeReport.
    # For the reverse (CrimeReport to evidence), we would need to modify the CrimeReport model, which we are not allowed to do.
    # We'll leave it as a unidirectional relationship for now.
    # If needed later, the CrimeReport model can be updated in its own branch/session.

    def __repr__(self):
        return f"<Evidence {self.id}: {self.file_name}>"