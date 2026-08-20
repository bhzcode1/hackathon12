from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin
from app.crud import crime_report
from app.models import CrimeReport, ReportStatusHistory, User
from app.schemas.crime_report import CrimeReportResponse

router = APIRouter()


def _update_report_status(
    db: Session,
    report_id: int,
    new_status: str,
    changed_by: int,
):
    """
    Helper function to update the report status and create a history record.
    """
    report = db.query(CrimeReport).filter(CrimeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Crime report not found")

    old_status = report.status
    # Update the report status
    report.status = new_status
    # Create a history record
    history = ReportStatusHistory(
        report_id=report_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by
    )
    db.add(history)
    db.commit()
    db.refresh(report)
    return report


@router.put("/reports/{report_id}/verify", response_model=CrimeReportResponse)
def verify_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Verify a crime report (only for admins).
    Changes status to VERIFIED.
    """
    report = _update_report_status(
        db=db,
        report_id=report_id,
        new_status="verified",
        changed_by=current_admin.id
    )
    return report


@router.put("/reports/{report_id}/reject", response_model=CrimeReportResponse)
def reject_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Reject a crime report (only for admins).
    Changes status to REJECTED.
    """
    report = _update_report_status(
        db=db,
        report_id=report_id,
        new_status="rejected",
        changed_by=current_admin.id
    )
    return report


@router.put("/reports/{report_id}/resolve", response_model=CrimeReportResponse)
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Resolve a crime report (only for admins).
    Changes status to RESOLVED.
    """
    report = _update_report_status(
        db=db,
        report_id=report_id,
        new_status="resolved",
        changed_by=current_admin.id
    )
    return report