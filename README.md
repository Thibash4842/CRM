# ScratchIO CRM

Enterprise CRM SaaS application inspired by Odoo CRM, HubSpot, Zoho CRM, and WorkDo Dash.

**Business Flow:** Lead → Deal → Client → Project → Invoice → Payment

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Drag & Drop | Dnd Kit |
| Backend | Spring Boot 3.2 |
| Database | PostgreSQL |
| Auth | JWT + Spring Security |

## Features

- **Authentication** — Login, Register, Forgot Password, Role-Based Access (Admin, Manager, Sales Executive)
- **Dashboard** — KPIs, monthly sales chart, conversion rate, recent activities, upcoming tasks
- **Lead Management** — CRUD, search, filter by status/source, lead conversion
- **Deal Pipeline** — Kanban board with drag-and-drop stages
- **Client Management** — Profiles, contact details, activity timeline
- **Task Management** — Assignments, due dates, priorities, reminders
- **Project Management** — Team assignment, progress tracking, timelines
- **Invoice Management** — Generate invoices, status tracking
- **Payment Management** — Payment recording, history, outstanding amounts
- **Reports** — Revenue, sales, leads, conversion, project analytics
- **UI** — Dark mode, glassmorphism, responsive design, premium dashboard

## Project Structure

```
CRM/
├── backend/                 # Spring Boot API
│   └── src/main/java/com/scratchio/crm/
│       ├── config/          # Security, CORS, data seeding
│       ├── controller/      # REST controllers
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # JPA entities & enums
│       ├── exception/       # Global exception handling
│       ├── repository/      # Spring Data JPA repos
│       ├── security/        # JWT filter & auth
│       └── service/         # Business logic
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── components/      # UI & layout components
│       ├── context/         # Auth & theme providers
│       ├── pages/           # Route pages
│       ├── services/        # API client
│       └── utils/           # Constants & helpers
├── database/
│   └── schema.sql           # PostgreSQL schema
└── docs/
    ├── ERD.md               # Entity relationship diagram
    └── DATABASE_SCHEMA.md   # Table documentation
```

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE scratchio_crm;"

# Or run full schema
psql -U postgres -f database/schema.sql
```

Update credentials in `backend/src/main/resources/application.yml` if needed.

### Backend

```bash
cd backend
mvn spring-boot:run
```

API runs at `http://localhost:8080/api`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scratchio.com | Admin@123 |
| Manager | manager@scratchio.com | Manager@123 |
| Sales | sales@scratchio.com | Sales@123 |

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `/register`, `/forgot-password`, `/reset-password`, `GET /auth/me` |
| Dashboard | `GET /dashboard` |
| Leads | `GET/POST /leads`, `GET/PUT/DELETE /leads/{id}` |
| Deals | `GET/POST /deals`, `PATCH /deals/{id}/stage` |
| Clients | `GET/POST /clients`, `POST /clients/convert/{leadId}`, `GET /clients/{id}/timeline` |
| Tasks | `GET/POST /tasks`, `PUT/DELETE /tasks/{id}` |
| Projects | `GET/POST /projects`, `PUT/DELETE /projects/{id}` |
| Invoices | `GET/POST /invoices`, `PATCH /invoices/{id}/status` |
| Payments | `GET /payments`, `GET /payments/summary`, `POST /payments` |
| Reports | `GET /reports/{revenue,sales,leads,conversion,projects}` |
| Users | `GET /users`, `PUT/DELETE /users/{id}` (Admin/Manager) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing key | (see application.yml) |
| `MAIL_USERNAME` | SMTP username | — |
| `MAIL_PASSWORD` | SMTP password | — |
| `VITE_API_URL` | Frontend API base URL | `/api` |

## License

Proprietary — ScratchIO CRM © 2024
