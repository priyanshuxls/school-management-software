"""
School Management System Backend - PRODUCTION VERSION
Python Flask + PostgreSQL

This is the production-ready version with:
- Input validation
- Error handling
- Rate limiting
- Logging
- Security enhancements
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import jwt
import re
from functools import wraps
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

load_dotenv()

app = Flask(__name__)

# ============================================
# CONFIGURATION
# ============================================

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-this-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:password@localhost:5432/school_management'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
    'max_overflow': 20
}
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))

# Validate SECRET_KEY in production
if os.getenv('FLASK_ENV') == 'production':
    if app.config['SECRET_KEY'] == 'change-this-in-production':
        raise ValueError('❌ SECRET_KEY must be changed in production!')
else:
    if app.config['SECRET_KEY'] == 'change-this-in-production':
        print('⚠️  WARNING: Using default SECRET_KEY. Change this in production!')

# CORS Configuration
if os.getenv('FLASK_ENV') == 'production':
    allowed_origins = os.getenv('CORS_ORIGINS', '').split(',')
    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
else:
    CORS(app)  # Allow all in development

# Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Create upload folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'gallery'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'files'), exist_ok=True)

db = SQLAlchemy(app)

# ============================================
# LOGGING SETUP
# ============================================

if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler(
        'logs/school_api.log',
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    
    app.logger.setLevel(logging.INFO)
    app.logger.info('School API startup')

# ============================================
# UTILITY FUNCTIONS
# ============================================

def api_response(data=None, message=None, status=200):
    """Standardized API response"""
    response = {
        'success': status < 400,
        'data': data,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    return jsonify(response), status

def sanitize_input(text):
    """Remove potentially dangerous characters"""
    if not text:
        return text
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', str(text))
    return text.strip()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_file_size(file, max_size_mb=10):
    """Validate file size"""
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    
    max_size = max_size_mb * 1024 * 1024
    if size > max_size:
        return False, f'File too large. Maximum size is {max_size_mb}MB'
    return True, None

def allowed_file(filename, extensions):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensions

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return api_response(message='Resource not found', status=404)

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    app.logger.error(f'Internal error: {str(error)}')
    return api_response(message='Internal server error', status=500)

@app.errorhandler(400)
def bad_request(error):
    return api_response(message='Bad request', status=400)

@app.errorhandler(413)
def request_entity_too_large(error):
    return api_response(message='File too large', status=413)

# ============================================
# AUTHENTICATION DECORATOR
# ============================================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return api_response(message='Token is missing', status=401)
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_admin = Admin.query.get(data['admin_id'])
            if not current_admin:
                return api_response(message='Invalid token', status=401)
        except jwt.ExpiredSignatureError:
            return api_response(message='Token has expired', status=401)
        except jwt.InvalidTokenError:
            return api_response(message='Invalid token', status=401)
        except Exception as e:
            app.logger.error(f'Token validation error: {str(e)}')
            return api_response(message='Token validation failed', status=401)
        
        return f(current_admin, *args, **kwargs)
    
    return decorated

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    try:
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except Exception as e:
        app.logger.error(f'Database health check failed: {str(e)}')
        db_status = 'unhealthy'
    
    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'degraded',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/version', methods=['GET'])
def api_version():
    """API version information"""
    return jsonify({
        'version': '1.0.0',
        'api_version': 'v1',
        'status': 'operational'
    })

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Admin login with rate limiting"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return api_response(message='Missing credentials', status=400)
        
        username = sanitize_input(data.get('username'))
        password = data.get('password')
        
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password):
            token = jwt.encode({
                'admin_id': admin.id,
                'username': admin.username,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            app.logger.info(f'Successful login: {username}')
            
            return api_response(
                data={
                    'token': token,
                    'admin': {
                        'id': admin.id,
                        'username': admin.username,
                        'name': admin.name
                    }
                },
                message='Login successful'
            )
        
        app.logger.warning(f'Failed login attempt: {username}')
        return api_response(message='Invalid credentials', status=401)
        
    except Exception as e:
        app.logger.error(f'Login error: {str(e)}')
        return api_response(message='Login failed', status=500)

# ============================================
# NOTICES ROUTES (Example with validation)
# ============================================

@app.route('/api/notices', methods=['GET'])
def get_notices():
    """Get all notices with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        pagination = Notice.query.order_by(
            Notice.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return api_response(
            data={
                'notices': [notice.to_dict() for notice in pagination.items],
                'total': pagination.total,
                'pages': pagination.pages,
                'current_page': page,
                'per_page': per_page
            },
            message='Notices retrieved successfully'
        )
    except Exception as e:
        app.logger.error(f'Error fetching notices: {str(e)}')
        return api_response(message='Failed to fetch notices', status=500)

@app.route('/api/notices', methods=['POST'])
@token_required
def create_notice(current_admin):
    """Create notice with validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'category', 'date', 'description']
        for field in required_fields:
            if not data.get(field):
                return api_response(message=f'Missing required field: {field}', status=400)
        
        # Sanitize inputs
        title = sanitize_input(data['title'])
        description = sanitize_input(data['description'])
        category = sanitize_input(data['category'])
        
        # Validate priority
        priority = data.get('priority', 'normal')
        if priority not in ['normal', 'high', 'urgent']:
            return api_response(message='Invalid priority value', status=400)
        
        notice = Notice(
            title=title,
            category=category,
            date=datetime.fromisoformat(data['date']),
            description=description,
            priority=priority,
            is_new=data.get('isNew', False)
        )
        
        db.session.add(notice)
        db.session.commit()
        
        app.logger.info(f'Notice created by {current_admin.username}: {title}')
        
        return api_response(
            data=notice.to_dict(),
            message='Notice created successfully',
            status=201
        )
        
    except ValueError as e:
        return api_response(message=f'Invalid date format: {str(e)}', status=400)
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Error creating notice: {str(e)}')
        return api_response(message='Failed to create notice', status=500)

# ============================================
# NOTE: Add similar validation to all other routes
# This is a template showing the pattern
# ============================================

# Import all models and routes from original app.py
# (Include all the model definitions and other routes here)

# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    # Production should use Gunicorn, not Flask dev server
    if os.getenv('FLASK_ENV') == 'production':
        print('⚠️  WARNING: Do not use Flask dev server in production!')
        print('Use: gunicorn -w 4 -b 0.0.0.0:5000 app_production:app')
    
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
        host='0.0.0.0',
        port=5000
    )
