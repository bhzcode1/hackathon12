# Deployment Guide for Crime Reporting Backend

This guide explains how to deploy the Crime Reporting Backend using Docker, Docker Compose, and Render.com.

## Prerequisites

- Docker and Docker Compose installed
- For Render: a Render.com account and a GitHub/GitLab repository

## 1. Running with Docker Compose (Recommended for Development)

The easiest way to run the application with all dependencies is using Docker Compose.

### Steps:

1. Copy the example environment file and adjust as needed:
   ```bash
   cp .env.example .env
   ```

2. Start the services:
   ```bash
   docker-compose up --build
   ```

3. The API will be available at `http://localhost:8000`.
   - API documentation: `http://localhost:8000/api/v1/docs`
   - The database will be available at `localhost:5432` (using the credentials from `.env`).

4. To stop and remove the containers:
   ```bash
   docker-compose down
   ```

### Notes:
- The first time you run `docker-compose up`, it will build the Docker image and create the database volume.
- The database data is persisted in the named volume `postgres_data`.
- To reset the database, remove the volume: `docker-compose down -v`

## 2. Running the Docker Container Manually

If you prefer to run the container without Docker Compose, you can do so by managing the database separately.

### Steps:

1. Build the Docker image:
   ```bash
   docker build -t crime-reporting-backend .
   ```

2. Run a PostgreSQL container (if you don't have one already):
   ```bash
   docker run --name crime-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=crime_reporting \
     -p 5432:5432 \
     -d postgres:15
   ```

3. Run the application container, linking to the PostgreSQL container:
   ```bash
   docker run --name crime-backend \
     --link crime-postgres:db \
     -p 8000:8000 \
     -e POSTGRES_SERVER=db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=crime_reporting \
     -e SECRET_KEY=your-secret-key-here \
     -e ACCESS_TOKEN_EXPIRE_MINUTES=30 \
     -d crime-reporting-backend
   ```

   Alternatively, you can use an env file:
   ```bash
   docker run --name crime-backend \
     --link crime-postgres:db \
     -p 8000:8000 \
     --env-file .env \
     -e POSTGRES_SERVER=db \
     -d crime-reporting-backend
   ```

## 3. Deploying to Render.com

Render.com makes it easy to deploy Dockerized applications.

### Steps:

1. Push your code to a GitHub, GitLab, or Bitbucket repository.

2. In Render.com, click "New" -> "Web Service".

3. Connect your repository.

4. Configure the service:
   - **Environment**: Docker
   - **Build Command**: `docker build -t crime-reporting-backend .`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Note: Render automatically sets the `PORT` environment variable.

5. Under "Advanced" -> "Environment", add the following variables:
   - `POSTGRES_SERVER`: (you'll set this after creating the database service)
   - `POSTGRES_USER`: from your .env
   - `POSTGRES_PASSWORD`: from your .env
   - `POSTGRES_DB`: from your .env
   - `SECRET_KEY`: a strong secret key
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
   - `BACKEND_CORS_ORIGINS`: set to your frontend URL (e.g., `["https://your-frontend.onrender.com"]`)

6. Add a PostgreSQL service:
   - Click "New" -> "PostgreSQL"
   - Choose a plan (the free tier is sufficient for testing)
   - Note the internal database name (e.g., `crime-reporting-db`)

7. Go back to your web service and set the `POSTGRES_SERVER` to the internal hostname of the PostgreSQL service (provided by Render, usually something like `crime-reporting-db.onrender.com`).

8. Save changes and Render will automatically deploy your application.

### Important Notes for Render:

- The `PORT` environment variable is provided by Render, so we use it in the start command.
- The database will be managed by Render's PostgreSQL service, so you don't need to run a separate container.
- For persistent storage, Render's PostgreSQL includes automatic backups and persistence.

## 4. Production Considerations

### Environment Variables
Make sure to set the following environment variables in production:

- `SECRET_KEY`: A strong, random secret key for JWT signing.
- `POSTGRES_SERVER`: The hostname of your PostgreSQL server.
- `POSTGRES_USER`: PostgreSQL username.
- `POSTGRES_PASSWORD`: PostgreSQL password.
- `POSTGRES_DB`: PostgreSQL database name.
- `POSTGRES_PORT`: PostgreSQL port (usually 5432).
- `BACKEND_CORS_ORIGINS`: A list of allowed origins for CORS (e.g., `["https://your-domain.com"]`).
- `FIRST_SUPERUSER`: Email for the first superuser (optional, for initialization).
- `FIRST_SUPERUSER_PASSWORD`: Password for the first superuser (optional).

### Database Migrations
The application uses Alembic for database migrations. The migrations are in the `alembic` directory.

To run migrations manually (if needed):
```bash
alembic upgrade head
```

In production, you might want to run migrations as part of your deployment process.

### Security
- Always change the `SECRET_KEY` in production.
- Use strong passwords for the PostgreSQL user and the first superuser.
- Consider enabling HTTPS (Render provides free SSL certificates).

## 5. Troubleshooting

### Container Logs
To see logs from the web container:
```bash
docker logs crime-backend
```

For docker-compose:
```bash
docker-compose logs web
```

### Database Connection Issues
Ensure that:
- The PostgreSQL container is running.
- The `POSTGRES_SERVER` environment variable in the web container points to the correct host.
- The credentials in the web container's environment match those set for the PostgreSQL container.

### Port Conflicts
If port 8000 is already in use, you can change the host port in the docker-compose.yml or the docker run command.

## 6. Directory Structure

After deployment, the application will be accessible at:

- API Base URL: `http://<your-domain-or-ip>:8000/api/v1`
- Interactive API Docs (Swagger UI): `http://<your-domain-or-ip>:8000/api/v1/docs`
- Alternative Docs (ReDoc): `http://<your-domain-or-ip>:8000/api/v1/redoc`

## Conclusion

You now have a production-ready deployment of the Crime Reporting Backend. For any questions or issues, refer to the logs or contact the development team.

---
*Last updated: August 20, 2026*