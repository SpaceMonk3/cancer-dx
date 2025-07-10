# CancerDx API Documentation

## Overview
The CancerDx API provides endpoints for cancer diagnostic analysis using AI-powered histopathology image processing.

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "doctor@demo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_id": "doctor@demo.com",
  "email": "doctor@demo.com",
  "name": "Dr. Smith"
}
```

### Predictions

#### POST /api/predict
Submit histopathology images and clinical data for analysis.

**Request:** Multipart form data
- `images`: Image files (PNG, JPG, JPEG, TIFF, BMP)
- `clinical_data`: JSON string with clinical information

**Clinical Data Format:**
```json
{
  "age": 25,
  "gender": "male",
  "tumorSite": "head-neck",
  "tumorSize": 3.5,
  "symptoms": ["Swelling/Mass", "Pain"],
  "histology": "high",
  "stage": "II",
  "priorTreatment": "None",
  "familyHistory": false,
  "notes": "Additional observations"
}
```

**Response:**
```json
{
  "id": 123,
  "prediction": "negative",
  "confidence": 0.85,
  "processing_time": 2.3,
  "image_count": 2,
  "clinical_data": {...},
  "model_version": "ResNet50-v2.1"
}
```

#### GET /api/predictions
Get user's prediction history.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 123,
    "user_id": "doctor@demo.com",
    "filename": "sample.jpg",
    "prediction": "negative",
    "confidence": 0.85,
    "clinical_data": {...},
    "timestamp": "2024-01-15T10:30:00Z",
    "processing_time": 2.3
  }
]
```

### GraphQL

#### POST /graphql
GraphQL endpoint for complex queries.

**Example Query:**
```graphql
query GetPredictionLogs($limit: Int, $offset: Int) {
  predictionLogs(limit: $limit, offset: $offset) {
    id
    userId
    filename
    prediction
    confidence
    clinicalData
    timestamp
    processingTime
  }
}
```

**Example Statistics Query:**
```graphql
query GetUserStatistics($userId: String!) {
  userStatistics(userId: $userId) {
    totalPredictions
    averageConfidence
    rhabdomyosarcomaDetected
    lastPredictionDate
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token)
- `404`: Not Found
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message",
  "detail": "Detailed error description",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- Prediction endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

## File Upload Limits
- Maximum file size: 10MB per image
- Maximum files per request: 5
- Supported formats: PNG, JPG, JPEG, TIFF, BMP
- Minimum resolution: 224x224 pixels