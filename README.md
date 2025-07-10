# CancerDx

A full-stack web application for rhabdomyosarcoma detection using deep learning and histopathology image analysis.

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: JWT-based token authentication
- **State Management**: React Context API
- **API Calls**: REST + GraphQL integration
- **Deployment**: Vercel-ready with static export

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **ML Model**: TensorFlow ResNet50 for image classification
- **Database**: PostgreSQL with SQLAlchemy ORM
- **APIs**: RESTful endpoints + GraphQL with Strawberry
- **Authentication**: JWT tokens with bcrypt password hashing
- **Containerization**: Docker and Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run with Docker Compose** (Recommended):
```bash
docker-compose up --build
```

Or run manually:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

## 🧠 ML Model Integration

The application uses a ResNet50-based model for rhabdomyosarcoma detection:

- **Model Architecture**: ResNet50 pre-trained on ImageNet with custom classification layers
- **Input**: 224x224 RGB histopathology images
- **Output**: Binary classification (positive/negative) with confidence score
- **Clinical Integration**: Predictions adjusted based on clinical risk factors

### Model Training Notes
In production, you would:
1. Collect and annotate histopathology images
2. Fine-tune ResNet50 on your specific dataset
3. Implement proper model validation and testing
4. Save the trained model weights

## 📊 Features

### Core Functionality
- **Secure Authentication**: JWT-based login system
- **Image Upload**: Drag-and-drop interface for histopathology images
- **Clinical Data Entry**: Comprehensive form for patient information
- **AI Prediction**: Real-time cancer detection with confidence scores
- **Results Dashboard**: Visual presentation of diagnostic results
- **History Tracking**: Complete log of past predictions and analyses

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live prediction progress and results
- **Error Handling**: Comprehensive error management and user feedback
- **Data Validation**: Input validation on both frontend and backend
- **Security**: Secure file upload, authentication, and data protection

## 🛠️ API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Predictions
- `POST /api/predict` - Submit images and clinical data for analysis
- `GET /api/predictions` - Get user's prediction history

### GraphQL
- `POST /graphql` - GraphQL endpoint for complex queries
  - Query prediction logs
  - Get user statistics
  - Advanced filtering and sorting

## 🗃️ Database Schema

### Users Table
- User authentication and profile information
- Secure password hashing with bcrypt

### Prediction Logs Table
- Complete record of all ML predictions
- Links to user accounts and clinical data
- Performance metrics and model versions

### Audit Logs Table
- System access and action logging
- Security monitoring and compliance

## 🔧 Development

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Backend Development
```bash
# Start with auto-reload
uvicorn app.main:app --reload

# Run database migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"
```

### Docker Development
```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f api

# Run database migrations in container
docker-compose exec api alembic upgrade head
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment
1. **Docker**: Use the provided Dockerfile for containerization
2. **Cloud Platforms**: Deploy to AWS ECS, Google Cloud Run, or similar
3. **Database**: Use managed PostgreSQL service (AWS RDS, Google Cloud SQL)

### Environment Variables
Make sure to set these in production:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Strong secret key for JWT tokens
- `ALLOWED_ORIGINS`: Frontend domain for CORS

## 📝 Medical Disclaimer

This application is for research and educational purposes only. The AI predictions should not be used as the sole basis for medical diagnosis or treatment decisions. Always consult with qualified medical professionals for clinical diagnosis and patient care.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Frontend Demo**: 
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **GraphQL Playground**: `http://localhost:8000/graphql`

## 💡 Future Improvements

- [ ] Advanced model ensemble techniques
- [ ] Real-time collaboration features
- [ ] DICOM image support
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with hospital systems (HL7 FHIR)