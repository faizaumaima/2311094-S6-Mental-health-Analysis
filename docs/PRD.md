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
| Beta | Final | JWT authentication, User and Admin roles (RBAC), Groups, member permissions, user dashboards, admin dashboard, security testing, and deployment |

**MVP workflow:** Project documentation → Data model → CRUD APIs → Basic analysis → Midterm demo.

**Beta workflow:** Authentication → RBAC and permissions → Group and member management → User dashboards → Admin dashboard → Security testing and deployment → Final demo.

## 1. Purpose

The Mental Health Analysis System is a web application for recording and reviewing basic mental well-being information, including daily mood, stress level, sleep hours, and optional personal notes.

The project will be developed in two releases:

- **MVP (midterm):** Build a working application with REST APIs for creating, viewing, updating, and deleting daily well-being records. Display simple summaries of recorded information and demonstrate the application locally.
- **Beta (final):** Add JWT-based authentication, User and Admin roles, role-based access control, Groups, group member management, member-level permissions, user dashboards, and an admin dashboard. Deploy the application using the faculty-approved setup.

The system will use React with TypeScript for the frontend and FastAPI with Python for the backend. AI, machine learning, NLP, and LLMs are not included.

## 2. Problem statement

People may want to record their mood, stress, and sleep patterns but find it difficult to organize these records and review changes over time. They may also want to share selected well-being information with members of a trusted support group.

This project aims to provide a simple web application for recording and reviewing well-being information. Users will be able to manage their personal records and participate in groups with other members. Group members will have specific permissions to create, edit, or assign records according to their granted access.

The system will also provide an administrator dashboard for managing users and overseeing the application. Authentication, authorization, and role-based permissions will help protect user information.

## 3. Goals

| ID | Goal | Release |
|---|---|---|
| G-1 | Provide REST APIs to create, read, update, and delete daily well-being records. | MVP |
| G-2 | Store records in a database so data persists between application restarts. | MVP |
| G-3 | Validate inputs and return clear API error responses. | MVP |
| G-4 | Calculate simple mood and stress summaries from saved records. | MVP |
| G-5 | Connect the React frontend to the FastAPI backend. | MVP |
| G-6 | Provide automatic API documentation through FastAPI's OpenAPI interface. | MVP |
| G-7 | Allow users to register, log in, and securely access their accounts using JWT authentication. | Beta |
| G-8 | Enforce role-based access control for Users and Administrators. | Beta |
| G-9 | Protect API endpoints using backend-enforced permissions and security scopes. | Beta |
| G-10 | Provide personal dashboards for authenticated users. | Beta |
| G-11 | Allow group members to create, edit/update, and assign well-being records according to their granted permissions. | Beta |
| G-12 | Provide an administrator dashboard to manage users and oversee the application. | Beta |
| G-13 | Deploy the application using the faculty-approved hosting setup. | Beta |

## 4. Target users

| User | Need | Release |
|---|---|---|
| User / demo user | Create, view, edit, and delete well-being records. | MVP |
| Instructor / reviewer | Test the REST APIs and review the application. | MVP |
| Registered user | Log in and privately manage personal records. | Beta |
| Group member | Participate in groups and perform actions according to granted permissions. | Beta |
| Administrator | Manage user accounts, oversee groups, and access the admin dashboard. | Beta |

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
- JWT-based authentication and authorization for protected API endpoints.
- Two roles: User and Administrator.
- RBAC and backend-enforced security scopes/permissions.
- Personal dashboard showing a user's records and basic trends.
- Users can access and modify only their own records, subject to authorization rules.
- Group creation and management.
- Group member management.
- Group-level member permissions:
  - Create: Add well-being records within a group.
  - Edit/Update: Modify authorized group records.
  - Assign: Assign a record to a group member for follow-up.
- Administrator dashboard.
- Administrator functions for managing user accounts and overseeing groups.
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
| F-11 | JWT authentication and protected API access | Beta | Must |
| F-12 | User and Administrator roles | Beta | Must |
| F-13 | Backend permission checks and security scopes | Beta | Must |
| F-14 | User profile and personal dashboard | Beta | Must |
| F-15 | Group creation, renaming, and deletion (group owner only) | Beta | Must |
| F-16 | Group member addition, removal, and permission management (group owner only) | Beta | Must |
| F-17 | Member permissions for Create, Edit/Update, and Assign actions | Beta | Must |
| F-18 | Administrator dashboard for managing users and groups | Beta | Must |
| F-19 | Password hashing and security hardening | Beta | Must |
| F-20 | Deployment using the approved hosting setup | Beta | Must |

## 7. User stories

### MVP

| ID | Story | Feature |
|---|---|---|
| US-01 | As a user, I want to record my daily mood and stress level so that I can keep track of my well-being. | F-1 |
| US-02 | As a user, I want to record my sleep hours and optional notes so that I can keep additional context. | F-1 |
| US-03 | As a user, I want to view my saved records so that I can review previous entries. | F-2 |
| US-04 | As a user, I want to edit a record so that I can correct mistakes. | F-3 |
| US-05 | As a user, I want to delete a record so that I can remove an entry. | F-4 |
| US-06 | As a user, I want to see simple mood and stress summaries so that I can understand my recorded information. | F-6 |

### Beta

| ID | Story | Feature |
|---|---|---|
| US-07 | As a user, I want to register and log in securely so that I can access my personal account. | F-10, F-11 |
| US-08 | As a registered user, I want to view my profile and personal dashboard so that I can review my well-being records. | F-14 |
| US-09 | As a user, I want to create a group so that I can share well-being records with other members. | F-15 |
| US-10 | As a group member, I want to view the members of my group so that I know who is participating. | F-16 |
| US-11 | As a group member, I want to have specific permissions so that I can perform only the actions allowed for me. | F-17 |
| US-12 | As a group member with Create permission, I want to add a well-being record to my group so that other authorized members can access it. | F-17 |
| US-13 | As a group member with Edit/Update permission, I want to modify an authorized group record so that its information stays accurate. | F-17 |
| US-14 | As a group member with Assign permission, I want to assign a group record to another member so that the member can follow up on it. | F-17 |
| US-15 | As an administrator, I want to manage user accounts so that I can oversee registered users. | F-18 |
| US-16 | As an administrator, I want to oversee groups and their memberships so that I can manage group activities. | F-18 |
| US-17 | As a group owner, I want to rename or delete my group, add or remove group members, and manage their permissions so that I can control my group. | F-15, F-16 |