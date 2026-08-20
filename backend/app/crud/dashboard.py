from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.models.crime_report import CrimeReport, ReportStatusEnum
from app.schemas.dashboard import StatItem, CrimeTypeCount, RecentReport, Hotspot


def get_dashboard_stats(db: Session):
    """
    Get dashboard statistics: total reports and counts by status.
    """
    # Total reports
    total_reports = db.query(func.count(CrimeReport.id)).scalar()

    # Reports by status
    status_counts = db.query(
        CrimeReport.status,
        func.count(CrimeReport.id)
    ).group_by(CrimeReport.status).all()

    reports_by_status = [
        StatItem(status=status, count=count) for status, count in status_counts
    ]

    return {
        "total_reports": total_reports,
        "reports_by_status": reports_by_status
    }


def get_dashboard_crime_types(db: Session):
    """
    Get report counts by crime type.
    """
    crime_type_counts = db.query(
        CrimeReport.crime_type,
        func.count(CrimeReport.id)
    ).group_by(CrimeReport.crime_type).all()

    crime_types = [
        CrimeTypeCount(crime_type=crime_type, count=count)
        for crime_type, count in crime_type_counts
    ]

    return {"crime_types": crime_types}


def get_dashboard_recent_reports(db: Session, limit: int = 10):
    """
    Get the latest reports.
    """
    recent_reports = db.query(CrimeReport).order_by(
        CrimeReport.created_at.desc()
    ).limit(limit).all()

    # Convert to the schema format
    result = []
    for report in recent_reports:
        result.append(RecentReport(
            id=report.id,
            title=report.title,
            crime_type=report.crime_type,
            status=report.status,
            created_at=report.created_at,
            latitude=report.latitude,
            longitude=report.longitude
        ))

    return {"recent_reports": result}


def get_dashboard_hotspots(db: Session, precision: int = 3):
    """
    Get hotspot coordinates with report counts.
    Groups by rounded latitude and longitude to the given precision.
    """
    # We use the round function in SQL to group by rounded coordinates.
    # Note: The exact SQL function for rounding might vary by database.
    # For PostgreSQL, we can use round(latitude, :precision) and round(longitude, :precision).
    # Since we are using SQLAlchemy, we can use the func.round.

    # However, note: func.round might not be available in all SQLAlchemy versions.
    # Alternatively, we can do the rounding in Python, but that would be less efficient.
    # Let's assume we are using PostgreSQL and use func.round.

    # We'll group by the rounded latitude and longitude.
    lat_rounded = func.round(CrimeReport.latitude, precision)
    lon_rounded = func.round(CrimeReport.longitude, precision)

    hotspot_query = db.query(
        lat_rounded.label('latitude'),
        lon_rounded.label('longitude'),
        func.count(CrimeReport.id).label('count')
    ).group_by(
        lat_rounded,
        lon_rounded
    ).order_by(
        func.count(CrimeReport.id).desc()
    ).all()

    hotspots = [
        Hotspot(latitude=lat, longitude=lon, count=count)
        for lat, lon, count in hotspot_query
    ]

    return {"hotspots": hotspots}