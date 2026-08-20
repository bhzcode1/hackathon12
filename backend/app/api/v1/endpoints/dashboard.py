from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user  # We'll create a dependency that reuses existing auth
from app.models.user import User
from app.crud import dashboard
from app.schemas.dashboard import (
    DashboardStats,
    DashboardCrimeTypes,
    DashboardRecentReports,
    DashboardHotspots
)

# We cannot modify existing authentication code, so we create a dependency here
# that uses the existing security.decode_token function and the user model.
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_token

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

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard statistics: total reports and counts by status.
    """
    stats = dashboard.get_dashboard_stats(db)
    return stats


@router.get("/crime-types", response_model=DashboardCrimeTypes)
def get_dashboard_crime_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get report counts by crime type.
    """
    crime_types = dashboard.get_dashboard_crime_types(db)
    return crime_types


@router.get("/recent-reports", response_model=DashboardRecentReports)
def get_dashboard_recent_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """
    Get the latest reports.
    """
    recent_reports = dashboard.get_dashboard_recent_reports(db, limit=limit)
    return recent_reports


@router.get("/hotspots", response_model=DashboardHotspots)
def get_dashboard_hotspots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    precision: int = 3
):
    """
    Get hotspot coordinates with report counts.
    """
    hotspots = dashboard.get_dashboard_hotspots(db, precision=precision)
    return hotspots