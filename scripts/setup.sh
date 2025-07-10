#!/bin/bash

echo "🏥 Setting up CancerDx - AI Cancer Diagnostic Platform"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p deployment/ssl

# Copy environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file. Please update with your configuration."
fi

if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo "✅ Created .env.local file."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build and start backend services
echo "🐳 Starting backend services with Docker..."
cd backend
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend API is running at http://localhost:8000"
else
    echo "❌ Backend API is not responding. Check Docker logs:"
    docker-compose logs api
fi

if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ API documentation available at http://localhost:8000/docs"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the frontend: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Login with demo credentials: doctor@demo.com / password123"
echo ""
echo "Backend services:"
echo "- API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo "- GraphQL: http://localhost:8000/graphql"
echo "- Database: localhost:5432"
echo ""
echo "To stop backend services: cd backend && docker-compose down"