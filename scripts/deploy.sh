#!/bin/bash

echo "🚀 Deploying CancerDx to Production"
echo "=================================="

# Check if required environment variables are set
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ Required environment variables are not set."
    echo "Please set: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, SECRET_KEY"
    exit 1
fi

# Build frontend for production
echo "🏗️ Building frontend for production..."
npm run build

# Deploy backend with production configuration
echo "🐳 Deploying backend services..."
cd deployment
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services
echo "⏳ Waiting for production services to start..."
sleep 60

# Health check
echo "🔍 Performing health checks..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Production API is running"
else
    echo "❌ Production API health check failed"
    docker-compose -f docker-compose.prod.yml logs api
    exit 1
fi

echo ""
echo "🎉 Production deployment complete!"
echo ""
echo "Services:"
echo "- API: http://your-domain.com/api"
echo "- Frontend: Deploy the 'out' directory to your hosting provider"
echo ""
echo "Don't forget to:"
echo "1. Configure SSL certificates in deployment/ssl/"
echo "2. Update nginx.conf with your domain"
echo "3. Set up DNS records"
echo "4. Configure firewall rules"