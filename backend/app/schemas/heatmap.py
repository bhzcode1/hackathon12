from pydantic import BaseModel
from typing import List


class HeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    weight: int


class HeatmapResponse(List[HeatmapPoint]):
    pass