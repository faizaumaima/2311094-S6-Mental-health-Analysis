# Technical Design Document (TDD) — Mental Health Analysis System

| Field | Value |
|---|---|
| Product | Mental Health Analysis System |
| Version | MVP + Beta |
| Releases | MVP — Mid-term, Beta — Final |
| Status | Draft |
| Related docs | Product Requirements Document (PRD), Software Requirements Specification (SRS) |

## Documents in this set

| Short form | Full form | Purpose |
|---|---|---|
| PRD | Product Requirements Document | What we build and why |
| SRS | Software Requirements Specification | Requirements and permissions |
| TDD | Technical Design Document | How we build the system |

Build the MVP for the midterm. The Beta release extends it for the final.

## 1. Overview

**MVP:** A FastAPI REST API connected to a database for creating, viewing, updating, and deleting daily well-being records. The React frontend allows users to record their mood, stress level, sleep hours, and optional notes.

**Beta:** Add authentication, user profiles, role-based access control (RBAC), security permissions, and counsellor access to assigned users' authorized records. Deploy the application using Vercel.

The system provides basic tracking and summaries; it does not diagnose mental health conditions or use AI.

## 2. Tech stack

| Layer | Choice | Why | Release |
|---|---|---|---|
| Frontend | React + TypeScript + Vite | Required by faculty and provided template | MVP |
| Backend | FastAPI + Python | REST APIs and automatic API documentation | MVP |
| Database | SQL database (final choice to be confirmed) | Stores well-being records and user information | MVP |
| API communication | REST APIs with JSON | Connects frontend and backend | MVP |
| Hosting | Vercel | Required deployment platform | Beta |
| Authentication | JWT or secure session-based authentication | Verifies users | Beta |
| Authorization | RBAC and security scopes/permissions | Restricts access by role and resource | Beta |
| Version control | GitHub | Branches, issues, and pull requests | MVP |

## 3. Architecture

The application has three main parts:

1. **Frontend:** React pages and forms for recording mood, stress, and sleep, and viewing summaries.
2. **Backend:** FastAPI endpoints validate requests, apply business rules, check permissions, and communicate with the database.
3. **Database:** Stores well-being records and, in Beta, user accounts, roles, counsellor assignments, and authorized access information.

### 3.1 Request flow — MVP

User enters a well-being record → React sends a REST API request → FastAPI validates the data → database stores or retrieves the record → API returns JSON → React displays the result.

### 3.2 Authentication and permission flow — Beta

User logs in → backend verifies credentials → authenticated request reaches the API → backend checks the user's role and permissions → authorized data is returned; unauthorized requests are rejected.

## 4. Project structure

The project will follow the provided FastAPI + React template. Additional files can be created as features are implemented.

```text
backend/
  main.py              # FastAPI application and API routes
  requirements.txt     # Python dependencies
  app/
    database.py        # Database connection
    records/           # Well-being record operations
      router.py        # REST API endpoints
      schemas.py       # Request and response validation
      models.py        # Database models
    auth/              # Beta: login and authentication
    users/             # Beta: profiles and user management
    permissions.py     # Beta: RBAC and security checks

frontend/
  src/
    App.tsx            # Main application
    components/        # Forms and reusable UI
    pages/             # Dashboard and record pages
    services/
      api.ts           # Backend API calls
    types/             # TypeScript types

docs/
  01-prd.md
  02-srs.md
  03-tdd.md
```

The structure above is the planned organization, not the current implemented structure. It can be added gradually without changing the faculty's template.

## 5. Data model

### 5.1 Well-being record — MVP

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| mood | String | Required; selected from predefined values |
| stress_level | Integer | Required; 1–10 |
| sleep_hours | Float | Required; 0–24 |
| record_date | Date | Required |
| notes | Text | Optional |
| created_at | Timestamp | Automatically recorded |

### 5.2 Additional data — Beta

| Table | Main fields | Purpose |
|---|---|---|
| app_user | id, name, email, password_hash | User accounts |
| user_role | user_id, role | User, Counsellor, or Admin |
| counsellor_assignment | counsellor_id, user_id | Connects counsellors with assigned users |
| well_being_record | owner_id | Links each record to its owner |

Records must belong to the appropriate user. Counsellors may access only assigned users' records when access is authorized. Administrators manage accounts, roles, and assignments without automatically receiving unrestricted access to private notes.

## 6. REST API design

Base path: `/api/v1`. Request and response bodies use JSON.

### 6.1 MVP endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| POST | `/api/v1/records` | Create a well-being record | MVP |
| GET | `/api/v1/records` | List records | MVP |
| GET | `/api/v1/records/{id}` | View one record | MVP |
| PATCH | `/api/v1/records/{id}` | Update a record | MVP |
| DELETE | `/api/v1/records/{id}` | Delete a record | MVP |
| GET | `/api/health` | Check API status | MVP |

The backend will validate required fields and return appropriate HTTP status codes, such as `201` for creation, `404` for missing records, and `422` for invalid input.

### 6.2 Beta endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Register an account |
| POST | `/api/v1/auth/login` | Authenticate a user |
| GET | `/api/v1/users/me` | View the current user's profile |
| GET | `/api/v1/counsellor/records` | View authorized records of assigned users |
| GET | `/api/v1/admin/users` | Manage user accounts (Admin only) |

All protected endpoints will verify authentication and the required role or permission. The exact endpoints may be adjusted to match the final SRS and implementation.

## 7. Database access

The backend will use a database connection configured through environment variables. Database models will represent well-being records and, in Beta, user accounts and counsellor assignments.

- **MVP:** Create and test the database schema and CRUD operations locally.
- **Beta:** Extend the schema for accounts and permissions, and use versioned migrations if needed.
- Database credentials and authentication secrets must not be committed to GitHub or exposed in frontend code.

The database provider and connection setup must be confirmed before deployment.

## 8. Security design — Beta

| Area | Design |
|---|---|
| Authentication | Verify users before accessing protected features |
| Passwords | Store securely hashed passwords, never plain text |
| RBAC | Define User, Counsellor, and Admin roles |
| Permissions | Enforce access checks in the backend |
| Record privacy | Users access their own records; counsellors access authorized assigned records |
| Input validation | Validate data with FastAPI/Pydantic |
| Secrets | Store credentials and keys in environment variables |
| Error handling | Return suitable error messages without exposing sensitive details |

## 9. Deployment

The project will use the faculty-provided GitHub template and Vercel workflow.

1. Develop and test the MVP locally.
2. Connect the frontend and backend through REST APIs.
3. Configure the production database and environment variables.
4. Deploy to Vercel and test the deployed application.
5. Add and verify authentication, RBAC, and permissions for the Beta release.

## 10. Risks and mitigation

| Risk | Mitigation |
|---|---|
| Scope becomes too large | Implement core CRUD features first |
| Database configuration problems | Confirm the database provider early |
| Unauthorized access to private records | Test permissions on the backend |
| Frontend and backend integration errors | Test each API before integrating the UI |
| Deployment issues | Test locally and verify environment variables before deployment |

**Design principle:** Complete a small, functional, and secure application first. Add authentication and role-based features only after the MVP works correctly.
