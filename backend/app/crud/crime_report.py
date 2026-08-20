from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Tuple, Optional

from app.models.crime_report import CrimeReport
from app.schemas.crime_report import CrimeReportCreate, CrimeReportUpdate


def get(db: Session, id: int):
    return db.query(CrimeReport).filter(CrimeReport.id == id).first()


def get_multi(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
    status: Optional[List[str]] = None,
    crime_type: Optional[List[str]] = None,
    severity: Optional[List[str]] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Tuple[List[CrimeReport], int]:
    """
    Get multiple crime reports with filtering, search, sorting, and pagination.
    Returns a tuple of (items, total).
    """
    query = db.query(CrimeReport)

    # Apply filters
    if status:
        query = query.filter(CrimeReport.status.in_(status))
    if crime_type:
        query = query.filter(CrimeReport.crime_type.in_(crime_type))
    if severity:
        query = query.filter(CrimeReport.severity.in_(severity))
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CrimeReport.description.ilike(search_term),
                CrimeReport.crime_type.ilike(search_term)
            )
        )

    # Apply sorting
    if sort == "newest":
        query = query.order_by(CrimeReport.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(CrimeReport.created_at.asc())
    elif sort == "nearest":
        if latitude is None or longitude is None:
            raise ValueError("latitude and longitude are required for nearest sort")
        # Haversine formula for distance in kilometers
        distance_expr = func.acos(
            cos(func.radians(latitude)) *
            cos(func.radians(CrimeReport.latitude)) *
            cos(func.radians(CrimeReport.longitude) - func.radians(longitude)) +
            sin(func.radians(latitude)) *
            sin(func.radians(CrimeReport.latitude))
        ) * 6371  # Earth radius in km
        query = query.order_by(distance_expr.asc())
    else:
        # Default to newest
        query = query.order_by(CrimeReport.created_at.desc())

    # Get total count
    total = query.count()

    # Apply pagination
    query = query.offset(skip).limit(limit)

    items = query.all()

    return items, total


def create_with_owner(db: Session, *, obj_in: CrimeReportCreate, owner_id: int):
    obj_in_data = obj_in.model_dump()
    db_obj = CrimeReport(**obj_in_data, user_id=owner_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, *, db_obj: CrimeReport, obj_in: CrimeReportUpdate):
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, *, id: int):
    obj = db.query(CrimeReport).get(id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj