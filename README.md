# Off-Campus Housing Management System (Verified Housing for Students & Workers)
- Nguyen Van Duy Anh
- Tran Anh Chuong (Chun)
- Duong Hien Chi Kien

## 1) Brief Description (Problem + Solution)
**Problem:** Students and workers near universities/industrial zones often find housing through Facebook/Zalo groups. This leads to unverified listings, inconsistent information, no contract standardization, and difficult handling of disputes/safety/maintenance issues.

**Solution:** This project builds an **Off-Campus Housing Management System** that connects:
- **Landlords** (create/manage listings, handle contracts, respond to issues)
- **Students/Workers** (search verified listings, submit rental requests, sign contracts, report issues)
- **University Admin / Industrial Park Management** (verify landlords/properties, manage incidents and trust)

Key focus: **verified listings, structured contracts, and issue/incident workflows**.

---

## 2) Functional Requirements
### 2.1 User & Access
- User registration/login (Landlord / Tenant / Admin roles)
- Profile management (contact info, affiliation if applicable)
- Role-based dashboards and permissions

### 2.2 Listings & Search
- Landlord can create/update/delete listings (property/room, price, deposit, availability, amenities)
- Tenant can browse/search/filter listings (price, distance, type, availability, amenities)
- Listing verification badge (Verified / Pending / Rejected)

### 2.3 Rental Requests & Contracting
- Tenant submits rental requests to a listing
- Landlord can accept/reject requests
- Generate a contract from an accepted request
- Contract lifecycle: `DRAFT -> SENT -> SIGNED -> ACTIVE -> TERMINATED`
- Support shared housing: multiple tenants in one contract (contract-tenants)

### 2.4 Issue Reporting (Incidents / Maintenance / Disputes)
- Tenant or landlord can create issue reports linked to a contract
- Issue categorization (maintenance, safety, noise, scam, hygiene, dispute)
- Admin can triage/assign issues; track status + resolution time
- Evidence attachments (photos/documents) for issue reports (metadata + file links)

### 2.5 Reviews & Feedback (Verified Stays)
- Tenants can review listing/landlord **only after a valid contract**
- Ratings + comments, with "verified stay" derived from contract

### 2.6 Admin Verification & Governance
- Admin verifies landlords and/or properties (inspection/approval workflow)
- Admin analytics dashboard (verification stats, incident counts, response time)

---

## 3) Non-Functional Requirements
- **Data Integrity:** FK constraints, unique constraints, NOT NULL, controlled status enums
- **3NF Design:** minimize redundancy (use IDs instead of duplicated username/email in tables)
- **Security:** RBAC (roles/privileges), password hashing, least-privilege DB users
- **Reliability:** audit logs for critical actions (contract state changes, issue resolution)
- **Performance:** indexes on common filters and joins; evidence of query optimization
- **Scalability:** design supports multiple organizations (universities/industrial zones)
- **Maintainability:** clean schema naming conventions; predictable repository structure
- **Web Integration:** CRUD interface + API endpoints + validation to prevent SQL injection
- **Testing:** unit + integration tests; test dataset; reproducible scripts

---

## 4) Planned Core Entities (Brief Outline)
> Final ERD will include at least **4+ entities** (requirement), but our MVP includes more for realism.

### Core
- **users**: accounts, roles (landlord/tenant/admin), status
- **organizations**: university/industrial park/company (optional but recommended)
- **user_affiliations**: links users to organizations (verification context)
- **properties**: owned by landlord, address, zone/org association
- **rooms**: belongs to a property, capacity, base rent
- **listings**: references either a property or a room (exactly one), price/deposit/status
- **rental_requests**: tenant requests a listing; status tracking
- **contracts**: created from accepted request; rent/deposit/dates/status
- **contract_tenants**: many-to-many for shared contracts
- **issue_reports**: incidents linked to contract, status, severity, assignment
- **issue_attachments**: file metadata for issues (URL/path + uploader)
- **reviews**: contract-bound reviews; rating/comment; target type (listing/landlord)
- **verifications**: admin verification workflow for landlord/property/listing
- **audit_logs**: records important actions for accountability

---

## 5) Tech Stack
**Database:** MySQL 8
**Backend API:** Node.js + Express (or Flask)  
**Frontend:** React (or simple server-rendered pages if scope is tight)  
**Auth:** JWT/session + bcrypt password hashing  
**ORM (optional):** Prisma / Sequelize (or raw SQL with prepared statements)  
**DevOps:** Docker + docker-compose (recommended for reproducibility)  
**Testing:** Postman collection + backend unit tests (Jest/PyTest)
**Real-time Communication:** Socket.IO for WebSocket support

---

## 6) Team Members and Roles
- **Member 1 (Nguyen Van Duy Anh):** Project Manager + Requirements + Documentation, QA/Security (test plan, SQL injection prevention, RBAC)
- **Member 2 (Duong Hien Chi Kien):** Database Architect (ERD, normalization, DDL, views, indexes)
- **Member 3 (Tran Anh Chuong):** Backend Developer (API, procedures integration, auth), Frontend Developer (UI, CRUD flows, admin dashChuong

---

## 7) Timeline (Planned Milestones)
### Milestone 1 — Team registration & topic selection (**Dec 1, 2025**)
**Deliverables/Notes:**
- Finalize project scope + roles
- Confirm MVP workflows (listing → request → contract → issue → review)
- Initial ERD draft (rough) and repository setup

### Milestone 2 — Peer review of proposals (**Dec 8, 2025**)
**Deliverables/Notes:**
- One-page proposal + refined ERD (entities + relationships + cardinalities)
- Risk list (scope risks, schedule risks)
- Incorporate feedback: clarify verification + contract parties + issue workflow

### Milestone 3 — Submit design document (ERD, DDL, task division) (**Dec 15, 2025**)
**Deliverables/Notes:**
- ERD final (4+ entities, normalized to 3NF)
- Accurate DDL scripts (tables + constraints + indexes)
- Include:
  - **≥ 1 view**
  - Plan for **≥ 2 stored procedures**
  - Plan for **≥ 1 trigger**
- Task breakdown by teammate + start implementing DB

### Milestone 4 — Final submission & presentation slides (**Dec 22, 2025**)
**Deliverables/Notes:**
- Working web app (CRUD + key workflows)
- Demonstrate:
  - Views
  - 2 procedures
  - 1 trigger
  - Indexing/optimization evidence (EXPLAIN, before/after timing, etc.)
  - Security configuration (roles/privileges, prepared statements, hashing/encryption)
- Slides: architecture, ERD, demo flow, performance + security highlights
- Final report + reproducible setup steps

---

## 8) Academic / Evaluation Requirements Checklist (Rubric Alignment)
### 8.1 Conceptual & Physical Design (4 pts)
- [ ] Requirements documented
- [ ] ERD with **4+ entities**
- [ ] 3NF (avoid redundant username/email copies across tables)
- [ ] Accurate DDL

### 8.2 Implementation of DB Entities (4 pts)
- [ ] Tables implemented
- [ ] **Views** implemented
- [ ] **≥ 2 stored procedures**
- [ ] **≥ 1 trigger**

### 8.3 Performance Tuning (3 pts)
- [ ] Indexes (FK indexes + search filters)
- [ ] Query optimization evidence (EXPLAIN / before-after comparisons)
- [ ] Optional: partitioning (issues/contracts by date) if dataset grows

### 8.4 Security Configuration (3 pts)
- [ ] DB roles/privileges (least privilege)
- [ ] Encryption/hashing strategy (passwords + sensitive fields as needed)
- [ ] SQL injection prevention (prepared statements / ORM)

### 8.5 Testing & Web Integration (4 pts)
- [ ] Functional website + CRUD
- [ ] Analytics queries (admin dashboard)
- [ ] Thorough testing (test cases + screenshots/logs)

### 8.6 Presentation & Documentation (2 pts)
- [ ] Clear architecture + reproducible code (README + scripts)
- [ ] Slides & report included

---

## 9) Repository Structure (Suggested)

## 10) How to Run (Example)
1. Create database and user (MySQL)
2. Run `/db/schema.sql`, then `/db/seed.sql`
3. Start backend (`/api`)
4. Start frontend (`/web`)
5. Open app in browser and test core flows

---

## 11) Core MVP Demo Flow (What we will show)
1) Admin verifies landlord/property → listing becomes "Verified"  
2) Tenant searches → submits rental request  
3) Landlord accepts → contract created → signatures recorded  
4) Tenant reports an issue → admin assigns → resolution tracked  
5) Tenant submits review (only after contract)

---

## 12) Complete Web Application Features

### 12.1 Authentication & User Management
- **User Registration**: Multi-role registration (Landlord, Tenant, Admin)
- **User Login**: JWT-based authentication with secure password hashing (bcrypt)
- **Profile Management**: Users can update their profile information (name, email, phone)
- **Role-Based Access Control (RBAC)**: Different dashboards and permissions for each role
- **User Status Management**: Admin can activate, suspend, or delete user accounts
- **Real-time User Updates**: WebSocket notifications for user status changes, profile updates, and deletions

### 12.2 Property & Listing Management
- **Property Creation**: Landlords can create properties with address, coordinates, and description
- **Room Management**: Create and manage individual rooms within properties
- **Listing Creation**: Create listings for entire properties or individual rooms
- **Listing Features**: JSON-based features/amenities system (utilities, parking, etc.)
- **Listing Status Workflow**: `pending_verification` → `verified` → `available` → `rented` → `inactive`
- **Advanced Search & Filtering**: 
  - Filter by price range (min/max)
  - Filter by listing type (room vs whole property)
  - Filter by status (verified, available, etc.)
  - Text search across property addresses and descriptions
- **Real-time Listing Updates**: WebSocket notifications for listing creation, updates, and deletions

### 12.3 Rental Request System
- **Request Submission**: Tenants can submit rental requests with messages and desired move-in dates
- **Request Management**: Landlords can view, accept, or reject rental requests
- **Request Status Tracking**: `pending` → `accepted`/`rejected`/`cancelled`
- **Duplicate Prevention**: System prevents multiple pending requests for the same listing
- **Real-time Notifications**: Landlords receive instant WebSocket notifications when new rental requests are created

### 12.4 Contract Management
- **Contract Creation**: Generate contracts from accepted rental requests
- **Multi-Tenant Support**: Support for shared housing with multiple tenants per contract
- **Contract Lifecycle**: `DRAFT` → `SENT` → `SIGNED` → `ACTIVE` → `TERMINATED`/`CANCELLED`
- **Digital Signatures**: Track signatures from both landlords and tenants
- **Contract Terms**: Manage rent, deposit, start date, and end date
- **Proposed End Date System**: Landlords and tenants can propose contract end dates for negotiation
- **Contract Signing**: Both parties must sign before contract becomes active
- **Automatic Listing Update**: Trigger automatically marks listing as "rented" when contract becomes active

### 12.5 Issue Reporting & Management
- **Issue Creation**: Tenants and landlords can report issues linked to active contracts
- **Issue Categories**: 
  - Maintenance
  - Safety
  - Noise
  - Scam
  - Hygiene
  - Contract Dispute
  - Other
- **Severity Levels**: Low, Medium, High, Critical
- **Issue Status Workflow**: `open` → `triaged` → `in_progress` → `resolved`/`rejected`
- **Issue Assignment**: Admin can assign issues to specific users
- **SLA Tracking**: Track resolution time against SLA hours
- **Issue Attachments**: Support for file attachments (photos/documents) as evidence
- **Status History**: Complete audit trail of issue status changes

### 12.6 Review System
- **Contract-Bound Reviews**: Reviews can only be created after a valid contract exists
- **Multi-Target Reviews**: Review listings, landlords, properties, or rooms
- **Rating System**: 1-5 star rating system
- **Review Aggregation**: Automatic calculation of average ratings and review counts
- **Duplicate Prevention**: One review per target per contract

### 12.7 Verification System
- **Landlord Verification**: Admin can verify landlord accounts
- **Property Verification**: Admin can verify properties
- **Listing Verification**: Admin can verify listings (changes status to "verified")
- **Verification Workflow**: `pending` → `verified`/`rejected`
- **Verification Notes**: Admin can add notes during verification process

### 12.8 Organization Management
- **Organization Types**: University, Industrial Park, Company
- **User Affiliations**: Link users to organizations
- **Affiliation Status**: `pending` → `verified`/`rejected`
- **Organization-Based Properties**: Properties can be associated with organizations

### 12.9 Admin Dashboard & Analytics

#### 12.9.1 Financial Performance Analytics
- **Monthly Revenue Tracking**: View revenue by month with cumulative totals
- **Revenue Charts**: Interactive charts showing monthly income and cumulative revenue trends
- **Key Performance Indicators (KPIs)**:
  - Total Revenue (all-time earnings from contracts)
  - Best Performing Month
  - Month-over-Month Growth
- **SQL Window Functions**: Uses advanced SQL window functions for running totals and cumulative calculations
- **Real-time Data**: Financial data updates in real-time as contracts are created and activated

#### 12.9.2 Issue Analytics Dashboard
- **Issue Statistics by Category**: 
  - Uses SQL `GROUP BY WITH ROLLUP` for category aggregation
  - Visual pie charts showing distribution of issues by category
- **Severity Analysis**: Bar charts showing issue distribution by severity level
- **Key Metrics**:
  - Total Reports
  - Active Issues
  - Critical Alerts
  - Resolution Rate
- **Recent Reports Table**: View latest issue reports with full details
- **Category Breakdown**: Visual representation of maintenance, safety, noise, and other issue types

#### 12.9.3 User Management
- **User List**: View all registered users with search and filter capabilities
- **User Status Management**: Activate, suspend, or delete users
- **Role Management**: View and manage user roles
- **Real-time Updates**: WebSocket notifications for user changes

#### 12.9.4 Verification Center
- **Pending Verifications**: View all pending landlord, property, and listing verifications
- **Verification Actions**: Approve or reject verifications with notes
- **Verification History**: Track all verification actions

### 12.10 Role-Based Dashboards

#### Tenant Dashboard
- View rental requests status
- View active contracts
- Report issues
- Search and browse listings
- Manage profile

#### Landlord Dashboard
- View property listings
- Manage rental requests (accept/reject)
- View contracts
- Track issues related to properties
- Create new listings
- View statistics (listings count, pending requests, active issues)

#### Admin Dashboard
- System overview with key statistics
- Financial performance analytics
- Issue analytics and management
- User management
- Verification center
- Platform-wide analytics

---

## 13) WebSocket Real-Time Features

The application implements **Socket.IO** for real-time bidirectional communication between the server and clients, enabling instant updates without page refreshes.

### 13.1 Real-Time Listing Updates
- **Event: `listing_created`**: When a landlord creates a new listing, all tenants browsing listings see it instantly
- **Event: `listing_updated`**: When admin verifies a listing or landlord updates listing details, changes appear immediately
- **Event: `listing_deleted`**: When a listing is deleted, it's removed from all tenant views in real-time
- **Implementation**: Used in `ListingSearch.jsx` for tenant browsing experience

### 13.2 Real-Time Rental Request Notifications
- **Event: `rental_request_created`**: When a tenant submits a rental request, the landlord's dashboard updates instantly
- **Implementation**: Used in `LandlordDashboard.jsx` to show new requests without refresh
- **Auto-Update**: Recent requests list and statistics counter update automatically

### 13.3 Real-Time User Management
- **Event: `user_created`**: New user registrations appear in admin panel immediately
- **Event: `user_updated`**: Profile updates reflected across all admin views
- **Event: `user_status_changed`**: User status changes (active/suspended) update in real-time
- **Event: `user_deleted`**: Deleted users are removed from admin views instantly
- **Implementation**: Used in `UserManagement.jsx` for seamless admin experience

### 13.4 WebSocket Architecture
- **Backend**: Socket.IO server integrated with Express.js HTTP server
- **Frontend**: Socket.IO client with automatic reconnection
- **Connection Management**: Automatic connection handling with WebSocket transport
- **Event Broadcasting**: Server emits events to all connected clients or specific rooms
- **Error Handling**: Graceful fallback and reconnection on connection loss

### 13.5 Benefits
- **Improved User Experience**: No need to refresh pages to see updates
- **Instant Notifications**: Landlords see rental requests immediately
- **Live Data**: Tenants see new listings as they're posted
- **Collaborative Feel**: Multiple users see changes in real-time
- **Reduced Server Load**: Efficient push-based updates instead of polling

---

## 14) Full Stack Deployment

### 14.1 Production Deployment
The application is deployed as a **full-stack solution** with separate frontend and backend services:

- **Frontend**: Deployed on Vercel at `https://vinhousingg.vercel.app`
- **Backend API**: Deployed separately (configured for production environment)
- **Database**: MySQL 8.0+ hosted on production server

### 14.2 Deployment Architecture
```
┌─────────────────┐
│   Frontend      │  React App (Vercel)
│   (Vercel)      │  Port: 3001 (dev) / Production URL
└────────┬─────────┘
        │ HTTP/HTTPS
        │ REST API + WebSocket
┌───────▼─────────┐
│   Backend API   │  Node.js + Express
│   (Production)  │  Port: 3000 (dev) / Production Port
└────────┬─────────┘
        │ MySQL Protocol
┌───────▼─────────┐
│   Database      │  MySQL 8.0+
│   (Production)  │  VinHousing Database
└─────────────────┘
```

### 14.3 Environment Configuration
- **Frontend Environment Variables**:
  - `REACT_APP_API_URL`: Backend API URL (production or localhost)
- **Backend Environment Variables**:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`: Secret key for JWT token generation
  - `PORT`: Server port (default: 3000)
  - `CORS_ORIGIN`: Allowed frontend origin
  - `CLIENT_URL`: WebSocket client URL

### 14.4 Deployment Features
- **CORS Configuration**: Properly configured for cross-origin requests
- **WebSocket Support**: Socket.IO configured for production with proper CORS
- **Database Connection Pooling**: Optimized connection management
- **Error Handling**: Comprehensive error handling and logging
- **Security**: JWT authentication, password hashing, SQL injection prevention

---

## 15) Admin Dashboard - Financial Performance Analytics

The admin dashboard provides comprehensive financial analytics based on contract data and issue reports, enabling data-driven decision making.

### 15.1 Financial Performance Dashboard

#### 15.1.1 Revenue Analytics
- **Monthly Revenue Breakdown**: 
  - Monthly income from all active contracts
  - Cumulative revenue using SQL window functions (running totals)
  - Growth trends and month-over-month comparisons
- **Visual Charts**:
  - Bar chart showing monthly revenue
  - Line chart showing cumulative revenue trend
  - Interactive tooltips with detailed information
- **Key Metrics Display**:
  - Total Revenue (all-time)
  - Best Performing Month
  - Growth indicators (positive/negative)
- **Data Source**: Contracts table with `status = 'active'` and `rent` field

#### 15.1.2 SQL Implementation
The financial analytics use advanced SQL features:
- **Window Functions**: `SUM() OVER (ORDER BY month)` for cumulative totals
- **GROUP BY**: Monthly aggregation of contract revenue
- **Date Functions**: Month extraction and formatting for grouping

### 15.2 Issue Report Analytics

#### 15.2.1 Issue Statistics Dashboard
- **Category Breakdown**: 
  - Uses SQL `GROUP BY WITH ROLLUP` to aggregate issues by category
  - Shows total count per category plus grand total
  - Categories: Maintenance, Safety, Noise, Scam, Hygiene, Contract Dispute, Other
- **Severity Analysis**:
  - Distribution of issues by severity (Critical, High, Medium, Low)
  - Visual bar charts for easy understanding
- **Visual Representations**:
  - Pie chart for category distribution
  - Bar chart for severity levels
  - Color-coded severity badges
- **Key Performance Indicators**:
  - Total Reports
  - Active Issues count
  - Critical Alerts count
  - Resolution Rate percentage

#### 15.2.2 Issue Management Features
- **Recent Reports Table**: View latest 10 issue reports with:
  - Issue ID
  - Category
  - Title and Description
  - Severity badge
  - Status indicator
  - Creation date
- **Real-time Updates**: Dashboard refreshes to show latest issues
- **Filtering**: Filter by category, severity, or status

### 15.3 Analytics API Endpoints
- `GET /api/analytics/revenue`: Returns monthly revenue with cumulative totals
- `GET /api/analytics/issues`: Returns issue statistics grouped by category
- `GET /api/analytics/users`: Returns user growth statistics (optional)

### 15.4 Business Intelligence Features
- **Trend Analysis**: Identify revenue trends and issue patterns
- **Performance Monitoring**: Track platform health through issue metrics
- **Data-Driven Decisions**: Make informed decisions based on financial and operational data
- **Export Capabilities**: Data available via API for further analysis

### 15.5 Dashboard Navigation
- **Main Dashboard**: Overview with quick stats and links to detailed analytics
- **Financial Analytics Page**: Detailed revenue charts and tables
- **Issue Analytics Page**: Comprehensive issue breakdown and management
- **Quick Actions**: Direct links to verification center and user management

---

## 16) How to Run Locally

### 16.1 Prerequisites
- Node.js (v14 or higher)
- MySQL 8.0 or higher
- npm or yarn package manager

### 16.2 Database Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE VinHousing;
   ```

2. Run database scripts in order:
   ```bash
   mysql -u root -p VinHousing < db/schema.sql
   mysql -u root -p VinHousing < db/views.sql
   mysql -u root -p VinHousing < db/procedures.sql
   mysql -u root -p VinHousing < db/triggers.sql
   mysql -u root -p VinHousing < db/seed.sql  # Optional: test data
   ```

### 16.3 Backend Setup
1. Navigate to API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.template .env
   ```

4. Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=VinHousing
   JWT_SECRET=your_super_secret_jwt_key
   PORT=3000
   CORS_ORIGIN=http://localhost:3001
   CLIENT_URL=http://localhost:3001
   ```

5. Start backend server:
   ```bash
   npm run dev  # Development mode with auto-reload
   # OR
   npm start    # Production mode
   ```

6. Verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

### 16.4 Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   echo "REACT_APP_API_URL=http://localhost:3000" > .env
   ```

4. Start frontend development server:
   ```bash
   npm start
   ```

5. Frontend will automatically open at `http://localhost:3001`

### 16.5 Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **WebSocket**: Automatically connects to backend on port 3000

### 16.6 Default Test Accounts
After running seed data, you can use:
- **Admin**: admin@vinhousing.com / password123
- **Landlord**: landlord@example.com / password123
- **Tenant**: tenant@example.com / password123

---

## 17) API Documentation

### 17.1 Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (authenticated)

### 17.2 User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/:id/status` - Update user status (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### 17.3 Property Endpoints
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (landlord/admin)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/rooms` - Create room in property

### 17.4 Listing Endpoints
- `GET /api/listings` - Get all listings (with filters: status, price, type)
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create listing (landlord/admin)
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### 17.5 Rental Request Endpoints
- `GET /api/rental-requests` - Get all rental requests
- `GET /api/rental-requests/:id` - Get rental request by ID
- `POST /api/rental-requests` - Create rental request (tenant)
- `PUT /api/rental-requests/:id/status` - Update request status (accept/reject/cancel)

### 17.6 Contract Endpoints
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create contract (landlord/admin)
- `PUT /api/contracts/:id` - Update contract
- `POST /api/contracts/:id/sign` - Sign contract
- `POST /api/contracts/:id/proposed-end-date` - Propose contract end date

### 17.7 Issue Endpoints
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create issue report
- `PUT /api/issues/:id/status` - Update issue status
- `POST /api/issues/:id/attachments` - Add attachment to issue

### 17.8 Review Endpoints
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/stats` - Get average rating stats
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review

### 17.9 Verification Endpoints
- `GET /api/verifications` - Get all verifications
- `GET /api/verifications/:id` - Get verification by ID
- `POST /api/verifications` - Create verification (admin only)
- `PUT /api/verifications/:id` - Update verification (admin only)

### 17.10 Analytics Endpoints (Admin Only)
- `GET /api/analytics/revenue` - Get revenue analytics with monthly breakdown
- `GET /api/analytics/issues` - Get issue statistics by category
- `GET /api/analytics/users` - Get user growth statistics

### 17.11 Authentication
Most endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 18) Database Features

### 18.1 Views
- `v_searchable_listings`: Comprehensive listing view with property and room details
- `v_user_trust_score`: User trustworthiness metrics based on verifications and strikes
- Additional views for reporting and analytics

### 18.2 Stored Procedures
- `sp_create_rental_request`: Validates and creates rental requests with business logic
- `sp_change_issue_status`: Manages issue status transitions with audit logging

### 18.3 Triggers
- `trg_contract_activate`: Automatically updates listing status to "rented" when contract becomes active and sets signed_at timestamp

### 18.4 Indexes
- Foreign key indexes for performance
- Search filter indexes (status, price, dates)
- Composite indexes for common query patterns

---

## 19) Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for tenant, landlord, and admin
- **SQL Injection Prevention**: Prepared statements for all database queries
- **Input Validation**: express-validator for request validation
- **CORS Configuration**: Properly configured for security
- **Audit Logging**: Track critical actions in audit_logs table
