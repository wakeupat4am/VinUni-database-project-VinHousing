import React, { useEffect, useState } from 'react';
import { 
  Container, Grid, Card, CardMedia, CardContent, Typography, CardActions, 
  Button, Chip, TextField, Box, InputAdornment, MenuItem, Select, FormControl, InputLabel, Paper, Collapse 
} from '@mui/material';
import { listingService } from '../../services/api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import BedIcon from '@mui/icons-material/Bed';
import VerifiedIcon from '@mui/icons-material/Verified';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Icon for pending

export default function ListingSearch() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Filter States ---
  const [priceFilter, setPriceFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // ✅ NEW: Status Filter (Default to 'verified' so users see clean data first)
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadListings = async () => {
      try {
        // ✅ CRITICAL CHANGE: Fetch ALL listings so we can filter them locally
        // Passing {} means "no filter" to the backend
        const res = await listingService.getAll({});
        setListings(res.data.listings || []);
      } catch (error) {
        console.error("Failed to load listings", error);
      }
    };
    loadListings();
  }, []);

  const filteredListings = listings.filter(l => {
    // 1. Text Search
    const matchesSearch = 
      l.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Price Filter
    let matchesPrice = true;
    if (priceFilter === 'low') matchesPrice = l.price < 500;
    if (priceFilter === 'medium') matchesPrice = l.price >= 500 && l.price <= 1000;
    if (priceFilter === 'high') matchesPrice = l.price > 1000;

    // 3. Type Filter
    let matchesType = true;
    if (typeFilter === 'room') matchesType = l.unit_name !== 'Whole Property';
    if (typeFilter === 'whole_house') matchesType = l.unit_name === 'Whole Property';

    // 4. ✅ NEW: Status Filter
    let matchesStatus = true;
    if (statusFilter && statusFilter !== 'all') {
        matchesStatus = l.status === statusFilter;
    }

    return matchesSearch && matchesPrice && matchesType && matchesStatus;
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Navbar title="Find Your Home" />

      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', bgcolor: 'primary.main', color: 'white', 
        py: { xs: 6, md: 10 }, mb: 6, textAlign: 'center',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center' 
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight="800" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Discover Your Perfect Space
          </Typography>
          
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth variant="outlined" placeholder="Search by location, amenities..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
                  sx={{ bgcolor: 'transparent' }}
                />
                <Button variant="contained" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}>
                  Search
                </Button>
            </Box>

            {/* Collapsible Filters */}
            <Collapse in={showFilters} sx={{ width: '100%', mt: showFilters ? 2 : 0 }}>
                <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid #eee', flexWrap: 'wrap' }}>
                    
                    {/* Price Filter */}
                    <FormControl size="small" sx={{ flex: 1, minWidth: '150px' }}>
                        <InputLabel>Price Range</InputLabel>
                        <Select value={priceFilter} label="Price Range" onChange={(e) => setPriceFilter(e.target.value)}>
                            <MenuItem value="">Any Price</MenuItem>
                            <MenuItem value="low">Under $500</MenuItem>
                            <MenuItem value="medium">$500 - $1,000</MenuItem>
                            <MenuItem value="high">Above $1,000</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Type Filter */}
                    <FormControl size="small" sx={{ flex: 1, minWidth: '150px' }}>
                        <InputLabel>Property Type</InputLabel>
                        <Select value={typeFilter} label="Property Type" onChange={(e) => setTypeFilter(e.target.value)}>
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="whole_house">Whole Property Only</MenuItem>
                            <MenuItem value="room">Private Room Only</MenuItem>
                        </Select>
                    </FormControl>

                    {/* ✅ NEW: Status Filter Dropdown */}
                    <FormControl size="small" sx={{ flex: 1, minWidth: '150px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="verified">Verified (Active)</MenuItem>
                            <MenuItem value="pending_verification">Pending Review</MenuItem>
                            <MenuItem value="rented">Rented / Archived</MenuItem>
                        </Select>
                    </FormControl>

                </Box>
            </Collapse>
          </Paper>
          
          <Button startIcon={<FilterListIcon />} sx={{ mt: 2, color: 'white', opacity: 0.9 }} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "More Filters"}
          </Button>
        </Container>
      </Box>

      {/* Results Grid */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Available Listings <Chip label={filteredListings.length} color="primary" size="small" sx={{ ml: 1, fontWeight: 'bold' }} />
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {filteredListings.map((l) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="240" image={l.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"} alt="House" />
                  
                  {/* ✅ DYNAMIC BADGES BASED ON STATUS */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      {l.status === 'verified' && (
                        <Chip icon={<VerifiedIcon sx={{ color: 'white !important' }} />} label="Verified" size="small" sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }} />
                      )}
                      {l.status === 'pending_verification' && (
                        <Chip icon={<HourglassEmptyIcon sx={{ color: 'white !important' }} />} label="Pending" size="small" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold' }} />
                      )}
                      {l.status === 'rented' && (
                        <Chip label="Rented" size="small" sx={{ bgcolor: 'grey.700', color: 'white', fontWeight: 'bold' }} />
                      )}
                  </Box>

                  <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 1.5, py: 0.5, borderRadius: 2, backdropFilter: 'blur(4px)', fontWeight: 'bold' }}>
                    ${Number(l.price).toLocaleString()}/mo
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                    {l.unit_name === 'Whole Property' ? 'Whole Property' : `${l.unit_name}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <LocationOnIcon fontSize="small" color="action" /> {l.property_address}
                  </Typography>
                  
                  {/* Type Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                       {l.unit_name === 'Whole Property' ? <HomeWorkIcon fontSize="small" color="action"/> : <BedIcon fontSize="small" color="action" />}
                       <Typography variant="caption" fontWeight="bold">
                         {l.unit_name === 'Whole Property' ? 'House' : 'Room'}
                       </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {l.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button variant="outlined" fullWidth onClick={() => navigate(`/listings/${l.id}`)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}