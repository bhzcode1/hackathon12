from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.crime_report import CrimeReport


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    from math import radians, cos, sin, asin, sqrt
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lon2])
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    # Radius of earth in kilometers. Use 3956 for miles
    r = 6371
    return c * r


def get_nearby_reports(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[CrimeReport], int]:
    """
    Get crime reports within a given radius (km) from a point, sorted by distance.
    Returns a tuple of (items, total).
    """
    # Haversine formula for distance in kilometers
    distance_expr = func.acos(
        cos(func.radians(latitude)) *
        cos(func.radians(CrimeReport.latitude)) *
        cos(func.radians(CrimeReport.longitude) - func.radians(longitude)) +
        sin(func.radians(latitude)) *
        sin(func.radians(CrimeReport.latitude))
    ) * 6371  # Earth radius in km

    query = db.query(CrimeReport).filter(distance_expr <= radius_km)

    total = query.count()

    # Order by distance (ascending) for nearest first
    query = query.order_by(distance_expr.asc()).offset(skip).limit(limit)

    items = query.all()

    return items, total


def get_map_reports(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[CrimeReport], int]:
    """
    Get all crime reports for map display (simplified data).
    Returns a tuple of (items, total) ordered by creation date (newest first).
    """
    query = db.query(CrimeReport)
    total = query.count()
    # Order by created_at descending (newest first)
    query = query.order_by(CrimeReport.created_at.desc()).offset(skip).limit(limit)
    items = query.all()
    return items, total