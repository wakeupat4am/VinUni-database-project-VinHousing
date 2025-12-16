# SQL Database Analysis

## 📊 Database Structure Overview

### ✅ **COMPLETE: Schema (schema.sql / VinHousingDDL.sql)**

**22 Tables Organized into 9 Modules:**

#### 1. **Users & Security** (2 tables)
- `users` - Core user accounts (landlord/tenant/admin)
- `audit_logs` - Action tracking for accountability

#### 2. **Organizations & Affiliations** (2 tables)
- `organizations` - Universities/Industrial Parks/Companies
- `user_affiliations` - Links users to organizations (pending/verified/rejected)

#### 3. **Properties & Listings** (5 tables)
- `properties` - Property details (address, geo coordinates, owner)
- `rooms` - Individual rooms within properties
- `listings` - Property/room listings (exactly one of property_id OR room_id)
- `listing_features` - JSON features/amenities
- `house_rules` - Property rules text

#### 4. **Rental Workflow** (4 tables)
- `rental_requests` - Tenant requests for listings
- `contracts` - Rental contracts (draft → sent → signed → active)
- `contract_tenants` - Many-to-many: contracts ↔ tenants (shared housing)
- `contract_signatures` - E-signature tracking
- `rule_ack` - House rules acknowledgements

#### 5. **Issue Management** (3 tables)
- `issue_reports` - Maintenance/dispute reports
- `issue_attachments` - File attachments (photos/documents)
- `issue_status_history` - Status change audit trail

#### 6. **Reviews** (1 table)
- `reviews` - Contract-gated reviews (listing/landlord/property/room)

#### 7. **Verifications** (1 table)
- `verifications` - Admin verification workflow (landlord/property/listing)

#### 8. **User Preferences** (1 table)
- `user_preferences` - Tenant search preferences (budget, location, tags)

#### 9. **Moderation** (2 tables)
- `flags` - User-reported content flags
- `user_strikes` - Penalty points system

---

## ✅ **COMPLETE: Views (views.sql)**

### 1. `v_searchable_listings`
**Purpose:** Optimized view for listing search/browse
- Shows only verified listings
- Includes property address, coordinates, room name
- Calculates area for room listings
- **Used for:** Frontend search, filtering

### 2. `v_user_trust_score`
**Purpose:** Calculate user reputation/trust metrics
- Counts verified landlord verifications
- Sums strike points (negative)
- **Used for:** Admin dashboard, user credibility display

---

## ❌ **MISSING: Stored Procedures (procedures.sql)**

**File is EMPTY** - Need to create ≥2 stored procedures

### Suggested Procedures:

#### 1. `sp_create_contract_from_request`
```sql
DELIMITER //
CREATE PROCEDURE sp_create_contract_from_request(
    IN p_rental_request_id BIGINT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_rent DECIMAL(12,2),
    IN p_deposit DECIMAL(12,2),
    OUT p_contract_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_listing_id BIGINT UNSIGNED;
    DECLARE v_landlord_id BIGINT UNSIGNED;
    DECLARE v_requester_id BIGINT UNSIGNED;
    
    -- Get request details
    SELECT listing_id, requester_user_id INTO v_listing_id, v_requester_id
    FROM rental_requests WHERE id = p_rental_request_id AND status = 'accepted';
    
    -- Get landlord from listing
    SELECT owner_user_id INTO v_landlord_id
    FROM listings WHERE id = v_listing_id;
    
    -- Create contract
    INSERT INTO contracts (listing_id, landlord_user_id, start_date, end_date, rent, deposit, status)
    VALUES (v_listing_id, v_landlord_id, p_start_date, p_end_date, p_rent, p_deposit, 'draft');
    
    SET p_contract_id = LAST_INSERT_ID();
    
    -- Add tenant
    INSERT INTO contract_tenants (contract_id, tenant_user_id)
    VALUES (p_contract_id, v_requester_id);
END //
DELIMITER ;
```

#### 2. `sp_get_listing_stats`
```sql
DELIMITER //
CREATE PROCEDURE sp_get_listing_stats(
    IN p_listing_id BIGINT UNSIGNED,
    OUT p_total_requests INT,
    OUT p_accepted_requests INT,
    OUT p_active_contracts INT,
    OUT p_average_rating DECIMAL(3,2)
)
BEGIN
    SELECT COUNT(*) INTO p_total_requests
    FROM rental_requests WHERE listing_id = p_listing_id;
    
    SELECT COUNT(*) INTO p_accepted_requests
    FROM rental_requests WHERE listing_id = p_listing_id AND status = 'accepted';
    
    SELECT COUNT(*) INTO p_active_contracts
    FROM contracts c
    JOIN rental_requests rr ON c.listing_id = rr.listing_id
    WHERE c.listing_id = p_listing_id AND c.status = 'active';
    
    SELECT AVG(rating) INTO p_average_rating
    FROM reviews WHERE target_type = 'listing' AND target_id = p_listing_id;
END //
DELIMITER ;
```

---

## ❌ **MISSING: Triggers (triggers.sql)**

**File is EMPTY** - Need to create ≥1 trigger

### Suggested Triggers:

#### 1. `trg_listing_status_on_verification`
**Purpose:** Auto-update listing status when verified
```sql
DELIMITER //
CREATE TRIGGER trg_listing_status_on_verification
AFTER UPDATE ON verifications
FOR EACH ROW
BEGIN
    IF NEW.target_type = 'listing' AND NEW.status = 'verified' AND OLD.status != 'verified' THEN
        UPDATE listings SET status = 'verified' WHERE id = NEW.target_id;
    END IF;
END //
DELIMITER ;
```

#### 2. `trg_contract_status_on_all_signed`
**Purpose:** Auto-update contract to 'signed' when all parties sign
```sql
DELIMITER //
CREATE TRIGGER trg_contract_status_on_all_signed
AFTER INSERT ON contract_signatures
FOR EACH ROW
BEGIN
    DECLARE v_total_parties INT;
    DECLARE v_signed_count INT;
    
    -- Count total parties (landlord + tenants)
    SELECT COUNT(*) + 1 INTO v_total_parties
    FROM contract_tenants WHERE contract_id = NEW.contract_id;
    
    -- Count signatures
    SELECT COUNT(*) INTO v_signed_count
    FROM contract_signatures WHERE contract_id = NEW.contract_id;
    
    -- If all signed, update contract
    IF v_signed_count >= v_total_parties THEN
        UPDATE contracts 
        SET status = 'signed', signed_at = NOW()
        WHERE id = NEW.contract_id AND status != 'signed';
    END IF;
END //
DELIMITER ;
```

#### 3. `trg_audit_contract_changes`
**Purpose:** Log contract status changes to audit_logs
```sql
DELIMITER //
CREATE TRIGGER trg_audit_contract_changes
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata_json)
        VALUES (
            NEW.landlord_user_id,
            CONCAT('CONTRACT_', UPPER(NEW.status)),
            'contracts',
            NEW.id,
            JSON_OBJECT('from_status', OLD.status, 'to_status', NEW.status)
        );
    END IF;
END //
DELIMITER ;
```

---

## ❌ **MISSING: Seed Data (seed.sql)**

**File is EMPTY** - Need test data for development/testing

### Suggested Seed Data:

```sql
-- Sample Organizations
INSERT INTO organizations (name, org_type) VALUES
('VinUniversity', 'university'),
('Hanoi Industrial Park', 'industrial_park');

-- Sample Users
INSERT INTO users (email, password_hash, full_name, role, status) VALUES
('admin@vinhousing.com', '$2a$10$...', 'Admin User', 'admin', 'active'),
('landlord1@example.com', '$2a$10$...', 'John Landlord', 'landlord', 'active'),
('tenant1@example.com', '$2a$10$...', 'Jane Tenant', 'tenant', 'active');

-- Sample Properties, Listings, etc.
-- (Full seed data would go here)
```

---

## 🔍 **Key Database Features**

### Constraints & Validation
- ✅ CHECK constraints for enums (role, status, category, etc.)
- ✅ Foreign key relationships with CASCADE/RESTRICT
- ✅ Unique constraints (email, composite keys)
- ✅ Date validation (end_date >= start_date)

### Indexes (Performance)
- ✅ Foreign key indexes
- ✅ Search indexes (status, dates, entity lookups)
- ✅ Composite indexes for common queries

### Data Integrity
- ✅ Referential integrity via FKs
- ✅ Cascade deletes where appropriate
- ✅ RESTRICT on critical relationships (users, contracts)

---

## 📋 **What Needs to Be Created**

1. **Stored Procedures** (`procedures.sql`)
   - [ ] `sp_create_contract_from_request` - Contract creation workflow
   - [ ] `sp_get_listing_stats` - Analytics/statistics

2. **Triggers** (`triggers.sql`)
   - [ ] `trg_listing_status_on_verification` - Auto-update listing status
   - [ ] `trg_contract_status_on_all_signed` - Auto-complete contract signing
   - [ ] `trg_audit_contract_changes` - Audit logging

3. **Seed Data** (`seed.sql`)
   - [ ] Sample organizations
   - [ ] Sample users (admin, landlords, tenants)
   - [ ] Sample properties, listings, contracts
   - [ ] Test data for all workflows

---

## 🎯 **Next Steps**

1. **Create stored procedures** - Add business logic in database
2. **Create triggers** - Automate status updates and auditing
3. **Add seed data** - Enable testing without manual data entry
4. **Test all SQL files** - Ensure they run without errors
5. **Document procedures/triggers** - Explain what each does

