import React, { useState } from 'react';
import { FileText, Folder, Code, Database, Globe, Monitor, GitBranch, CheckCircle } from 'lucide-react';

const ProjectStructure = () => {
  const [activeTab, setActiveTab] = useState('structure');

  const structure = [
    { name: 'chemical-equipment-visualizer/', icon: Folder, children: [
      { name: 'backend/', icon: Folder, desc: 'Django Backend', children: [
        { name: 'equipment_api/', icon: Folder, children: [
          { name: 'settings.py', icon: Code },
          { name: 'urls.py', icon: Code },
          { name: 'wsgi.py', icon: Code }
        ]},
        { name: 'equipment/', icon: Folder, children: [
          { name: 'models.py', icon: Code, desc: 'Data models' },
          { name: 'serializers.py', icon: Code, desc: 'DRF serializers' },
          { name: 'views.py', icon: Code, desc: 'API views' },
          { name: 'urls.py', icon: Code }
        ]},
        { name: 'manage.py', icon: Code },
        { name: 'requirements.txt', icon: FileText }
      ]},
      { name: 'frontend-web/', icon: Globe, desc: 'React Frontend', children: [
        { name: 'src/', icon: Folder, children: [
          { name: 'App.js', icon: Code },
          { name: 'components/', icon: Folder },
          { name: 'services/', icon: Folder }
        ]},
        { name: 'package.json', icon: FileText }
      ]},
      { name: 'frontend-desktop/', icon: Monitor, desc: 'PyQt5 Desktop', children: [
        { name: 'main.py', icon: Code },
        { name: 'ui/', icon: Folder },
        { name: 'requirements.txt', icon: FileText }
      ]},
      { name: 'sample_equipment_data.csv', icon: Database },
      { name: 'README.md', icon: FileText }
    ]}
  ];

  const features = [
    { title: 'CSV Upload', desc: 'Upload chemical equipment data via Web or Desktop', status: 'Required' },
    { title: 'Data Analysis', desc: 'Calculate averages, counts, and distributions', status: 'Required' },
    { title: 'Visualization', desc: 'Chart.js (Web) + Matplotlib (Desktop)', status: 'Required' },
    { title: 'History (Last 5)', desc: 'Store and retrieve recent uploads', status: 'Required' },
    { title: 'PDF Reports', desc: 'Generate downloadable reports', status: 'Required' },
    { title: 'Authentication', desc: 'Basic user authentication', status: 'Required' }
  ];

  const techStack = [
    { layer: 'Frontend (Web)', tech: 'React.js + Chart.js', color: 'bg-blue-100 text-blue-700' },
    { layer: 'Frontend (Desktop)', tech: 'PyQt5 + Matplotlib', color: 'bg-green-100 text-green-700' },
    { layer: 'Backend', tech: 'Django + DRF', color: 'bg-purple-100 text-purple-700' },
    { layer: 'Data Processing', tech: 'Pandas', color: 'bg-yellow-100 text-yellow-700' },
    { layer: 'Database', tech: 'SQLite', color: 'bg-gray-100 text-gray-700' },
    { layer: 'Version Control', tech: 'Git & GitHub', color: 'bg-red-100 text-red-700' }
  ];

  const renderTree = (items, level = 0) => {
    return items.map((item, idx) => (
      <div key={idx} style={{ marginLeft: `${level * 20}px` }} className="my-1">
        <div className="flex items-center gap-2 text-sm">
          {item.icon && <item.icon size={16} className="text-gray-600" />}
          <span className="font-mono font-semibold">{item.name}</span>
          {item.desc && <span className="text-xs text-gray-500">({item.desc})</span>}
        </div>
        {item.children && renderTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Chemical Equipment Parameter Visualizer</h1>
            <p className="text-blue-100">Hybrid Web + Desktop Application - Complete Implementation Guide</p>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              {['structure', 'tech', 'features', 'setup'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'structure' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Folder className="text-blue-600" />
                  Project Structure
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  {renderTree(structure)}
                </div>
              </div>
            )}

            {activeTab === 'tech' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {techStack.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-700 mb-2">{item.layer}</div>
                      <div className={`${item.color} px-3 py-1 rounded-full inline-block text-sm font-medium`}>
                        {item.tech}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <div className="space-y-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.desc}</div>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {feature.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Quick Setup Guide</h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <h3 className="font-bold text-blue-900 mb-2">1. Backend Setup</h3>
                    <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver`}
                    </pre>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <h3 className="font-bold text-green-900 mb-2">2. Web Frontend Setup</h3>
                    <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`cd frontend-web
npm install
npm start`}
                    </pre>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                    <h3 className="font-bold text-purple-900 mb-2">3. Desktop App Setup</h3>
                    <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`cd frontend-desktop
pip install -r requirements.txt
python main.py`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <GitBranch className="text-gray-600" />
            Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Review the complete code files I'll provide below</li>
            <li>Set up the project structure as shown</li>
            <li>Install dependencies for each component</li>
            <li>Test with the sample CSV data</li>
            <li>Create a GitHub repository and push your code</li>
            <li>Record a 2-3 minute demo video</li>
            <li>Submit via the Google Form</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProjectStructure;