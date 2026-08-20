from .user import UserCreate, UserUpdate, UserInDB, User, Token, TokenPayload, TokenData
from .evidence import EvidenceBase, EvidenceCreate, EvidenceUpdate, EvidenceInDBBase, Evidence
from .dashboard import (
    StatItem,
    DashboardStats,
    CrimeTypeCount,
    DashboardCrimeTypes,
    RecentReport,
    DashboardRecentReports,
    Hotspot,
    DashboardHotspots
)
from .crime_report import (
    CrimeReportBase,
    CrimeReportCreate,
    CrimeReportUpdate,
    CrimeReportInDBBase,
    CrimeReportResponse,
    NearbyReportResponse,
    MapReportResponse
)
from .ai import AIClassificationRequest, AIClassificationResponse
from .risk import RiskScoreRequest, RiskScoreResponse
from .pagination import PaginatedResponse

__all__ = [
    "UserCreate", "UserUpdate", "UserInDB", "User", "Token", "TokenPayload", "TokenData",
    "EvidenceBase", "EvidenceCreate", "EvidenceUpdate", "EvidenceInDBBase", "Evidence",
    "StatItem", "DashboardStats",
    "CrimeTypeCount", "DashboardCrimeTypes",
    "RecentReport", "DashboardRecentReports",
    "Hotspot", "DashboardHotspots",
    "CrimeReportBase", "CrimeReportCreate", "CrimeReportUpdate", "CrimeReportInDBBase", "CrimeReportResponse",
    "NearbyReportResponse", "MapReportResponse",
    "AIClassificationRequest", "AIClassificationResponse",
    "RiskScoreRequest", "RiskScoreResponse",
    "PaginatedResponse"
]