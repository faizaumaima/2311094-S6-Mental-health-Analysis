# Mental Health Analysis

A web-based application for recording and managing personal well-being information, including mood, stress levels, sleep hours, and notes.

## Features

- User registration and JWT-based login
- Personal records CRUD operations
- Mood, stress, sleep, and notes tracking
- Group creation and member management
- Group member permissions
- Role-Based Access Control (User and Admin)
- Admin dashboard and user management
- Audit logs
- Record ownership protection

## Technology Stack

- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI
- Database: Supabase PostgreSQL
- ORM: SQLModel
- Authentication: JWT
- Deployment: Vercel

## Project Structure

- `backend/` - FastAPI backend
- `frontend/` - React and TypeScript frontend
- `docs/` - Project documentation
- `vercel.json` - Vercel configuration

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
fastapi dev main.py