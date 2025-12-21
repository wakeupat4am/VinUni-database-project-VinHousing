import React, { useEffect, useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { authService, requestService, contractService, issueService } from '../../services/api';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// CSS
import './TenantDashboard.css';

export default function TenantDashboard() {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    
    // Data States
    const [requests, setRequests] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [issues, setIssues] = useState([]);

    // Modal States
    const [openIssueModal, setOpenIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({
        contract_id: '',
        title: '',
        description: '',
        category: 'maintenance',
        severity: 'medium'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reqRes, conRes, issRes] = await Promise.all([
                requestService.getAll({ requester_id: user.id }),
                contractService.getAll(),
                issueService.getAll()
            ]);
            setRequests(reqRes.data.requests || []);
            setContracts(conRes.data.contracts || []);
            setIssues(issRes.data.issues || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    // --- Handlers ---
    const handleOpenReportModal = () => {
        if (contracts.length === 0) {
            alert("You need an active rental contract to report an issue.");
            return;
        }
        setIssueForm(prev => ({
            ...prev,
            contract_id: contracts.length === 1 ? contracts[0].id : ''
        }));
        setOpenIssueModal(true);
    };

    const handleIssueSubmit = async () => {
        if (!issueForm.contract_id || !issueForm.title || !issueForm.description) {
            alert("Please fill in all required fields.");
            return;
        }
        try {
            await issueService.create(issueForm);
            alert("Issue reported successfully!");
            setOpenIssueModal(false);
            setIssueForm({ contract_id: '', title: '', description: '', category: 'maintenance', severity: 'medium' });
            fetchData();
        } catch (err) {
            alert("Failed to report issue: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="td-root">
            <Navbar title="Tenant Dashboard" />
            
            <div className="td-container">
                {/* 1. Welcome Header */}
                <div className="td-header">
                    <div className="td-welcome-text">
                        <h1>Welcome back, {user?.full_name?.split(' ')[0] || 'Tenant'}!</h1>
                        <p>Here's what's happening with your rentals today.</p>
                    </div>
                    <button className="td-action-btn" onClick={() => navigate('/listings')}>
                        <SearchIcon fontSize="small" /> Find a New Home
                    </button>
                </div>

                {/* 2. Main Grid (Requests & Contracts) */}
                <div className="td-grid">
                    
                    {/* Active Requests Card */}
                    <div className="td-card">
                        <div className="td-card-header">
                            <div className="td-card-title">
                                <HomeIcon sx={{ color: '#2563eb' }} /> Rental Requests
                            </div>
                            <span className="td-badge-count">{requests.length}</span>
                        </div>
                        
                        {requests.length === 0 ? (
                            <div className="td-empty">No active requests found.</div>
                        ) : (
                            <ul className="td-list">
                                {requests.map((req) => (
                                    <li key={req.id} className="td-list-item" // ✅ ADD THIS: Navigate to the listing page
            onClick={() => navigate(`/listings/${req.listing_id}`)}
            // ✅ ADD THIS: Change cursor so user knows it's clickable
            style={{ cursor: 'pointer' }}>
                                        <div className="td-item-icon"><HomeIcon fontSize="small"/></div>
                                        <div className="td-item-content">
                                            <span className="td-item-title">Request #{req.id}</span>
                                            <span className="td-item-subtitle">Submitted on {new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`td-status ${req.status}`}>{req.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Active Contracts Card */}
                    <div className="td-card">
                        <div className="td-card-header">
                            <div className="td-card-title">
                                <AssignmentIcon sx={{ color: '#10b981' }} /> My Contracts
                            </div>
                            <span className="td-badge-count" style={{ color: '#10b981', background: '#ecfdf5' }}>{contracts.length}</span>
                        </div>

                        {contracts.length === 0 ? (
                            <div className="td-empty">No active contracts found.</div>
                        ) : (
                            <ul className="td-list">
                                {contracts.map((con) => (
                                    <li key={con.id} className="td-list-item" onClick={() => navigate('/contracts')}>
                                        <div className="td-item-icon"><AssignmentIcon fontSize="small"/></div>
                                        <div className="td-item-content">
                                            <span className="td-item-title">{con.property_address || `Contract #${con.id}`}</span>
                                            <span className="td-item-subtitle">${con.rent_amount || con.rent}/mo</span>
                                        </div>
                                        <span className={`td-status active`}>Active</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 3. Issues Section (Full Width) */}
                <div className="td-issues-section">
                    <div className="td-card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className="td-card-title">
                            <ReportProblemIcon sx={{ color: '#ef4444' }} /> Reported Issues
                        </div>
                        <button className="td-report-btn" onClick={handleOpenReportModal}>
                            <AddCircleOutlineIcon sx={{ fontSize: 16, verticalAlign: 'middle', marginRight: '4px' }} />
                            Report Issue
                        </button>
                    </div>

                    {issues.length === 0 ? (
                        <div className="td-empty">No issues reported recently. That's good news!</div>
                    ) : (
                        <div className="td-issue-grid">
                            {issues.map((issue) => (
                                <div key={issue.id} className="td-issue-card">
                                    <div className="td-issue-header">
                                        <span className="td-issue-title">{issue.title}</span>
                                        <span className={`td-status ${issue.status === 'resolved' ? 'resolved' : 'open'}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="td-issue-desc">{issue.description}</p>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        Reported on {new Date(issue.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- REPORT MODAL (Kept Material UI for Form ease) --- */}
                <Dialog open={openIssueModal} onClose={() => setOpenIssueModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogContent dividers>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Property</InputLabel>
                                <Select
                                    value={issueForm.contract_id}
                                    label="Select Property"
                                    onChange={(e) => setIssueForm({ ...issueForm, contract_id: e.target.value })}
                                >
                                    {contracts.map(con => (
                                        <MenuItem key={con.id} value={con.id}>
                                            {con.property_address || `Contract #${con.id}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Title"
                                size="small"
                                fullWidth
                                placeholder="e.g., Leaky Sink"
                                value={issueForm.title}
                                onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                            />

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={issueForm.category}
                                        label="Category"
                                        onChange={(e) => setIssueForm({ ...issueForm, category: e.target.value })}
                                    >
                                        <MenuItem value="maintenance">Maintenance</MenuItem>
                                        <MenuItem value="noise">Noise</MenuItem>
                                        <MenuItem value="safety">Safety</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Severity</InputLabel>
                                    <Select
                                        value={issueForm.severity}
                                        label="Severity"
                                        onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                                    >
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Describe the problem in detail..."
                                value={issueForm.description}
                                onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenIssueModal(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleIssueSubmit} variant="contained" color="error">Submit</Button>
                    </DialogActions>
                </Dialog>

            </div>
        </div>
    );
}