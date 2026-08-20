# Render Deployment Steps

This document provides specific steps for deploying the Crime Reporting Backend to Render.com.

## Prerequisites

1. Your code is pushed to a GitHub, GitLab, or Bitbucket repository.
2. You have a Render.com account.

## Step-by-Step Guide

### 1. Create a PostgreSQL Service on Render

1. In your Render dashboard, click "New" -> "PostgreSQL".
2. Choose a plan (the Free tier is sufficient for testing).
3. Fill in the required fields:
   - **Name**: e.g., `crime-reporting-db`
   - **Region**: Choose closest to your users
   - **Plan**: Select Free (or paid as needed)
4. Click "Create Postgres".

Render will create the database and provide you with an internal connection string. Note the **Host** (e.g., `crime-reporting-db.onrender.com`), which you'll use in the next step.

### 2. Create a Web Service on Render

1. Click "New" -> "Web Service".
2. Connect your repository containing the backend code.
3. Configure the service:
   - **Name**: e.g., `crime-reporting-backend`
   - **Region**: Same as your PostgreSQL service (for lower latency)
   - **Branch**: `main` (or your default branch)
   - **Environment**: Docker
   - **Build Command**: `docker build -t crime-reporting-backend .`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - Note: Render provides the `$PORT` environment variable automatically.
4. Under "Advanced" -> "Environment", add the following environment variables:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `POSTGRES_SERVER` | `<your-postgres-host>` | From the PostgreSQL service's "Host" field (e.g., `crime-reporting-db.onrender.com`) |
   | `POSTGRES_USER` | `<your-postgres-user>` | From the PostgreSQL service's "User" field |
   | `POSTGRES_PASSWORD` | `<your-postgres-password>` | From the PostgreSQL service's "Password" field |
   | `POSTGRES_DB` | `<your-postgres-db>` | From the PostgreSQL service's "Database Name" field |
   | `SECRET_KEY` | `<strong-random-secret>` | Generate a strong secret (e.g., 32+ random characters) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Or your desired value |
   | `BACKEND_CORS_ORIGINS` | `["<your-frontend-url>"]` | Replace with your frontend URL (e.g., `["https://your-frontend.onrender.com"]`). If you don't have a frontend yet, you can use `["*"]` for development, but **change this in production** to specific origins for security. |

   Important: Render does not support complex objects like lists directly in environment variables. For `BACKEND_CORS_ORIGINS`, you must provide a JSON string. For example:
   ```
   ["https://your-frontend.onrender.com"]
   ```
   (including the brackets and quotes).

5. Click "Create Web Service".

### 3. Wait for Deployment

Render will:
1. Clone your repository
2. Build the Docker image using your Dockerfile
3. Start the container with the provided start command
4. Set the environment variables

You can view the logs in real-time by clicking on the service in your Render dashboard.

### 4. Verify Deployment

Once the deployment is successful (indicated by a "Live" status and healthy logs), your API will be available at:
```
https://<your-service-name>.onrender.com
```

The API documentation will be at:
```
https://<your-service-name>.onrender.com/api/v1/docs
```

### 5. Initialize First Superuser (Optional)

If you want to create the first superuser automatically, you can use the `FIRST_SUPERUSER` and `FIRST_SUPERUSER_PASSWORD` environment variables. Add these to your web service's environment:

| Key | Value |
|-----|-------|
| `FIRST_SUPERUSER` | `admin@crimeapp.com` |
| `FIRST_SUPERUSER_PASSWORD` | `<strong-password>` |

The application will create this user on startup if it doesn't already exist.

### 6. Updating Your Service

When you push new code to your repository, Render will automatically rebuild and redeploy your service (if you have "Auto-Deploy" enabled, which is on by default).

## Troubleshooting

### Common Issues

- **"Connection refused" to database**: Double-check that the `POSTGRES_SERVER` variable matches the host from your PostgreSQL service, and that the credentials are correct.
- **CORS errors in frontend**: Ensure `BACKEND_CORS_ORIGINS` includes your frontend's exact URL (including protocol and port if not default).
- **Application fails to start**: Check the logs in Render for any startup errors (e.g., missing environment variables, import errors).

### Accessing Logs

In the Render dashboard:
1. Select your web service.
2. Click on the "Logs" tab to view real-time and historical logs.

## Notes

- Render provides free SSL certificates for your service, so your API will be accessible via HTTPS.
- The PostgreSQL service includes daily backups and is managed by Render (you don't need to handle backups yourself).
- For production, consider upgrading your PostgreSQL plan for better performance and higher connection limits.
- Always keep your `SECRET_KEY` secure and never commit it to your repository.

---
*Last updated: August 20, 2026*