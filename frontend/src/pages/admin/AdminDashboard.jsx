import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  verificationService,
  userService,
  issueService,
  authService,
    listingService,
} from "../../services/api";

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
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalUsers: 0,
    activeIssues: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data, default to empty arrays on failure
        const [verRes, userRes, issueRes] = await Promise.all([
          verificationService
            .getAll({ status: "verified" })
            .catch(() => ({ data: { verifications: [] } })),
          userService.getAll().catch(() => ({ data: { users: [] } })),
          issueService.getAll().catch(() => ({ data: { issues: [] } })),
        ]);
        const listingRes = await listingService.getAll({
          status: "pending_verification",
          limit: 1,
        });

        setStats({
          // ✅ Fix: Read 'total' from backend, or fallback to length if missing
          pendingVerifications: listingRes.data.total || 0,

          totalUsers: userRes.data.users?.length || 0, // You should likely do the same fix for Users!
          activeIssues:
            issueRes.data.issues?.filter((i) => i.status !== "resolved")
              .length || 0,
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

        {/* --- QUICK ACTIONS --- */}
        <h3 className="ad-section-title">Quick Actions</h3>

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
