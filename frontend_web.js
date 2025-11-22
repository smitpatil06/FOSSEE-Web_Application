// ============================================
// frontend-web/src/App.js
// ============================================
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = 'http://localhost:8000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDatasetId, setCurrentDatasetId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/login/`, { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUsername(response.data.user);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setData([]);
    setSummary(null);
    setHistory([]);
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/datasets/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/datasets/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${token}`
        }
      });
      setData(response.data.data);
      setSummary(response.data.summary);
      setCurrentDatasetId(response.data.id);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDataset = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/datasets/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      const dataset = response.data;
      setData(JSON.parse(dataset.raw_data));
      setSummary({
        total_count: dataset.total_count,
        avg_flowrate: dataset.avg_flowrate,
        avg_pressure: dataset.avg_pressure,
        avg_temperature: dataset.avg_temperature,
        type_distribution: dataset.type_distribution
      });
      setCurrentDatasetId(id);
    } catch (err) {
      setError('Failed to load dataset');
    }
  };

  const downloadPDF = () => {
    if (!currentDatasetId) return;
    window.open(`${API_URL}/datasets/${currentDatasetId}/download_pdf/?token=${token}`, '_blank');
  };

  if (!token) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Chemical Equipment Visualizer</h1>
          <form onSubmit={login}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  const barChartData = summary ? {
    labels: ['Flowrate', 'Pressure', 'Temperature'],
    datasets: [{
      label: 'Average Values',
      data: [summary.avg_flowrate, summary.avg_pressure, summary.avg_temperature],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
    }]
  } : null;

  const pieChartData = summary ? {
    labels: Object.keys(summary.type_distribution),
    datasets: [{
      data: Object.values(summary.type_distribution),
      backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    }]
  } : null;

  return (
    <div className="App">
      <header>
        <h1>Chemical Equipment Parameter Visualizer</h1>
        <div>
          <span>Welcome, {username}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="container">
        <div className="upload-section">
          <h2>Upload CSV File</h2>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button onClick={uploadFile} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        {summary && (
          <>
            <div className="summary-section">
              <h2>Summary Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Equipment</h3>
                  <p>{summary.total_count}</p>
                </div>
                <div className="stat-card">
                  <h3>Avg Flowrate</h3>
                  <p>{summary.avg_flowrate.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Avg Pressure</h3>
                  <p>{summary.avg_pressure.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Avg Temperature</h3>
                  <p>{summary.avg_temperature.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={downloadPDF} className="pdf-btn">Download PDF Report</button>
            </div>

            <div className="charts-section">
              <div className="chart">
                <h3>Average Parameters</h3>
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
              <div className="chart">
                <h3>Equipment Type Distribution</h3>
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>

            <div className="table-section">
              <h2>Equipment Data</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Equipment Name</th>
                      <th>Type</th>
                      <th>Flowrate</th>
                      <th>Pressure</th>
                      <th>Temperature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item['Equipment Name']}</td>
                        <td>{item.Type}</td>
                        <td>{item.Flowrate}</td>
                        <td>{item.Pressure}</td>
                        <td>{item.Temperature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <h2>Recent Uploads (Last 5)</h2>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item" onClick={() => loadDataset(item.id)}>
                  <h4>{item.filename}</h4>
                  <p>{new Date(item.uploaded_at).toLocaleString()}</p>
                  <p>Count: {item.total_count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


// ============================================
// frontend-web/src/App.css
// ============================================
/*
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.App {
  min-height: 100vh;
}

header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  color: #667eea;
  font-size: 1.5rem;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 1rem;
}

.login-container {
  max-width: 400px;
  margin: 100px auto;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.login-container h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 2rem;
}

.login-container form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-container input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 5px;
  font-size: 1rem;
}

.login-container button {
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}

.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.upload-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.upload-section input {
  margin: 1rem 0;
  padding: 0.5rem;
}

.upload-section button {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 1rem;
}

.summary-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
}

.pdf-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.table-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #667eea;
  color: white;
  font-weight: 600;
}

tr:hover {
  background: #f7fafc;
}

.history-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.history-item {
  border: 2px solid #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.error {
  color: #ef4444;
  margin-top: 0.5rem;
}
*/


// ============================================
// frontend-web/package.json
// ============================================
/*
{
  "name": "equipment-visualizer-web",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
*/