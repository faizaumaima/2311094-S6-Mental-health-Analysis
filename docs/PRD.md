# Product Requirements Document (PRD) — Mental Health Analysis System

| Field | Value |
|---|---|
| Product | Mental Health Analysis System |
| Version | MVP + Beta |
| Releases | MVP — Mid-term, Beta — Final |
| Status | Draft |
| Related docs | Software Requirements Specification (SRS), Technical Design Document (TDD) |

This document covers both releases. Every goal, feature, and user story has a Release column to clarify what will be developed for the midterm and what will be added for the final demonstration.

## Documents in this set

| Short form | Full form | Purpose |
|---|---|---|
| PRD | Product Requirements Document | What we build and why |
| SRS | Software Requirements Specification | Exact requirements, permissions, and acceptance criteria |
| TDD | Technical Design Document | Architecture, data model, and API design |

## 0. Release plan

| Release | When | Focus |
|---|---|---|
| MVP | Mid-term | Core well-being record CRUD, database, REST APIs, basic analysis, and local demonstration |
| Beta | Final | Authentication, user roles (RBAC), security scopes/permissions, profile dashboard, counsellor access, and deployment |

**MVP workflow:** Project documentation → Data model → CRUD APIs → Basic analysis → Midterm demo.

**Beta workflow:** Authentication → RBAC and permissions → User dashboards → Counsellor features → Security testing and deployment → Final demo.

## 1. Purpose

The Mental Health Analysis System is a web application for recording and reviewing basic mental well-being information, including daily mood, stress level, sleep hours, and optional personal notes.

The project will be developed in two releases:

- **MVP (midterm):** Build a working application with REST APIs for creating, viewing, updating, and deleting daily well-being records. Display simple summaries of recorded information and demonstrate the application locally.
- **Beta (final):** Add user accounts, authentication, role-based access control, security scopes, user dashboards, and authorized counsellor access. Deploy the application using the faculty-approved setup.

The system will use React with TypeScript for the frontend and FastAPI with Python for the backend. AI, machine learning, NLP, and LLMs are not included.

## 2. Problem statement

People may want to record their mood, stress, and sleep patterns but find it difficult to organize these records and review changes over time. Counsellors may also need a structured way to review information shared by the people they support.

This project aims to provide a simple web application for recording and reviewing well-being information. It will also demonstrate secure access to private records through authentication, authorization, and role-based permissions in the Beta release.

## 3. Goals

| ID | Goal | Release |
|---|---|---|
| G-1 | Provide REST APIs to create, read, update, and delete daily well-being records. | MVP |
| G-2 | Store records in a database so data persists between application restarts. | MVP |
| G-3 | Validate inputs and return clear API error responses. | MVP |
| G-4 | Calculate simple mood and stress summaries from saved records. | MVP |
| G-5 | Connect the React frontend to the FastAPI backend. | MVP |
| G-6 | Provide automatic API documentation through FastAPI's OpenAPI interface. | MVP |
| G-7 | Allow users to register, log in, and access their own accounts. | Beta |
| G-8 | Enforce role-based access for users, counsellors, and administrators. | Beta |
| G-9 | Protect API endpoints using security scopes and permissions. | Beta |
| G-10 | Provide a profile dashboard for authenticated users. | Beta |
| G-11 | Allow authorized counsellors to review records of assigned users. | Beta |
| G-12 | Deploy the application using the faculty-approved hosting setup. | Beta |

## 4. Target users

| User | Need | Release |
|---|---|---|
| User / demo user | Create, view, edit, and delete well-being records. | MVP |
| Instructor / reviewer | Test the REST APIs and review the application. | MVP |
| Registered user | Log in and privately manage personal records. | Beta |
| Counsellor | Review authorized records of assigned users and track their progress. | Beta |
| Administrator | Manage user accounts, roles, and counsellor assignments. | Beta |

In the MVP, the application is intended for local demonstration using test data and does not provide secure multi-user access. In the Beta, records will be associated with authenticated users, and access will be controlled by backend permissions.

## 5. Scope

### In scope — MVP (midterm)

- Create daily well-being records containing mood, stress level, sleep hours, date, and an optional note.
- List and view saved records.
- Update existing records.
- Delete records.
- Validate submitted data and return clear error messages.
- Calculate simple mood and stress summaries from saved records.
- Connect the frontend and backend using REST APIs.
- Store records in a database.
- Provide a health-check endpoint and interactive API documentation.
- Run the application locally for the midterm demonstration.

### In scope — Beta (final)

- User registration, login, and logout.
- Authentication and authorization for protected API endpoints.
- Three roles: User, Counsellor, and Administrator.
- RBAC and backend-enforced security scopes/permissions.
- Personal dashboard showing a user's records and basic trends.
- Users can access and modify only their own records.
- Counsellors can view records only for assigned users with authorized access.
- Basic counsellor session management and progress notes.
- Administrator functions for managing accounts, roles, and assignments.
- Secure password hashing, input validation, and appropriate error handling.
- Deployment using the faculty-approved Vercel setup and a compatible database service.

### Out of scope for this semester

- AI, machine learning, NLP, LLMs, and RAG.
- Automated mental-health diagnosis or risk prediction.
- Automated crisis detection or clinical alerts.
- Online therapy or video consultations.
- Payment processing and hospital-system integration.
- Complex statistical analysis or predictive analytics.
- Mobile applications.
- Email verification, social login, and password-reset workflows unless required by the faculty.

The system is intended for personal tracking and educational demonstration. It is not a medical diagnostic or emergency-response system.

## 6. Features and priority (MoSCoW)

Priorities are assigned separately for each release. A Beta Must feature is required for the final demonstration, not the midterm.

| ID | Feature | Release | Priority |
|---|---|---|---|
| F-1 | Create a daily well-being record | MVP | Must |
| F-2 | List and view saved records | MVP | Must |
| F-3 | Update a well-being record | MVP | Must |
| F-4 | Delete a well-being record | MVP | Must |
| F-5 | Validate inputs and return clear errors | MVP | Must |
| F-6 | Basic mood and stress summaries | MVP | Must |
| F-7 | Database persistence | MVP | Must |
| F-8 | Health-check endpoint and API documentation | MVP | Should |
| F-9 | Basic React page connected to REST APIs | MVP | Must |
| F-10 | User registration, login, and logout | Beta | Must |
| F-11 | Personal records associated with authenticated users | Beta | Must |
| F-12 | User, Counsellor, and Administrator roles | Beta | Must |
| F-13 | Backend permission checks and security scopes | Beta | Must |
| F-14 | User profile and personal dashboard | Beta | Must |
| F-15 | Counsellor access to assigned and authorized records | Beta | Must |
| F-16 | Basic counsellor session and progress-note management | Beta | Should |
| F-17 | Administrator account, role, and assignment management | Beta | Must |
| F-18 | Password hashing and security hardening | Beta | Must |
| F-19 | Deployment using the approved hosting setup | Beta | Must |
| F-20 | Predefined wellness recommendations | Beta | Could |

## 7. User stories

### MVP

| ID | Story | Feature |
|---|---|---|
| US-01 | As a user, I want to record my daily mood and stress level so that I can keep track of my well-being. | F-1 |
| US-02 | As a user, I want to record my sleep hours and optional notes so that I can keep additional context. | F-1 |
| US-03 | As a user, I want to view my saved records so that I can review previous entries. | F-2 |
| US-04 | As a user, I want to edit a record so that I can correct mistakes. | F-3 |
| US-05 | As a user, I want to delete a record so that I can remove an entry. | F-4 |
| US-06 | As a user, I want to see simple mood and stress summaries so
