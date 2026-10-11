# 🚀 Deployment Guide: Deploying RideHub for Your Friend

This guide walks you through deploying the complete full-stack **RideHub** application into **your friend's GitHub repository** using **their credentials** across **Neon (Database)**, **Render (Backend)**, and **Vercel (Frontend)**. All three services offer 100% free tiers with no credit card required.

---

## 📋 Architecture Overview

```
[ Passenger / Driver / Admin Browser ]
                  │
                  ▼
   [ Vercel: React 18 + Vite Frontend ]
                  │
                  ▼ REST API (JWT Authenticated)
   [ Render: Spring Boot 3 + Java 21 Backend ]
                  │
                  ▼ Flyway Migrations & Pure SQL
   [ Neon.tech: Free Serverless PostgreSQL ]
```

---

## 🛠️ STEP 1: Push Code to Your Friend's GitHub Repository

### 1.1 Create the Repository on Friend's GitHub
1. Ask your friend to log into [GitHub](https://github.com/) with their account.
2. Click **New Repository** (`+` icon at the top right).
3. Name it: `ridehub` (or any preferred name).
4. Set visibility: **Public** or **Private**.
5. **Do NOT** check "Add a README", ".gitignore", or "license" (we already have them).
6. Click **Create repository**.
7. Copy the repository URL (e.g., `https://github.com/<friend-username>/ridehub.git`).

### 1.2 Push Code from Your Local Terminal
Open PowerShell or Command Prompt in `c:\JFS\RideSharing` and run:

```powershell
# 1. Initialize and stage all project files
git init
git add .
git commit -m "Initial commit: Production-ready RideHub full-stack application"

# 2. Set the main branch
git branch -M main

# 3. Add your friend's repository as the remote origin
git remote add origin https://github.com/<friend-username>/ridehub.git

# 4. Push to their repository
git push -u origin main
```

> **Note on Friend's Credentials:** When running `git push`, Git will prompt for authentication:
> - **Username**: your friend's GitHub username.
> - **Password**: a GitHub Personal Access Token (classic) with `repo` scope generated from [GitHub Developer Settings](https://github.com/settings/tokens), or sign in via browser popup if using Git Credential Manager.

---

## 🗄️ STEP 2: Set Up the Free Database on Neon (1 Minute)

[Neon](https://neon.tech) provides a fast, serverless PostgreSQL database that requires zero maintenance.

1. Have your friend sign up or log in at **[https://neon.tech](https://neon.tech)** (free tier).
2. Click **Create Project**.
3. Choose a project name (e.g. `ridehub-db`) and pick the closest region.
4. Once created, you will see the **Connection Details** on the dashboard.
5. Copy the connection string. It will look like:
   ```
   postgresql://neondb_owner:npg_abcdef123@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. **Save this connection string** — you'll paste it directly into Render in Step 3!

> **Automatic Migrations:** The backend automatically executes all Flyway migrations (`V1` to `V4`) and seeds the initial demo accounts on first launch. No manual SQL scripts need to be run!

---

## 🖥️ STEP 3: Deploy the Backend on Render (Free)

[Render](https://render.com) will host the Spring Boot 3 Docker service.

1. Have your friend log into **[https://render.com](https://render.com)** using their GitHub account.
2. Click **New +** at the top right -> Select **Web Service**.
3. Under **Connect a repository**, select your friend's repository (`ridehub`).
4. Configure the service details:
   - **Name**: `ridehub-backend` (or your choice)
   - **Region**: Choose the same region or closest to the Neon database (e.g. `Ohio (US East)` or `Oregon (US West)`)
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
5. Scroll down to **Environment Variables** and add the following:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | *Paste Neon connection string from Step 2* | Backend automatically handles `postgresql://` or `jdbc:postgresql://` |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 64-character hex secret for signing auth tokens |
   | `FRONTEND_ORIGIN` | `https://*.vercel.app,http://localhost:5173` | Allows Vercel frontend to make CORS requests |

6. Click **Deploy Web Service**.
7. Wait 2–4 minutes for Render to build the Docker image and start the application.
8. Once the status shows **Live**, copy your public Backend URL:
   - Example: `https://ridehub-backend-xyz.onrender.com`
9. Verify health by opening: `https://ridehub-backend-xyz.onrender.com/actuator/health` in your browser (it should return `{"status":"UP"}`).

---

## 🌐 STEP 4: Deploy the Frontend on Vercel (Free)

[Vercel](https://vercel.com) provides instant CDN hosting for Vite + React applications.

1. Have your friend log into **[https://vercel.com](https://vercel.com)** using their GitHub account.
2. Click **Add New...** -> **Project**.
3. Import the repository (`ridehub`).
4. In the Project Configuration screen:
   - **Root Directory**: Click **Edit** next to `./` and select `frontend`. Click **Continue**.
   - **Framework Preset**: Should automatically detect `Vite`.
   - **Build and Output Settings**: Leave as default (`npm run build`, `dist`).
5. Open **Environment Variables** and add:

   | Name | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend-name.onrender.com/api/v1` |

   *(Replace with your friend's actual Render backend URL from Step 3)*

6. Click **Deploy**.
7. In ~45 seconds, the deployment will finish! Click **Go to Dashboard** or the preview image to open the live site.
   - Example: `https://ridehub-frontend.vercel.app`

---

## 🔑 STEP 5: Verification & Pre-Seeded Logins

The application will be live immediately! Open the Vercel frontend URL and log in with any of the pre-seeded role accounts:

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ridehub.com` | `Admin@123` | Admin KPIs, moderation, viewing all users/rides/bookings/reports |
| **Driver** | `driver@ridehub.com` | `Driver@123` | Publish new rides, accept/reject bookings, manage vehicles |
| **Passenger** | `passenger@ridehub.com` | `Passenger@123` | Search rides, book seats, leave ratings and reviews |

*(You can also use the **Demo Quick-Fill** buttons on the login page or register a brand new account!)*

---

## 💡 Troubleshooting & Pro-Tips

- **Render Free Tier Spin-down:** On the free tier, Render puts web services to sleep after 15 minutes of inactivity. The first request after sleep takes 30-45 seconds to wake up. This is normal.
- **CORS Errors:** Our backend configuration now dynamically permits any `https://*.vercel.app` domain. You will not experience CORS rejections when testing preview or production Vercel branches.
- **Live Swagger API Docs:** Your friend can access interactive Swagger UI anytime at:
  `https://your-backend-name.onrender.com/swagger-ui/index.html`
