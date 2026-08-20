#!/usr/bin/env python3
"""
Seed data generator for the Crime Reporting Backend.
Generates:
- 50 users
- 200 crime reports
- Evidence files (for some reports)
- Various statuses, severities, and crime types

Run this script to populate a test database with demo data.
"""

import os
import sys
import random
from datetime import datetime, timedelta
from uuid import uuid4

# Add the backend directory to the path so we can import from the app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.crime_report import CrimeReport, ReportStatusEnum, SeverityEnum
from app.models.evidence import Evidence, FileTypeEnum
from app.crud import user as user_crud
from app.crud import crime_report as crime_report_crud  # We'll create this if needed, but for now we'll use direct ORM for simplicity
from app.crud import evidence as evidence_crud

# We'll create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define some sample data for generating realistic demo
CRIME_TYPES = [
    "Theft", "Assault", "Vandalism", "Burglary", "Robbery",
    "Fraud", "Drug Offense", "Traffic Violation", "Disorderly Conduct",
    "Weapon Offense", "Cybercrime", "Hate Crime"
]

# Sample addresses and locations (bounding box for a city, e.g., New York City)
SAMPLE_ADDRESSES = [
    "123 Main St, New York, NY",
    "456 Oak Ave, Los Angeles, CA",
    "789 Pine Rd, Chicago, IL",
    "321 Elm St, Houston, TX",
    "654 Maple Dr, Phoenix, AZ",
    "987 Cedar Ln, Philadelphia, PA",
    "147 Birch Blvd, San Antonio, TX",
    "258 Walnut Way, San Diego, CA",
    "369 Juniper Jct, Dallas, TX",
    "741 Aspen Ave, San Jose, CA"
]

# Sample descriptions for crime reports
SAMPLE_DESCRIPTIONS = [
    "Victim reported stolen property",
    "Witness saw suspicious activity",
    "Property damage reported",
    "Break-in detected at residential property",
    "Aggressive behavior observed in public area",
    "Illegal substances found in vehicle",
    "Traffic accident with injuries",
    "Vandalism of public property",
    "Unauthorized access to computer system",
    "Threatening behavior reported",
    "Lost item reported in public area",
    "Suspicious package found near building"
]

def clear_database(db):
    """Clear all data from the tables (in reverse order of foreign key dependencies)."""
    print("Clearing existing data...")
    db.query(Evidence).delete()
    db.query(CrimeReport).delete()
    db.query(User).delete()
    db.commit()

def create_users(db, count=50):
    """Create fake users."""
    print(f"Creating {count} users...")
    users = []
    for i in range(count):
        email = f"user{i+1}@example.com"
        # Check if user already exists (in case we're adding to existing data)
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            users.append(existing)
            continue

        username = f"user{i+1}"
        full_name = f"User {i+1}"
        password = get_password_hash("password123")  # Same password for all for simplicity in demo

        user = User(
            email=email,
            hashed_password=password,
            full_name=full_name,
            is_active=True,
            is_superuser=(i == 0)  # First user is superuser
        )
        db.add(user)
        users.append(user)

    db.commit()
    # Refresh to get IDs
    for user in users:
        db.refresh(user)
    return users

def create_crime_reports(db, users, count=200):
    """Create fake crime reports."""
    print(f"Creating {count} crime reports...")
    reports = []
    start_date = datetime.now() - timedelta(days=30)  # Reports from last 30 days

    for i in range(count):
        user = random.choice(users)
        # Random date within the last 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        created_at = start_date + timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

        # Random location within a bounding box (approx. NYC area for demo)
        latitude = round(random.uniform(40.4774, 40.9176), 6)  # NYC latitude range
        longitude = round(random.uniform(-74.2591, -73.7004), 6)  # NYC longitude range

        address = random.choice(SAMPLE_ADDRESSES)
        description = random.choice(SAMPLE_DESCRIPTIONS)
        crime_type = random.choice(CRIME_TYPES)
        severity = random.choice(list(SeverityEnum))
        status = random.choice(list(ReportStatusEnum))

        report = CrimeReport(
            user_id=user.id,
            title=f"{crime_type} Incident #{i+1}",
            description=description,
            crime_type=crime_type,
            severity=severity,
            status=status,
            latitude=latitude,
            longitude=longitude,
            address=address,
            is_anonymous=random.choice([True, False]),
            created_at=created_at,
            updated_at=created_at  # Initially same as created
        )
        db.add(report)
        reports.append(report)

    db.commit()
    # Refresh to get IDs
    for report in reports:
        db.refresh(report)
    return reports

def create_evidence(db, reports, evidence_per_report=2):
    """Create evidence for some reports."""
    print("Creating evidence...")
    evidence_list = []
    # We'll add evidence to about 40% of the reports
    reports_with_evidence = random.sample(reports, k=int(len(reports) * 0.4))

    for report in reports_with_evidence:
        num_evidence = random.randint(1, evidence_per_report)
        for j in range(num_evidence):
            # Generate a fake filename
            file_ext = random.choice(['jpg', 'png', 'mp4', 'mov'])
            file_name = f"evidence_{report.id}_{j+1}.{file_ext}"
            # Create a dummy file in the uploads directory
            uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
            os.makedirs(uploads_dir, exist_ok=True)
            file_path = os.path.join(uploads_dir, file_name)

            # Create a dummy file (just write some bytes)
            with open(file_path, 'wb') as f:
                f.write(b"This is a dummy evidence file for demo purposes." * 100)  # Make it non-empty

            # Determine file type from extension
            try:
                file_type = FileTypeEnum(file_ext.upper())
            except ValueError:
                # Default to JPG if extension doesn't match (shouldn't happen with our choices)
                file_type = FileTypeEnum.JPG

            evidence = Evidence(
                report_id=report.id,
                file_name=file_name,
                file_path=file_path,  # Store the relative or absolute path? We'll store the absolute path for simplicity in demo
                file_type=file_type,
                uploaded_at=report.created_at + timedelta(hours=random.randint(1, 24))
            )
            db.add(evidence)
            evidence_list.append(evidence)

    db.commit()
    # Refresh to get IDs
    for evidence in evidence_list:
        db.refresh(evidence)
    return evidence_list

def main():
    """Main function to run the seed data generation."""
    print("Starting seed data generation...")

    # Create a database session
    db = SessionLocal()

    try:
        # Optional: Clear existing data (uncomment if you want to start fresh)
        # clear_database(db)

        # Create users
        users = create_users(db, count=50)

        # Create crime reports
        reports = create_crime_reports(db, users, count=200)

        # Create evidence
        evidence = create_evidence(db, reports, evidence_per_report=2)

        print(f"""
Seed data generation complete!
- Users created: {len(users)}
- Crime reports created: {len(reports)}
- Evidence records created: {len(evidence)}
        """)

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()