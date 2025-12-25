import React, { useEffect, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TimelineIcon from '@mui/icons-material/Timeline';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { issueService, analyticsService } from '../../services/api';

// Import the Redesigned CSS
import './IssueAnalytics.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function IssueAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({ total: 0, active: 0, critical: 0, resolvedRate: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statRes, issueRes] = await Promise.all([
          analyticsService.getIssueStats(),
          issueService.getAll()
      ]);
      
      const issueList = issueRes.data.issues || [];
      const cleanStats = (statRes.data.stats || []).filter(s => s.category !== 'TOTAL');
      
      setStats(cleanStats);
      setIssues(issueList);

      const total = issueList.length;
      const resolved = issueList.filter(i => i.status === 'resolved' || i.status === 'closed').length;
      const critical = issueList.filter(i => i.severity === 'critical').length;
      const active = total - resolved;
      const rate = total > 0 ? ((resolved / total) * 100).toFixed(0) : 0;

      setKpis({ total, active, critical, resolvedRate: rate });
    } catch (err) {
      console.error("Failed to fetch issue analytics", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Render Helpers ---
  const renderSeverityBadge = (severity) => {
    return <span className={`ia-badge ${severity}`}>{severity}</span>;
  };

  const renderStatus = (status) => {
    const isClosed = status === 'resolved' || status === 'closed';
    const color = isClosed ? '#94a3b8' : '#3b82f6'; // Grey or Blue
    return (
      <span className="ia-status" style={{ color: color }}>
        <span className="ia-dot" style={{ backgroundColor: color }}></span>
        {status}
      </span>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ia-custom-tooltip">
          <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            {label || payload[0].name}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            <span style={{color: payload[0].fill}}>●</span> Count: <strong>{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ia-root">
      <Navbar title="Issue Analytics" />
      
      <div className="ia-container">
        
        {/* --- Header Section --- */}
        <div className="ia-header">
          <div>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/admin')} 
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, mb: 1, padding: 0, minWidth: 0, '&:hover': { background: 'transparent', color: '#0f172a'} }}
              disableRipple
            >
              Dashboard
            </Button>
            <h1 className="ia-title">Issue Management</h1>
            <p className="ia-subtitle">Real-time overview of maintenance, complaints, and safety reports.</p>
          </div>
          <div>
             <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchData} 
                disabled={loading}
                sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#e2e8f0', color: '#475569' }}
             >
                Refresh
             </Button>
          </div>
        </div>

        {/* --- 1. Stats Grid (Responsive Auto-fit) --- */}
        <div className="ia-stats-grid">
            <div className="ia-stat-card">
                <div className="ia-stat-icon-wrapper ia-blue"><AssignmentIcon fontSize="inherit" /></div>
                <div className="ia-stat-info">
                    <span className="ia-stat-label">Total Reports</span>
                    <span className="ia-stat-number">{kpis.total}</span>
                </div>
            </div>

            <div className="ia-stat-card">
                <div className="ia-stat-icon-wrapper ia-purple"><TimelineIcon fontSize="inherit" /></div>
                <div className="ia-stat-info">
                    <span className="ia-stat-label">Active Issues</span>
                    <span className="ia-stat-number">{kpis.active}</span>
                </div>
            </div>

            <div className="ia-stat-card">
                <div className="ia-stat-icon-wrapper ia-red"><BugReportIcon fontSize="inherit" /></div>
                <div className="ia-stat-info">
                    <span className="ia-stat-label">Critical Alerts</span>
                    <span className="ia-stat-number" style={{ color: kpis.critical > 0 ? '#ef4444' : 'inherit' }}>
                        {kpis.critical}
                    </span>
                </div>
            </div>

            <div className="ia-stat-card">
                <div className="ia-stat-icon-wrapper ia-green"><CheckCircleOutlineIcon fontSize="inherit" /></div>
                <div className="ia-stat-info">
                    <span className="ia-stat-label">Resolution Rate</span>
                    <span className="ia-stat-number">{kpis.resolvedRate}%</span>
                </div>
            </div>
        </div>

        {/* --- 2. Charts Grid (Split 1:2) --- */}
        <div className="ia-charts-grid">
            
            {/* Pie Chart */}
            <div className="ia-card">
              <div className="ia-card-header">
                  <h2 className="ia-card-title"><AssignmentIcon sx={{ color: '#6366f1', fontSize: 20 }} /> Category Split</h2>
                  <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
              </div>
              <div className="ia-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60} 
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="category"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        iconType="circle" 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="ia-card">
              <div className="ia-card-header">
                <h2 className="ia-card-title"><WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20 }} /> Severity Overview</h2>
                <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
              </div>
              <div className="ia-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                        { name: 'Critical', count: issues.filter(i => i.severity === 'critical').length, fill: '#ef4444' },
                        { name: 'High', count: issues.filter(i => i.severity === 'high').length, fill: '#f59e0b' },
                        { name: 'Medium', count: issues.filter(i => i.severity === 'medium').length, fill: '#6366f1' },
                        { name: 'Low', count: issues.filter(i => i.severity === 'low').length, fill: '#10b981' },
                    ]}
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    barSize={50}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13 }} 
                        allowDecimals={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {
                            [
                                { fill: '#ef4444' }, { fill: '#f59e0b' }, { fill: '#6366f1' }, { fill: '#10b981' }
                            ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                        }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>

        {/* --- 3. Recent Reports Table --- */}
        <div className="ia-card">
            <div className="ia-card-header">
                <h2 className="ia-card-title">Recent Reports</h2>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>View All</Button>
            </div>
            
            <div className="ia-table-wrapper">
                <table className="ia-table">
                    <thead>
                        <tr>
                            <th width="80">ID</th>
                            <th width="120">Category</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th width="120">Severity</th>
                            <th width="120">Status</th>
                            <th width="120" style={{textAlign: 'right'}}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.slice(0, 10).map((issue) => (
                        <tr key={issue.id}>
                            <td className="ia-id-cell">#{issue.id}</td>
                            <td style={{ textTransform: 'capitalize', color: '#475569', fontWeight: 500 }}>
                                {issue.category}
                            </td>
                            <td className="ia-title-cell">
                                {issue.title || 'No Title'}
                            </td>
                            <td className="ia-desc-cell" title={issue.description}>
                                {issue.description}
                            </td>
                            <td>
                                {renderSeverityBadge(issue.severity)}
                            </td>
                            <td>
                                {renderStatus(issue.status)}
                            </td>
                            <td style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.85rem' }}>
                                {new Date(issue.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                        ))}
                        {issues.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}