from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud import crime_report
from app.models import User
from app.services import geospatial
from app.schemas.crime_report import CrimeReportCreate, CrimeReportUpdate, CrimeReportResponse, NearbyReportResponse, MapReportResponse
from app.schemas.pagination import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=CrimeReportResponse)
def create_crime_report(
    report_in: CrimeReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new crime report.
    """
    # We don't allow the client to set user_id; it comes from the authenticated user
    report = crime_report.create_with_owner(
        db=db, obj_in=report_in, owner_id=current_user.id
    )
    return report


@router.get("/", response_model=PaginatedResponse[CrimeReportResponse])
def read_crime_reports(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[List[str]] = Query(None, description="Filter by status"),
    crime_type: Optional[List[str]] = Query(None, description="Filter by crime type"),
    severity: Optional[List[str]] = Query(None, description="Filter by severity"),
    search: Optional[str] = Query(None, description="Search in description and crime type"),
    sort: str = Query("newest", description="Sort order: newest, oldest, nearest"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Latitude for nearest sort"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Longitude for nearest sort"),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve crime reports with filtering, search, sorting, and pagination.
    """
    try:
        items, total = crime_report.get_multi(
            db=db,
            skip=skip,
            limit=limit,
            status=status,
            crime_type=crime_type,
            severity=severity,
            search=search,
            sort=sort,
            latitude=latitude,
            longitude=longitude
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    page = (skip // limit) + 1 if limit > 0 else 1
    size = limit
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size
    }


@router.get("/{report_id}", response_model=CrimeReportResponse)
def read_crime_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific crime report by id.
    """
    report = crime_report.get(db, id=report_id)
    if not report:
        raise HTTPException(
            status_code=404, detail="Crime report not found"
        )
    return report


@router.put("/{report_id}", response_model=CrimeReportResponse)
def update_crime_report(
    *,
    db: Session = Depends(get_db),
    report_id: int,
    report_in: CrimeReportUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update a crime report.
    """
    report = crime_report.get(db, id=report_id)
    if not report:
        raise HTTPException(
            status_code=404, detail="Crime report not found"
        )
    # We don't allow changing the owner (user_id) via update
    report = crime_report.update(db, db_obj=report, obj_in=report_in)
    return report


@router.delete("/{report_id}", response_model=CrimeReportResponse)
def delete_crime_report(
    *,
    db: Session = Depends(get_db),
    report_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    Delete a crime report.
    """
    report = crime_report.get(db, id=report_id)
    if not report:
        raise HTTPException(
            status_code=404, detail="Crime report not found"
        )
    report = crime_report.remove(db, id=report_id)
    return report


@router.get("/nearby", response_model=PaginatedResponse[NearbyReportResponse])
def get_nearby_reports(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude of the center point"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude of the center point"),
    radius_km: float = Query(..., gt=0, description="Radius in kilometers from the center point"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of items to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get crime reports within a given radius (km) from a point, sorted by distance.
    """
    items, total = geospatial.get_nearby_reports(db, latitude, longitude, radius_km, skip, limit)
    # Convert items to NearbyReportResponse
    nearby_items = [
        NearbyReportResponse(
            report_id=item.id,
            crime_type=item.crime_type,
            status=item.status.value if hasattr(item.status, 'value') else str(item.status),
            severity=item.severity.value if hasattr(item.severity, 'value') else str(item.severity),
            latitude=item.latitude,
            longitude=item.longitude,
            created_at=item.created_at
        )
        for item in items
    ]
    page = (skip // limit) + 1 if limit > 0 else 1
    size = limit
    return {
        "items": nearby_items,
        "total": total,
        "page": page,
        "size": size
    }


@router.get("/map", response_model=PaginatedResponse[MapReportResponse])
def get_map_reports(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of items to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get simplified report data for map markers.
    """
    items, total = geospatial.get_map_reports(db, skip, limit)
    # Convert items to MapReportResponse
    map_items = [
        MapReportResponse(
            id=item.id,
            crime_type=item.crime_type,
            latitude=item.latitude,
            longitude=item.longitude,
            status=item.status.value if hasattr(item.status, 'value') else str(item.status)
        )
        for item in items
    ]
    page = (skip // limit) + 1 if limit > 0 else 1
    size = limit
    return {
        "items": map_items,
        "total": total,
        "page": page,
        "size": size
    }