-- ScratchIO CRM - PostgreSQL Database Schema
-- Run: psql -U postgres -f schema.sql

CREATE DATABASE scratchio_crm;
\c scratchio_crm;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(50) NOT NULL DEFAULT 'SALES_EXECUTIVE',
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    reset_token     VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'MANAGER', 'SALES_EXECUTIVE'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    company         VARCHAR(255),
    job_title       VARCHAR(100),
    source          VARCHAR(100),
    status          VARCHAR(50) NOT NULL DEFAULT 'NEW',
    notes           TEXT,
    assigned_to_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_lead_status CHECK (status IN (
        'NEW', 'CONTACTED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST'
    ))
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to_id);
CREATE INDEX idx_leads_company ON leads(company);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
    id              BIGSERIAL PRIMARY KEY,
    lead_id         BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    company_name    VARCHAR(255) NOT NULL,
    contact_name    VARCHAR(200) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    website         VARCHAR(500),
    industry        VARCHAR(100),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    postal_code     VARCHAR(20),
    notes           TEXT,
    assigned_to_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_company ON clients(company_name);
CREATE INDEX idx_clients_assigned ON clients(assigned_to_id);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE deals (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    value               DECIMAL(15, 2) NOT NULL DEFAULT 0,
    stage               VARCHAR(50) NOT NULL DEFAULT 'QUALIFICATION',
    expected_close_date DATE,
    lead_id             BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    client_id           BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    assigned_to_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_deal_stage CHECK (stage IN (
        'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'
    ))
);

CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_assigned ON deals(assigned_to_id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMP,
    priority        VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reminder_at     TIMESTAMP,
    assigned_to_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    lead_id         BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    deal_id         BIGINT REFERENCES deals(id) ON DELETE SET NULL,
    client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    project_id      BIGINT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    CONSTRAINT chk_task_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    progress        INTEGER NOT NULL DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    client_id       BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    deal_id         BIGINT REFERENCES deals(id) ON DELETE SET NULL,
    manager_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_project_status CHECK (status IN (
        'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'
    )),
    CONSTRAINT chk_project_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_id);

-- Add FK for tasks.project_id
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- ============================================================
-- PROJECT TEAM MEMBERS
-- ============================================================
CREATE TABLE project_members (
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(50) DEFAULT 'MEMBER',
    joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
    id              BIGSERIAL PRIMARY KEY,
    invoice_number  VARCHAR(50) NOT NULL UNIQUE,
    client_id       BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    project_id      BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    amount          DECIMAL(15, 2) NOT NULL,
    tax_amount      DECIMAL(15, 2) DEFAULT 0,
    total_amount    DECIMAL(15, 2) NOT NULL,
    due_date        DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes           TEXT,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_invoice_status CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE'))
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    amount          DECIMAL(15, 2) NOT NULL,
    payment_date    DATE NOT NULL,
    payment_method  VARCHAR(50),
    reference       VARCHAR(100),
    notes           TEXT,
    created_by_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ============================================================
-- ACTIVITIES (Audit / Timeline)
-- ============================================================
CREATE TABLE activities (
    id              BIGSERIAL PRIMARY KEY,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT NOT NULL,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Default admin: admin@scratchio.com / Admin@123
INSERT INTO users (email, password, first_name, last_name, role)
VALUES (
    'admin@scratchio.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    'ADMIN'
);
