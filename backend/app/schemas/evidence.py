from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.evidence import FileTypeEnum


class EvidenceBase(BaseModel):
    file_name: str
    file_path: str
    file_type: FileTypeEnum


class EvidenceCreate(EvidenceBase):
    report_id: int


class EvidenceUpdate(BaseModel):
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[FileTypeEnum] = None


class EvidenceInDBBase(EvidenceBase):
    id: int
    report_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class Evidence(EvidenceInDBBase):
    pass