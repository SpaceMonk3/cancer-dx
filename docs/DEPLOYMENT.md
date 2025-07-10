# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend)
- Domain name and SSL certificates (for production)

## Development Deployment

### 1. Setup Environment
```bash
# Clone the repository
git clone <your-repo-url>
cd cancer-diagnostic-app

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Start Services
```bash
# Start backend services
cd backend
docker-compose up -d

# Start frontend (in another terminal)
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Production Deployment

### 1. Environment Configuration
Create production environment file:
```bash
# deployment/.env
POSTGRES_DB=cancerdx_prod
POSTGRES_USER=cancerdx_prod_user
POSTGRES_PASSWORD=your-secure-password
SECRET_KEY=your-super-secret-key-minimum-32-characters
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2. SSL Certificates
Place SSL certificates in `deployment/ssl/`:
- `cert.pem`: SSL certificate
- `key.pem`: Private key

### 3. Deploy Backend
```bash
cd deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Deploy Frontend

#### Option A: Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL=https://your-api-domain.com`
3. Deploy automatically on push

#### Option B: Static Hosting
```bash
# Build for production
npm run build

# Deploy 'out' directory to your hosting provider
# (Netlify, AWS S3, etc.)
```

### 5. Database Migration
```bash
# Run database migrations
docker-compose exec api python -c "
from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
"
```

## Monitoring and Maintenance

### Health Checks
- API Health: `GET /health`
- Database: Check Docker container status
- Frontend: Monitor Vercel deployment status

### Logs
```bash
# View API logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres
```

### Backup
```bash
# Backup database
docker-compose exec postgres pg_dump -U cancerdx_user cancerdx > backup.sql

# Restore database
docker-compose exec -T postgres psql -U cancerdx_user cancerdx < backup.sql
```

### Updates
```bash
# Update backend
git pull
docker-compose build --no-cache
docker-compose up -d

# Update frontend
git pull
npm run build
# Deploy to hosting provider
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **SSL/TLS**: Always use HTTPS in production
3. **Database**: Use strong passwords and restrict access
4. **API Keys**: Rotate JWT secret keys regularly
5. **File Uploads**: Validate file types and sizes
6. **CORS**: Configure allowed origins properly

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, AWS ALB)
- Deploy multiple API instances
- Use managed database service (AWS RDS, Google Cloud SQL)

### Vertical Scaling
- Increase Docker container resources
- Optimize database queries
- Implement caching (Redis)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **API Not Responding**
   ```bash
   # Check API container
   docker-compose ps api
   
   # Check logs
   docker-compose logs api
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **CORS Errors**
   - Check `ALLOWED_ORIGINS` environment variable
   - Ensure frontend URL is included in allowed origins