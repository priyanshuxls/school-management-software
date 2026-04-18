# 🏫 Amol Chand Public School - Complete Management System

A modern, responsive school management system built with HTML5, CSS3, JavaScript, and Python Flask. Features a beautiful glassmorphism UI, comprehensive admin panel, and full backend integration.

![School Management System](https://img.shields.io/badge/School-Management%20System-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

## ✨ Features

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful glass-effect cards and components
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Ripple effects, hover transitions, and page animations
- **Dark Theme** - Professional dark color scheme with gradient backgrounds
- **Interactive Elements** - Smooth button interactions and visual feedback

### 🏠 Public Website
- **Homepage** - Hero section, quick stats, latest notices, and events
- **About Page** - School information, mission, vision, and principal's message
- **Admissions** - Application form and admission process
- **Faculty** - Staff directory with detailed profiles
- **Gallery** - Event photos with category filtering and lightbox viewer
- **Activities** - School programs and extracurricular activities
- **Results** - Student result portal with roll number search
- **Syllabus** - Downloadable curriculum documents
- **Toppers** - Student achievements with multiple categories
- **Contact** - Contact information, location map, and inquiry form

### 🔧 Admin Panel
- **Dashboard** - Overview with quick stats and management cards
- **Content Management**:
  - Notices & Announcements
  - Events & Activities
  - Gallery Images
  - Faculty Profiles
  - Student Toppers
  - Downloadable Files
  - Fee Structure
  - About Section
  - Student Results
- **File Uploads** - Image and document management
- **Real-time Updates** - Changes reflect immediately on public site

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- PostgreSQL 12 or higher
- Modern web browser
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/school-management-system.git
cd school-management-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
python -c "from app import db; db.create_all()"

# Create admin user
python -c "from app import *; admin = Admin(username='admin', name='Administrator'); admin.set_password('admin123'); db.session.add(admin); db.session.commit(); print('Admin created!')"

# Run development server
python app.py
```

### 3. Frontend Setup
```bash
# Open another terminal in project root
# Serve frontend files (choose one method):

# Method 1: Python HTTP Server
python -m http.server 8000

# Method 2: Node.js HTTP Server (if you have Node.js)
npx http-server -p 8000

# Method 3: PHP Server (if you have PHP)
php -S localhost:8000
```

### 4. Access Application
- **Public Website**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin.html
- **Backend API**: http://localhost:5000
- **Admin Credentials**: username: `admin`, password: `admin123`

## 📁 Project Structure

```
school-management-system/
├── 📄 Frontend (Public Website)
│   ├── index.html              # Homepage
│   ├── about.html              # About page
│   ├── admission.html          # Admissions
│   ├── faculty.html            # Faculty directory
│   ├── gallery.html            # Photo gallery
│   ├── result.html             # Student results
│   ├── toppers.html            # Student achievements
│   └── contact.html            # Contact information
│
├── 🔧 Admin Panel
│   ├── admin.html              # Admin dashboard
│   ├── admin-notices.html      # Manage notices
│   ├── admin-events.html       # Manage events
│   ├── admin-gallery.html      # Manage gallery
│   ├── admin-faculty.html      # Manage faculty
│   ├── admin-toppers.html      # Manage toppers
│   └── admin-*.html            # Other admin pages
│
├── 🎨 Styles
│   ├── css/styles.css          # Main stylesheet
│   ├── css/admin.css           # Admin panel styles
│   ├── css/toppers.css         # Toppers page styles
│   ├── css/faculty.css         # Faculty page styles
│   └── css/gallery.css         # Gallery page styles
│
├── ⚡ Scripts
│   ├── js/script.js            # Main JavaScript
│   ├── js/api-service.js       # Backend API integration
│   ├── js/admin-*.js           # Admin panel functionality
│   ├── js/ripple-effect.js     # UI interactions
│   └── js/toppers.js           # Toppers page logic
│
├── 🐍 Backend
│   ├── app.py                  # Main Flask application
│   ├── app_production.py       # Production-ready version
│   ├── database_setup.sql      # Database schema
│   ├── production_fixes.sql    # Production optimizations
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
│
├── 🖼️ Assets
│   └── assets/images/          # Event photos and media
│
└── 📚 Documentation
    ├── README.md               # This file
    ├── MASTER_DOCUMENTATION.md # Complete documentation
    ├── IMPLEMENTATION_GUIDE.md # Setup instructions
    └── *.md                    # Various guides and reports
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Flexbox, Grid, animations, and glassmorphism effects
- **JavaScript (ES6+)** - Modern JavaScript with async/await, modules
- **Font Awesome** - Icon library for UI elements
- **Google Fonts** - Poppins and Playfair Display typography

### Backend
- **Python 3.8+** - Modern Python with type hints
- **Flask** - Lightweight web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens
- **Werkzeug** - File uploads and security
- **Flask-CORS** - Cross-origin resource sharing

## 📖 Documentation

### Complete Guides
- **[Master Documentation](MASTER_DOCUMENTATION.md)** - Complete system overview
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Detailed setup instructions
- **[Production Setup](PRODUCTION_SETUP_GUIDE.md)** - Production deployment guide
- **[API Documentation](DOCUMENTATION_PART2.md)** - Backend API reference

### Feature Guides
- **[UI Refinement Summary](UI_REFINEMENT_SUMMARY.md)** - UI improvements and design
- **[Gallery Fix Summary](GALLERY_FIX_SUMMARY.md)** - Image upload functionality
- **[Code Cleanup Report](CODE_CLEANUP_REPORT.md)** - Code quality analysis

## 🎯 Key Features Showcase

### 🎨 Beautiful UI
- Modern glassmorphism design with subtle transparency effects
- Smooth animations and ripple effects on all interactive elements
- Responsive grid layouts that work on all screen sizes
- Professional color scheme with gradient backgrounds

### 📱 Responsive Design
- Mobile-first approach with breakpoints for all devices
- Touch-friendly interface with proper spacing and sizing
- Optimized images and lazy loading for fast performance
- Consistent experience across desktop, tablet, and mobile

### 🔐 Secure Admin Panel
- JWT-based authentication system
- Role-based access control
- Secure file upload with validation
- CSRF protection and input sanitization

### 📊 Data Management
- Real-time content updates without page refresh
- Advanced search and filtering capabilities
- Bulk operations for efficient management
- Data export and backup functionality

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test thoroughly before submitting
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome** for the beautiful icons
- **Google Fonts** for the typography
- **Flask Community** for the excellent framework
- **PostgreSQL Team** for the robust database system

## 📞 Support

For support and questions:
- **Create an Issue** on GitHub
- **Email**: support@amolchandschool.edu
- **Documentation**: Check the docs folder for detailed guides

## 🔄 Version History

- **v2.0.0** - Complete UI refinement, gallery fixes, production readiness
- **v1.5.0** - Added toppers system, faculty management, improved admin panel
- **v1.0.0** - Initial release with basic functionality

---

**Made with ❤️ for Amol Chand Public School**

*Empowering education through technology*
