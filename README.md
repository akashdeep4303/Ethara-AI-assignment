<div align="center">

```
███████╗████████╗██╗  ██╗ █████╗ ██████╗  █████╗
██╔════╝╚══██╔══╝██║  ██║██╔══██╗██╔══██╗██╔══██╗
█████╗     ██║   ███████║███████║██████╔╝███████║
██╔══╝     ██║   ██╔══██║██╔══██║██╔══██╗██╔══██║
███████╗   ██║   ██║  ██║██║  ██║██║  ██║██║  ██║
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

**A full-stack project & team task management platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?style=for-the-badge)](https://zod.dev)

*Create projects · Assign tasks · Manage teams · Track progress*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Authentication Algorithm](#-authentication-algorithm)
- [Role & Permission System](#-role--permission-system)
- [Task Lifecycle](#-task-lifecycle)
- [API Reference](#-api-reference)
- [Local Development](#-local-development)
- [Deployment — Railway](#-deployment--railway)
- [Scripts Reference](#-scripts-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

**Ethara** is a production-ready web application for collaborative project management. It gives teams a clean, role-aware workspace where Admins control the project settings and membership, while Members stay focused on tasks assigned to them.

Built on **Next.js App Router** with **PostgreSQL** via **Prisma**, secured with **JWT cookies**, and validated end-to-end with **Zod** — Ethara is designed to be deployed in minutes on Railway or any Node-compatible host.

### Why Ethara?

| Problem | Ethara's Solution |
|---------|-------------------|
| Complex permission setups | Two clean roles: Admin & Member — nothing more |
| Bloated dashboards | Focused dashboard: overdue tasks, your assignments, status mix |
| Heavyweight infra | Single Postgres DB, zero external services |
| Slow cold starts | Next.js App Router with edge-friendly JWT auth |

---

## ✨ Features

### 🗂️ Project Management
- Create and name projects with optional descriptions
- Each project is isolated — members only see projects they belong to
- Project creator is automatically assigned the **Admin** role
- Soft permission checks at every API route

### 👥 Team & Role Management
- **Admin** — full control: invite/remove members, promote/demote roles, edit project details, delete project
- **Member** — task participation only: create tasks (self-assign or unassigned), update status/due date on owned/assigned tasks
- The system prevents a project from being left without at least one Admin
- Members must have a registered Ethara account to be invited (by exact email)

### ✅ Task System
- Tasks carry: `title`, `description`, `status`, `dueDate`, `assignee`, `creator`
- Three statuses: `TODO → IN_PROGRESS → DONE`
- Overdue detection: any non-DONE task past its due date is flagged
- Assignment rules enforced server-side — Members cannot assign to others

### 📊 Dashboard
- Cross-project aggregates in a single API call
- Status breakdown (how many TODO / IN_PROGRESS / DONE across all projects)
- Overdue task list with project context
- "Assigned to me" view for fast daily triage

### 🔐 Authentication
- Email + password registration and login
- Stateless JWT stored in a **secure, httpOnly cookie** — no session tables
- `/api/auth/me` for fast client-side session hydration
- Middleware-free: each handler verifies the JWT independently

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 15 App Router  ·  React  ·  Tailwind CSS          │
│  Client Components for forms, optimistic updates           │
├─────────────────────────────────────────────────────────────┤
│                         API LAYER                           │
│  Next.js Route Handlers (/api/**)                          │
│  Zod for request body validation                           │
│  JWT (jose) for stateless auth via cookies                 │
├─────────────────────────────────────────────────────────────┤
│                        DATA LAYER                           │
│  Prisma ORM  ·  PostgreSQL 16                              │
│  Prisma Migrate for schema versioning                      │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | Next.js 15 (App Router) | SSR, routing, API routes |
| Styling | Tailwind CSS | Utility-first CSS |
| Language | TypeScript 5 | Type safety end-to-end |
| ORM | Prisma | Database access & migrations |
| Database | PostgreSQL 16 | Relational data store |
| Auth | JWT via `jose` + httpOnly cookie | Stateless sessions |
| Validation | Zod | Schema-first request validation |
| Containerisation | Docker Compose | Local Postgres instance |
| Deployment | Railway + Dockerfile | Zero-config cloud deploy |

---

## 🏗️ Architecture

### High-Level System Diagram

```mermaid
graph TB
    Browser["🌐 Browser\n(Next.js Client)"]
    AppRouter["📁 App Router\n(Next.js Server)"]
    APIRoutes["⚙️ API Route Handlers\n/api/**"]
    JWT["🔐 JWT Middleware\n(jose + httpOnly cookie)"]
    Zod["✅ Zod Validation\nRequest schemas"]
    Prisma["🔷 Prisma ORM"]
    Postgres[("🗄️ PostgreSQL\nDatabase")]

    Browser -->|"HTTP requests\n+ cookie"| AppRouter
    AppRouter --> APIRoutes
    APIRoutes --> JWT
    JWT -->|"Verified userId"| Zod
    Zod -->|"Validated payload"| Prisma
    Prisma <-->|"SQL queries"| Postgres
    Prisma -->|"Typed result"| APIRoutes
    APIRoutes -->|"JSON response"| Browser
```

### Request Flow — Authenticated Route

```mermaid
sequenceDiagram
    participant C as 🌐 Client
    participant R as ⚙️ Route Handler
    participant J as 🔐 JWT Verifier
    participant V as ✅ Zod
    participant P as 🔷 Prisma
    participant D as 🗄️ Postgres

    C->>R: HTTP request + auth cookie
    R->>J: Extract & verify JWT
    alt Token invalid / missing
        J-->>C: 401 Unauthorized
    end
    J-->>R: { userId }
    R->>V: Validate request body
    alt Schema mismatch
        V-->>C: 400 Bad Request + errors
    end
    V-->>R: Typed, clean payload
    R->>P: Prisma query (with userId + projectId)
    P->>D: SQL
    D-->>P: Result rows
    P-->>R: Typed objects
    R-->>C: 200 JSON response
```

### Folder Structure

```
ethara/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login & register pages
│   ├── dashboard/              # Dashboard page
│   ├── projects/               # Project list + [projectId] detail
│   └── layout.tsx              # Root layout
├── api/                        # REST route handlers
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── projects/
│   │   └── [projectId]/
│   │       ├── route.ts        # GET / PATCH / DELETE project
│   │       ├── members/
│   │       │   └── [userId]/route.ts
│   │       └── tasks/
│   │           └── [taskId]/route.ts
│   └── dashboard/route.ts
├── lib/
│   ├── auth.ts                 # JWT sign / verify helpers
│   ├── db.ts                   # Prisma client singleton
│   ├── client-errors.ts        # Error parsing utilities
│   └── validations.ts          # Zod schemas
├── prisma/
│   ├── schema.prisma           # Data model
│   └── migrations/             # Migration history
├── docker-compose.yml          # Local Postgres
├── Dockerfile                  # Production image
└── railway.json                # Railway deploy config
```

---

## 🗃️ Database Schema

```mermaid
erDiagram
    User {
        string  id        PK
        string  email     UK
        string  name
        string  password
        datetime createdAt
    }

    Project {
        string  id          PK
        string  name
        string  description
        string  ownerId     FK
        datetime createdAt
    }

    ProjectMember {
        string  userId      FK
        string  projectId   FK
        enum    role        "ADMIN | MEMBER"
        datetime joinedAt
    }

    Task {
        string   id            PK
        string   title
        string   description
        enum     status        "TODO | IN_PROGRESS | DONE"
        datetime dueDate
        string   projectId     FK
        string   createdById   FK
        string   assignedToId  FK
        datetime createdAt
        datetime updatedAt
    }

    User        ||--o{ Project       : "owns"
    User        ||--o{ ProjectMember : "member of"
    Project     ||--o{ ProjectMember : "has"
    Project     ||--o{ Task          : "contains"
    User        ||--o{ Task          : "creates"
    User        ||--o{ Task          : "assigned to"
```

### Data Constraints

| Constraint | Detail |
|-----------|--------|
| `User.email` | Unique — used as login identity |
| `ProjectMember` | Composite PK `(userId, projectId)` — no duplicates |
| `Task.status` | Enum: `TODO`, `IN_PROGRESS`, `DONE` |
| `ProjectMember.role` | Enum: `ADMIN`, `MEMBER` |
| At-least-one-admin | Enforced in application logic on role changes & member removal |

---

## 🔐 Authentication Algorithm

### Registration Flow

```mermaid
flowchart TD
    A([User submits email + password + name]) --> B{Email format valid?\nZod check}
    B -- No --> C[/400: Invalid email/]
    B -- Yes --> D{Email already\nregistered?\nPrisma lookup}
    D -- Yes --> E[/409: Email already in use/]
    D -- No --> F[bcrypt.hash password\ncost factor 12]
    F --> G[Prisma: CREATE User\nid = cuid]
    G --> H[Sign JWT\npayload: userId\nexpiry: 7 days]
    H --> I[Set httpOnly Secure cookie\nsameSite=lax]
    I --> J([201: User created + session active])
```

### Login Flow

```mermaid
flowchart TD
    A([User submits email + password]) --> B{Zod schema\nvalid?}
    B -- No --> C[/400: Bad request/]
    B -- Yes --> D[Prisma: SELECT user\nWHERE email = ?]
    D --> E{User found?}
    E -- No --> F[/401: Invalid credentials/]
    E -- Yes --> G[bcrypt.compare\nsubmitted vs stored hash]
    G --> H{Passwords match?}
    H -- No --> F
    H -- Yes --> I[Sign JWT — jose SignJWT\nHS256, 7d expiry]
    I --> J[Set cookie:\nName: token\nhttpOnly: true\nSecure: true\nsameSite: lax\npath: /]
    J --> K([200: Authenticated])
```

### Session Verification (every protected route)

```mermaid
flowchart LR
    A[Incoming Request] --> B[Extract cookie 'token']
    B --> C{Cookie present?}
    C -- No --> D[/401 Unauthorized/]
    C -- Yes --> E[jose.jwtVerify\nwith JWT_SECRET]
    E --> F{Signature valid\n& not expired?}
    F -- No --> D
    F -- Yes --> G[Extract userId\nfrom payload]
    G --> H[Proceed to\nbusiness logic]
```

### Security Properties

| Property | Implementation |
|---------|---------------|
| Password storage | `bcryptjs` with cost factor 12 (~250ms hash time) |
| Token algorithm | HMAC-SHA256 (HS256) via `jose` |
| Token expiry | 7 days — sliding window on each login |
| Cookie flags | `httpOnly`, `Secure` (prod), `sameSite=lax` |
| Secret rotation | Change `JWT_SECRET` env var — all sessions invalidated immediately |
| No server-side session store | Stateless JWT — scales horizontally with zero infra |

---

## 🛡️ Role & Permission System

### Role Capability Matrix

| Action | Admin | Member |
|--------|:-----:|:------:|
| View project & tasks | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| Assign task to any member | ✅ | ❌ |
| Assign task to self | ✅ | ✅ |
| Edit any task (title, description) | ✅ | ❌ |
| Update status on own/assigned task | ✅ | ✅ |
| Update due date on own/assigned task | ✅ | ✅ |
| Delete own/assigned task | ✅ | ✅ |
| Delete any task | ✅ | ❌ |
| Invite members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Promote/demote roles | ✅ | ❌ |
| Edit project name/description | ✅ | ❌ |
| Delete project | ✅ | ❌ |

### Permission Check Algorithm

```mermaid
flowchart TD
    A([API Request: task action]) --> B[Verify JWT\nget userId]
    B --> C[Fetch ProjectMember\nWHERE userId + projectId]
    C --> D{Member record\nexists?}
    D -- No --> E[/403 Forbidden — not a member/]
    D -- Yes --> F{role = ADMIN?}
    F -- Yes --> G([✅ Allow all actions])
    F -- No --> H[/Member role/]
    H --> I{Action type?}
    I -- "Read project/tasks" --> J([✅ Allowed])
    I -- "Create task" --> K{assignedToId?}
    K -- "null or self" --> L([✅ Allowed])
    K -- "other user" --> M[/403 Members self-assign only/]
    I -- "Edit task" --> N{Task.createdById = userId\nOR Task.assignedToId = userId?}
    N -- Yes --> O{Edit field?}
    O -- "status / dueDate" --> P([✅ Allowed])
    O -- "title / description / assignee" --> Q[/403 Insufficient role/]
    N -- No --> Q
    I -- "Admin-only action" --> R[/403 Admin required/]
```

### At-Least-One-Admin Guarantee

```mermaid
flowchart TD
    A([Admin attempts: remove member\nOR demote self to Member]) --> B[Count current\nADMIN members\nin project]
    B --> C{Admin count > 1?}
    C -- Yes --> D([✅ Allow change])
    C -- No --> E{Is the target\nthe last Admin?}
    E -- Yes --> F[/400: Cannot remove last admin/]
    E -- No --> D
```

---

## 📋 Task Lifecycle

### Status State Machine

```mermaid
stateDiagram-v2
    [*] --> TODO : Task created
    TODO --> IN_PROGRESS : Work begins
    IN_PROGRESS --> DONE : Completed
    DONE --> IN_PROGRESS : Reopened
    IN_PROGRESS --> TODO : Blocked / reset
    TODO --> DONE : Quick done
    DONE --> [*] : Task deleted
```

### Full Task Lifecycle Flowchart

```mermaid
flowchart TD
    A([Task Created]) --> B{assignedToId set?}
    B -- Yes --> C[Status: TODO\nAssigned to member]
    B -- No --> D[Status: TODO\nUnassigned]
    C --> E[Member begins work]
    D --> F{Admin assigns\nmember?}
    F -- Yes --> C
    F -- No --> E
    E --> G[Status → IN_PROGRESS]
    G --> H{dueDate set?}
    H -- Yes --> I{Current time\n> dueDate AND\nstatus ≠ DONE?}
    I -- Yes --> J[🔴 Flagged OVERDUE\non dashboard]
    I -- No --> K[Normal progress]
    H -- No --> K
    K --> L[Status → DONE]
    J --> M{Reassigned or\ndue date extended?}
    M -- Yes --> K
    M -- No --> J
    L --> N([Task Complete ✅])
    G --> O{Admin deletes\nor member\ndeletes own?}
    O --> P([Task Deleted 🗑️])
```

### Overdue Detection Algorithm

```
FUNCTION detectOverdue(task):
  IF task.dueDate IS NOT NULL
    AND task.status != "DONE"
    AND NOW() > task.dueDate
  THEN
    RETURN true  → flag as overdue on dashboard
  ELSE
    RETURN false
  END
```

---

## 🌐 API Reference

### Authentication

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/api/auth/register` | ❌ | `{ email, password, name }` | `201 { user }` + sets cookie |
| `POST` | `/api/auth/login` | ❌ | `{ email, password }` | `200 { user }` + sets cookie |
| `POST` | `/api/auth/logout` | ✅ | — | `200` + clears cookie |
| `GET` | `/api/auth/me` | ✅ | — | `200 { user }` |

### Projects

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| `GET` | `/api/projects` | Member+ | — | `200 { projects[] }` |
| `POST` | `/api/projects` | Any auth | `{ name, description? }` | `201 { project }` |
| `GET` | `/api/projects/:id` | Member+ | — | `200 { project }` |
| `PATCH` | `/api/projects/:id` | Admin | `{ name?, description? }` | `200 { project }` |
| `DELETE` | `/api/projects/:id` | Admin | — | `200 { ok }` |

### Members

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| `GET` | `/api/projects/:id/members` | Member+ | — | `200 { members[] }` |
| `POST` | `/api/projects/:id/members` | Admin | `{ email, role }` | `201 { member }` |
| `PATCH` | `/api/projects/:id/members/:uid` | Admin | `{ role }` | `200 { member }` |
| `DELETE` | `/api/projects/:id/members/:uid` | Admin | — | `200 { ok }` |

### Tasks

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| `GET` | `/api/projects/:id/tasks` | Member+ | — | `200 { tasks[] }` |
| `POST` | `/api/projects/:id/tasks` | Member+ | `{ title, description?, dueDate?, assignedToId? }` | `201 { task }` |
| `PATCH` | `/api/projects/:id/tasks/:tid` | See roles | `{ status?, dueDate?, title?, description?, assignedToId? }` | `200 { task }` |
| `DELETE` | `/api/projects/:id/tasks/:tid` | Admin or owner | — | `200 { ok }` |

### Dashboard

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| `GET` | `/api/dashboard` | ✅ | `200 { statusCounts, overdueTasks[], assignedToMe[] }` |

### Dashboard Aggregation Algorithm

```
FUNCTION buildDashboard(userId):
  projects ← Prisma: SELECT all projects WHERE member = userId

  statusCounts ← { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  overdueTasks ← []
  assignedToMe ← []

  FOR EACH project IN projects:
    tasks ← Prisma: SELECT tasks WHERE projectId = project.id

    FOR EACH task IN tasks:
      statusCounts[task.status] += 1

      IF detectOverdue(task):
        overdueTasks.push({ ...task, projectName: project.name })

      IF task.assignedToId = userId AND task.status != "DONE":
        assignedToMe.push({ ...task, projectName: project.name })

  RETURN { statusCounts, overdueTasks, assignedToMe }
```

---

## 💻 Local Development

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| PostgreSQL | 14+ (local) or Docker |

---

### ⚡ Quick Setup (Postgres already running on port 5432)

```bash
# 1. Clone the repo
git clone https://github.com/your-org/ethara.git
cd ethara

# 2. Auto-configure .env, create DB, run migrations, and start dev server
npm run setup:local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're ready.

---

### 🐳 Option A — Postgres via Docker

```bash
# 1. Start Postgres container (Docker must be running)
npm run db:up

# 2. Copy environment file
cp .env.example .env
# DATABASE_URL in .env.example already matches docker-compose.yml

# 3. Install dependencies
npm ci

# 4. Apply database migrations
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Stop Postgres when done:
```bash
npm run db:down
```

---

### 🔧 Option B — Your Own Postgres Instance

1. Create a database and user in Postgres:

```sql
CREATE DATABASE ethara;
CREATE USER ethara_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ethara TO ethara_user;
```

2. Set environment variables in `.env`:

```env
DATABASE_URL="postgresql://ethara_user:your_password@localhost:5432/ethara?schema=public"
JWT_SECRET="your-super-secret-random-string-at-least-32-chars"
```

3. Run migrations and start:

```bash
npm ci
npx prisma migrate dev
npm run dev
```

---

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Full Postgres connection string |
| `JWT_SECRET` | ✅ Prod / Optional Dev | Secret for signing JWT tokens. Falls back to a dev default locally |
| `PORT` | Auto (Railway) | HTTP port — injected by Railway automatically |

---

## 🚂 Deployment — Railway

### Step-by-Step

```mermaid
flowchart LR
    A([Push to GitHub]) --> B[Connect repo\nto Railway]
    B --> C[Add PostgreSQL\nservice]
    C --> D[Attach DB →\nDATABASE_URL injected]
    D --> E[Set JWT_SECRET\nin Variables]
    E --> F[Deploy 🚀\nDockerfile builds image]
    F --> G{Startup entrypoint}
    G --> H[prisma migrate deploy]
    H --> I[next start on\nRAILWAY_PORT]
    I --> J([✅ Live at Railway URL])
```

### Detailed Steps

1. **Push to GitHub** — or use Railway CLI: `railway login && railway link`

2. **New project on Railway** → Deploy from GitHub repo

3. **Add PostgreSQL** service:
   - Click `+ New` → `Database` → `PostgreSQL`
   - Railway auto-injects `DATABASE_URL` into your web service when both services are in the same project

4. **Set `JWT_SECRET`** on the web service Variables tab:
   ```bash
   # Generate a strong secret
   openssl rand -hex 32
   ```

5. **Deploy** — Railway detects `Dockerfile` and `railway.json` automatically. The image:
   - Runs `prisma migrate deploy` on startup (safe for production — does not reset data)
   - Starts `next start` on `0.0.0.0:$PORT`

6. **Smoke test** after deploy:
   - Register two accounts
   - Create a project → add task
   - Invite second account as Member
   - Verify Member cannot invite others or change project name

---

## 📜 Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Next.js dev with hot reload |
| Dev (Turbopack) | `npm run dev:turbo` | Faster HMR via Turbopack |
| Build | `npm run build` | `prisma generate` + production build |
| Start | `npm run start` | Production server (`next start`) |
| Railway start | `npm run start:railway` | `prisma migrate deploy` then `next start` |
| Local setup | `npm run setup:local` | Auto `.env` + DB create + migrate |
| DB up | `npm run db:up` | Start Postgres Docker container |
| DB down | `npm run db:down` | Stop Postgres Docker container |
| Clean | `npm run clean` | Delete `.next` build artifacts |
| Prisma migrate | `npx prisma migrate dev` | Apply schema changes in development |
| Prisma studio | `npx prisma studio` | Visual DB browser at localhost:5555 |

> **Note:** `postinstall` runs `prisma generate` automatically — deploy platforms (Vercel, Railway, Render) will generate the Prisma client during `npm ci`.

---

## 🔍 Troubleshooting

### `ENOENT … pages/_app/build-manifest.json`

Caused by a stale `.next` build folder mixed between dev modes (e.g. Turbopack vs standard):

```bash
npm run clean
npm run dev
```

For a production-style run:
```bash
npm run clean && npm run build && npm run start
```

> ⚠️ Never mix `next dev --turbopack` output with `next start` without a clean rebuild.

---

### `Signup fails: "Cannot reach the database…"`

PostgreSQL must be running and `.env` (not `.env.example`) must have a valid `DATABASE_URL`. Then:

```bash
npm run db:up         # start Docker Postgres
cp .env.example .env  # create .env if missing
npx prisma migrate dev
```

On **Railway**: verify the Postgres service is in the same project as the web service so `DATABASE_URL` is injected automatically.

---

### `401 Unauthorized on all requests`

1. Check that `JWT_SECRET` in your `.env` matches what was used when the cookie was set
2. Clear browser cookies and log in again
3. In production, confirm the environment variable is set on the Railway service Variables tab

---

### `403 Forbidden — last admin`

Ethara prevents a project from losing all admins. To remove or demote the only Admin, first promote another Member to Admin, then make the change.

---

### Prisma Client Not Found (deploy platforms)

The `postinstall` script runs `prisma generate` automatically. If your platform skips `postinstall`, run it manually:

```bash
npx prisma generate && npm run build
```

---

## 🗺️ Role Model Summary

```mermaid
flowchart TD
    subgraph Roles
        A[👑 Admin]
        B[👤 Member]
    end

    subgraph "Admin capabilities"
        A1[Project CRUD]
        A2[Invite / Remove members]
        A3[Promote / Demote roles]
        A4[Full task management]
    end

    subgraph "Member capabilities"
        B1[View project & tasks]
        B2[Create tasks]
        B3[Self-assign tasks]
        B4[Update status/due on own tasks]
    end

    A --> A1 & A2 & A3 & A4
    B --> B1 & B2 & B3 & B4
    A --> B1 & B2 & B3 & B4
```

---

<div align="center">

Built with ❤️ using **Next.js** · **Prisma** · **PostgreSQL** · **Tailwind CSS**

*Ethara — organized, prioritized, always on track.*

</div>