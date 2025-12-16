import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import Navbar from '../../components/Navbar';
import { listingService, verificationService } from '../../services/api';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function VerificationList() {
    const [items, setItems] = useState([]);
    const [tabValue, setTabValue] = useState(0); // 0: pending, 1: verified, 2: rejected
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [notes, setNotes] = useState('');

    // Map tab index to listing status
    const statusMap = ['pending_verification', 'verified', 'rejected'];

    const fetchItems = async () => {
        try {
            // Currently focusing on Listings as per user request
            const res = await listingService.getAll({ status: statusMap[tabValue] });
            setItems(res.data.listings || []);
        } catch (error) {
            console.error("Error fetching items", error);
            setItems([]);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [tabValue]);

    const handleAction = (item, action) => { // action: 'verified' or 'rejected'
        setSelectedItem({ ...item, nextStatus: action });
        setNotes('');
        setOpenDialog(true);
    };

    const confirmAction = async () => {
        try {
            // 1. Create verification record
            await verificationService.create({
                target_type: 'listing',
                target_id: selectedItem.id,
                status: selectedItem.nextStatus,
                notes: notes
            });

            // 2. If rejected, we also need to explicitly update the listing status 
            // (Backend only auto-updates on 'verified')
            if (selectedItem.nextStatus === 'rejected') {
                await listingService.update(selectedItem.id, { status: 'rejected' });
            }

            setOpenDialog(false);
            fetchItems(); // Refresh list
        } catch (error) {
            console.error("Error updating verification", error);
            alert("Error updating verification status");
        }
    };

    return (
        <>
            <Navbar title="Verification Center" />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>Listing Verifications</Typography>

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary" centered>
                        <Tab label="Pending Verification" />
                        <Tab label="Verified" />
                        <Tab label="Rejected" />
                    </Tabs>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Property Address</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Landlord ID</TableCell>
                                <TableCell>Date Created</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.property_address}</TableCell>
                                    <TableCell>${row.price}</TableCell>
                                    <TableCell>{row.landlord_id}</TableCell>
                                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            color={row.status === 'verified' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.status === 'pending_verification' && (
                                            <>
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    startIcon={<CheckIcon />}
                                                    onClick={() => handleAction(row, 'verified')}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<CloseIcon />}
                                                    onClick={() => handleAction(row, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No listings found with status "{statusMap[tabValue]}".</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Action Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Confirm {selectedItem?.nextStatus === 'verified' ? 'Approval' : 'Rejection'}</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Are you sure you want to mark this listing as <strong>{selectedItem?.nextStatus}</strong>?
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Admin Notes (Optional)"
                            fullWidth
                            variant="outlined"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={confirmAction} variant="contained" color={selectedItem?.nextStatus === 'verified' ? 'success' : 'error'}>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </>
    );
}
