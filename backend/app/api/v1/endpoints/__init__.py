from .auth import router as auth_router
from .users import router as users_router
from .evidence import router as evidence_router
from .dashboard import router as dashboard_router
from .heatmap import router as heatmap_router
from .analytics import router as analytics_router
from .ai import router as ai_router
from .report import router as report_router
from .admin import router as admin_router

__all__ = ["auth_router", "users_router", "evidence_router", "dashboard_router", "heatmap_router", "analytics_router", "ai_router", "report_router", "admin_router"]