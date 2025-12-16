import React from 'react';
import { Activity, Book, Trophy } from 'lucide-react';
import '../App.css';

const Dashboard = () => {
  return (
    <div className="page-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, Student!</h1>
        <p className="dashboard-subtitle">Track your progress and continue your journey.</p>
      </header>

      <div className="stats-grid">
        <StatCard 
          icon={Activity} 
          label="Current Streak" 
          value="3 Days" 
          color="#10b981" 
        />
        <StatCard 
          icon={Trophy} 
          label="Skills Mastered" 
          value="2" 
          color="#f59e0b" 
        />
        <StatCard 
          icon={Book} 
          label="Modules in Progress" 
          value="1" 
          color="#3b82f6" 
        />
      </div>

      <div className="glass content-section">
        <h2 className="section-title">Recommended Next Steps</h2>
        <div className="placeholder-box">
          <p>Modules will appear here...</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass stat-card">
    <div className="icon-box" style={{ background: `${color}20` }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default Dashboard;
