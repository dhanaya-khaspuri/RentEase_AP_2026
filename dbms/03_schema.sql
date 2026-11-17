-- =====================================================================
-- RentEase: Property & PG Management System
-- DBMS Project - Application (AP) Database Schema
-- Course: Database Management Systems (DBMS)
-- Team: T0084 (RentEase)
-- Target Database: PostgreSQL 15+
-- =====================================================================

-- Clean setup
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;
DROP TYPE IF EXISTS complaint_priority CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Enum Definitions
CREATE TYPE user_role AS ENUM ('ADMIN', 'OWNER', 'TENANT');
CREATE TYPE complaint_status AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- ---------------------------------------------------------------------
-- 1. USERS
-- Stores credentials, role-based access, and contact profiles
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            VARCHAR(36) PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20) NOT NULL,
    role          user_role NOT NULL DEFAULT 'TENANT',
    status        VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_status 
        CHECK (status IN ('active', 'blocked', 'inactive'))
);

-- ---------------------------------------------------------------------
-- 2. PROPERTIES
-- Accommodations, hostels, and PGs managed by owners
-- ---------------------------------------------------------------------
CREATE TABLE properties (
    id            VARCHAR(36) PRIMARY KEY,
    owner_id      VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    location      VARCHAR(500) NOT NULL,
    type          VARCHAR(100) NOT NULL,
    total_rooms   INTEGER NOT NULL DEFAULT 0,
    amenities     TEXT[] DEFAULT ARRAY[]::TEXT[],
    manager_phone VARCHAR(20) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_properties_total_rooms 
        CHECK (total_rooms >= 0)
);

-- ---------------------------------------------------------------------
-- 3. ROOMS
-- Individual rentable inventory units inside a property
-- ---------------------------------------------------------------------
CREATE TABLE rooms (
    id                VARCHAR(36) PRIMARY KEY,
    property_id       VARCHAR(36) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number       VARCHAR(50) NOT NULL,
    floor             INTEGER NOT NULL DEFAULT 1,
    capacity          INTEGER NOT NULL DEFAULT 2,
    occupied          INTEGER NOT NULL DEFAULT 0,
    rent              NUMERIC(10, 2) NOT NULL,
    type              VARCHAR(100) NOT NULL DEFAULT 'Double Sharing',
    has_ac            BOOLEAN NOT NULL DEFAULT FALSE,
    has_attached_bath BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_rooms_capacity 
        CHECK (capacity > 0),
    CONSTRAINT chk_rooms_occupancy 
        CHECK (occupied >= 0 AND occupied <= capacity),
    CONSTRAINT chk_rooms_rent 
        CHECK (rent >= 0)
);

-- ---------------------------------------------------------------------
-- 4. LEASES
-- Rental agreements binding a tenant to a specific room
-- ---------------------------------------------------------------------
CREATE TABLE leases (
    id           VARCHAR(36) PRIMARY KEY,
    tenant_id    VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    room_id      VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    deposit      NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_lease_dates 
        CHECK (end_date >= start_date),
    CONSTRAINT chk_lease_rent 
        CHECK (monthly_rent >= 0 AND deposit >= 0)
);

-- ---------------------------------------------------------------------
-- 5. PAYMENTS
-- Rent and utility ledger transactions
-- ---------------------------------------------------------------------
CREATE TABLE payments (
    id             VARCHAR(36) PRIMARY KEY,
    property_id    VARCHAR(36) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id      VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_number    VARCHAR(50) NOT NULL,
    month          VARCHAR(30) NOT NULL,
    due_date       DATE NOT NULL,
    amount         NUMERIC(10, 2) NOT NULL,
    status         payment_status NOT NULL DEFAULT 'PENDING',
    payment_date   TIMESTAMPTZ,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_payment_amount 
        CHECK (amount >= 0),
    CONSTRAINT chk_payment_settlement 
        CHECK (status <> 'PAID' OR payment_date IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 6. COMPLAINTS
-- Maintenance and issue tickets submitted by tenants
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    id               VARCHAR(36) PRIMARY KEY,
    property_id      VARCHAR(36) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id        VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_number      VARCHAR(50) NOT NULL,
    category         VARCHAR(100) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    priority         complaint_priority NOT NULL DEFAULT 'MEDIUM',
    status           complaint_status NOT NULL DEFAULT 'PENDING',
    assigned_to      VARCHAR(255),
    assigned_phone   VARCHAR(20),
    resolution_notes TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 7. NOTICES
-- Broadcast announcements published to property residents
-- ---------------------------------------------------------------------
CREATE TABLE notices (
    id          VARCHAR(36) PRIMARY KEY,
    property_id VARCHAR(36) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    content     TEXT NOT NULL,
    author      VARCHAR(255) NOT NULL,
    priority    VARCHAR(50) NOT NULL DEFAULT 'Normal',
    is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
