from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ModelVersionResponse(BaseModel):
    """Schema for a registered ML model version."""
    id: str
    version: str
    algorithm: str
    mae: float
    rmse: float
    r2: float
    is_active: bool
    trained_at: datetime
    hyperparameters: Dict[str, Any]
    feature_names: List[str]

    model_config = ConfigDict(from_attributes=True)


class ModelListResponse(BaseModel):
    """List of all registered models in the platform."""
    models: List[ModelVersionResponse]
