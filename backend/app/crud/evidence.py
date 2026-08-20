from sqlalchemy.orm import Session
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate


def get_evidence(db: Session, evidence_id: int):
    return db.query(Evidence).filter(Evidence.id == evidence_id).first()


def get_evidences_by_report(db: Session, report_id: int, skip: int = 0, limit: int = 100):
    return db.query(Evidence).filter(Evidence.report_id == report_id).offset(skip).limit(limit).all()


def create_evidence(db: Session, evidence: EvidenceCreate):
    db_evidence = Evidence(
        report_id=evidence.report_id,
        file_name=evidence.file_name,
        file_path=evidence.file_path,
        file_type=evidence.file_type
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


def update_evidence(db: Session, db_evidence: Evidence, evidence_in: EvidenceUpdate):
    update_data = evidence_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evidence, field, value)
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


def remove_evidence(db: Session, evidence_id: int):
    evidence = db.query(Evidence).get(evidence_id)
    if evidence:
        db.delete(evidence)
        db.commit()
    return evidence