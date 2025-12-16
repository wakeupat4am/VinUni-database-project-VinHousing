import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { verificationService, userService, issueService } from '../../services/api';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingVerifications: 0,
        totalUsers: 0,
        activeIssues: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [verRes, userRes, issueRes] = await Promise.all([
                    verificationService.getAll({ status: 'pending' }),
                    userService.getAll(),
                    issueService.getAll()
                ]);

                setStats({
                    pendingVerifications: verRes.data.verifications.length,
                    totalUsers: userRes.data.users.length,
                    activeIssues: issueRes.data.issues.filter(i => i.status !== 'resolved').length
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <Navbar title="Admin Dashboard" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    System Overview
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Stat Cards */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#e3f2fd' }}>
                            <VerifiedUserIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3" color="primary" fontWeight="bold">{stats.pendingVerifications}</Typography>
                            <Typography variant="subtitle1">Pending Verifications</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f3e5f5' }}>
                            <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3" color="secondary" fontWeight="bold">{stats.totalUsers}</Typography>
                            <Typography variant="subtitle1">Total Users</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#ffebee' }}>
                            <ReportProblemIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3" color="error" fontWeight="bold">{stats.activeIssues}</Typography>
                            <Typography variant="subtitle1">Active Issues</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                    Quick Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Typography variant="h6">Verification Center</Typography>
                                </Box>
                                <Typography color="text.secondary" paragraph>
                                    Review and approve landlord documents, property listings, and user affiliations.
                                </Typography>
                            </Box>
                            <Button variant="contained" onClick={() => navigate('/admin/verifications')}>
                                Manage Verifications
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <PeopleIcon color="info" />
                                    <Typography variant="h6">User Management</Typography>
                                </Box>
                                <Typography color="text.secondary" paragraph>
                                    View all users, manage roles, and deactivate suspicious accounts.
                                </Typography>
                            </Box>
                            <Button variant="contained" color="info" onClick={() => navigate('/admin/users')}>
                                Manage Users
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
