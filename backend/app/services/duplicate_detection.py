import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.crime_report import CrimeReport
from datetime import datetime, timezone
import math

class DuplicateDetector:
    def __init__(self,
                 text_weight: float = 0.5,
                 location_weight: float = 0.3,
                 time_weight: float = 0.2,
                 duplicate_threshold: float = 0.7):
        self.text_weight = text_weight
        self.location_weight = location_weight
        self.time_weight = time_weight
        self.duplicate_threshold = duplicate_threshold
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def _compute_text_similarity(self, new_description: str, existing_descriptions: List[str]) -> np.ndarray:
        """Compute cosine similarity between new description and each existing description."""
        if not existing_descriptions:
            return np.array([])
        all_descriptions = [new_description] + existing_descriptions
        tfidf_matrix = self.vectorizer.fit_transform(all_descriptions)
        # First row is the new description
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        return similarities

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance between two points on the earth (specified in decimal degrees)."""
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lon2, lon2])
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        # Radius of earth in kilometers. Use 3956 for miles
        r = 6371
        return c * r

    def _compute_location_similarity(self, new_lat: float, new_lon: float,
                                     existing_lats: List[float], existing_lons: List[float]) -> np.ndarray:
        """Compute location similarity using a Gaussian kernel on distance."""
        if not existing_lats:
            return np.array([])
        distances = np.array([
            self._haversine_distance(new_lat, new_lon, lat, lon)
            for lat, lon in zip(existing_lats, existing_lons)
        ])
        # Choose sigma such that at 1km distance, similarity is ~0.5
        sigma = 1.0  # km
        similarities = np.exp(-distances**2 / (2 * sigma**2))
        return similarities

    def _compute_time_similarity(self, new_time: datetime, existing_times: List[datetime]) -> np.ndarray:
        """Compute time similarity using exponential decay."""
        if not existing_times:
            return np.array([])
        # Ensure all times are timezone aware (convert to UTC)
        if new_time.tzinfo is None:
            new_time = new_time.replace(tzinfo=timezone.utc)
        time_diffs = np.array([
            abs((new_time - t).total_seconds()) for t in existing_times
        ])
        # Choose tau such that at 1 day (86400 seconds) similarity is ~0.5
        tau = 86400 / math.log(2)
        similarities = np.exp(-time_diffs / tau)
        return similarities

    def check_duplicate(self, db: Session,
                        description: str,
                        latitude: float,
                        longitude: float,
                        current_time: Optional[datetime] = None) -> Tuple[bool, float, Optional[int]]:
        """
        Check if the given report is a duplicate of any existing report.
        Returns (is_duplicate, similarity_score, matched_report_id).
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)

        # Fetch all existing crime reports
        existing_reports = db.query(CrimeReport).all()
        if not existing_reports:
            return False, 0.0, None

        # Extract data from existing reports
        existing_descriptions = [r.description for r in existing_reports]
        existing_lats = [float(r.latitude) for r in existing_reports]
        existing_lons = [float(r.longitude) for r in existing_reports]
        existing_times = [r.created_at for r in existing_reports]
        existing_ids = [r.id for r in existing_reports]

        # Compute similarities
        text_sim = self._compute_text_similarity(description, existing_descriptions)
        location_sim = self._compute_location_similarity(latitude, longitude, existing_lats, existing_lons)
        time_sim = self._compute_time_similarity(current_time, existing_times)

        # Combine similarities (weighted average)
        combined_sim = (
            self.text_weight * text_sim +
            self.location_weight * location_sim +
            self.time_weight * time_sim
        )

        # Find the best match
        best_idx = int(np.argmax(combined_sim))
        best_score = float(combined_sim[best_idx])
        best_id = existing_ids[best_idx]

        is_duplicate = best_score >= self.duplicate_threshold

        return is_duplicate, best_score, best_id if is_duplicate else None


def get_duplicate_detector() -> DuplicateDetector:
    """Factory function to get a duplicate detector instance."""
    return DuplicateDetector()