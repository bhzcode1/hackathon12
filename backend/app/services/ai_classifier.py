"""
AI Crime Classification Service Layer.

This module provides a rule-based classification for crime reports based on the description.
It is designed to be easily replaceable with a real ML model in the future.
"""

from typing import Tuple
import re


def classify_crime(description: str) -> Tuple[str, float, str]:
    """
    Classify a crime based on the description using rule-based keyword matching.

    Args:
        description (str): The crime description provided by the user.

    Returns:
        Tuple[str, float, str]: (predicted_crime_type, confidence, severity)
            - predicted_crime_type: One of ["THEFT", "ASSAULT", "CYBERCRIME", "VANDALISM", "OTHER"]
            - confidence: A float between 0 and 1 indicating the confidence of the prediction.
            - severity: One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"] based on the crime type and context.

    Note:
        This is a simplified rule-based system. In a real scenario, this would be replaced by a trained ML model.
    """
    # Convert description to lowercase for case-insensitive matching
    desc_lower = description.lower()

    # Define keywords for each crime type
    theft_keywords = ["stole", "stolen", "snatched", "robbed", "theft", "burglar", "larceny"]
    assault_keywords = ["attacked", "hit", "beaten", "assault", "violence", "fight", "punched", "kicked"]
    cybercrime_keywords = ["hacked", "phishing", "scam", "fraud", "identity theft", "malware", "virus"]
    vandalism_keywords = ["damaged", "broken", "graffiti", "vandalism", "defaced", "destroyed"]

    # Count matches for each category
    theft_count = sum(1 for keyword in theft_keywords if keyword in desc_lower)
    assault_count = sum(1 for keyword in assault_keywords if keyword in desc_lower)
    cybercrime_count = sum(1 for keyword in cybercrime_keywords if keyword in desc_lower)
    vandalism_count = sum(1 for keyword in vandalism_keywords if keyword in desc_lower)

    # Determine the crime type with the highest count
    counts = {
        "THEFT": theft_count,
        "ASSAULT": assault_count,
        "CYBERCRIME": cybercrime_count,
        "VANDALISM": vandalism_count,
    }
    # If no keywords matched, default to OTHER
    if max(counts.values()) == 0:
        predicted_crime_type = "OTHER"
        confidence = 0.5  # Low confidence for other
    else:
        predicted_crime_type = max(counts, key=counts.get)
        # Confidence is the proportion of the highest count to the total keyword matches (or a fixed value if we want)
        total_matches = sum(counts.values())
        confidence = counts[predicted_crime_type] / total_matches if total_matches > 0 else 0.5

    # Determine severity based on crime type and context (simplified)
    # In a real system, this would be more sophisticated and possibly part of the model output.
    severity_map = {
        "THEFT": "MEDIUM",
        "ASSAULT": "HIGH",
        "CYBERCRIME": "MEDIUM",
        "VANDALISM": "LOW",
        "OTHER": "LOW",
    }
    severity = severity_map.get(predicted_crime_type, "LOW")

    # Adjust severity based on some simple heuristics (optional)
    # For example, if the description mentions a weapon, increase severity for assault.
    if predicted_crime_type == "ASSAULT" and any(word in desc_lower for word in ["knife", "gun", "weapon"]):
        severity = "CRITICAL"

    return predicted_crime_type, confidence, severity