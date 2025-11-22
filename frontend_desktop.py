# ============================================
# frontend-desktop/main.py
# ============================================
import sys
import requests
import json
import pandas as pd
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QLineEdit, 
                             QTableWidget, QTableWidgetItem, QFileDialog,
                             QMessageBox, QListWidget, QTabWidget, QGroupBox,
                             QGridLayout)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


API_URL = 'http://localhost:8000/api'


class LoginWindow(QWidget):
    def __init__(self, parent=None):
        super().__init__()
        self.parent = parent
        self.init_ui()
    
    def init_ui(self):
        self.setWindowTitle('Login - Chemical Equipment Visualizer')
        self.setGeometry(100, 100, 400, 250)
        
        layout = QVBoxLayout()
        layout.setSpacing(15)
        
        title = QLabel('Chemical Equipment Visualizer')
        title.setFont(QFont('Arial', 18, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText('Username')
        self.username_input.setMinimumHeight(40)
        layout.addWidget(self.username_input)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText('Password')
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setMinimumHeight(40)
        layout.addWidget(self.password_input)
        
        login_btn = QPushButton('Login')
        login_btn.setMinimumHeight(40)
        login_btn.clicked.connect(self.login)
        layout.addWidget(login_btn)
        
        self.error_label = QLabel('')
        self.error_label.setStyleSheet('color: red;')
        self.error_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.error_label)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def login(self):
        username = self.username_input.text()
        password = self.password_input.text()
        
        try:
            response = requests.post(f'{API_URL}/login/', 
                                    json={'username': username, 'password': password})
            if response.status_code == 200:
                token = response.json()['token']
                self.parent.set_token(token, username)
                self.close()
            else:
                self.error_label.setText('Invalid credentials')
        except Exception as e:
            self.error_label.setText(f'Error: {str(e)}')


class ChartWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.figure = Figure(figsize=(8, 6))
        self.canvas = FigureCanvas(self.figure)
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        self.setLayout(layout)
    
    def plot_bar_chart(self, data):
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        labels = ['Flowrate', 'Pressure', 'Temperature']
        values = [data['avg_flowrate'], data['avg_pressure'], data['avg_temperature']]
        colors = ['#3b82f6', '#10b981', '#f59e0b']
        ax.bar(labels, values, color=colors)
        ax.set_title('Average Parameters', fontsize=14, fontweight='bold')
        ax.set_ylabel('Value')
        self.canvas.draw()
    
    def plot_pie_chart(self, distribution):
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        labels = list(distribution.keys())
        sizes = list(distribution.values())
        colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors[:len(labels)])
        ax.set_title('Equipment Type Distribution', fontsize=14, fontweight='bold')
        self.canvas.draw()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.token = None
        self.username = None
        self.current_data = None
        self.current_summary = None
        self.current_dataset_id = None
        self.init_ui()
        self.show_login()
    
    def init_ui(self):
        self.setWindowTitle('Chemical Equipment Parameter Visualizer')
        self.setGeometry(100, 100, 1400, 800)
        
        # Main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QVBoxLayout(main_widget)
        
        # Header
        header = QWidget()
        header_layout = QHBoxLayout(header)
        
        title = QLabel('Chemical Equipment Visualizer')
        title.setFont(QFont('Arial', 16, QFont.Bold))
        header_layout.addWidget(title)
        
        header_layout.addStretch()
        
        self.user_label = QLabel('')
        header_layout.addWidget(self.user_label)
        
        logout_btn = QPushButton('Logout')
        logout_btn.clicked.connect(self.logout)
        header_layout.addWidget(logout_btn)
        
        main_layout.addWidget(header)
        
        # Tab widget
        self.tabs = QTabWidget()
        
        # Upload Tab
        upload_tab = QWidget()
        upload_layout = QVBoxLayout(upload_tab)
        
        upload_group = QGroupBox('Upload CSV File')
        upload_group_layout = QHBoxLayout()
        
        self.file_label = QLabel('No file selected')
        upload_group_layout.addWidget(self.file_label)
        
        browse_btn = QPushButton('Browse')
        browse_btn.clicked.connect(self.browse_file)
        upload_group_layout.addWidget(browse_btn)
        
        upload_btn = QPushButton('Upload & Analyze')
        upload_btn.clicked.connect(self.upload_file)
        upload_group_layout.addWidget(upload_btn)
        
        upload_group.setLayout(upload_group_layout)
        upload_layout.addWidget(upload_group)
        
        # Summary section
        self.summary_group = QGroupBox('Summary Statistics')
        summary_layout = QGridLayout()
        
        self.total_label = QLabel('Total: -')
        self.flowrate_label = QLabel('Avg Flowrate: -')
        self.pressure_label = QLabel('Avg Pressure: -')
        self.temp_label = QLabel('Avg Temperature: -')
        
        summary_layout.addWidget(self.total_label, 0, 0)
        summary_layout.addWidget(self.flowrate_label, 0, 1)
        summary_layout.addWidget(self.pressure_label, 1, 0)
        summary_layout.addWidget(self.temp_label, 1, 1)
        
        pdf_btn = QPushButton('Download PDF Report')
        pdf_btn.clicked.connect(self.download_pdf)
        summary_layout.addWidget(pdf_btn, 2, 0, 1, 2)
        
        self.summary_group.setLayout(summary_layout)
        upload_layout.addWidget(self.summary_group)
        
        # Charts
        charts_widget = QWidget()
        charts_layout = QHBoxLayout(charts_widget)
        
        self.bar_chart = ChartWidget()
        self.pie_chart = ChartWidget()
        
        charts_layout.addWidget(self.bar_chart)
        charts_layout.addWidget(self.pie_chart)
        
        upload_layout.addWidget(charts_widget)
        upload_layout.addStretch()
        
        self.tabs.addTab(upload_tab, 'Upload & Analyze')
        
        # Data Table Tab
        table_tab = QWidget()
        table_layout = QVBoxLayout(table_tab)
        
        self.data_table = QTableWidget()
        table_layout.addWidget(self.data_table)
        
        self.tabs.addTab(table_tab, 'Data Table')
        
        # History Tab
        history_tab = QWidget()
        history_layout = QVBoxLayout(history_tab)
        
        history_label = QLabel('Recent Uploads (Last 5)')
        history_label.setFont(QFont('Arial', 12, QFont.Bold))
        history_layout.addWidget(history_label)
        
        self.history_list = QListWidget()
        self.history_list.itemDoubleClicked.connect(self.load_dataset)
        history_layout.addWidget(self.history_list)
        
        self.tabs.addTab(history_tab, 'History')
        
        main_layout.addWidget(self.tabs)
        
        self.selected_file = None
    
    def show_login(self):
        self.login_window = LoginWindow(self)
        self.login_window.show()
    
    def set_token(self, token, username):
        self.token = token
        self.username = username
        self.user_label.setText(f'Welcome, {username}!')
        self.fetch_history()
    
    def browse_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, 'Select CSV File', '', 'CSV Files (*.csv)')
        if file_path:
            self.selected_file = file_path
            self.file_label.setText(file_path.split('/')[-1])
    
    def upload_file(self):
        if not self.selected_file:
            QMessageBox.warning(self, 'Warning', 'Please select a file first')
            return
        
        try:
            with open(self.selected_file, 'rb') as f:
                files = {'file': f}
                headers = {'Authorization': f'Token {self.token}'}
                response = requests.post(f'{API_URL}/datasets/upload/', 
                                       files=files, headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    self.current_data = result['data']
                    self.current_summary = result['summary']
                    self.current_dataset_id = result['id']
                    self.update_display()
                    self.fetch_history()
                    QMessageBox.information(self, 'Success', 'File uploaded successfully!')
                else:
                    QMessageBox.critical(self, 'Error', response.json().get('error', 'Upload failed'))
        except Exception as e:
            QMessageBox.critical(self, 'Error', str(e))
    
    def update_display(self):
        if not self.current_summary:
            return
        
        # Update summary
        s = self.current_summary
        self.total_label.setText(f"Total Equipment: {s['total_count']}")
        self.flowrate_label.setText(f"Avg Flowrate: {s['avg_flowrate']:.2f}")
        self.pressure_label.setText(f"Avg Pressure: {s['avg_pressure']:.2f}")
        self.temp_label.setText(f"Avg Temperature: {s['avg_temperature']:.2f}")
        
        # Update charts
        self.bar_chart.plot_bar_chart(s)
        self.pie_chart.plot_pie_chart(s['type_distribution'])
        
        # Update table
        if self.current_data:
            df = pd.DataFrame(self.current_data)
            self.data_table.setRowCount(len(df))
            self.data_table.setColumnCount(len(df.columns))
            self.data_table.setHorizontalHeaderLabels(df.columns)
            
            for i, row in df.iterrows():
                for j, value in enumerate(row):
                    self.data_table.setItem(i, j, QTableWidgetItem(str(value)))
    
    def fetch_history(self):
        try:
            headers = {'Authorization': f'Token {self.token}'}
            response = requests.get(f'{API_URL}/datasets/', headers=headers)
            if response.status_code == 200:
                datasets = response.json()
                self.history_list.clear()
                for ds in datasets:
                    item_text = f"{ds['filename']} - {ds['uploaded_at'][:19]} (Count: {ds['total_count']})"
                    item = self.history_list.addItem(item_text)
                    self.history_list.item(self.history_list.count() - 1).setData(Qt.UserRole, ds['id'])
        except Exception as e:
            print(f'Error fetching history: {e}')
    
    def load_dataset(self, item):
        dataset_id = item.data(Qt.UserRole)
        try:
            headers = {'Authorization': f'Token {self.token}'}
            response = requests.get(f'{API_URL}/datasets/{dataset_id}/', headers=headers)
            if response.status_code == 200:
                dataset = response.json()
                self.current_data = json.loads(dataset['raw_data'])
                self.current_summary = {
                    'total_count': dataset['total_count'],
                    'avg_flowrate': dataset['avg_flowrate'],
                    'avg_pressure': dataset['avg_pressure'],
                    'avg_temperature': dataset['avg_temperature'],
                    'type_distribution': dataset['type_distribution']
                }
                self.current_dataset_id = dataset_id
                self.update_display()
                self.tabs.setCurrentIndex(0)
        except Exception as e:
            QMessageBox.critical(self, 'Error', str(e))
    
    def download_pdf(self):
        if not self.current_dataset_id:
            QMessageBox.warning(self, 'Warning', 'No dataset loaded')
            return
        
        try:
            url = f'{API_URL}/datasets/{self.current_dataset_id}/download_pdf/?token={self.token}'
            response = requests.get(url)
            if response.status_code == 200:
                file_path, _ = QFileDialog.getSaveFileName(self, 'Save PDF', 
                                                          f'report_{self.current_dataset_id}.pdf',
                                                          'PDF Files (*.pdf)')
                if file_path:
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    QMessageBox.information(self, 'Success', 'PDF downloaded successfully!')
        except Exception as e:
            QMessageBox.critical(self, 'Error', str(e))
    
    def logout(self):
        self.token = None
        self.username = None
        self.current_data = None
        self.current_summary = None
        self.current_dataset_id = None
        self.user_label.setText('')
        self.history_list.clear()
        self.data_table.setRowCount(0)
        self.show_login()


if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


# ============================================
# frontend-desktop/requirements.txt
# ============================================
"""
PyQt5==5.15.10
matplotlib==3.8.2
pandas==2.1.3
requests==2.31.0
"""