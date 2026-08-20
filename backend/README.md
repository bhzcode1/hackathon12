# Crime Reporting Backend - Phase 1

## Overview
This is the backend for an Interactive Map-Based Real-Time Crime Reporting System. Phase 1 implements database setup and authentication.

## Features Implemented in Phase 1
- User authentication with JWT
- User registration and login
- Password hashing with bcrypt
- PostgreSQL database with SQLAlchemy ORM
- Alembic for database migrations
- RESTful API endpoints for user management

## Technology Stack
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Alembic (for migrations)
- Pydantic (for data validation)
- Passlib (for password hashing)
- Python-JOSE (for JWT handling)

## Setup Instructions

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the values
   - Default `.env` already created with development values

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

5. Access the API documentation:
   - Swagger UI: http://localhost:8000/api/v1/docs
   - ReDoc: http://localhost:8000/api/v1/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/login/access-token` - Login and get access token
- `POST /api/v1/auth/register` - Register new user

### Users
- `GET /api/v1/users/` - List users (pagination supported)
- `POST /api/v1/users/` - Create new user
- `GET /api/v1/users/{user_id}` - Get specific user
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

## First Superuser Creation
The first superuser can be created by setting the following in `.env`:
- `FIRST_SUPERUSER=admin@crimeapp.com`
- `FIRST_SUPERUSER_PASSWORD=adminpassword`

Then run the initialization script (to be implemented in a future phase) or create manually via the API.

## Project Structure
```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── api.py
│   │   │   └── endpoints/
│   │   │       ├── auth.py
│   │   │       └── users.py
│   ├── models/
│   │   └── user.py
│   ├── schemas/
│   │   └── user.py
│   └── crud/
│       └── user.py
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_create_users_table.py
├── alembic.ini
├── requirements.txt
└── .env
```