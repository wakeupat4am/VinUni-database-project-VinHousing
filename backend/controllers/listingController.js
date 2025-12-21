const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

// Get all listings with filters
const getListings = async (req, res, next) => {
  try {
    const {
      status, property_id, room_id, owner_id, 
      min_price, max_price, page = 1, limit = 20
    } = req.query;

    const limitNum = parseInt(limit, 10);
    const offsetNum = (parseInt(page, 10) - 1) * limitNum;

    // 1. Build Base Conditions
    let baseSql = ' FROM v_searchable_listings WHERE 1=1'; 
    const params = [];

    if (status) { baseSql += ' AND status = ?'; params.push(status); }
    if (owner_id) { baseSql += ' AND owner_user_id = ?'; params.push(owner_id); }
    if (min_price) { baseSql += ' AND price >= ?'; params.push(min_price); }
    if (max_price) { baseSql += ' AND price <= ?'; params.push(max_price); }

    // 2. Fetch Data (Paginated)
    const dataQuery = `SELECT * ${baseSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limitNum, offsetNum];
    const [listings] = await pool.query(dataQuery, dataParams);

    // 3. Fetch Total Count
    const countQuery = `SELECT COUNT(*) as total ${baseSql}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    res.json({ 
        listings, 
        total,
        pagination: {
            page: parseInt(page, 10),
            limit: limitNum,
            total: total,
            pages: Math.ceil(total / limitNum)
        }
    });
  } catch (error) {
    next(error);
  }
};

// Get listing by ID
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Query the VIEW to get joined data (address, features, etc.)
    const [listings] = await pool.query(
      `SELECT * FROM v_searchable_listings WHERE id = ?`,
      [id]
    );

    if (listings.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listings[0];

    // Parse features JSON safely
    try {
        if (typeof listing.features_json === 'string') {
            listing.features_json = JSON.parse(listing.features_json);
        }
    } catch (e) { listing.features_json = {}; }

    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

// Create listing
const createListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, room_id, price, deposit, available_from, features_json } = req.body;
    const owner_user_id = req.user.id;

    // Validate inputs
    if (!property_id && !room_id) {
      return res.status(400).json({ error: 'Either property_id or room_id must be provided.' });
    }

    // Verify ownership (Property)
    if (property_id) {
      const [properties] = await pool.execute(
        'SELECT owner_user_id FROM properties WHERE id = ?',
        [property_id]
      );
      if (properties.length === 0) return res.status(404).json({ error: 'Property not found.' });
      if (properties[0].owner_user_id !== owner_user_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You do not own this property.' });
      }
    }

    // Verify ownership (Room)
    if (room_id) {
      const [rooms] = await pool.execute(
        'SELECT p.owner_user_id FROM rooms r JOIN properties p ON r.property_id = p.id WHERE r.id = ?',
        [room_id]
      );
      if (rooms.length === 0) return res.status(404).json({ error: 'Room not found.' });
      if (rooms[0].owner_user_id !== owner_user_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You do not own this room.' });
      }
    }
    
    // Check for Duplicates
    const [existing] = await pool.query(
      `SELECT id FROM listings 
      WHERE property_id = ? 
      AND (room_id = ? OR (room_id IS NULL AND ? IS NULL))
      AND status IN ('verified', 'pending_verification')`,
      [property_id, room_id, room_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'An active listing already exists for this unit.' });
    }

    // Insert the Listing
    const [result] = await pool.execute(
      'INSERT INTO listings (owner_user_id, property_id, room_id, price, deposit, available_from, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [owner_user_id, property_id, room_id || null, price, deposit || 0, available_from || null, 'pending_verification']
    );

    // Insert Features
    if (features_json) {
      await pool.execute(
        'INSERT INTO listing_features (listing_id, features_json) VALUES (?, ?)',
        [result.insertId, JSON.stringify(features_json)]
      );
    }

    // ✅ WEBSOCKET UPDATE: Fetch the FULL view data to broadcast
    const [listings] = await pool.query(
      'SELECT * FROM v_searchable_listings WHERE id = ?',
      [result.insertId]
    );
    const newListing = listings[0];
    try { newListing.features_json = JSON.parse(newListing.features_json); } catch(e) {}

    // ⚡ Broadcast "New Listing" to all connected clients
    if (req.io) {
        req.io.emit('listing_created', newListing);
    }

    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (error) {
    next(error);
  }
};

// Update listing
const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, deposit, available_from, status, features_json } = req.body;

    // Check ownership
    const [listings] = await pool.execute('SELECT owner_user_id FROM listings WHERE id = ?', [id]);
    if (listings.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    if (listings[0].owner_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this listing.' });
    }

    // Dynamic SQL Update
    const updates = [];
    const params = [];
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (deposit !== undefined) { updates.push('deposit = ?'); params.push(deposit); }
    if (available_from !== undefined) { updates.push('available_from = ?'); params.push(available_from); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Update Features
    if (features_json !== undefined) {
      const [existing] = await pool.execute('SELECT listing_id FROM listing_features WHERE listing_id = ?', [id]);
      if (existing.length === 0) {
        await pool.execute('INSERT INTO listing_features (listing_id, features_json) VALUES (?, ?)', [id, JSON.stringify(features_json)]);
      } else {
        await pool.execute('UPDATE listing_features SET features_json = ? WHERE listing_id = ?', [JSON.stringify(features_json), id]);
      }
    }

    // ✅ WEBSOCKET UPDATE: Fetch the FULL view data again
    const [updated] = await pool.query(
      'SELECT * FROM v_searchable_listings WHERE id = ?',
      [id]
    );
    const updatedListing = updated[0];
    try { updatedListing.features_json = JSON.parse(updatedListing.features_json); } catch(e) {}

    // ⚡ Broadcast "Listing Updated" (e.g., Status changed to 'Verified')
    if (req.io) {
        req.io.emit('listing_updated', updatedListing);
    }

    res.json({ message: 'Listing updated successfully', listing: updatedListing });
  } catch (error) {
    next(error);
  }
};

// Delete listing
const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [listings] = await pool.execute('SELECT owner_user_id FROM listings WHERE id = ?', [id]);
    if (listings.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    if (listings[0].owner_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this listing.' });
    }

    await pool.execute('DELETE FROM listings WHERE id = ?', [id]);
    
    // Optional: Emit delete event if you want cards to disappear instantly
    if (req.io) {
        req.io.emit('listing_deleted', { id: parseInt(id) });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const createListingValidation = [
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('deposit').optional().isFloat({ min: 0 }),
  body('available_from').optional().isISO8601().toDate(),
  body('property_id').optional().isInt(),
  body('room_id').optional().isInt(),
  body('features_json').optional().isObject()
];

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createListingValidation
};