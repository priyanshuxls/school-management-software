"""
School Management System Backend
Python Flask + PostgreSQL
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import jwt
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration — reads from .env file
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-this-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:password@localhost:5432/school_management'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))

# Create upload folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'gallery'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'files'), exist_ok=True)

db = SQLAlchemy(app)

# ============================================
# DATABASE MODELS
# ============================================

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Notice(db.Model):
    __tablename__ = 'notices'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='normal')
    is_new = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'date': self.date.isoformat(),
            'description': self.description,
            'priority': self.priority,
            'isNew': self.is_new,
            'createdAt': self.created_at.isoformat()
        }


class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    badge_color = db.Column(db.String(20), default='blue')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date.isoformat(),
            'time': self.time,
            'location': self.location,
            'description': self.description,
            'category': self.category,
            'badgeColor': self.badge_color,
            'createdAt': self.created_at.isoformat()
        }


class GalleryImage(db.Model):
    __tablename__ = 'gallery_images'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(255), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    photographer = db.Column(db.String(120))
    description = db.Column(db.Text)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'eventName': self.event_name,
            'eventDate': self.event_date.isoformat(),
            'photographer': self.photographer,
            'description': self.description,
            'fileName': self.file_name,
            'fileUrl': f'/api/uploads/gallery/{self.file_name}',
            'uploadDate': self.upload_date.isoformat()
        }


class DownloadFile(db.Model):
    __tablename__ = 'download_files'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_type = db.Column(db.String(100))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'description': self.description,
            'fileName': self.file_name,
            'fileUrl': f'/api/uploads/files/{self.file_name}',
            'fileSize': self.file_size,
            'fileType': self.file_type,
            'uploadDate': self.upload_date.isoformat()
        }


class FeeStructure(db.Model):
    __tablename__ = 'fee_structure'
    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(100), nullable=False)
    session = db.Column(db.String(20), nullable=False)
    admission_fee = db.Column(db.Integer, nullable=False)
    tuition_fee = db.Column(db.Integer, nullable=False)
    annual_charges = db.Column(db.Integer, nullable=False)
    transport_fee = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'class': self.class_name,
            'session': self.session,
            'admissionFee': self.admission_fee,
            'tuitionFee': self.tuition_fee,
            'annualCharges': self.annual_charges,
            'transportFee': self.transport_fee,
            'createdAt': self.created_at.isoformat()
        }


class StudentResult(db.Model):
    __tablename__ = 'student_results'
    id = db.Column(db.Integer, primary_key=True)
    session = db.Column(db.String(20), nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    exam_type = db.Column(db.String(50), nullable=False)
    roll_number = db.Column(db.String(50), nullable=False)
    student_name = db.Column(db.String(120), nullable=False)
    dob = db.Column(db.String(20))
    subjects = db.Column(db.JSON, nullable=False)
    total_marks = db.Column(db.Integer, nullable=False)
    max_marks = db.Column(db.Integer, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'session': self.session,
            'className': self.class_name,
            'examType': self.exam_type,
            'rollNumber': self.roll_number,
            'studentName': self.student_name,
            'dob': self.dob,
            'subjects': self.subjects,
            'totalMarks': self.total_marks,
            'maxMarks': self.max_marks,
            'percentage': self.percentage,
            'status': self.status,
            'uploadDate': self.upload_date.isoformat()
        }


class AboutSection(db.Model):
    __tablename__ = 'about_section'
    id = db.Column(db.Integer, primary_key=True)
    school_name = db.Column(db.String(255), nullable=False)
    established_year = db.Column(db.Integer, nullable=False)
    affiliation = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    mission = db.Column(db.Text, nullable=False)
    vision = db.Column(db.Text, nullable=False)
    principal_name = db.Column(db.String(120), nullable=False)
    principal_designation = db.Column(db.String(100), nullable=False)
    principal_message = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'schoolInfo': {
                'name': self.school_name,
                'establishedYear': self.established_year,
                'affiliation': self.affiliation,
                'description': self.description
            },
            'missionVision': {
                'mission': self.mission,
                'vision': self.vision
            },
            'principal': {
                'name': self.principal_name,
                'designation': self.principal_designation,
                'message': self.principal_message
            }
        }


class Topper(db.Model):
    __tablename__ = 'toppers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    class_name = db.Column('class', db.String(50), nullable=False)
    section = db.Column(db.String(10))
    category = db.Column(db.String(50), nullable=False)
    percentage = db.Column(db.Numeric(5, 2), nullable=False)
    year = db.Column(db.Integer)
    position = db.Column(db.String(100), nullable=False)
    rank = db.Column(db.String(100))
    roll_number = db.Column(db.String(50))
    subjects = db.Column(db.JSON)
    remarks = db.Column(db.Text)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'class': self.class_name,
            'section': self.section,
            'category': self.category,
            'percentage': float(self.percentage),
            'year': self.year,
            'position': self.position,
            'rank': self.rank,
            'rollNumber': self.roll_number,
            'subjects': self.subjects,
            'remarks': self.remarks,
            'displayOrder': self.display_order,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }


class Faculty(db.Model):
    __tablename__ = 'faculty'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'designation': self.designation,
            'subject': self.subject,
            'icon': self.icon,
            'displayOrder': self.display_order,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }


# ============================================
# AUTHENTICATION DECORATOR
# ============================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_admin = Admin.query.get(data['admin_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_admin, *args, **kwargs)
    
    return decorated


# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and admin.check_password(password):
        token = jwt.encode({
            'admin_id': admin.id,
            'username': admin.username
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'admin': {
                'id': admin.id,
                'username': admin.username,
                'name': admin.name
            }
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401


# ============================================
# NOTICES ROUTES
# ============================================

@app.route('/api/notices', methods=['GET'])
def get_notices():
    notices = Notice.query.order_by(Notice.created_at.desc()).all()
    return jsonify([notice.to_dict() for notice in notices]), 200


@app.route('/api/notices', methods=['POST'])
@token_required
def create_notice(current_admin):
    data = request.get_json()
    
    notice = Notice(
        title=data['title'],
        category=data['category'],
        date=datetime.fromisoformat(data['date']),
        description=data['description'],
        priority=data.get('priority', 'normal'),
        is_new=data.get('isNew', False)
    )
    
    db.session.add(notice)
    db.session.commit()
    
    return jsonify(notice.to_dict()), 201


@app.route('/api/notices/<int:id>', methods=['DELETE'])
@token_required
def delete_notice(current_admin, id):
    notice = Notice.query.get_or_404(id)
    db.session.delete(notice)
    db.session.commit()
    
    return jsonify({'message': 'Notice deleted'}), 200


# ============================================
# EVENTS ROUTES
# ============================================

@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.order_by(Event.date).all()
    return jsonify([event.to_dict() for event in events]), 200


@app.route('/api/events', methods=['POST'])
@token_required
def create_event(current_admin):
    data = request.get_json()
    
    event = Event(
        name=data['name'],
        date=datetime.fromisoformat(data['date']),
        time=data['time'],
        location=data['location'],
        description=data['description'],
        category=data['category'],
        badge_color=data.get('badgeColor', 'blue')
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify(event.to_dict()), 201


@app.route('/api/events/<int:id>', methods=['DELETE'])
@token_required
def delete_event(current_admin, id):
    event = Event.query.get_or_404(id)
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted'}), 200


# ============================================
# GALLERY ROUTES
# ============================================

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    images = GalleryImage.query.order_by(GalleryImage.upload_date.desc()).all()
    return jsonify([image.to_dict() for image in images]), 200


@app.route('/api/gallery', methods=['POST'])
@token_required
def upload_gallery_image(current_admin):
    if 'images' not in request.files:
        return jsonify({'message': 'No images provided'}), 400
    
    files = request.files.getlist('images')
    data = request.form
    
    uploaded_images = []
    
    for file in files:
        if file and allowed_file(file.filename, ['jpg', 'jpeg', 'png']):
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'gallery', filename)
            file.save(filepath)
            
            image = GalleryImage(
                category=data['category'],
                event_name=data['eventName'],
                event_date=datetime.fromisoformat(data['eventDate']),
                photographer=data.get('photographer'),
                description=data.get('description'),
                file_name=filename,
                file_path=filepath
            )
            
            db.session.add(image)
            uploaded_images.append(image)
    
    db.session.commit()
    
    return jsonify([img.to_dict() for img in uploaded_images]), 201


@app.route('/api/gallery/<int:id>', methods=['DELETE'])
@token_required
def delete_gallery_image(current_admin, id):
    image = GalleryImage.query.get_or_404(id)
    
    # Delete file from filesystem
    if os.path.exists(image.file_path):
        os.remove(image.file_path)
    
    db.session.delete(image)
    db.session.commit()
    
    return jsonify({'message': 'Image deleted'}), 200


# ============================================
# DOWNLOADS ROUTES
# ============================================

@app.route('/api/downloads', methods=['GET'])
def get_downloads():
    files = DownloadFile.query.order_by(DownloadFile.upload_date.desc()).all()
    return jsonify([file.to_dict() for file in files]), 200


@app.route('/api/downloads', methods=['POST'])
@token_required
def upload_download_file(current_admin):
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['file']
    data = request.form
    
    if file and allowed_file(file.filename, ['pdf', 'doc', 'docx', 'xls', 'xlsx']):
        filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'files', filename)
        file.save(filepath)
        
        download_file = DownloadFile(
            title=data['title'],
            category=data['category'],
            description=data.get('description'),
            file_name=filename,
            file_path=filepath,
            file_size=os.path.getsize(filepath),
            file_type=file.content_type
        )
        
        db.session.add(download_file)
        db.session.commit()
        
        return jsonify(download_file.to_dict()), 201
    
    return jsonify({'message': 'Invalid file type'}), 400


@app.route('/api/downloads/<int:id>', methods=['DELETE'])
@token_required
def delete_download_file(current_admin, id):
    file = DownloadFile.query.get_or_404(id)
    
    # Delete file from filesystem
    if os.path.exists(file.file_path):
        os.remove(file.file_path)
    
    db.session.delete(file)
    db.session.commit()
    
    return jsonify({'message': 'File deleted'}), 200


# ============================================
# FEE STRUCTURE ROUTES
# ============================================

@app.route('/api/fee-structure', methods=['GET'])
def get_fee_structure():
    fees = FeeStructure.query.all()
    return jsonify([fee.to_dict() for fee in fees]), 200


@app.route('/api/fee-structure', methods=['POST'])
@token_required
def create_fee_structure(current_admin):
    data = request.get_json()
    
    fee = FeeStructure(
        class_name=data['class'],
        session=data['session'],
        admission_fee=data['admissionFee'],
        tuition_fee=data['tuitionFee'],
        annual_charges=data['annualCharges'],
        transport_fee=data['transportFee']
    )
    
    db.session.add(fee)
    db.session.commit()
    
    return jsonify(fee.to_dict()), 201


@app.route('/api/fee-structure/<int:id>', methods=['DELETE'])
@token_required
def delete_fee_structure(current_admin, id):
    fee = FeeStructure.query.get_or_404(id)
    db.session.delete(fee)
    db.session.commit()
    
    return jsonify({'message': 'Fee structure deleted'}), 200


# ============================================
# STUDENT RESULTS ROUTES
# ============================================

@app.route('/api/results/search', methods=['POST'])
def search_result():
    data = request.get_json()
    roll_number = data.get('rollNumber')
    dob = data.get('dob')
    
    result = StudentResult.query.filter_by(
        roll_number=roll_number,
        dob=dob
    ).first()
    
    if result:
        return jsonify(result.to_dict()), 200
    
    return jsonify({'message': 'Result not found'}), 404


@app.route('/api/results/upload', methods=['POST'])
@token_required
def upload_results(current_admin):
    data = request.get_json()
    
    results = []
    for student in data['students']:
        result = StudentResult(
            session=data['session'],
            class_name=data['class'],
            exam_type=data['examType'],
            roll_number=student['rollNumber'],
            student_name=student['studentName'],
            dob=student.get('dob'),
            subjects=student['subjects'],
            total_marks=student['totalMarks'],
            max_marks=student['maxMarks'],
            percentage=student['percentage'],
            status=student['status']
        )
        db.session.add(result)
        results.append(result)
    
    db.session.commit()
    
    return jsonify({
        'message': f'{len(results)} results uploaded successfully',
        'count': len(results)
    }), 201


# ============================================
# ABOUT SECTION ROUTES
# ============================================

@app.route('/api/about', methods=['GET'])
def get_about():
    about = AboutSection.query.first()
    if about:
        return jsonify(about.to_dict()), 200
    return jsonify({'message': 'About section not found'}), 404


@app.route('/api/about', methods=['PUT'])
@token_required
def update_about(current_admin):
    data = request.get_json()
    about = AboutSection.query.first()
    
    if not about:
        about = AboutSection()
        db.session.add(about)
    
    about.school_name = data['schoolInfo']['name']
    about.established_year = data['schoolInfo']['establishedYear']
    about.affiliation = data['schoolInfo']['affiliation']
    about.description = data['schoolInfo']['description']
    about.mission = data['missionVision']['mission']
    about.vision = data['missionVision']['vision']
    about.principal_name = data['principal']['name']
    about.principal_designation = data['principal']['designation']
    about.principal_message = data['principal']['message']
    
    db.session.commit()
    
    return jsonify(about.to_dict()), 200


# ============================================
# TOPPERS ROUTES
# ============================================

@app.route('/api/toppers', methods=['GET'])
def get_toppers():
    toppers = Topper.query.filter_by(is_active=True).order_by(Topper.display_order, Topper.created_at.desc()).all()
    return jsonify([topper.to_dict() for topper in toppers]), 200


@app.route('/api/toppers', methods=['POST'])
@token_required
def create_topper(current_admin):
    data = request.get_json()
    
    topper = Topper(
        name=data['name'],
        class_name=data['class'],
        section=data.get('section'),
        category=data['category'],
        percentage=data['percentage'],
        year=data.get('year'),
        position=data.get('position', data.get('rank')),
        rank=data.get('rank'),
        roll_number=data.get('rollNumber'),
        subjects=data.get('subjects'),
        remarks=data.get('remarks'),
        display_order=data.get('displayOrder', 0)
    )
    
    db.session.add(topper)
    db.session.commit()
    
    return jsonify(topper.to_dict()), 201


@app.route('/api/toppers/<int:id>', methods=['DELETE'])
@token_required
def delete_topper(current_admin, id):
    topper = Topper.query.get_or_404(id)
    db.session.delete(topper)
    db.session.commit()
    
    return jsonify({'message': 'Topper deleted'}), 200


# ============================================
# FACULTY ROUTES
# ============================================

@app.route('/api/faculty', methods=['GET'])
def get_faculty():
    faculty = Faculty.query.filter_by(is_active=True).order_by(Faculty.display_order, Faculty.created_at.desc()).all()
    return jsonify([member.to_dict() for member in faculty]), 200


@app.route('/api/faculty', methods=['POST'])
@token_required
def create_faculty(current_admin):
    data = request.get_json()
    
    faculty = Faculty(
        name=data['name'],
        designation=data['designation'],
        subject=data['subject'],
        icon=data['icon'],
        display_order=data.get('displayOrder', 0)
    )
    
    db.session.add(faculty)
    db.session.commit()
    
    return jsonify(faculty.to_dict()), 201


@app.route('/api/faculty/<int:id>', methods=['DELETE'])
@token_required
def delete_faculty(current_admin, id):
    faculty = Faculty.query.get_or_404(id)
    db.session.delete(faculty)
    db.session.commit()
    
    return jsonify({'message': 'Faculty member deleted'}), 200


# ============================================
# FILE SERVING ROUTES
# ============================================

@app.route('/api/uploads/gallery/<filename>')
def serve_gallery_image(filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], 'gallery'), filename)


@app.route('/api/uploads/files/<filename>')
def serve_download_file(filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], 'files'), filename)


# ============================================
# UTILITY FUNCTIONS
# ============================================

def allowed_file(filename, extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensions


# ============================================
# DATABASE INITIALIZATION
# ============================================

@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    print('Database initialized!')


@app.cli.command()
def create_admin():
    """Create default admin user."""
    admin = Admin(
        username='admin',
        name='Administrator'
    )
    admin.set_password('admin123')
    
    db.session.add(admin)
    db.session.commit()
    
    print('Admin user created!')
    print('Username: admin')
    print('Password: admin123')


# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
