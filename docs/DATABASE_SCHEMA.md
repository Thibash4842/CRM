# ScratchIO CRM - Database Schema Documentation

## Overview

PostgreSQL database for the ScratchIO CRM enterprise SaaS application.

**Database Name:** `scratchio_crm`

## Tables

### 1. users
Authentication and role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Auto-increment ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| password | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| role | VARCHAR(50) | NOT NULL | ADMIN, MANAGER, SALES_EXECUTIVE |
| avatar_url | VARCHAR(500) | | Profile image URL |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| reset_token | VARCHAR(255) | | Password reset token |
| reset_token_expiry | TIMESTAMP | | Token expiration |
| created_at | TIMESTAMP | DEFAULT NOW | Created timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Updated timestamp |

### 2. leads
Sales leads before conversion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Lead ID |
| first_name | VARCHAR(100) | NOT NULL | Contact first name |
| last_name | VARCHAR(100) | NOT NULL | Contact last name |
| email | VARCHAR(255) | | Email address |
| phone | VARCHAR(20) | | Phone number |
| company | VARCHAR(255) | | Company name |
| job_title | VARCHAR(100) | | Job title |
| source | VARCHAR(100) | | Lead source |
| status | VARCHAR(50) | NOT NULL | Lead pipeline status |
| notes | TEXT | | Additional notes |
| assigned_to_id | BIGINT | FK → users | Assigned sales rep |
| created_by_id | BIGINT | FK → users | Creator |

**Status Values:** NEW, CONTACTED, MEETING_SCHEDULED, PROPOSAL_SENT, WON, LOST

### 3. clients
Converted leads and direct clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Client ID |
| lead_id | BIGINT | FK → leads | Source lead (if converted) |
| company_name | VARCHAR(255) | NOT NULL | Company name |
| contact_name | VARCHAR(200) | NOT NULL | Primary contact |
| email | VARCHAR(255) | | Email |
| phone | VARCHAR(20) | | Phone |
| website | VARCHAR(500) | | Website URL |
| industry | VARCHAR(100) | | Industry sector |
| address | TEXT | | Street address |
| city, state, country | VARCHAR | | Location fields |
| postal_code | VARCHAR(20) | | ZIP/postal code |
| notes | TEXT | | Client notes |

### 4. deals
Sales opportunities with pipeline stages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Deal ID |
| title | VARCHAR(255) | NOT NULL | Deal name |
| description | TEXT | | Deal details |
| value | DECIMAL(15,2) | NOT NULL | Deal monetary value |
| stage | VARCHAR(50) | NOT NULL | Pipeline stage |
| expected_close_date | DATE | | Expected close date |
| lead_id | BIGINT | FK → leads | Related lead |
| client_id | BIGINT | FK → clients | Related client |
| assigned_to_id | BIGINT | FK → users | Deal owner |

**Stage Values:** QUALIFICATION, PROPOSAL, NEGOTIATION, WON, LOST

### 5. tasks
Task management with assignments and reminders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Task ID |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | | Task details |
| due_date | TIMESTAMP | | Due date/time |
| priority | VARCHAR(20) | NOT NULL | LOW, MEDIUM, HIGH, URGENT |
| status | VARCHAR(20) | NOT NULL | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| reminder_at | TIMESTAMP | | Reminder datetime |
| assigned_to_id | BIGINT | FK → users | Assignee |
| lead/deal/client/project_id | BIGINT | FK | Related entities |

### 6. projects
Client project management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Project ID |
| name | VARCHAR(255) | NOT NULL | Project name |
| description | TEXT | | Project details |
| status | VARCHAR(50) | NOT NULL | Project status |
| progress | INTEGER | 0-100 | Completion percentage |
| start_date | DATE | | Start date |
| end_date | DATE | | End date |
| client_id | BIGINT | FK → clients | Client |
| deal_id | BIGINT | FK → deals | Source deal |
| manager_id | BIGINT | FK → users | Project manager |

**Status Values:** PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD

### 7. project_members (M:N)
| Column | Type | Constraints |
|--------|------|-------------|
| project_id | BIGINT | PK, FK → projects |
| user_id | BIGINT | PK, FK → users |
| role | VARCHAR(50) | DEFAULT 'MEMBER' |

### 8. invoices
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Invoice ID |
| invoice_number | VARCHAR(50) | NOT NULL, UNIQUE | Invoice number |
| client_id | BIGINT | FK → clients | Billed client |
| project_id | BIGINT | FK → projects | Related project |
| amount | DECIMAL(15,2) | NOT NULL | Subtotal |
| tax_amount | DECIMAL(15,2) | | Tax amount |
| total_amount | DECIMAL(15,2) | NOT NULL | Total due |
| due_date | DATE | NOT NULL | Payment due date |
| status | VARCHAR(20) | NOT NULL | DRAFT, SENT, PAID, OVERDUE |

### 9. payments
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Payment ID |
| invoice_id | BIGINT | FK → invoices | Related invoice |
| amount | DECIMAL(15,2) | NOT NULL | Payment amount |
| payment_date | DATE | NOT NULL | Date received |
| payment_method | VARCHAR(50) | | Payment method |
| reference | VARCHAR(100) | | Transaction reference |

### 10. activities
Audit trail and timeline events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Activity ID |
| type | VARCHAR(50) | NOT NULL | Activity type |
| title | VARCHAR(255) | NOT NULL | Activity title |
| description | TEXT | | Details |
| entity_type | VARCHAR(50) | NOT NULL | LEAD, DEAL, CLIENT, etc. |
| entity_id | BIGINT | NOT NULL | Related entity ID |
| user_id | BIGINT | FK → users | Actor |

## Indexes

- `users(email)`, `users(role)`
- `leads(status)`, `leads(assigned_to_id)`, `leads(company)`
- `deals(stage)`, `deals(client_id)`, `deals(assigned_to_id)`
- `clients(company_name)`, `clients(assigned_to_id)`
- `tasks(status)`, `tasks(due_date)`, `tasks(assigned_to_id)`
- `projects(status)`, `projects(client_id)`
- `invoices(status)`, `invoices(client_id)`, `invoices(invoice_number)`
- `payments(invoice_id)`, `payments(payment_date)`
- `activities(entity_type, entity_id)`, `activities(created_at DESC)`

## Setup

```bash
# Create database
psql -U postgres -f database/schema.sql
```

Or let Spring Boot auto-create tables with `spring.jpa.hibernate.ddl-auto: update`.
