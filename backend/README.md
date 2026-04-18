# School Management System - Backend API

Python Flask + PostgreSQL Backend for School Management System

## Features

- ✅ RESTful API
- ✅ JWT Authentication
- ✅ PostgreSQL Database
- ✅ File Upload (Images & Documents)
- ✅ CRUD Operations for all entities
- ✅ Secure password hashing
- ✅ CORS enabled

## Tech Stack

- **Framework:** Flask 3.0
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (PyJWT)
- **File Handling:** Werkzeug
- **CORS:** Flask-CORS

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Installation

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

### 2. Create Database

```bash
# Start PostgreSQL service
# Windows: Start from Services
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql

# Access PostgreSQL
psql -U postgres

# Run the setup script
\i database_setup.sql

# Or manually:
CREATE DATABASE school_db;
\c school_db
# Then copy and paste the SQL from database_setup.sql
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your database credentials
# Update DATABASE_URL with your PostgreSQL credentials
```

### 5. Initialize Database

```bash
# Initialize database tables
flask init-db

# Create admin user
flask create-admin
```

### 6. Run the Server

```bash
python app.py
```

Server will start at `http://localhost:5000`

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "admin": {
    "id": 1,
    "username": "admin",
    "name": "Administrator"
  }
}
```

### Notices

#### Get All Notices
```http
GET /api/notices
```

#### Create Notice (Auth Required)
```http
POST /api/notices
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Admissions Open",
  "category": "admission",
  "date": "2026-04-20",
  "description": "Admissions for 2026-27 are now open",
  "priority": "high",
  "isNew": true
}
```

#### Delete Notice (Auth Required)
```http
DELETE /api/notices/<id>
Authorization: Bearer <token>
```

### Events

#### Get All Events
```http
GET /api/events
```

#### Create Event (Auth Required)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Annual Sports Day",
  "date": "2026-05-15",
  "time": "9:00 AM",
  "location": "School Ground",
  "description": "Annual sports competition",
  "category": "sports",
  "badgeColor": "green"
}
```

#### Delete Event (Auth Required)
```http
DELETE /api/events/<id>
Authorization: Bearer <token>
```

### Gallery

#### Get All Images
```http
GET /api/gallery
```

#### Upload Images (Auth Required)
```http
POST /api/gallery
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, ...]
- category: "sports"
- eventName: "Sports Day 2026"
- eventDate: "2026-05-15"
- photographer: "John Doe"
- description: "Event photos"
```

#### Delete Image (Auth Required)
```http
DELETE /api/gallery/<id>
Authorization: Bearer <token>
```

### Downloads

#### Get All Files
```http
GET /api/downloads
```

#### Upload File (Auth Required)
```http
POST /api/downloads
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [file]
- title: "Admission Form 2026"
- category: "forms"
- description: "Application form"
```

#### Delete File (Auth Required)
```http
DELETE /api/downloads/<id>
Authorization: Bearer <token>
```

### Fee Structure

#### Get All Fee Structures
```http
GET /api/fee-structure
```

#### Create Fee Structure (Auth Required)
```http
POST /api/fee-structure
Authorization: Bearer <token>
Content-Type: application/json

{
  "class": "Class I - V",
  "session": "2025-26",
  "admissionFee": 8000,
  "tuitionFee": 8500,
  "annualCharges": 4500,
  "transportFee": "As per route"
}
```

#### Delete Fee Structure (Auth Required)
```http
DELETE /api/fee-structure/<id>
Authorization: Bearer <token>
```

### Student Results

#### Search Result
```http
POST /api/results/search
Content-Type: application/json

{
  "rollNumber": "001",
  "dob": "15/01/2010"
}
```

#### Upload Results (Auth Required)
```http
POST /api/results/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "session": "2025-26",
  "class": "10",
  "examType": "annual",
  "students": [
    {
      "rollNumber": "001",
      "studentName": "John Doe",
      "dob": "15/01/2010",
      "subjects": [
        {"name": "Math", "marks": 95, "maxMarks": 100}
      ],
      "totalMarks": 450,
      "maxMarks": 500,
      "percentage": 90.0,
      "status": "PASS"
    }
  ]
}
```

### About Section

#### Get About Section
```http
GET /api/about
```

#### Update About Section (Auth Required)
```http
PUT /api/about
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolInfo": {
    "name": "Amol Chand Public School",
    "establishedYear": 1985,
    "affiliation": "CBSE Affiliated",
    "description": "School description"
  },
  "missionVision": {
    "mission": "Our mission",
    "vision": "Our vision"
  },
  "principal": {
    "name": "Dr. A. K. Singh",
    "designation": "Principal",
    "message": "Principal's message"
  }
}
```

## File Structure

```
backend/
├── app.py                 # Main application file
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── database_setup.sql    # Database schema
├── README.md             # This file
└── uploads/              # Upload directory (created automatically)
    ├── gallery/          # Gallery images
    └── files/            # Downloadable files
```

## Database Schema

### Tables:
1. **admins** - Admin users
2. **notices** - School notices
3. **events** - Upcoming events
4. **gallery_images** - Gallery photos
5. **download_files** - Downloadable files
6. **fee_structure** - Fee information
7. **student_results** - Student results
8. **about_section** - About page content

## Security

### Current Implementation:
- JWT token authentication
- Password hashing with Werkzeug
- CORS enabled for frontend
- File type validation
- File size limits (10MB)

### Production Recommendations:
1. Change SECRET_KEY in .env
2. Use HTTPS/SSL
3. Implement rate limiting
4. Add input validation
5. Use environment variables
6. Enable PostgreSQL SSL
7. Implement backup strategy
8. Add logging
9. Use production WSGI server (Gunicorn)
10. Set up monitoring

## Deployment

### Using Gunicorn (Production)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production

```bash
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-production-secret-key
```

## Testing

```bash
# Test API endpoints
curl http://localhost:5000/api/notices

# Test with authentication
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/notices
```

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l

# Check credentials in .env file
```

### Import Error
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Permission Error on Uploads
```bash
# Create uploads directory
mkdir -p uploads/gallery uploads/files

# Set permissions
chmod 755 uploads
```

## Support

For issues or questions:
1. Check PostgreSQL logs
2. Check Flask console output
3. Verify database connection
4. Check file permissions

## License

This project is for educational purposes.

---

**Version:** 1.0  
**Last Updated:** April 2026
