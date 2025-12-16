CREATE VIEW v_searchable_listings AS
SELECT
    l.id AS listing_id,
    l.price,
    l.status,
    p.address,
    p.geo_lat,
    p.geo_lng,
    COALESCE(r.room_name, 'Whole Property') AS unit_name,
    CASE WHEN l.room_id IS NOT NULL THEN r.area_m2 ELSE NULL END AS area
FROM listings l
JOIN properties p ON l.property_id = p.id
LEFT JOIN rooms r ON l.room_id = r.id
WHERE l.status = 'verified';

CREATE VIEW v_user_trust_score AS
SELECT
    u.id,
    u.full_name,
    u.role,
    COUNT(DISTINCT v.id) AS verifications_count,
    COALESCE(SUM(s.points), 0) AS total_strike_points
FROM users u
LEFT JOIN verifications v ON u.id = v.target_id AND v.target_type = 'landlord' AND v.status = 'verified'
LEFT JOIN user_strikes s ON u.id = s.user_id
GROUP BY u.id;
