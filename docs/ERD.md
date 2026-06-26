# ScratchIO CRM - Entity Relationship Diagram

## Business Flow

```
Lead → Deal → Client → Project → Invoice → Payment
```

## ERD Diagram

```mermaid
erDiagram
    USERS ||--o{ LEADS : "assigned_to / created_by"
    USERS ||--o{ DEALS : "assigned_to / created_by"
    USERS ||--o{ CLIENTS : "assigned_to / created_by"
    USERS ||--o{ TASKS : "assigned_to / created_by"
    USERS ||--o{ PROJECTS : "manager / created_by"
    USERS ||--o{ INVOICES : "created_by"
    USERS ||--o{ PAYMENTS : "created_by"
    USERS ||--o{ ACTIVITIES : "performed_by"
    USERS }o--o{ PROJECTS : "team_members"

    LEADS ||--o| CLIENTS : "converts_to"
    LEADS ||--o{ DEALS : "has"
    LEADS ||--o{ TASKS : "related"

    CLIENTS ||--o{ DEALS : "has"
    CLIENTS ||--o{ PROJECTS : "has"
    CLIENTS ||--o{ INVOICES : "billed_to"
    CLIENTS ||--o{ TASKS : "related"

    DEALS ||--o{ PROJECTS : "generates"
    DEALS ||--o{ TASKS : "related"

    PROJECTS ||--o{ INVOICES : "billed_for"
    PROJECTS ||--o{ TASKS : "related"

    INVOICES ||--o{ PAYMENTS : "receives"

    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar first_name
        varchar last_name
        varchar role
        boolean is_active
    }

    LEADS {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar email
        varchar company
        varchar source
        varchar status
        bigint assigned_to_id FK
    }

    CLIENTS {
        bigint id PK
        bigint lead_id FK
        varchar company_name
        varchar contact_name
        varchar email
        bigint assigned_to_id FK
    }

    DEALS {
        bigint id PK
        varchar title
        decimal value
        varchar stage
        date expected_close_date
        bigint lead_id FK
        bigint client_id FK
        bigint assigned_to_id FK
    }

    TASKS {
        bigint id PK
        varchar title
        timestamp due_date
        varchar priority
        varchar status
        bigint assigned_to_id FK
        bigint lead_id FK
        bigint deal_id FK
        bigint client_id FK
        bigint project_id FK
    }

    PROJECTS {
        bigint id PK
        varchar name
        varchar status
        int progress
        date start_date
        date end_date
        bigint client_id FK
        bigint deal_id FK
        bigint manager_id FK
    }

    INVOICES {
        bigint id PK
        varchar invoice_number UK
        bigint client_id FK
        bigint project_id FK
        decimal total_amount
        date due_date
        varchar status
    }

    PAYMENTS {
        bigint id PK
        bigint invoice_id FK
        decimal amount
        date payment_date
        varchar payment_method
    }

    ACTIVITIES {
        bigint id PK
        varchar type
        varchar title
        varchar entity_type
        bigint entity_id
        bigint user_id FK
        timestamp created_at
    }
```

## Table Relationships Summary

| Parent | Child | Relationship | Description |
|--------|-------|--------------|-------------|
| users | leads | 1:N | User assigned/created leads |
| users | deals | 1:N | User assigned/created deals |
| users | clients | 1:N | User assigned/created clients |
| users | tasks | 1:N | User assigned/created tasks |
| users | projects | 1:N | User manages/creates projects |
| users | projects | M:N | Team members via project_members |
| leads | clients | 1:1 | Lead converts to client |
| leads | deals | 1:N | Lead associated with deals |
| clients | deals | 1:N | Client has deals |
| clients | projects | 1:N | Client has projects |
| clients | invoices | 1:N | Client receives invoices |
| deals | projects | 1:N | Won deal spawns project |
| projects | invoices | 1:N | Project generates invoices |
| invoices | payments | 1:N | Invoice receives payments |

## Enum Values

### Lead Status
`NEW` → `CONTACTED` → `MEETING_SCHEDULED` → `PROPOSAL_SENT` → `WON` / `LOST`

### Deal Stage
`QUALIFICATION` → `PROPOSAL` → `NEGOTIATION` → `WON` / `LOST`

### Project Status
`PLANNING` → `IN_PROGRESS` → `COMPLETED` / `ON_HOLD`

### Invoice Status
`DRAFT` → `SENT` → `PAID` / `OVERDUE`

### User Roles
`ADMIN` | `MANAGER` | `SALES_EXECUTIVE`
