-- Production Fixes for Database
-- Run this after initial database_setup.sql

-- ============================================
-- ADD CONSTRAINTS
-- ============================================

-- Add unique constraints
ALTER TABLE fee_structure 
ADD CONSTRAINT unique_class_session UNIQUE (class_name, session);

-- Add check constraints for percentages
ALTER TABLE toppers 
ADD CONSTRAINT check_percentage_toppers 
CHECK (percentage >= 0 AND percentage <= 100);

ALTER TABLE student_results 
ADD CONSTRAINT check_percentage_results 
CHECK (percentage >= 0 AND percentage <= 100);

-- Add check constraints for year
ALTER TABLE toppers 
ADD CONSTRAINT check_year_toppers 
CHECK (year >= 1900 AND year <= 2100);

-- ============================================
-- ADD MISSING INDEXES
-- ============================================

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_toppers_category ON toppers(category);
CREATE INDEX IF NOT EXISTS idx_toppers_year ON toppers(year);
CREATE INDEX IF NOT EXISTS idx_toppers_class ON toppers(class);

CREATE INDEX IF NOT EXISTS idx_faculty_name ON faculty(name);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_toppers_category_year ON toppers(category, year);
CREATE INDEX IF NOT EXISTS idx_results_class_session ON student_results(class_name, session);

-- ============================================
-- ADD AUDIT COLUMNS (Optional but recommended)
-- ============================================

-- Add updated_at to tables that don't have it
ALTER TABLE notices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE toppers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_toppers_updated_at BEFORE UPDATE ON toppers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD DATA VALIDATION
-- ============================================

-- Ensure priority values are valid
ALTER TABLE notices 
ADD CONSTRAINT check_priority 
CHECK (priority IN ('normal', 'high', 'urgent'));

-- Ensure badge colors are valid
ALTER TABLE events 
ADD CONSTRAINT check_badge_color 
CHECK (badge_color IN ('blue', 'green', 'amber', 'pink', 'red'));

-- Ensure category values are valid for toppers
ALTER TABLE toppers 
ADD CONSTRAINT check_category 
CHECK (category IN ('board', 'yearly', 'class'));

-- Ensure status values are valid for results
ALTER TABLE student_results 
ADD CONSTRAINT check_status 
CHECK (status IN ('PASS', 'FAIL', 'ABSENT'));

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Analyze tables for query optimization
ANALYZE admins;
ANALYZE notices;
ANALYZE events;
ANALYZE gallery_images;
ANALYZE download_files;
ANALYZE fee_structure;
ANALYZE student_results;
ANALYZE about_section;
ANALYZE toppers;
ANALYZE faculty;

-- Vacuum tables to reclaim space
VACUUM ANALYZE;

-- ============================================
-- SECURITY ENHANCEMENTS
-- ============================================

-- Create read-only user for reporting (optional)
-- CREATE USER school_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE school_db TO school_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO school_readonly;

-- ============================================
-- BACKUP RECOMMENDATIONS
-- ============================================

-- Set up automated backups (run as cron job):
-- 0 2 * * * pg_dump school_db > /backups/school_db_$(date +\%Y\%m\%d).sql

-- Success message
\echo 'Production fixes applied successfully!'
\echo 'Database is now production-ready!'
