#!/bin/bash

# Start script for the backend service
echo "Starting CancerDx Backend Service..."

# Wait for database to be ready
echo "Waiting for database connection..."
python -c "
import time
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('DATABASE_URL', 'postgresql://cancerdx_user:cancerdx_password@postgres:5432/cancerdx')

# Parse connection string
import urllib.parse as urlparse
url = urlparse.urlparse(db_url)

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        conn.close()
        print('Database connection successful!')
        break
    except psycopg2.OperationalError:
        retry_count += 1
        print(f'Database connection attempt {retry_count}/{max_retries} failed. Retrying in 2 seconds...')
        time.sleep(2)

if retry_count >= max_retries:
    print('Failed to connect to database after maximum retries')
    exit(1)
"

# Create uploads directory
mkdir -p /app/uploads

# Start the FastAPI application
echo "Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload