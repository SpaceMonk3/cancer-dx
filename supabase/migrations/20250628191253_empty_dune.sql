-- Initialize database schema for CancerDx
-- This file is automatically executed when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE prediction_result AS ENUM ('positive', 'negative');
CREATE TYPE audit_status AS ENUM ('success', 'failure', 'error');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prediction_logs table
CREATE TABLE IF NOT EXISTS prediction_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- References User.email
    filename VARCHAR(255) NOT NULL,
    prediction prediction_result NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    clinical_data JSONB,
    processing_time FLOAT,
    model_version VARCHAR(100) DEFAULT 'ResNet50-v2.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    image_count INTEGER DEFAULT 1,
    notes TEXT
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status audit_status DEFAULT 'success'
);

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_logs_user_id ON prediction_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_logs_timestamp ON prediction_logs(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_logs_prediction ON prediction_logs(prediction);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development (optional)
-- This will be overridden by the application's authentication system
INSERT INTO users (email, name, hashed_password, is_active) VALUES
('doctor@demo.com', 'Dr. Smith', '$2b$12$demo_hashed_password', true),
('admin@cancerdx.com', 'Admin User', '$2b$12$demo_hashed_password', true)
ON CONFLICT (email) DO NOTHING;

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.email,
    u.name,
    COUNT(pl.id) as total_predictions,
    COUNT(CASE WHEN pl.prediction = 'positive' THEN 1 END) as positive_predictions,
    COUNT(CASE WHEN pl.prediction = 'negative' THEN 1 END) as negative_predictions,
    AVG(pl.confidence) as average_confidence,
    MAX(pl.timestamp) as last_prediction_date
FROM users u
LEFT JOIN prediction_logs pl ON u.email = pl.user_id
GROUP BY u.email, u.name;

-- Grant permissions
GRANT SELECT ON user_statistics TO cancerdx_user;