-- =====================================================================
-- RentEase: Property & PG Management System
-- DBMS Project (AP) — CP3: SQL Queries
-- Course: Database Management Systems (DBMS)
-- Team: T0084 (Dhanaya Khaspuri, Mahika Garg, Ishan Bansal, Saumya Madan)
-- Database: PostgreSQL 15+
--
-- Format: Each query is labelled READ or WRITE with an id (R1, R2…, W1…).
-- These are the actual queries executed by the RentEase application.
-- =====================================================================

-- =====================================================================
-- READ QUERIES
-- =====================================================================

-- R1 READ
-- Login: look up a user by email for authentication
SELECT id, name, email, password_hash, role, status
FROM   users
WHERE  email = 'tenant@example.com';

-- R2 READ
-- Profile: fetch full profile of a logged-in user by id
SELECT id, name, email, phone, role, status, created_at, updated_at
FROM   users
WHERE  id = 'user-uuid-here';

-- R3 READ
-- Owner dashboard: list all properties owned by a specific owner
SELECT p.id,
       p.name,
       p.location,
       p.type,
       p.total_rooms,
       p.amenities,
       p.manager_phone,
       p.created_at
FROM   properties p
WHERE  p.owner_id = 'owner-uuid-here'
ORDER  BY p.created_at DESC;

-- R4 READ
-- Room list: all rooms for a given property with occupancy status
SELECT r.id,
       r.room_number,
       r.floor,
       r.capacity,
       r.occupied,
       r.rent,
       r.type,
       r.has_ac,
       r.has_attached_bath,
       (r.capacity - r.occupied) AS available_beds
FROM   rooms r
WHERE  r.property_id = 'property-uuid-here'
ORDER  BY r.floor, r.room_number;

-- R5 READ
-- Tenant dashboard: get the active lease for the logged-in tenant
SELECT l.id           AS lease_id,
       l.start_date,
       l.end_date,
       l.monthly_rent,
       l.deposit,
       l.is_active,
       r.room_number,
       r.floor,
       r.type         AS room_type,
       r.has_ac,
       r.has_attached_bath,
       p.name         AS property_name,
       p.location,
       p.manager_phone
FROM   leases l
JOIN   rooms r      ON r.id = l.room_id
JOIN   properties p ON p.id = r.property_id
WHERE  l.tenant_id = 'tenant-uuid-here'
  AND  l.is_active = TRUE;

-- R6 READ
-- Payment history: all payments for a tenant, newest first
SELECT pay.id,
       pay.month,
       pay.due_date,
       pay.amount,
       pay.status,
       pay.payment_date,
       pay.payment_method,
       pay.transaction_id,
       pay.notes,
       p.name AS property_name,
       pay.room_number
FROM   payments pay
JOIN   properties p ON p.id = pay.property_id
WHERE  pay.tenant_id = 'tenant-uuid-here'
ORDER  BY pay.due_date DESC;

-- R7 READ
-- Owner payments view: all payments for a specific property
SELECT pay.id,
       u.name         AS tenant_name,
       u.phone        AS tenant_phone,
       pay.room_number,
       pay.month,
       pay.due_date,
       pay.amount,
       pay.status,
       pay.payment_date,
       pay.payment_method,
       pay.transaction_id
FROM   payments pay
JOIN   users u ON u.id = pay.tenant_id
WHERE  pay.property_id = 'property-uuid-here'
ORDER  BY pay.due_date DESC;

-- R8 READ
-- Overdue payments: all OVERDUE or PENDING-past-due-date payments for a property
SELECT pay.id,
       u.name         AS tenant_name,
       u.phone,
       pay.room_number,
       pay.month,
       pay.due_date,
       pay.amount,
       pay.status,
       (CURRENT_DATE - pay.due_date) AS days_overdue
FROM   payments pay
JOIN   users u ON u.id = pay.tenant_id
WHERE  pay.property_id = 'property-uuid-here'
  AND  (pay.status = 'OVERDUE'
     OR (pay.status = 'PENDING' AND pay.due_date < CURRENT_DATE))
ORDER  BY days_overdue DESC;

-- R9 READ
-- Complaints list: all complaints for a property, newest first
SELECT c.id,
       u.name          AS tenant_name,
       u.phone         AS tenant_phone,
       c.room_number,
       c.category,
       c.title,
       c.description,
       c.priority,
       c.status,
       c.assigned_to,
       c.assigned_phone,
       c.resolution_notes,
       c.created_at,
       c.updated_at
FROM   complaints c
JOIN   users u ON u.id = c.tenant_id
WHERE  c.property_id = 'property-uuid-here'
ORDER  BY
    CASE c.priority
        WHEN 'URGENT' THEN 1
        WHEN 'HIGH'   THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW'    THEN 4
    END,
    c.created_at DESC;

-- R10 READ
-- Tenant complaints: complaints raised by the logged-in tenant
SELECT c.id,
       c.category,
       c.title,
       c.description,
       c.priority,
       c.status,
       c.assigned_to,
       c.resolution_notes,
       c.created_at,
       c.updated_at,
       p.name AS property_name
FROM   complaints c
JOIN   properties p ON p.id = c.property_id
WHERE  c.tenant_id = 'tenant-uuid-here'
ORDER  BY c.created_at DESC;

-- R11 READ
-- Notices: all pinned-first notices for a property
SELECT n.id,
       n.title,
       n.category,
       n.content,
       n.author,
       n.priority,
       n.is_pinned,
       n.created_at
FROM   notices n
WHERE  n.property_id = 'property-uuid-here'
ORDER  BY n.is_pinned DESC, n.created_at DESC;

-- R12 READ
-- Admin: all users on the platform with their roles and status
SELECT id, name, email, phone, role, status, created_at
FROM   users
ORDER  BY created_at DESC;

-- R13 READ
-- Owner summary: total revenue collected per property this month
SELECT p.id,
       p.name,
       p.location,
       COUNT(pay.id)       AS total_payments,
       SUM(pay.amount)     AS total_billed,
       SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END) AS collected,
       SUM(CASE WHEN pay.status IN ('PENDING','OVERDUE') THEN pay.amount ELSE 0 END) AS outstanding
FROM   properties p
LEFT   JOIN payments pay ON pay.property_id = p.id
                        AND pay.month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
WHERE  p.owner_id = 'owner-uuid-here'
GROUP  BY p.id, p.name, p.location
ORDER  BY collected DESC;

-- R14 READ
-- Occupancy report: room occupancy per property
SELECT p.id,
       p.name,
       p.total_rooms,
       SUM(r.capacity)                        AS total_beds,
       SUM(r.occupied)                        AS occupied_beds,
       SUM(r.capacity - r.occupied)           AS available_beds,
       ROUND(
           SUM(r.occupied)::NUMERIC * 100
           / NULLIF(SUM(r.capacity), 0), 2
       )                                      AS occupancy_pct
FROM   properties p
JOIN   rooms r ON r.property_id = p.id
WHERE  p.owner_id = 'owner-uuid-here'
GROUP  BY p.id, p.name, p.total_rooms
ORDER  BY occupancy_pct DESC;

-- R15 READ
-- Tenant list: all active tenants in a property with their room and lease info
SELECT u.id          AS tenant_id,
       u.name,
       u.email,
       u.phone,
       r.room_number,
       r.floor,
       r.type        AS room_type,
       l.start_date,
       l.end_date,
       l.monthly_rent,
       l.deposit,
       l.is_active
FROM   leases l
JOIN   users u      ON u.id = l.tenant_id
JOIN   rooms r      ON r.id = l.room_id
JOIN   properties p ON p.id = r.property_id
WHERE  p.id = 'property-uuid-here'
  AND  l.is_active = TRUE
ORDER  BY r.room_number;

-- =====================================================================
-- WRITE QUERIES
-- =====================================================================

-- W1 WRITE
-- Register a new user (tenant, owner, or admin)
INSERT INTO users (id, name, email, password_hash, phone, role, status)
VALUES (
    gen_random_uuid()::VARCHAR,
    'Ravi Sharma',
    'ravi@example.com',
    '$2b$10$hashedpassword',
    '+919876543210',
    'TENANT',
    'active'
);

-- W2 WRITE
-- Add a new property (called by an owner)
INSERT INTO properties (id, owner_id, name, location, type, total_rooms, amenities, manager_phone)
VALUES (
    gen_random_uuid()::VARCHAR,
    'owner-uuid-here',
    'Sunrise PG',
    'Koramangala, Bengaluru',
    'PG',
    20,
    ARRAY['WiFi', 'Meals', 'Laundry', 'CCTV'],
    '+919900112233'
);

-- W3 WRITE
-- Add a new room to a property
INSERT INTO rooms (id, property_id, room_number, floor, capacity, occupied, rent, type, has_ac, has_attached_bath)
VALUES (
    gen_random_uuid()::VARCHAR,
    'property-uuid-here',
    '101',
    1,
    3,
    0,
    8500.00,
    'Triple Sharing',
    FALSE,
    FALSE
);

-- W4 WRITE
-- Create a lease when a tenant is assigned to a room
INSERT INTO leases (id, tenant_id, room_id, start_date, end_date, monthly_rent, deposit, is_active)
VALUES (
    gen_random_uuid()::VARCHAR,
    'tenant-uuid-here',
    'room-uuid-here',
    '2026-11-01',
    '2027-10-31',
    8500.00,
    17000.00,
    TRUE
);

-- W5 WRITE
-- Update room occupancy count when a tenant is assigned
UPDATE rooms
SET    occupied = occupied + 1
WHERE  id = 'room-uuid-here'
  AND  occupied < capacity;

-- W6 WRITE
-- Generate a monthly payment record for a tenant
INSERT INTO payments (id, property_id, tenant_id, room_number, month, due_date, amount, status)
VALUES (
    gen_random_uuid()::VARCHAR,
    'property-uuid-here',
    'tenant-uuid-here',
    '101',
    '2026-11',
    '2026-11-05',
    8500.00,
    'PENDING'
);

-- W7 WRITE
-- Mark a payment as PAID after successful transaction
UPDATE payments
SET    status         = 'PAID',
       payment_date   = CURRENT_TIMESTAMP,
       payment_method = 'UPI',
       transaction_id = 'TXN20261119001',
       notes          = 'Paid via RentEase app'
WHERE  id = 'payment-uuid-here'
  AND  tenant_id = 'tenant-uuid-here';

-- W8 WRITE
-- Raise a maintenance complaint by a tenant
INSERT INTO complaints (id, property_id, tenant_id, room_number, category, title, description, priority)
VALUES (
    gen_random_uuid()::VARCHAR,
    'property-uuid-here',
    'tenant-uuid-here',
    '101',
    'Plumbing',
    'Water leakage in bathroom',
    'There is a continuous water leak from the tap in the attached bathroom since morning.',
    'HIGH'
);

-- W9 WRITE
-- Owner assigns a complaint to a maintenance person
UPDATE complaints
SET    status         = 'ASSIGNED',
       assigned_to    = 'Ramesh Plumber',
       assigned_phone = '+919911223344',
       updated_at     = CURRENT_TIMESTAMP
WHERE  id = 'complaint-uuid-here'
  AND  property_id = 'property-uuid-here';

-- W10 WRITE
-- Owner resolves a complaint
UPDATE complaints
SET    status           = 'RESOLVED',
       resolution_notes = 'Tap replaced. Issue fixed on 19-Nov-2026.',
       updated_at       = CURRENT_TIMESTAMP
WHERE  id = 'complaint-uuid-here'
  AND  property_id = 'property-uuid-here';

-- W11 WRITE
-- Owner publishes a notice to all residents of a property
INSERT INTO notices (id, property_id, title, category, content, author, priority, is_pinned)
VALUES (
    gen_random_uuid()::VARCHAR,
    'property-uuid-here',
    'Water Supply Interruption on 20-Nov',
    'Maintenance',
    'Due to pipeline maintenance, water supply will be interrupted from 10 AM to 2 PM on 20-Nov-2026. Please store water in advance.',
    'Manager Suresh',
    'High',
    TRUE
);

-- W12 WRITE
-- Deactivate a lease when tenant vacates
UPDATE leases
SET    is_active = FALSE
WHERE  id        = 'lease-uuid-here'
  AND  tenant_id = 'tenant-uuid-here';

-- W13 WRITE
-- Free up room bed count when tenant vacates
UPDATE rooms
SET    occupied = GREATEST(occupied - 1, 0)
WHERE  id = 'room-uuid-here';
