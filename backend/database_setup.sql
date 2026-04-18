-- School Management System Database Setup
-- PostgreSQL Database Schema

-- Note: Database is already created by the setup script
-- This file only creates tables and inserts default data

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    badge_color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    photographer VARCHAR(120),
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create download_files table
CREATE TABLE IF NOT EXISTS download_files (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fee_structure table
CREATE TABLE IF NOT EXISTS fee_structure (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    session VARCHAR(20) NOT NULL,
    admission_fee INTEGER NOT NULL,
    tuition_fee INTEGER NOT NULL,
    annual_charges INTEGER NOT NULL,
    transport_fee VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create student_results table
CREATE TABLE IF NOT EXISTS student_results (
    id SERIAL PRIMARY KEY,
    session VARCHAR(20) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    dob VARCHAR(20),
    subjects JSONB NOT NULL,
    total_marks INTEGER NOT NULL,
    max_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create about_section table
CREATE TABLE IF NOT EXISTS about_section (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    established_year INTEGER NOT NULL,
    affiliation VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    principal_name VARCHAR(120) NOT NULL,
    principal_designation VARCHAR(100) NOT NULL,
    principal_message TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create toppers table
CREATE TABLE IF NOT EXISTS toppers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    class VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    category VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    year INTEGER,
    position VARCHAR(100) NOT NULL,
    rank VARCHAR(100),
    roll_number VARCHAR(50),
    subjects JSONB,
    remarks TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notices_date ON notices(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_downloads_category ON download_files(category);
CREATE INDEX IF NOT EXISTS idx_results_roll ON student_results(roll_number);
CREATE INDEX IF NOT EXISTS idx_results_dob ON student_results(dob);
CREATE INDEX IF NOT EXISTS idx_toppers_order ON toppers(display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faculty_order ON faculty(display_order ASC, created_at DESC);

-- Insert default admin user (password: admin123)
-- Using bcrypt hash for password 'admin123'
INSERT INTO admins (username, password_hash, name) 
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7667oPK45K', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert default about section
INSERT INTO about_section (
    school_name, 
    established_year, 
    affiliation, 
    description, 
    mission, 
    vision, 
    principal_name, 
    principal_designation, 
    principal_message
) VALUES (
    'Amol Chand Public School',
    1985,
    'CBSE Affiliated',
    'Amol Chand Public School, established in 1985, is a CBSE affiliated institution committed to nurturing minds and building character.',
    'To provide a stimulating learning environment that maximizes individual potential and equips students to meet the challenges of education, work, and life.',
    'To be a center of excellence in education, shaping compassionate and responsible global citizens with strong 21st-century skills.',
    'Dr. A. K. Singh',
    'Principal',
    'At ACPS, we focus on instilling a lifelong love for learning, a spirit of curiosity, and the resilience to face life''s challenges. Our dedicated faculty works tirelessly to ensure each child reaches their highest potential.'
)
ON CONFLICT DO NOTHING;

-- Insert default toppers
INSERT INTO toppers (name, class, section, category, percentage, year, position, roll_number, subjects, remarks, display_order) VALUES
('Rahul Sharma', 'XII - Science', 'A', 'board', 98.4, 2024, 'Board Topper', '2024001', '{"Physics": 98, "Chemistry": 99, "Mathematics": 100, "English": 95, "Computer Science": 100}'::jsonb, 'Outstanding performance with exceptional analytical skills. Consistently maintained top position throughout the academic year.', 1),
('Priya Verma', 'XII - Science', 'B', 'board', 97.2, 2024, 'Board Topper', '2024002', '{"Physics": 96, "Chemistry": 98, "Mathematics": 98, "English": 94, "Biology": 100}'::jsonb, 'Excellent academic record with strong foundation in sciences. Demonstrated leadership qualities as class monitor.', 2),
('Arjun Mehta', 'X', 'A', 'board', 96.8, 2024, 'Board Topper', '2024003', '{"Mathematics": 100, "Science": 98, "English": 96, "Hindi": 95, "Social Science": 99}'::jsonb, 'Brilliant all-rounder with perfect score in Mathematics. Active member of school debate team.', 3)
ON CONFLICT DO NOTHING;

-- Insert default faculty
INSERT INTO faculty (name, designation, subject, icon, display_order) VALUES
('Dr. A. K. Singh', 'Principal', 'M.Ed, Ph.D', 'fa-user-tie', 1),
('Mrs. Sunita Sharma', 'Vice Principal', 'M.A. English', 'fa-chalkboard-teacher', 2),
('Mr. Rajesh Kumar', 'Head - Science', 'M.Sc. Physics', 'fa-flask', 3),
('Ms. Priya Verma', 'Head - Mathematics', 'M.Sc. Mathematics', 'fa-calculator', 4)
ON CONFLICT DO NOTHING;

-- Success message
\echo 'Database setup completed successfully!'
\echo 'Tables created: 10'
\echo 'Default admin user created: admin / admin123'
