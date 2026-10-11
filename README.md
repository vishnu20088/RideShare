# RIDEHUB — Smart Ride Sharing & Carpooling Platform

A production-ready **Java Full-Stack** ride-sharing and carpooling web platform connecting drivers with empty car seats to passengers traveling along similar routes. Built with **Spring Boot 3, Java 21, Spring JDBC / JdbcTemplate, Neon Serverless PostgreSQL, Flyway, and React.js (Vite)**.

---

## 🌟 Key Capabilities & Features

### 1. Robust Role-Based Access Control
- **Passenger**: Search trips with filters, request seat reservations, track booking statuses, cancel reservations, review drivers after trip completion.
- **Driver**: Register vehicles, publish rides with pricing & seats, review passenger requests with atomic confirmations, mark rides completed.
- **Administrator**: Comprehensive dashboard metrics, user suspension/reactivation, ride oversight, booking audit ledger, and safety report investigation.
- Dual-role support: Any user can act as both passenger and driver without separate accounts.

### 2. Transactional Concurrency & Atomic Seat Allocation
- **Atomic Deduction**: Seat deduction uses row-level locking (`SELECT ... FOR UPDATE`) and conditional SQL updates (`UPDATE rides SET available_seats = available_seats - ? WHERE id = ? AND available_seats >= ?`) to guarantee zero overselling under simultaneous requests.
- **Seat Restoration**: Cancelling a confirmed booking safely restores seats to the ride (`available_seats = LEAST(total_seats, available_seats + ?)`), while repeated confirmations or duplicate reviews are strictly rejected.
- **Zero ORM / JPA**: Built 100% with `JdbcTemplate` and parameterized SQL queries to prevent SQL injection and maximize performance.

### 3. Serverless Cloud Database & Migrations
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL with SSL encryption.
- **Flyway Migrations**: Managed schema evolution (`V1__...` to `V4__...`) with standard relational types (`BIGINT`, `VARCHAR`, `NUMERIC`, `TIMESTAMP WITH TIME ZONE`, `BOOLEAN`).

---

## 🛠️ Mandatory Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Vanilla CSS (Design Tokens), Vite |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring JDBC (`JdbcTemplate`), Spring Security (Stateless JWT), Bean Validation, Actuator |
| **Database** | Neon Serverless PostgreSQL (Driver: `postgresql-42.7.3`), Flyway 10.10.0 (H2 PostgreSQL-mode for test fallback) |
| **Security** | BCrypt password hashing, HMAC-SHA256 JWT tokens, CORS whitelist |
| **Testing** | JUnit 5, MockMvc, Spring Boot Test, Mockito |
| **API Docs** | Springdoc OpenAPI / Swagger UI 2.5.0 |

---

## 📁 Project Architecture

```text
RideSharing/
├── backend/
│   ├── src/main/java/com/ridehub/
│   │   ├── config/          # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/      # Auth, User, Driver, Vehicle, Ride, Booking, Review, Notification, Admin
│   │   ├── dto/             # Request/Response contracts & validation
│   │   ├── exception/       # GlobalExceptionHandler, Custom exceptions, ErrorResponse
│   │   ├── model/           # Relational entities & enums
│   │   ├── repository/      # Pure JdbcTemplate repositories with parameterized SQL
│   │   ├── security/        # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│   │   ├── service/         # Transactional business logic & seat allocation
│   │   └── RideHubApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml  # Neon config with fallback defaults
│   │   └── db/migration/    # Flyway V1 - V4 PostgreSQL SQL migrations
│   ├── src/test/java/       # Automated JUnit 5 & MockMvc test suites
│   ├── pom.xml
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI, Layout, RideCards, BookingCards, SearchForm
│   │   ├── context/         # AuthContext (state, tokens, roles)
│   │   ├── hooks/           # useAuth
│   │   ├── pages/           # Landing, Browse, Details, Auth, Dashboards, Admin
│   │   ├── services/        # Axios api.js with JWT interceptor
│   │   ├── utils/           # Formatters (currency, dates, times)
│   │   ├── App.jsx          # Protected & Admin route definitions
│   │   ├── index.css        # Rich design tokens (Navy surfaces, Emerald accents)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
├── render.yaml              # Render Docker deployment specification
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Java 21** or higher
- **Maven 3.9+**
- **Node.js 18+** & npm 9+

### 1. Run the Spring Boot Backend

```bash
cd backend

# Run automated test suite (100% passing)
mvn test

# Package executable JAR
mvn package -DskipTests

# Start the backend server
java -jar target/ridehub-backend-1.0.0.jar
```

The backend starts at `http://localhost:8080`.
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **Actuator Health Check**: `http://localhost:8080/actuator/health`

### 2. Run the React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application starts at `http://localhost:5173`.

---

## 🔑 Demo Accounts (Pre-Seeded)

The database automatically initializes the following accounts for immediate testing:

| Role | Email | Password | Pre-configured Data |
|---|---|---|---|
| **Administrator** | `admin@ridehub.com` | `Admin@123` | Full administrative privileges |
| **Driver** | `driver@ridehub.com` | `Driver@123` | Verified driver profile, registered vehicle |
| **Passenger** | `passenger@ridehub.com` | `Passenger@123` | Active passenger profile ready to book |

*Quick-autofill buttons for these accounts are available directly on the login screen.*

---

## 🗄️ Neon PostgreSQL Configuration

To connect directly to your live **Neon Serverless PostgreSQL** database:

1. Obtain your connection string from the [Neon Console](https://console.neon.tech).
2. Set the following environment variables (or create `backend/.env`):

```env
DATABASE_URL=jdbc:postgresql://ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your_neon_password
DATABASE_DRIVER=org.postgresql.Driver
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
FRONTEND_ORIGIN=http://localhost:5173,https://your-app.vercel.app
SERVER_PORT=8080
```

Flyway will automatically execute migrations `V1` through `V4` on startup against your Neon database.

---

## 🧪 Automated Testing Verification

The backend test suite verifies:
- **Authentication**: Registration, duplicate email rejection (409 Conflict), invalid credentials (401), protected endpoint authorization.
- **Authorization**: Passenger restricted from administrative endpoints (403 Forbidden), admin granted access.
- **Ride Lifecycle**: Search & filters, driver self-booking restrictions, available seat bounds.
- **Atomic Booking Logic**: Seat deduction upon confirmation, repeated confirmation rejections, atomic seat restoration upon cancellation.
- **Database Constraints**: Review restrictions on non-completed rides.

```bash
mvn test
# Results: Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS
```

---

## 🌐 Deployment Instructions

### React Frontend on Vercel
1. Link the repository to Vercel with **Root Directory** set to `frontend`.
2. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api/v1`
3. Vercel automatically detects `vercel.json` and configures single-page client routing.

### Spring Boot Backend on Render / Railway
1. Create a **Web Service** using Docker (using `backend/Dockerfile` or `render.yaml`).
2. Add your Neon credentials in the Environment Variables:
   - `DATABASE_URL`: `jdbc:postgresql://ep-your-subdomain.neon.tech/neondb?sslmode=require`
   - `DATABASE_USERNAME`: `neondb_owner`
   - `DATABASE_PASSWORD`: `your-neon-password`
   - `JWT_SECRET`: (generated secure 256-bit secret)
   - `FRONTEND_ORIGIN`: `https://your-frontend.vercel.app`

---

## 🛡️ License

Built with pride for RideHub under the Apache 2.0 License.
