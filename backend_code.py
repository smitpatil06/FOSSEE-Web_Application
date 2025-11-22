# ============================================
# backend/equipment/models.py
# ============================================
from django.db import models
from django.contrib.auth.models import User
import json

class EquipmentDataset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)
    total_count = models.IntegerField()
    avg_flowrate = models.FloatField()
    avg_pressure = models.FloatField()
    avg_temperature = models.FloatField()
    type_distribution = models.JSONField()
    raw_data = models.TextField()
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.filename} - {self.uploaded_at}"


# ============================================
# backend/equipment/serializers.py
# ============================================
from rest_framework import serializers
from .models import EquipmentDataset

class EquipmentDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentDataset
        fields = '__all__'
        read_only_fields = ['user', 'uploaded_at']


# ============================================
# backend/equipment/views.py
# ============================================
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
import pandas as pd
import json
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from .models import EquipmentDataset
from .serializers import EquipmentDatasetSerializer

class EquipmentDatasetViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentDatasetSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return EquipmentDataset.objects.filter(user=self.request.user)[:5]
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        csv_file = request.FILES['file']
        
        try:
            df = pd.read_csv(csv_file)
            
            required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_cols):
                return Response({'error': 'CSV missing required columns'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate statistics
            total_count = len(df)
            avg_flowrate = df['Flowrate'].mean()
            avg_pressure = df['Pressure'].mean()
            avg_temperature = df['Temperature'].mean()
            type_distribution = df['Type'].value_counts().to_dict()
            
            # Create dataset
            dataset = EquipmentDataset.objects.create(
                user=request.user,
                filename=csv_file.name,
                total_count=total_count,
                avg_flowrate=avg_flowrate,
                avg_pressure=avg_pressure,
                avg_temperature=avg_temperature,
                type_distribution=type_distribution,
                raw_data=df.to_json(orient='records')
            )
            
            # Keep only last 5
            old_datasets = EquipmentDataset.objects.filter(user=request.user)[5:]
            for ds in old_datasets:
                ds.delete()
            
            return Response({
                'id': dataset.id,
                'data': json.loads(dataset.raw_data),
                'summary': {
                    'total_count': total_count,
                    'avg_flowrate': round(avg_flowrate, 2),
                    'avg_pressure': round(avg_pressure, 2),
                    'avg_temperature': round(avg_temperature, 2),
                    'type_distribution': type_distribution
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        dataset = self.get_object()
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph(f"Equipment Report - {dataset.filename}", styles['Heading1'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Summary
        summary_text = f"""
        <b>Summary Statistics</b><br/>
        Total Equipment: {dataset.total_count}<br/>
        Average Flowrate: {dataset.avg_flowrate:.2f}<br/>
        Average Pressure: {dataset.avg_pressure:.2f}<br/>
        Average Temperature: {dataset.avg_temperature:.2f}<br/>
        """
        elements.append(Paragraph(summary_text, styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Type Distribution
        dist_data = [['Equipment Type', 'Count']]
        for eq_type, count in dataset.type_distribution.items():
            dist_data.append([eq_type, str(count)])
        
        table = Table(dist_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="equipment_report_{dataset.id}.pdf"'
        return response


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': username})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ============================================
# backend/equipment/urls.py
# ============================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentDatasetViewSet, login_view

router = DefaultRouter()
router.register(r'datasets', EquipmentDatasetViewSet, basename='dataset')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
]


# ============================================
# backend/equipment_api/settings.py (Add to existing)
# ============================================
"""
Add these to your settings.py:

INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'equipment',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

CORS_ALLOW_ALL_ORIGINS = True  # For development only

"""


# ============================================
# backend/equipment_api/urls.py
# ============================================
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('equipment.urls')),
]


# ============================================
# backend/requirements.txt
# ============================================
"""
Django==4.2.7
djangorestframework==3.14.0
pandas==2.1.3
reportlab==4.0.7
django-cors-headers==4.3.1
"""