import React, { useEffect, useState } from 'react';
import {
    Container, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Chip, TextField,
    Box, InputAdornment, Avatar, IconButton, Tooltip, Card, CardContent
} from '@mui/material';
import Navbar from '../../components/Navbar';
import { userService } from '../../services/api';
// 1. Import Socket Connection
import { socket } from '../../services/socket'; 

import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete Icon

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userService.getAll();
            const usersData = res.data.users || res.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error("Error fetching users", error);
            // Don't clear users on error to avoid flickering if network blips
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Initial Load
        fetchUsers();

        // 2. Real-Time Listeners
        // A. User Deleted
        socket.on('user_deleted', (data) => {
            console.log("⚡ Real-time: User deleted", data.id);
            setUsers(prev => prev.filter(u => u.id !== parseInt(data.id)));
        });

        // B. User Status Changed (Active/Suspended)
        socket.on('user_status_changed', (data) => {
            console.log("⚡ Real-time: Status changed", data);
            setUsers(prev => prev.map(u => 
                u.id === parseInt(data.id) ? { ...u, status: data.status } : u
            ));
        });

        // C. User Profile Updated
        socket.on('user_updated', (updatedUser) => {
            console.log("⚡ Real-time: User updated", updatedUser);
            setUsers(prev => prev.map(u => 
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
            ));
        });

        // D. New User Registered (Optional bonus)
        socket.on('user_created', (newUser) => {
             setUsers(prev => [newUser, ...prev]);
        });

        // 3. Cleanup Listeners
        return () => {
            socket.off('user_deleted');
            socket.off('user_status_changed');
            socket.off('user_updated');
            socket.off('user_created');
        };
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
        // No confirmation needed for fast admin actions (or keep it if you prefer)
        try {
            await userService.updateStatus(userId, newStatus);
            // No need to call fetchUsers()! The socket will update the UI automatically.
        } catch (error) {
            alert("Error updating user status");
        }
    };

    // New: Handle Delete
    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            // Check if userService.delete exists in api.js, if not, verify api.js configuration
            if (userService.delete) {
                 await userService.delete(userId); 
            } else {
                 // Fallback if the method name is different in your api.js
                 console.error("Delete method missing in userService");
            }
        } catch (error) {
            alert("Error deleting user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'secondary';
            case 'landlord': return 'primary';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'suspended': return 'warning';
            case 'deleted': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
            <Navbar title="User Management" />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            User Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage system users, roles, and account statuses
                        </Typography>
                        {/* Status Indicator */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 5px lime' }} />
                            <Typography variant="caption" color="success.main">Real-time updates active</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                        />
                    </CardContent>
                </Card>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{ 
                                            '&:hover': { bgcolor: 'action.hover' }, 
                                            transition: 'background-color 0.2s',
                                            // Highlight deleted users if they stick around (optional)
                                            opacity: user.status === 'deleted' ? 0.5 : 1 
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {user.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                                                label={user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                                                color={getRoleColor(user.role)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status ? user.status.toUpperCase() : 'UNKNOWN'}
                                                color={getStatusColor(user.status)}
                                                size="small"
                                                sx={{ fontWeight: 'bold', borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {user.role !== 'admin' && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Tooltip title={user.status === 'active' ? "Suspend User" : "Activate User"}>
                                                        <IconButton
                                                            color={user.status === 'active' ? 'warning' : 'success'}
                                                            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                                        >
                                                            {user.status === 'active' ? <BlockIcon /> : <CheckCircleOutlineIcon />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    {/* Delete Button */}
                                                    <Tooltip title="Delete Permanently">
                                                        <IconButton 
                                                            color="error"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No users found matching your search.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}