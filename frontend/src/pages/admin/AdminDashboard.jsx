import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  verificationService,
  userService,
  issueService,
  authService,
  listingService,
  analyticsService, // ✅ Added Analytics Service
} from "../../services/api";

// MUI Components (New additions for the Analytics section)
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Chip 
} from "@mui/material";

// Icons
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PeopleIcon from "@mui/icons-material/People";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

// Import CSS
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  // State for cards
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalUsers: 0,
    activeIssues: 0,
  });

  // ✅ New State for Analytics (Group By & Window Functions)
  const [analytics, setAnalytics] = useState({ 
    revenue: [], 
    issues: [] 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data, default to empty arrays on failure
        const [
          verRes, 
          userRes, 
          issueRes, 
          listingRes,
          revRes,        // ✅ Analytics: Revenue
          issueStatRes   // ✅ Analytics: Issues
        ] = await Promise.all([
          verificationService.getAll({ status: "verified" }).catch(() => ({ data: { verifications: [] } })),
          userService.getAll().catch(() => ({ data: { users: [] } })),
          issueService.getAll().catch(() => ({ data: { issues: [] } })),
          listingService.getAll({ status: "pending_verification", limit: 1 }).catch(() => ({ data: { total: 0 } })),
          // ✅ Fetch Analytics endpoints
          analyticsService.getRevenue().catch(() => ({ data: { stats: [] } })),
          analyticsService.getIssueStats().catch(() => ({ data: { stats: [] } }))
        ]);

        setStats({
          pendingVerifications: listingRes.data.total || 0,
          totalUsers: userRes.data.users?.length || 0,
          activeIssues: issueRes.data.issues?.filter((i) => i.status !== "resolved").length || 0,
        });

        // ✅ Set Analytics Data
        setAnalytics({
            revenue: revRes.data.stats || [],
            issues: issueStatRes.data.stats || []
        });

      } catch (error) {
        console.error("Error fetching admin stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="ad-root">
      <Navbar title="Admin Dashboard" />

      <div className="ad-container">
        {/* --- HEADER --- */}
        <div className="ad-header">
          <div className="ad-header-icon">
            <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
          </div>
          <div className="ad-header-text">
            <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}</h1>
            <p>System Overview & Control Panel</p>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="ad-stats-grid">
          {/* Stat 1: Verifications (Blue) */}
          <div className="ad-stat-card blue">
            <VerifiedUserIcon className="ad-stat-bg-icon" />
            <div className="ad-stat-content">
              <div className="ad-stat-info">
                <span>Pending Verifications</span>
                <h2>{stats.pendingVerifications}</h2>
              </div>
              <div className="ad-stat-icon-wrapper">
                <VerifiedUserIcon sx={{ color: "white" }} />
              </div>
            </div>
          </div>

          {/* Stat 2: Users (Orange) */}
          <div className="ad-stat-card orange">
            <PeopleIcon className="ad-stat-bg-icon" />
            <div className="ad-stat-content">
              <div className="ad-stat-info">
                <span>Total Users</span>
                <h2>{stats.totalUsers}</h2>
              </div>
              <div className="ad-stat-icon-wrapper">
                <PeopleIcon sx={{ color: "white" }} />
              </div>
            </div>
          </div>

          {/* Stat 3: Issues (Red) */}
          <div className="ad-stat-card red">
            <ReportProblemIcon className="ad-stat-bg-icon" />
            <div className="ad-stat-content">
              <div className="ad-stat-info">
                <span>Active Issues</span>
                <h2>{stats.activeIssues}</h2>
              </div>
              <div className="ad-stat-icon-wrapper">
                <ReportProblemIcon sx={{ color: "white" }} />
              </div>
            </div>
          </div>
        </div>

        {/* --- ✅ NEW: ANALYTICS SECTION --- */}
        <div style={{ marginTop: '40px', marginBottom: '20px' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
                Platform Analytics
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                Advanced insights using SQL Window Functions & Grouping
            </Typography>

            <Grid container spacing={3}>
                {/* Revenue Table */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ 
                    p: 3, borderRadius: 3, border: '1px solid #e2e8f0',
                    cursor: 'pointer', transition: '0.2s',
                    '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } // ✅ Hover Effect
                }} onClick={() => navigate('/admin/analytics/financial')}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">Financial Performance</Typography>
                    <ArrowForwardIcon color="action" />
                </Box>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '12px 0' }}>Month</th>
                                    <th style={{ padding: '12px 0' }}>Monthly</th>
                                    <th style={{ padding: '12px 0' }}>Cumulative (Run. Total)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.revenue.length > 0 ? (
                                    analytics.revenue.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px 0', fontSize: '0.95rem' }}>{row.month}</td>
                                            <td style={{ fontWeight: '600' }}>${Number(row.monthly_total).toLocaleString()}</td>
                                            {/* Highlighted column showing Window Function Result */}
                                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                ${Number(row.cumulative_revenue).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" style={{ py: 2, textAlign: 'center', color: '#999' }}>No revenue data yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </Paper>
                </Grid>

                {/* Issue Categories Chips */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} onClick={() => navigate('/admin/analytics/issues')} // ✅ Added Navigation
                sx={{ 
                    p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%',
                    cursor: 'pointer', transition: '0.2s',
                    '&:hover': { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } // ✅ Hover Effect
                }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">Issues by Category</Typography>
                    <ArrowForwardIcon color="action" />
                </Box>
                        <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                            Aggregated using GROUP BY WITH ROLLUP
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {analytics.issues.length > 0 ? (
                                analytics.issues.map((row, i) => (
                                    <Chip 
                                        key={i} 
                                        label={`${row.category || 'TOTAL'}: ${row.count}`} 
                                        color={row.category === 'TOTAL' ? 'primary' : 'default'}
                                        variant={row.category === 'TOTAL' ? 'filled' : 'outlined'}
                                        sx={{ 
                                            fontWeight: row.category === 'TOTAL' ? 'bold' : 'normal',
                                            fontSize: '0.95rem',
                                            padding: '8px 4px'
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography color="text.secondary">No issues reported yet.</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>


        {/* --- QUICK ACTIONS --- */}
        <h3 className="ad-section-title" style={{ marginTop: '40px' }}>Quick Actions</h3>

        <div className="ad-actions-grid">
          {/* Action 1: Verification Center */}
          <div
            className="ad-action-card verification"
            onClick={() => navigate("/admin/verifications")}
          >
            <div>
              <div className="ad-action-header">
                <div className="ad-action-icon">
                  <VerifiedUserIcon />
                </div>
                <h4 className="ad-action-title">Verification Center</h4>
              </div>
              <p className="ad-action-desc">
                Review pending landlord documents, approve property listings,
                and manage user affiliations.
              </p>
            </div>
            <button className="ad-action-btn">
              Go to Verifications <ArrowForwardIcon fontSize="small" />
            </button>
          </div>

          {/* Action 2: User Management */}
          <div
            className="ad-action-card users"
            onClick={() => navigate("/admin/users")}
          >
            <div>
              <div className="ad-action-header">
                <div className="ad-action-icon">
                  <PeopleIcon />
                </div>
                <h4 className="ad-action-title">User Management</h4>
              </div>
              <p className="ad-action-desc">
                View all registered users, update roles, handle account
                suspensions, and monitor activity.
              </p>
            </div>
            <button className="ad-action-btn">
              Manage Users <ArrowForwardIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}