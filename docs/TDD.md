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

**MVP:** A FastAPI REST API connected to a Supabase PostgreSQL database for creating, viewing, updating, and deleting daily well-being records. The React frontend allows users to record their mood, stress level, sleep hours, date, and optional notes. The system also provides basic summaries.

**Beta:** The system adds user registration, JWT-based authentication, two global roles (User and Administrator), role-based access control (RBAC), security scopes and permissions, personal dashboards, group creation and management, group membership, member-level Create, Edit/Update, and Assign permissions, and an administrator dashboard.

The backend enforces authentication and authorization before allowing access to protected resources.

The system provides basic tracking and summaries. It does not diagnose mental health conditions or use AI, machine learning, or automated clinical assessment.

## 2. Tech stack

| Layer | Choice | Why | Release |
|---|---|---|---|
| Frontend | React + TypeScript + Vite | Required by faculty and provided template | MVP |
| Backend | FastAPI + Python | REST APIs and automatic API documentation | MVP |
| Database | Supabase PostgreSQL | Persistent storage for records, users, groups, and memberships | MVP + Beta |
| ORM | SQLModel | Defines database models and handles database operations | MVP + Beta |
| API communication | REST APIs with JSON | Connects frontend and backend | MVP |
| Hosting | Vercel | Faculty-approved deployment platform | Beta |
| Authentication | JWT using PyJWT | Authenticates users through signed tokens | Beta |
| Password hashing | Argon2 using argon2-cffi | Securely stores passwords | Beta |
| Authorization | RBAC and FastAPI security scopes | Restricts access according to roles and permissions | Beta |
| Database migrations | Alembic | Manages versioned database schema changes | Beta |
| Version control | GitHub | Branches, issues, and pull requests | MVP + Beta |


## 3. Architecture

The application has three main parts:

1. **Frontend:** React with TypeScript provides forms for well-being records, personal dashboards, group management interfaces, and an administrator dashboard.
2. **Backend:** FastAPI handles REST API requests, data validation, business logic, JWT authentication, role-based access control, and group-level permission checks.
3. **Database:** Supabase PostgreSQL stores user accounts, well-being records, groups, group memberships, and member-level permissions.

The frontend communicates with the backend through REST APIs using JSON. The backend validates each request, verifies the user's identity, checks the required role and permissions, communicates with the database, and returns an appropriate response.

The backend is responsible for enforcing all security and access restrictions. Frontend controls alone must not be treated as security.

### 3.1 Request flow — MVP

User enters a well-being record → React sends a REST API request → FastAPI validates the data → database stores or retrieves the record → API returns JSON → React displays the result.

### 3.2 Authentication and permission flow — Beta

1. A user submits their email and password through the login form.
2. The backend verifies the credentials against the stored account information.
3. If the credentials are valid, the backend generates and returns a signed JWT.
4. The frontend includes the JWT in the Authorization header when sending requests to protected endpoints.
5. FastAPI verifies the JWT signature and expiration and identifies the authenticated user.
6. The backend checks the user's global role (User or Administrator) and the required security scope.
7. For group operations, the backend also verifies group membership and the required member-level permission (Create, Edit/Update, or Assign).
8. If authentication fails, the backend returns 401 Unauthorized. If the user lacks the required role or permission, it returns 403 Forbidden.
9. If all checks pass, the backend performs the requested operation and returns the response.

## 4. Project structure

The project will follow the provided FastAPI + React template. The following structure describes the planned organization of additional Beta features. These files and folders can be added gradually as features are implemented.

```text
backend/
  main.py
  requirements.txt
  app/
    database.py
    records/
      router.py
      schemas.py
      models.py
      crud.py
    auth/
      router.py
      schemas.py
      security.py
    users/
      router.py
      models.py
      schemas.py
    groups/
      router.py
      models.py
      schemas.py
      crud.py
    admin/
      router.py
    permissions.py

frontend/
  src/
    App.tsx
    components/
    pages/
      Login.tsx
      Register.tsx
      Dashboard.tsx
      GroupDashboard.tsx
      AdminDashboard.tsx
    services/
      api.ts
    types/

docs/
  PRD.md
  SRS.md
  TDD.md
```

**Note:** This is the planned organization, not a statement that every listed file already exists. The existing faculty template and implemented files will be retained. New files will be added only when their corresponding features are developed.

## 5. Data model

The system uses Supabase PostgreSQL to store well-being records and Beta features. The following tables describe the planned logical database design.

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

### 5.2 User account — Beta

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| name | String | Required |
| email | String | Required and unique |
| password_hash | String | Required; securely hashed |
| role | String | Required; User or Administrator |
| is_active | Boolean | Indicates whether the account is active |
| created_at | Timestamp | Automatically recorded |

### 5.3 Groups — Beta

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| name | String | Required |
| description | Text | Optional |
| created_by | Integer | Foreign key referencing app_user; identifies the group owner |
| created_at | Timestamp | Automatically recorded |

### 5.4 Group membership — Beta

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| group_id | Integer | Foreign key referencing groups |
| user_id | Integer | Foreign key referencing app_user |
| joined_at | Timestamp | Automatically recorded |

A user may belong to multiple groups. Each group membership connects one user to one group.
The group creator shall automatically be added as a member of the group. The creator is the group owner, identified by the created_by field in the groups table.
### 5.5 Group member permissions — Beta

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| membership_id | Integer | Foreign key referencing group_membership |
| permission | String | Create, Edit/Update, or Assign |

Each group member may have different permissions. The backend checks these permissions before allowing group operations.
Only the group owner can assign, change, or remove permission entries for a group member. The backend must verify group ownership before allowing these changes.
### 5.6 Additional well-being record fields — Beta

The existing well-being record table will be extended to support personal and group records.

| Column | Type | Rules |
|---|---|---|
| owner_id | Integer | Foreign key referencing app_user; identifies the record owner |
| group_id | Integer | Optional foreign key referencing groups; identifies the group if it is a group record |

A record may be personal or associated with a group. Group records must be accessible only to authorized group members.

### 5.7 Group record assignment — Beta

| Column | Type | Rules |
|---|---|---|
| id | Integer | Primary key |
| record_id | Integer | Foreign key referencing well_being_record |
| assigned_by | Integer | Foreign key referencing app_user |
| assigned_to | Integer | Foreign key referencing app_user |
| status | String | Tracks the assignment status |
| created_at | Timestamp | Automatically recorded |

A group member with Assign permission may assign a group record to another member of the same group. The backend must verify group membership before allowing an assignment.

**Note:** These tables describe the planned Beta database design. Existing MVP tables and data must be preserved when the Beta schema is implemented. Database migrations will be used for schema changes.

## 6. REST API design

Base path: `/api`. Request and response bodies use JSON.

### 6.1 MVP endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| POST | `/api/records/` | Create a well-being record | MVP |
| GET | `/api/records/` | List well-being records | MVP |
| GET | `/api/records/{id}` | View one record | MVP |
| PUT | `/api/records/{id}` | Update a well-being record | MVP |
| DELETE | `/api/records/{id}` | Delete a well-being record | MVP |
| GET | `/api/health` | Check API status | MVP |

The Records API uses the existing backend route structure. The backend validates required fields and returns appropriate HTTP status codes, including `201 Created`, `200 OK`, `204 No Content`, `404 Not Found`, and `422 Unprocessable Entity`.

### 6.2 Beta authentication and user endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account | Beta |
| POST | `/api/auth/login` | Authenticate a user and issue a JWT | Beta |
| GET | `/api/users/me` | View the authenticated user's profile | Beta |
| PUT | `/api/users/me` | Update the authenticated user's profile | Beta |

### 6.3 Beta group endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| POST | `/api/groups/` | Create a group | Beta |
| GET | `/api/groups/` | List groups accessible to the user | Beta |
| GET | `/api/groups/{group_id}` | View group information | Beta |
| GET | `/api/groups/{group_id}/members` | View group members | Beta |
| POST | `/api/groups/{group_id}/members` | Add a member to a group (group owner only) | Beta |
| DELETE | `/api/groups/{group_id}/members/{user_id}` | Remove a group member (group owner only) | Beta |
| PUT | `/api/groups/{group_id}/members/{user_id}/permissions` | Set or update a member's group permissions (group owner only) | Beta |
| PUT | `/api/groups/{group_id}` | Rename/update a group (group owner only) | Beta |
| DELETE | `/api/groups/{group_id}` | Delete a group (group owner only) | Beta |

### 6.4 Beta group record and assignment endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| POST | `/api/groups/{group_id}/records/` | Create a group record (group membership and Create permission required) | Beta |
| GET | `/api/groups/{group_id}/records/` | List records accessible to authorized group members | Beta |
| PUT | `/api/groups/{group_id}/records/{record_id}` | Update a group record (group membership and Edit/Update permission required) | Beta |
| POST | `/api/groups/{group_id}/records/{record_id}/assign` | Assign a record to another member of the same group (group membership and Assign permission required) | Beta |

### 6.5 Beta administrator endpoints

| Method | Path | Purpose | Release |
|---|---|---|---|
| GET | `/api/admin/users` | List user accounts | Beta |
| PUT | `/api/admin/users/{user_id}` | Update a user's account status | Beta |
| GET | `/api/admin/groups` | View all groups | Beta |
| GET | `/api/admin/groups/{group_id}/members` | Oversee group memberships | Beta |

All Beta endpoints are planned endpoints and must be implemented before they are treated as available features.

Protected endpoints require a valid JWT. The backend must also check the user's global role, group membership, and required group-level permission before performing protected operations.
## 7. Database access

The backend will connect to the Supabase PostgreSQL database using a connection string stored in environment variables. SQLModel will be used to define database models and perform database operations.

- **MVP:** Store well-being records in the configured Supabase PostgreSQL database and support CRUD operations through the FastAPI backend.
- **Beta:** Extend the database with user accounts, global roles, groups, group memberships, member-level permissions, and group record assignments.
- **Database migrations:** Use Alembic to manage and track database schema changes.
- **Data relationships:** Use foreign keys to connect users, records, groups, memberships, permissions, and assignments.
- **Data integrity:** Apply appropriate constraints to prevent duplicate memberships, invalid permissions, and invalid record assignments.
- **Security:** Store database credentials and authentication secrets in environment variables. Never commit them to GitHub or expose them in frontend code.

Existing MVP tables and records must be preserved when adding Beta database tables and columns.

All database operations must be performed through the backend. The frontend must not connect directly to the database using privileged credentials.

## 8. Security design — Beta

| Area | Design |
|---|---|
| Authentication | Authenticate users through email and password and issue signed JWTs |
| Token validation | Verify JWT signature and expiration on protected requests |
| Passwords | Store passwords using Argon2 hashing; never store plain-text passwords |
| Global roles | Support two roles: User and Administrator |
| RBAC | Restrict administrator-only operations to Administrator accounts |
| Security scopes | Use FastAPI security scopes to identify required permissions for protected operations |
| Group permissions | Enforce Create, Edit/Update, and Assign permissions separately for each group member |
| Group membership | Verify that users belong to the relevant group before allowing group operations |
| Group ownership | Only the group owner can add or remove members, set or update their permissions, rename a group, or delete a group. The backend must verify group ownership before allowing these operations |
| Record privacy | Users may access their own personal records; group records are accessible only to authorized group members |
| Administrator access | Administrators can manage user accounts and oversee groups and memberships without automatically receiving unrestricted access to private records |
| Input validation | Validate incoming data using FastAPI and Pydantic |
| Secrets | Store database credentials and authentication keys in environment variables |
| Error handling | Return appropriate HTTP status codes without exposing passwords, tokens, or sensitive internal details |

All authentication and authorization checks must be performed by the backend. Frontend restrictions alone are not sufficient to protect resources.

## 9. Deployment

The project will use the faculty-provided GitHub template and approved Vercel deployment workflow.

1. Develop and test the MVP locally.
2. Connect the React frontend and FastAPI backend through REST APIs.
3. Configure the Supabase PostgreSQL database connection using environment variables.
4. Configure the required production environment variables, including database credentials and JWT secret.
5. Deploy the application using the faculty-approved Vercel setup.
6. Test the deployed frontend and verify that its API requests reach the backend successfully.
7. For group operations, the backend verifies group membership and the required member-level permission (Create, Edit/Update, or Assign). For group-management operations, it also verifies that the authenticated user is the group owner.
8. Verify that unauthorized requests are rejected by the backend.
9. Test the deployed application again after the Beta features are integrated.

Deployment configuration must keep secrets out of the frontend and source control.

## 10. Risks and mitigation

| Risk | Mitigation |
|---|---|
| Scope becomes too large | Implement MVP CRUD features first, then add Beta features gradually |
| Database configuration problems | Use the existing Supabase PostgreSQL connection and verify environment variables |
| Unauthorized access to private records | Enforce authentication, ownership, group membership, and permissions in the backend |
| Incorrect group permissions | Test Create, Edit/Update, and Assign permissions separately for each group member |
| JWT security problems | Use signed tokens, validate token expiration, and protect the JWT secret |
| Database schema changes cause errors | Use Alembic migrations and preserve existing MVP data |
| Frontend and backend integration errors | Test each API endpoint before integrating the UI |
| Deployment issues | Test locally and verify production environment variables before deployment |

**Design principle:** Complete a small, functional MVP first. Extend it with secure authentication, roles, groups, and permissions for the Beta release without introducing unnecessary complexity.