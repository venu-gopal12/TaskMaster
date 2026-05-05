import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layers, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="error">Failed to load dashboard data.</div>;

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: <Layers size={24} />, color: 'var(--accent-primary)' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: <CheckCircle2 size={24} />, color: 'var(--status-in_progress)' },
    { title: 'Overdue Tasks', value: stats.overdueCount, icon: <AlertCircle size={24} />, color: 'var(--status-danger)' },
    { title: 'Pending Review', value: stats.statusBreakdown.review || 0, icon: <Clock size={24} />, color: 'var(--status-review)' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card glass-panel">
            <div className="stat-icon" style={{ color: card.color, backgroundColor: `${card.color}20` }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.title}</h3>
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="chart-section glass-panel">
          <h3>Task Status Breakdown</h3>
          <div className="status-bars">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="status-bar-wrapper">
                <div className="status-label">
                  <span className={`status-badge status-${status}`}>{status.replace('_', ' ')}</span>
                  <span>{count}</span>
                </div>
                <div className="progress-bg">
                  <div 
                    className={`progress-fill bg-${status}`} 
                    style={{ width: `${stats.totalTasks ? (count / stats.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
