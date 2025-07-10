from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import strawberry
from strawberry.fastapi import GraphQLRouter
import uvicorn
import os
from typing import List, Optional
import json

from .database import get_db, engine
from .models import Base, User, PredictionLog
from .schemas import UserResponse, PredictionResponse, PredictionLogResponse
from .ml_model import MLPredictor
from .auth import verify_token, create_access_token, hash_password, verify_password

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CancerDx API",
    description="AI-powered cancer diagnostic platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML model
ml_predictor = MLPredictor()

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_data

@app.get("/")
async def root():
    return {"message": "CancerDx API - AI-powered cancer diagnostic platform"}

@app.post("/auth/login")
async def login(email: str = Form(), password: str = Form(), db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    try:
        # Demo authentication - replace with real user verification
        demo_users = {
            "doctor@demo.com": {"password": "password123", "name": "Dr. Smith"},
            "admin@cancerdx.com": {"password": "admin123", "name": "Admin User"},
            "researcher@university.edu": {"password": "research123", "name": "Dr. Johnson"}
        }
        
        if email not in demo_users or demo_users[email]["password"] != password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_data = {"email": email, "name": demo_users[email]["name"]}
        token = create_access_token(user_data)
        
        return {
            "token": token,
            "user_id": email,
            "email": email,
            "name": demo_users[email]["name"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_cancer(
    images: List[UploadFile] = File(...),
    clinical_data: str = Form(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform cancer prediction on uploaded histopathology images
    """
    try:
        # Parse clinical data
        clinical_info = json.loads(clinical_data)
        
        # Validate uploaded files
        if not images:
            raise HTTPException(status_code=400, detail="No images uploaded")
        
        # Process images through ML model
        prediction_result = await ml_predictor.predict(images, clinical_info)
        
        # Log prediction to database
        prediction_log = PredictionLog(
            user_id=current_user["email"],
            filename=", ".join([img.filename for img in images]),
            prediction=prediction_result["prediction"],
            confidence=prediction_result["confidence"],
            clinical_data=clinical_info,
            processing_time=prediction_result["processing_time"]
        )
        
        db.add(prediction_log)
        db.commit()
        db.refresh(prediction_log)
        
        return PredictionResponse(
            id=prediction_log.id,
            prediction=prediction_result["prediction"],
            confidence=prediction_result["confidence"],
            processing_time=prediction_result["processing_time"],
            image_count=len(images),
            clinical_data=clinical_info,
            model_version=prediction_result["model_version"]
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid clinical data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/predictions", response_model=List[PredictionLogResponse])
async def get_predictions(
    limit: int = 10,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's prediction history"""
    try:
        predictions = db.query(PredictionLog)\
            .filter(PredictionLog.user_id == current_user["email"])\
            .order_by(PredictionLog.timestamp.desc())\
            .offset(offset)\
            .limit(limit)\
            .all()
        
        return [
            PredictionLogResponse(
                id=p.id,
                user_id=p.user_id,
                filename=p.filename,
                prediction=p.prediction,
                confidence=p.confidence,
                clinical_data=p.clinical_data,
                timestamp=p.timestamp,
                processing_time=p.processing_time
            ) for p in predictions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GraphQL Schema
@strawberry.type
class PredictionLogType:
    id: int
    user_id: str
    filename: str
    prediction: str
    confidence: float
    clinical_data: dict
    timestamp: str
    processing_time: float

@strawberry.type
class UserStatistics:
    total_predictions: int
    average_confidence: float
    rhabdomyosarcoma_detected: int
    last_prediction_date: Optional[str]

@strawberry.type
class Query:
    @strawberry.field
    def prediction_logs(self, limit: int = 10, offset: int = 0) -> List[PredictionLogType]:
        """Get prediction logs via GraphQL"""
        # This would normally require authentication context
        # For demo purposes, returning mock data
        return []
    
    @strawberry.field
    def user_statistics(self, user_id: str) -> UserStatistics:
        """Get user statistics via GraphQL"""
        # Mock statistics for demo
        return UserStatistics(
            total_predictions=15,
            average_confidence=0.78,
            rhabdomyosarcoma_detected=3,
            last_prediction_date="2024-01-15T10:30:00Z"
        )

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)