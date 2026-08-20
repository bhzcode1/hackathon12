from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.crud import analytics
from app.schemas.analytics import (
    CrimeTrendsResponse,
    SeverityDistributionResponse,
    StatusDistributionResponse
)

# We cannot modify existing authentication code, so we create a dependency here
# that uses the existing security.decode_token function and the user model.
from fastapi.security import OAuth2PasswordBearer

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


@router.get("/analytics/crime-trends", response_model=CrimeTrendsResponse)
def get_crime_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get crime trends by day, week, and month.
    """
    trends = analytics.get_crime_trends(db)
    return trends


@router.get("/analytics/severity-distribution", response_model=SeverityDistributionResponse)
def get_severity_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the distribution of reports by severity.
    """
    distribution = analytics.get_severity_distribution(db)
    return distribution


@router.get("/analytics/status-distribution", response_model=StatusDistributionResponse)
def get_status_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the distribution of reports by status.
    """
    distribution = analytics.get_status_distribution(db)
    return distribution