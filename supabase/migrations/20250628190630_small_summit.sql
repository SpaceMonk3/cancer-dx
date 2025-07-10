-- Initialize database schema for CancerDx
-- This file is automatically executed when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE prediction_result AS ENUM ('positive', 'negative');
CREATE TYPE audit_status AS ENUM ('success', 'failure', 'error');

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