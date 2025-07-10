from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Prediction schemas
class PredictionRequest(BaseModel):
    clinical_data: Dict[str, Any]

class PredictionResponse(BaseModel):
    id: int
    prediction: str  # 'positive' or 'negative'
    confidence: float
    processing_time: float
    image_count: int
    clinical_data: Dict[str, Any]
    model_version: str
    timestamp: Optional[datetime] = None

class PredictionLogResponse(BaseModel):
    id: int
    user_id: str
    filename: str
    prediction: str
    confidence: float
    clinical_data: Dict[str, Any]
    timestamp: datetime
    processing_time: float
    model_version: Optional[str] = None
    image_count: Optional[int] = None
    
    class Config:
        from_attributes = True

# Clinical data schemas
class ClinicalData(BaseModel):
    age: int
    gender: str
    tumor_site: str
    tumor_size: Optional[float] = None
    symptoms: List[str] = []
    histology: Optional[str] = None
    stage: Optional[str] = None
    prior_treatment: Optional[str] = None
    family_history: bool = False
    notes: Optional[str] = None

# Statistics schemas
class UserStatistics(BaseModel):
    total_predictions: int
    positive_predictions: int
    negative_predictions: int
    average_confidence: float
    last_prediction_date: Optional[datetime] = None
    most_common_tumor_site: Optional[str] = None

# Error schemas
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime