from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.crime_report import CrimeReport, SeverityEnum, ReportStatusEnum


def get_crime_trends(db: Session):
    """
    Get crime trends by day, week, and month.
    Returns a dictionary with keys: by_day, by_week, by_month.
    Each value is a list of dictionaries with keys: period (string) and count (int).
    """
    # By day: group by the date part of created_at
    day_results = db.query(
        func.date(CrimeReport.created_at).label('period'),
        func.count(CrimeReport.id).label('count')
    ).group_by(
        func.date(CrimeReport.created_at)
    ).order_by(
        func.date(CrimeReport.created_at)
    ).all()

    # By week: group by ISO year and week (format: YYYY-WW)
    week_results = db.query(
        func.to_char(CrimeReport.created_at, 'IYYY-IW').label('period'),
        func.count(CrimeReport.id).label('count')
    ).group_by(
        func.to_char(CrimeReport.created_at, 'IYYY-IW')
    ).order_by(
        func.to_char(CrimeReport.created_at, 'IYYY-IW')
    ).all()

    # By month: group by year and month (format: YYYY-MM)
    month_results = db.query(
        func.to_char(CrimeReport.created_at, 'YYYY-MM').label('period'),
        func.count(CrimeReport.id).label('count')
    ).group_by(
        func.to_char(CrimeReport.created_at, 'YYYY-MM')
    ).order_by(
        func.to_char(CrimeReport.created_at, 'YYYY-MM')
    ).all()

    # Convert to the expected format
    by_day = [{"period": str(period), "count": count} for period, count in day_results]
    by_week = [{"period": str(period), "count": count} for period, count in week_results]
    by_month = [{"period": str(period), "count": count} for period, count in month_results]

    return {
        "by_day": by_day,
        "by_week": by_week,
        "by_month": by_month
    }


def get_severity_distribution(db: Session):
    """
    Get the count of reports by severity.
    Returns a dictionary with keys as the severity enum values and integer counts.
    """
    results = db.query(
        CrimeReport.severity,
        func.count(CrimeReport.id)
    ).group_by(CrimeReport.severity).all()

    # Initialize with zeros for all severities
    distribution = {severity.value: 0 for severity in SeverityEnum}
    for severity, count in results:
        distribution[severity.value] = count

    return distribution


def get_status_distribution(db: Session):
    """
    Get the count of reports by status.
    Returns a dictionary with keys as the status enum values and integer counts.
    """
    results = db.query(
        CrimeReport.status,
        func.count(CrimeReport.id)
    ).group_by(CrimeReport.status).all()

    # Initialize with zeros for all statuses
    distribution = {status.value: 0 for status in ReportStatusEnum}
    for status, count in results:
        distribution[status.value] = count

    return distribution