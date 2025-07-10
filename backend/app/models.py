from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, Text
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    """User model for authentication and user management"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class PredictionLog(Base):
    """Model for storing ML prediction results and logs"""
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)  # References User.email
    filename = Column(String, nullable=False)  # Original filename(s)
    prediction = Column(String, nullable=False)  # 'positive' or 'negative'
    confidence = Column(Float, nullable=False)  # Confidence score (0.0 to 1.0)
    clinical_data = Column(JSON)  # Clinical information as JSON
    processing_time = Column(Float)  # Time taken for prediction in seconds
    model_version = Column(String, default="ResNet50-v2.1")  # Model version used
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Additional metadata
    image_count = Column(Integer, default=1)  # Number of images processed
    notes = Column(Text)  # Optional notes or additional information

class AuditLog(Base):
    """Model for audit logging and system monitoring"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String, nullable=False)  # e.g., 'login', 'prediction', 'download'
    resource = Column(String)  # Resource affected
    details = Column(JSON)  # Additional details as JSON
    ip_address = Column(String)
    user_agent = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    status = Column(String, default="success")  # 'success', 'failure', 'error'