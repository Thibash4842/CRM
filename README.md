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
│   ├── .env.example         # ← Copy this to .env and fill values
│   └── src/main/java/com/scratchio/crm/
│       ├── config/          # Security, CORS, env validation
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

---

## Getting Started (Local Development)

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/crm.git
cd crm
```

### 2. Set Up the Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE scratchio_crm;"
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit backend/.env with your local values
```

Your `backend/.env` should look like this:

```env
DB_URL=jdbc:postgresql://localhost:5432/scratchio_crm
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your-strong-random-secret-at-least-32-characters-long

MAIL_USERNAME=
MAIL_PASSWORD=

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

PORT=8080
```

> **Generate a strong JWT_SECRET:**
> ```bash
> # PowerShell
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
> # Or bash/Linux/Mac
> openssl rand -base64 48
> ```

### 4. Run the Backend

Load the `.env` variables, then start the server:

**PowerShell:**
```powershell
Get-Content backend/.env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object { $k,$v = $_ -split '=',2; [System.Environment]::SetEnvironmentVariable($k, $v, 'Process') }
cd backend
mvn spring-boot:run
```

**Bash / Linux / Mac:**
```bash
export $(grep -v '^#' backend/.env | xargs)
cd backend
mvn spring-boot:run
```

**IntelliJ IDEA:**
1. Open Run → Edit Configurations → your Spring Boot config
2. Add all variables from `.env` in the Environment Variables field

API runs at `http://localhost:8080/api`

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scratchio.com | Admin@123 |
| Manager | manager@scratchio.com | Manager@123 |
| Sales | sales@scratchio.com | Sales@123 |

---

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_URL` | ✅ Yes | Full JDBC PostgreSQL connection URL | — |
| `DB_USERNAME` | ✅ Yes | PostgreSQL username | — |
| `DB_PASSWORD` | ✅ Yes | PostgreSQL password | — |
| `JWT_SECRET` | ✅ Yes | JWT signing secret (min 32 chars) | — |
| `MAIL_USERNAME` | Optional | Gmail address for SMTP | empty |
| `MAIL_PASSWORD` | Optional | Gmail App Password | empty |
| `CORS_ALLOWED_ORIGINS` | Optional | Comma-separated allowed frontend URLs | `http://localhost:5173` |
| `PORT` | Optional | Server port | `8080` |

> **Note:** If any required variable (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`) is missing, the application will **fail to start** immediately with a clear error message listing which variables are missing.

---

## Deploying to Render

### Backend (Spring Boot)

1. Create a **PostgreSQL** database on Render. Note the Internal Connection URL.
2. Create a **Web Service**, connect your GitHub repo.
3. Set **Root Directory** to `backend`, **Build Command** to `mvn clean package -DskipTests`, **Start Command** to `java -jar target/crm-1.0.0.jar`.
4. Add these **Environment Variables** in Render dashboard:

| Key | Value |
|-----|-------|
| `DB_URL` | `jdbc:postgresql://<host>/<dbname>` (from Render DB Internal URL) |
| `DB_USERNAME` | From Render DB dashboard |
| `DB_PASSWORD` | From Render DB dashboard |
| `JWT_SECRET` | A strong random string (use `openssl rand -base64 48`) |
| `CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL (e.g. `https://crm.vercel.app`) |
| `MAIL_USERNAME` | Gmail address (if using email features) |
| `MAIL_PASSWORD` | Gmail App Password |

> Render automatically sets the `PORT` variable — no need to add it.

### Frontend (Vercel)

1. Create a new **Project** on Vercel, import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

---

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

---

## Security Best Practices

- ❌ **Never commit** `backend/.env` to Git — it's in `.gitignore`
- ❌ **Never hardcode** passwords or secrets in `application.yml`
- ✅ Always use a **long, random JWT_SECRET** in production (min 48 characters)
- ✅ Use **Gmail App Passwords** (not your real Gmail password) for SMTP
- ✅ Rotate credentials immediately if accidentally exposed in Git history
- ✅ In production, set `CORS_ALLOWED_ORIGINS` to only your exact frontend URL

---

## License

Proprietary — ScratchIO CRM © 2024
