import React, { useEffect, useState } from "react";
import { FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { listingService } from "../../services/api";
import { socket } from "../../services/socket"; // ✅ Import Socket
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";

import "./ListingSearch.css";

export default function ListingSearch() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Filter States ---
  const [priceFilter, setPriceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadListings = async () => {
      try {
        const params = {};
        if (priceFilter === "low") params.max_price = 500;
        if (priceFilter === "medium") { params.min_price = 500; params.max_price = 1000; }
        if (statusFilter !== "all") params.status = statusFilter;

        const res = await listingService.getAll(params);
        setListings(res.data.listings || []);
      } catch (error) {
        console.error("Failed to load listings", error);
      }
    };

    loadListings();
  }, [priceFilter, statusFilter]);

  // ✅ REAL-TIME LISTENER
  useEffect(() => {
    // 1. New Listing Created (e.g., Landlord submits a house)
    socket.on('listing_created', (newListing) => {
        console.log("⚡ Real-time: New Listing", newListing);
        // Add to TOP of the list
        setListings((prev) => [newListing, ...prev]);
    });

    // 2. Listing Updated (e.g., Admin verifies a house)
    socket.on('listing_updated', (updatedListing) => {
        console.log("⚡ Real-time: Listing Updated", updatedListing);
        // Replace the old version with the new one
        setListings((prev) => 
            prev.map((l) => l.id === updatedListing.id ? updatedListing : l)
        );
    });

    // 3. Listing Deleted (Optional)
    socket.on('listing_deleted', (data) => {
        setListings((prev) => prev.filter(l => l.id !== data.id));
    });

    // Cleanup
    return () => {
        socket.off('listing_created');
        socket.off('listing_updated');
        socket.off('listing_deleted');
    };
  }, []);

  // --- Filtering Logic (Client Side) ---
  // Note: This logic runs automatically whenever 'listings' state updates via Socket
  const filteredListings = listings.filter((l) => {
    // 1. Text Search
    const matchesSearch =
      l.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Price Filter
    let matchesPrice = true;
    if (priceFilter === "low") matchesPrice = l.price < 500;
    if (priceFilter === "medium") matchesPrice = l.price >= 500 && l.price <= 1000;
    if (priceFilter === "high") matchesPrice = l.price > 1000;

    // 3. Type Filter
    let matchesType = true;
    if (typeFilter === "room") matchesType = l.unit_name !== "Whole Property";
    if (typeFilter === "whole_house") matchesType = l.unit_name === "Whole Property";

    // 4. Status Filter
    let matchesStatus = true;
    if (statusFilter && statusFilter !== "all") {
      matchesStatus = l.status === statusFilter;
    }

    return matchesSearch && matchesPrice && matchesType && matchesStatus;
  });

  const dropdownStyle = {
    m: 1, minWidth: 140, backgroundColor: "white", borderRadius: "30px",
    ".MuiOutlinedInput-notchedOutline": { borderColor: "#dddddd" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#222" },
    ".MuiSelect-select": { padding: "10px 14px", fontSize: "14px", fontWeight: 500 },
    height: "45px",
  };

  return (
    <div className="ls-container">
      <Navbar title="" />

      {/* --- STICKY FILTER BAR --- */}
      <div className="ls-filter-bar">
        <div className="ls-filter-content">
          <div className="ls-search-pill">
            <input
              type="text"
              className="ls-search-input"
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="ls-search-btn"><SearchIcon fontSize="small" /></button>
          </div>

          <div className="ls-filters-row">
            <FormControl size="small" sx={dropdownStyle}>
              <InputLabel sx={{ fontSize: "13px", top: "-4px" }}>Price</InputLabel>
              <Select value={priceFilter} label="Price" onChange={(e) => setPriceFilter(e.target.value)}>
                <MenuItem value="">Any Price</MenuItem>
                <MenuItem value="low">Under $500</MenuItem>
                <MenuItem value="medium">$500 - $1,000</MenuItem>
                <MenuItem value="high">Above $1,000</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={dropdownStyle}>
              <InputLabel sx={{ fontSize: "13px", top: "-4px" }}>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="whole_house">Whole Property</MenuItem>
                <MenuItem value="room">Private Room</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={dropdownStyle}>
              <InputLabel sx={{ fontSize: "13px", top: "-4px" }}>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="verified">Verified (Active)</MenuItem>
                <MenuItem value="pending_verification">Pending Review</MenuItem>
                <MenuItem value="rented">Rented / Archived</MenuItem>
              </Select>
            </FormControl>

            {(searchTerm || priceFilter || typeFilter || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchTerm(""); setPriceFilter(""); setTypeFilter(""); setStatusFilter("all"); }}
                style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer", fontSize: "14px" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- LISTINGS GRID --- */}
      <div className="ls-grid-container">
        {filteredListings.length === 0 ? (
          <div className="ls-empty" style={{ width: "100%", gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
            <h3>No matches found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredListings.map((l) => (
            <div key={l.id} className="ls-card" onClick={() => navigate(`/listings/${l.id}`)}>
              <div className="ls-img-container">
                <button className="ls-heart-btn" onClick={(e) => e.stopPropagation()}>
                  <FavoriteBorderIcon sx={{ color: "white", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
                </button>
                <div className="ls-badge-container">
                  {l.status === "verified" && <div className="ls-badge verified"><VerifiedIcon sx={{ fontSize: 14 }} /> Verified</div>}
                  {l.status === "pending_verification" && <div className="ls-badge pending"><HourglassEmptyIcon sx={{ fontSize: 14 }} /> Pending</div>}
                  {l.status === "rented" && <div className="ls-badge rented"><BlockIcon sx={{ fontSize: 14 }} /> Rented</div>}
                </div>
                <img
                  src={l.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"}
                  alt="Property"
                  className="ls-main-img"
                />
              </div>

              <div className="ls-card-details">
                <div className="ls-header-row">
                  <span className="ls-location">{l.property_address ? l.property_address.split(",")[0] : "Unknown Location"}</span>
                  <span className="ls-rating"><StarIcon sx={{ fontSize: 14 }} /> 4.9</span>
                </div>
                <div className="ls-subtext">{l.unit_name === "Whole Property" ? "Whole House" : "Private Room"}</div>
                <div className="ls-subtext">{l.status === "rented" ? "Currently unavailable" : "Available now"}</div>
                <div className="ls-price"><strong>${Number(l.price).toLocaleString()}</strong> month</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}