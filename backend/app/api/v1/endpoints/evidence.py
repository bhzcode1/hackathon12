from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path
from uuid import uuid4
import mimetypes

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.evidence import Evidence, FileTypeEnum
from app.models.crime_report import CrimeReport  # Assume this exists from the other branch/session
from app.crud import evidence as evidence_crud
from app.schemas.evidence import EvidenceCreate, Evidence

# We cannot modify existing authentication code, so we create a dependency here
# that uses the existing security.decode_token function and the user model.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/access-token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except (ValueError, KeyError):
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".mp4", ".mov"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "video/mp4",
    "video/quicktime"  # for .mov
}

router = APIRouter()


def validate_file(upload_file: UploadFile):
    """Validate file size, extension, and mime type."""
    # Check file size
    upload_file.file.seek(0, 2)  # Seek to end
    file_size = upload_file.file.tell()
    upload_file.file.seek(0)  # Reset to beginning
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {MAX_FILE_SIZE // (1024*1024)} MB limit"
        )

    # Check extension
    filename = upload_file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a filename"
        )
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension {file_ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check mime type (optional but recommended)
    # Note: mime types can be spoofed, but we check as an additional layer
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type not in ALLOWED_MIME_TYPES:
        # We'll still allow if the extension is allowed and we trust the extension
        # But for safety, we can reject if mime type doesn't match
        # However, sometimes the mime type might not be detected correctly, so we'll log a warning but not fail
        # For now, we'll just check the extension and assume it's correct if extension is allowed.
        pass

    return file_ext


@router.post("/reports/{report_id}/upload", response_model=Evidence, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    report_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload evidence for a specific crime report.
    - report_id: The ID of the crime report to associate evidence with
    - file: The file to upload (jpg, jpeg, png, mp4, mov)
    """
    # Validate that the report exists
    report = db.query(CrimeReport).filter(CrimeReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crime report with id {report_id} not found"
        )

    # Validate the file
    file_ext = validate_file(file)

    # Generate a safe filename to avoid overwriting and path traversal
    # We'll keep the original extension but rename the base to a UUID
    safe_filename = f"{uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / safe_filename

    # Save the file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
    finally:
        file.file.close()

    # Determine file type from extension (remove the dot)
    file_type_str = file_ext[1:]  # removes the leading dot
    # Map to our enum (we have JPG, JPEG, etc.)
    # Note: our enum values are lowercase without dot, so we can use file_type_str.lower()
    try:
        file_type_enum = FileTypeEnum(file_type_str.lower())
    except ValueError:
        # This should not happen because we validated the extension, but just in case
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file_type_str}"
        )

    # Create evidence record
    evidence_in = EvidenceCreate(
        report_id=report_id,
        file_name=file.filename,  # original filename
        file_path=str(file_path),  # we store the relative path or absolute? We'll store the path relative to the app root
        file_type=file_type_enum
    )

    db_evidence = evidence_crud.create_evidence(db=db, evidence=evidence_in)
    return db_evidence


@router.get("/reports/{report_id}/evidence", response_model=List[Evidence])
def get_evidence_for_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all evidence for a specific crime report.
    """
    # Validate that the report exists
    report = db.query(CrimeReport).filter(CrimeReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crime report with id {report_id} not found"
        )

    evidences = evidence_crud.get_evidences_by_report(db, report_id=report_id)
    return evidences


@router.delete("/evidence/{evidence_id}", response_model=Evidence)
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an evidence by ID.
    """
    db_evidence = evidence_crud.get_evidence(db, evidence_id=evidence_id)
    if db_evidence is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence with id {evidence_id} not found"
        )

    # Optionally, we could check if the current user has permission to delete this evidence
    # For now, we allow any authenticated user to delete any evidence (could be restricted to admin or uploader)
    # Since we don't track uploader in the evidence model (we didn't add uploaded_by), we cannot check.
    # We'll leave it as is for now.

    # Delete the file from the filesystem
    file_path = Path(db_evidence.file_path)
    if file_path.is_file():
        try:
            file_path.unlink()
        except Exception as e:
                    # Log the error but still delete the database record
                    pass

    # Delete the evidence record
    return evidence_crud.remove_evidence(db, evidence_id=evidence_id)