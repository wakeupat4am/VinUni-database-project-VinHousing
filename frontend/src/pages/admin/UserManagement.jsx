import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, TextField, Box, InputAdornment } from '@mui/material';
import Navbar from '../../components/Navbar';
import { userService } from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await userService.getAll();
            // Ensure we handle both potential response structures
            const usersData = res.data.users || res.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error("Error fetching users", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;
        try {
            await userService.updateStatus(userId, newStatus);
            fetchUsers();
        } catch (error) {
            alert("Error updating user status");
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Navbar title="User Management" />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">All Users</Typography>
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} size="small" /></TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            color={user.status === 'active' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {user.role !== 'admin' && (
                                            user.status === 'active' ? (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<BlockIcon />}
                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                >
                                                    Deactivate
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    startIcon={<CheckCircleOutlineIcon />}
                                                    onClick={() => handleStatusChange(user.id, 'active')}
                                                >
                                                    Activate
                                                </Button>
                                            )
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
}
