# 🚗 RideHub — Complete Setup, Database & Deployment Guide

Welcome to **RideHub**, a full-stack smart ride-sharing and carpooling platform built with **Java 21, Spring Boot 3, Spring JDBC (pure SQL, no ORM), and React 18**.

This guide contains everything you need to run, configure, and deploy RideHub from scratch.

---

## ⚡ 1. QUICK START (Zero-Config in 2 Minutes)

You can run RideHub immediately without installing or setting up any database server! The backend comes pre-configured with an in-memory PostgreSQL-compatible mode that automatically applies all 4 Flyway database migrations and seeds initial demo users.

### Prerequisites:
- **Java 21** (or Java 17+): [Download Adoptium OpenJDK](https://adoptium.net/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)

### 1-Click Launch on Windows:
1. Double-click `setup-project.bat` (installs frontend dependencies).
2. Double-click `start-backend.bat` (starts the Spring Boot backend on `http://localhost:8080`).
3. Double-click `start-frontend.bat` (starts the React frontend on `http://localhost:5173`).
4. Open your browser and navigate to **`http://localhost:5173`**!

---

## 🗄️ 2. DATABASE CONFIGURATION OPTIONS

RideHub supports three database setups. Choose the one that suits your needs:

### Option A: In-Memory PostgreSQL Mode (Default / Offline)
- **Requires zero setup!**
- Enabled by default when no external database environment variables are set.
- All 4 Flyway migrations (`V1` to `V4`) run automatically on startup.
- Perfect for local testing, presentations, and demoing.

---

### Option B: Free Cloud PostgreSQL on Neon (Recommended for Cloud / Team Sharing)
[Neon](https://neon.tech) offers a free, serverless PostgreSQL database that requires no local installation.

1. Go to **[https://neon.tech](https://neon.tech)** and sign up for a free account.
2. Click **Create Project** and choose a project name (e.g. `ridehub-db`).
3. In your Neon dashboard, copy the **Connection Details** (choose `Pooled connection` or `Direct connection`).
   - Format: `postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`
4. Convert it to a JDBC connection URL:
   - JDBC URL: `jdbc:postgresql://ep-xyz.region.aws.neon.tech:5432/neondb?sslmode=require`
5. Configure RideHub to connect to Neon in one of two ways:

   **Method 1: Using environment variables before running:**
   ```powershell
   $env:DATABASE_URL="jdbc:postgresql://ep-xyz.region.aws.neon.tech:5432/neondb?sslmode=require"
   $env:DATABASE_USERNAME="your-neon-username"
   $env:DATABASE_PASSWORD="your-neon-password"
   $env:DATABASE_DRIVER="org.postgresql.Driver"
   java -jar backend/target/ridehub-backend-1.0.0.jar
   ```

   **Method 2: In `backend/src/main/resources/application.yml`:**
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://ep-xyz.region.aws.neon.tech:5432/neondb?sslmode=require
       username: your-neon-username
       password: your-neon-password
       driver-class-name: org.postgresql.Driver
   ```
6. Start the backend (`start-backend.bat` or `mvnw.cmd spring-boot:run`).
   - **Flyway will automatically create all tables, indexes, and initial accounts in Neon on first startup!**

---

### Option C: Local PostgreSQL (pgAdmin / Docker)

#### Using Docker:
```bash
docker run --name ridehub-postgres -e POSTGRES_DB=ridehub -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

#### Using pgAdmin / Local PostgreSQL installer:
1. Open pgAdmin or `psql` and create a database:
   ```sql
   CREATE DATABASE ridehub;
   ```
2. In `backend/src/main/resources/application.yml` or your `.env`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/ridehub
       username: postgres
       password: your_local_password
       driver-class-name: org.postgresql.Driver
   ```

---

## 🚀 3. DEPLOYING RIDEHUB TO THE CLOUD

### Deploying Frontend to Vercel (Free)
1. Push the code or upload the `frontend/` directory to GitHub.
2. Sign in to **[Vercel](https://vercel.com/)**.
3. Click **Add New Project** and select your repository.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend-api-url.onrender.com/api/v1`
6. Click **Deploy**. Vercel will build and deploy the React app with full routing support via `vercel.json`.

---

### Deploying Backend to Render (Free)
1. Sign in to **[Render](https://render.com/)**.
2. Click **New +** -> **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (Render will automatically detect `backend/Dockerfile`), OR
   - **Runtime**: `Java` with Build Command: `mvn clean package -DskipTests` and Start Command: `java -jar target/ridehub-backend-1.0.0.jar`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Neon JDBC URL
   - `DATABASE_USERNAME` = your Neon username
   - `DATABASE_PASSWORD` = your Neon password
   - `DATABASE_DRIVER` = `org.postgresql.Driver`
   - `JWT_SECRET` = any 64-character hex string (e.g. `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`)
   - `FRONTEND_ORIGIN` = `https://your-frontend.vercel.app`
6. Click **Create Web Service**. Render will build and deploy your backend.

---

## 🔑 4. PRE-SEEDED DEMO LOGIN ACCOUNTS

The application comes pre-configured with 3 demo accounts across all user roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@ridehub.com` | `Admin@123` | Full Admin Dashboard, User & Ride moderation, Reports, Revenue KPIs |
| **Verified Driver** | `driver@ridehub.com` | `Driver@123` | Publish rides, manage vehicles, accept/reject booking requests, complete rides |
| **Passenger** | `passenger@ridehub.com` | `Passenger@123` | Search rides with filters, request seats, cancel bookings, leave verified reviews |

> *Tip: You can also register a brand new account directly from the **Register** page.*

---

## 📖 5. API DOCUMENTATION & TESTING

Once the backend is running:
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema (JSON)**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **Health Check**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

All REST endpoints follow standard conventions under `/api/v1`:
- Auth: `/api/v1/auth/login`, `/api/v1/auth/register`
- Rides: `/api/v1/rides`, `/api/v1/rides/search`, `/api/v1/rides/{id}`
- Bookings: `/api/v1/rides/{id}/bookings`, `/api/v1/bookings/my`, `/api/v1/bookings/{id}/confirm`
- Reviews: `/api/v1/reviews`, `/api/v1/users/{id}/reviews`
- Admin: `/api/v1/admin/dashboard`, `/api/v1/admin/users`, `/api/v1/admin/rides`

---

## 🛠️ 6. PROJECT DIRECTORY STRUCTURE

```
RideSharing/
├── backend/                  # Java 21 & Spring Boot 3 backend
│   ├── src/main/java/        # Clean architecture (Controllers, Services, Repositories, DTOs, Security)
│   ├── src/main/resources/   # application.yml and db/migration (Flyway SQL V1-V4)
│   ├── pom.xml               # Maven dependencies (Pure JDBC, no JPA/Hibernate)
│   ├── mvnw.cmd              # Maven wrapper (Zero installation needed)
│   └── Dockerfile            # Production multi-stage Docker build
├── frontend/                 # React 18 + Vite frontend
│   ├── src/pages/            # 19 pages (Landing, Search, Dashboard, Booking, Admin, Reviews)
│   ├── src/components/       # Reusable UI components & Design Tokens
│   ├── src/services/api.js   # Centralized Axios API client with JWT interceptors
│   ├── package.json          # Frontend dependencies
│   └── vercel.json           # Vercel deployment routing config
├── setup-project.bat         # 1-Click environment check & dependency installation
├── start-backend.bat         # 1-Click backend launcher
├── start-frontend.bat        # 1-Click frontend launcher
├── package-for-whatsapp.bat  # 1-Click WhatsApp packaging utility
└── SETUP-GUIDE.md            # This complete guide
```

Enjoy using **RideHub**! If you have any questions or need custom feature additions, feel free to ask.
