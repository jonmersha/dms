# Document Management System (DMS)

A comprehensive Django-based Document Management System designed for organizations to manage audit reports and documents with advanced access control and fiscal year tracking.

## 📋 Project Overview

This system provides a secure platform for uploading, organizing, and distributing audit documents with granular access controls. It's particularly suited for financial institutions, accounting firms, and organizations that need to manage documents across different fiscal periods and quarters.

### 🎯 Key Features

- **🔐 Secure Document Management** - Upload, store, and manage PDF documents with access controls
- **📅 Fiscal Year Organization** - Organize documents by fiscal years (e.g., 2024-25, 2025-26)
- **📊 Quarterly Tracking** - Track documents across quarters (Q1: Jul-Sep, Q2: Oct-Dec, Q3: Jan-Mar, Q4: Apr-Jun)
- **👥 Role-Based Access Control** - Restrict document access to specific users or groups
- **📱 Modern Web Interface** - Responsive grid-based document browser
- **🔍 Advanced Filtering** - Filter documents by fiscal year and quarter
- **📥 Secure Downloads** - Controlled document download with permission checks
- **⚡ REST API** - Complete API for integration with other systems

## 🏗️ System Architecture

### Core Components

#### 1. **User Management** (`users` app)
- Custom User model with email-based authentication
- Integration with Djoser for REST API authentication
- JWT token-based authentication

#### 2. **Audit Periods** (`audits` app)
- Manage fiscal years (e.g., 2024-25, 2025-26)
- Track active/inactive periods
- Date validation and fiscal year formatting

#### 3. **Document Management** (`documents` app)
- Document upload with metadata
- Quarter-based organization (Q1-Q4)
- Access control and restrictions
- File storage with organized directory structure

### 🗂️ Database Schema

```
User
├── email (unique)
├── username
└── Standard Django auth fields

AuditPeriod
├── fiscal_year (e.g., "2024-25")
├── start_date
├── end_date
└── is_active

Document
├── title
├── audit_period (FK to AuditPeriod)
├── quarter (Q1, Q2, Q3, Q4)
├── uploaded_by (FK to User)
├── pdf_file
├── restricted (boolean)
└── allowed_users (M2M to User)
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Django 4.2+
- SQLite (default) or PostgreSQL

### Quick Start

1. **Clone and Setup**
```bash
git clone <repository-url>
cd dms
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Initialize Database**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

4. **Generate Sample Data**
```bash
python manage.py generate_audit_periods --start-year 2024 --end-year 2026
```

5. **Run Development Server**
```bash
python manage.py runserver
```

## 🎮 How to Use

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin/`
   - Login with superuser credentials

2. **Manage Audit Periods**
   - Create fiscal years (e.g., 2024-25)
   - Set start/end dates
   - Activate/deactivate periods

3. **Upload Documents**
   - Go to Documents section in admin
   - Fill in: Title, Audit Period, Quarter, Upload PDF
   - Set restrictions if needed
   - Select allowed users for restricted documents

4. **User Management**
   - Create and manage user accounts
   - Set permissions and access levels

### For End Users

1. **Browse Documents**
   - Navigate to `/documents/`
   - View documents in grid layout
   - Use filters by fiscal year and quarter

2. **Download Documents**
   - Click download button on any accessible document
   - Restricted documents require permission

3. **API Access**
   - Use `/auth/` endpoints for authentication
   - Access documents via REST API

## 🔧 API Endpoints

### Authentication
- `POST /auth/jwt/create/` - Get JWT tokens
- `POST /auth/jwt/refresh/` - Refresh token
- `GET /auth/users/me/` - Current user profile

### Documents
- `GET /documents/` - List accessible documents
- `GET /documents/{id}/download/` - Download specific document

## 📁 File Structure

```
dms/
├── dms/                 # Project settings
├── users/               # Custom user management
├── audits/              # Audit period management
├── documents/           # Document management
│   ├── models.py       # Document model with quarters
│   ├── views.py        # Document listing and download
│   ├── admin.py        # Admin interface with download links
│   └── templates/      # Grid-based document browser
├── media/              # Uploaded documents storage
│   └── reports/        # Organized by fiscal_year/quarter/
└── static/             # Static files
```

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **File Protection**: Permission-based document downloads
- **Data Validation**: Comprehensive model validation
- **SQL Injection Protection**: Django ORM security

## 🎨 User Interface

### Document Browser
- **Grid Layout**: Card-based document display
- **Advanced Filtering**: By fiscal year and quarter
- **Visual Indicators**: Color-coded access levels
- **Responsive Design**: Works on desktop and mobile

### Admin Interface
- **Jazzmin Theme**: Modern admin interface
- **Quick Actions**: Direct document management
- **Bulk Operations**: Mass document handling
- **Download Links**: Direct file access from admin

## ⚙️ Configuration

### Key Settings

```python
# Custom User Model
AUTH_USER_MODEL = 'users.User'

# File Upload Settings
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# API Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}
```

### Fiscal Year Configuration
- **Format**: YYYY-YY (e.g., 2024-25)
- **Start Month**: July (configurable)
- **Quarters**: 
  - Q1: July 1 - September 30
  - Q2: October 1 - December 31
  - Q3: January 1 - March 31
  - Q4: April 1 - June 30

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG = False`
- [ ] Configure production database (PostgreSQL)
- [ ] Set up static files serving
- [ ] Configure media files storage (AWS S3 recommended)
- [ ] Set up proper SSL certificates
- [ ] Configure email backend
- [ ] Set up monitoring and logging

### Docker Deployment
```dockerfile
# Sample Dockerfile available in repository
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check documentation in `/docs/`
- Create issue in GitHub repository
- Contact system administrator

## 🔄 Version History

- **v1.0.0** - Initial release with core document management
- **v1.1.0** - Added REST API and improved UI
- **v1.2.0** - Enhanced security and access controls

---

**Built with Django 🐍 & Bootstrap 💙**
