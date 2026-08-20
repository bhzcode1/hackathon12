from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.crime_report import CrimeReport


def get_heatmap_data(db: Session, precision: int = 3):
    """
    Get heatmap data by grouping nearby incidents.
    Groups by latitude and longitude rounded to the given precision (default 3 decimal places).
    Returns a list of dictionaries with latitude, longitude, and weight (count).
    """
    lat_rounded = func.round(CrimeReport.latitude, precision)
    lon_rounded = func.round(CrimeReport.longitude, precision)

    results = db.query(
        lat_rounded.label('latitude'),
        lon_rounded.label('longitude'),
        func.count(CrimeReport.id).label('weight')
    ).group_by(
        lat_rounded,
        lon_rounded
    ).all()

    # Convert to list of dictionaries
    heatmap_data = [
        {
            "latitude": float(lat),
            "longitude": float(lon),
            "weight": int(weight)
        }
        for lat, lon, weight in results
    ]

    return heatmap_data