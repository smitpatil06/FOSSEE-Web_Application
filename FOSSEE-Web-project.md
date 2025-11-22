# Chemical Equipment Parameter Visualizer

A hybrid Web + Desktop application for visualizing and analyzing chemical equipment data with Django backend, React web frontend, and PyQt5 desktop frontend.

## 📋 Features

- ✅ CSV file upload (Web & Desktop)
- ✅ Data analysis with Pandas
- ✅ Summary statistics (count, averages, distributions)
- ✅ Interactive visualizations (Chart.js for Web, Matplotlib for Desktop)
- ✅ Last 5 uploads history management
- ✅ PDF report generation
- ✅ Token-based authentication
- ✅ SQLite database storage
- ✅ Responsive UI design

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend (Web) | React.js + Chart.js | Interactive web interface |
| Frontend (Desktop) | PyQt5 + Matplotlib | Native desktop application |
| Backend | Django + DRF | RESTful API server |
| Data Processing | Pandas | CSV parsing & analytics |
| Database | SQLite | Data persistence |
| Version Control | Git & GitHub | Source code management |

## 📁 Project Structure

```
chemical-equipment-visualizer/
├── backend/
│   ├── equipment_api/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── equipment/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend-web/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── public/
├── frontend-desktop/
│   ├── main.py
│   └── requirements.txt
├── sample_equipment_data.csv
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- Git

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install pandas==2.1.3
pip install reportlab==4.0.7
pip install django-cors-headers==4.3.1

# Create Django project and app
django-admin startproject equipment_api .
python manage.py startapp equipment

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Username: admin
# Password: admin123 (or your choice)

# Run server
python manage.py runserver
```

**Backend will run on:** `http://localhost:8000`

### 2️⃣ Web Frontend Setup

```bash
# Navigate to web frontend directory
cd frontend-web

# Install dependencies
npm install

# Start development server
npm start
```

**Web app will run on:** `http://localhost:3000`

### 3️⃣ Desktop Frontend Setup

```bash
# Navigate to desktop frontend directory
cd frontend-desktop

# Install dependencies
pip install PyQt5==5.15.10
pip install matplotlib==3.8.2
pip install pandas==2.1.3
pip install requests==2.31.0

# Run application
python main.py
```

## 📊 Sample CSV Data

Create a file named `sample_equipment_data.csv`:

```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Reactor-A1,Reactor,150.5,45.2,85.3
Pump-B2,Pump,200.3,60.5,45.8
Heat Exchanger-C3,Heat Exchanger,180.7,55.0,95.2
Distillation Column-D4,Column,120.4,40.8,110.5
Compressor-E5,Compressor,250.9,80.3,55.7
Reactor-A2,Reactor,155.2,46.5,87.1
Pump-B3,Pump,195.6,58.9,44.2
Heat Exchanger-C4,Heat Exchanger,175.3,53.7,92.8
Separator-F1,Separator,140.8,48.2,65.4
Mixer-G1,Mixer,130.5,35.6,50.3
Reactor-A3,Reactor,148.9,44.8,86.5
Pump-B4,Pump,205.1,62.3,46.5
Distillation Column-D5,Column,125.7,42.1,108.9
Compressor-E6,Compressor,245.3,78.9,54.3
Heat Exchanger-C5,Heat Exchanger,182.4,56.2,94.6
```

## 🔐 Authentication

Both Web and Desktop applications use token-based authentication:

1. Login with your Django superuser credentials
2. Token is automatically managed
3. All API requests include authentication token

**Default credentials:**
- Username: `admin`
- Password: `admin123` (what you set during setup)

## 📱 Usage Guide

### Web Application

1. **Login**: Enter your credentials on the login page
2. **Upload CSV**: Click "Browse" and select your CSV file
3. **Analyze**: Click "Upload & Analyze" to process the data
4. **View Results**: 
   - Summary statistics displayed in cards
   - Bar chart showing average parameters
   - Pie chart showing equipment type distribution
   - Full data table
5. **History**: View and reload previous uploads from history section
6. **PDF Report**: Click "Download PDF Report" to generate a report

### Desktop Application

1. **Login**: Enter credentials in the login window
2. **Browse File**: Click "Browse" to select CSV file
3. **Upload**: Click "Upload & Analyze"
4. **View Data**: Switch between tabs:
   - Upload & Analyze: Charts and summary
   - Data Table: Full tabular view
   - History: Recent uploads (double-click to load)
5. **Download PDF**: Click "Download PDF Report" button

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login/` | User authentication |
| GET | `/api/datasets/` | List recent datasets |
| POST | `/api/datasets/upload/` | Upload new CSV |
| GET | `/api/datasets/{id}/` | Get specific dataset |
| GET | `/api/datasets/{id}/download_pdf/` | Download PDF report |

## 🧪 Testing

1. Use the provided `sample_equipment_data.csv`
2. Create superuser: `python manage.py createsuperuser`
3. Start backend: `python manage.py runserver`
4. Test Web: Open `http://localhost:3000`
5. Test Desktop: Run `python main.py`
6. Upload CSV and verify all features work

## 📦 Dependencies

### Backend
```txt
Django==4.2.7
djangorestframework==3.14.0
pandas==2.1.3
reportlab==4.0.7
django-cors-headers==4.3.1
```

### Web Frontend
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.2",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```

### Desktop Frontend
```txt
PyQt5==5.15.10
matplotlib==3.8.2
pandas==2.1.3
requests==2.31.0
```

## 🚨 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure `django-cors-headers` is installed and configured in `settings.py`:

```python
INSTALLED_APPS = [
    'corsheaders',
    # ... other apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only
```

### Port Conflicts
- Backend default: 8000 (change with `python manage.py runserver 8001`)
- Web frontend default: 3000 (change in package.json)

### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## 🎥 Demo Video Guidelines

Create a 2-3 minute video showing:

1. Project overview (10 seconds)
2. Backend running (10 seconds)
3. Web login and upload (40 seconds)
4. Web visualizations and features (40 seconds)
5. Desktop app login and upload (30 seconds)
6. Desktop visualizations (30 seconds)
7. History and PDF features (20 seconds)

## 📤 Submission Checklist

- [ ] GitHub repository with all source code
- [ ] README.md with setup instructions
- [ ] All three components working (Backend, Web, Desktop)
- [ ] Sample CSV file included
- [ ] Demo video (2-3 minutes)
- [ ] Requirements.txt files for all components
- [ ] Screenshots in repository (optional)
- [ ] Deployment link for web version (optional)

## 🌐 Optional Deployment

### Backend (Heroku/Railway)
```bash
# Add Procfile
echo "web: gunicorn equipment_api.wsgi" > Procfile

# Add runtime.txt
echo "python-3.11.0" > runtime.txt

# Deploy to platform
```

### Frontend (Vercel/Netlify)
```bash
cd frontend-web
npm run build
# Deploy build folder
```

## 👨‍💻 Development Notes

- Backend serves as single source of truth
- Both frontends consume same REST API
- SQLite database stores last 5 uploads per user
- Token authentication for security
- Pandas for efficient data processing
- Chart.js (Web) and Matplotlib (Desktop) for visualizations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is created for educational purposes as part of an internship screening task.

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Created for:** Intern Screening Task - Hybrid Web + Desktop Application  
**Date:** 2024  
**Technologies:** Django, React, PyQt5, Pandas, Chart.js, Matplotlib

---

## Quick Start Commands

```bash
# Backend
cd backend && python manage.py runserver

# Web Frontend
cd frontend-web && npm start

# Desktop App
cd frontend-desktop && python main.py
```

Good luck with your submission! 🚀