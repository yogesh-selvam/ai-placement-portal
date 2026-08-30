# CareerConnect AI 🚀

> **AI-powered placement and career opportunity platform for students and job seekers.**

CareerConnect AI is a full-stack web application designed to simplify the placement journey by bringing **job discovery, AI-powered career matching, applications, saved jobs, notifications, and profile management** into a single platform.

The application is built with a modern JavaScript stack and deployed using **Vercel, Render, and PostgreSQL** for a production-ready architecture.

---

## 🌟 Overview

Finding relevant opportunities during college placements can be difficult when job listings, applications, saved opportunities, and profile information are scattered across different platforms.

**CareerConnect AI** provides a centralized career platform where users can:

- 🔐 Sign in using college email and OTP authentication
- 👤 Create and manage their career profile
- 💼 Discover available jobs and internships
- 🔎 Search opportunities by title, skill, or location
- 🤖 View AI-powered job recommendations
- 📄 Apply for suitable opportunities
- 🔖 Save jobs for later
- 🔔 Receive application and career-related notifications
- 📊 Track applications and shortlisted opportunities
- 🎯 Improve profile completion and job matching

---

## ✨ Key Features

### 🔐 OTP-Based Authentication

Users can authenticate using their college email address.

**Authentication flow:**

```text
College Email
      ↓
Request OTP
      ↓
OTP Verification
      ↓
User Authentication
      ↓
CareerConnect Dashboard
```

---

### 🏠 Personalized Dashboard

The dashboard provides a quick overview of the user's career activity.

It includes:

- Welcome section
- Profile completion percentage
- Applications count
- Shortlisted opportunities
- Interview count
- Saved jobs count
- Recommended opportunities
- AI matching entry point

---

### 💼 Job Discovery

Users can browse available job opportunities and internships.

Each job can contain:

- Job title
- Company
- Location
- Work mode
- Employment type
- Salary
- Description
- Eligibility
- Required skills

Example opportunities include:

- Frontend Developer
- Data Analyst
- Software Developer
- AI/ML Intern

---

### 🔎 Job Search

Users can search for opportunities based on:

- Job title
- Skills
- Location

This makes it easier to quickly find relevant career opportunities.

---

### 🤖 AI-Powered Job Matching

CareerConnect AI is designed around personalized career recommendations.

The recommendation system can use profile information such as:

- Skills
- Education
- Career interests
- Experience
- Job requirements

The goal is to surface opportunities that are more relevant to each user's profile.

---

### 📄 Application Tracking

Users can apply for jobs and track their application activity.

Application-related information can include:

- Applied job
- Application status
- Application history
- Shortlisted status
- Interview-related information

---

### 🔖 Saved Jobs

Users can save interesting jobs and access them later from the **Saved Jobs** section.

This helps users maintain a personal shortlist of opportunities without immediately applying.

---

### 🔔 Notifications

The platform provides a notification area for important career and application updates.

Examples include:

- Application updates
- Shortlisting updates
- Interview-related notifications
- Platform notifications

---

### 👤 Profile Management

Users can maintain their professional profile and improve their profile completion percentage.

Profile information can be used to improve the relevance of job recommendations.

---

## 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │       User            │
                    │   Web Browser         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       Vercel          │
                    │   React + Vite        │
                    │      Frontend         │
                    └───────────┬───────────┘
                                │
                         HTTPS / REST API
                                │
                                ▼
                    ┌───────────────────────┐
                    │       Render          │
                    │  Node.js + Express    │
                    │       Backend         │
                    └───────────┬───────────┘
                                │
                         Prisma ORM
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL DB       │
                    │       Render          │
                    └───────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend build tool |
| JavaScript | Application logic |
| CSS | Styling and responsive UI |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API |
| Prisma | Database ORM |
| JavaScript | Backend logic |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Production relational database |
| Prisma Schema | Database models and relationships |

### Deployment

| Platform | Responsibility |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend API hosting |
| Render PostgreSQL | Production database |

---

## 📁 Project Structure

```text
ai-placement-portal-fullstack/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   └── server.js
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── package.json
│   └── .env
│
├── README.md
└── package.json
```

> Folder names may vary slightly depending on the current project version.

---

## 🗄️ Database

CareerConnect AI uses **PostgreSQL** with **Prisma ORM**.

The application contains database entities for major platform features, including:

```text
User
Job
Application
ApplicationHistory
SavedJob
Notification
OtpCode
Project
Skill
```

### Relationship Overview

```text
User
 │
 ├── Applications
 │
 ├── Saved Jobs
 │
 ├── Notifications
 │
 ├── OTP Codes
 │
 ├── Projects
 │
 └── Skills

Job
 │
 ├── Applications
 │
 └── Saved Jobs
```

---

## 🔌 API Overview

The backend exposes REST API endpoints for the frontend.

### Health Check

```http
GET /api/health
```

Used to verify that the backend service is running.

### Jobs

```http
GET /api/jobs
```

Returns available job opportunities.

### Authentication

```http
POST /api/auth/request-otp
POST /api/auth/verify-otp
```

Used for OTP-based authentication.

### Recommended Jobs

The backend also provides recommendation functionality for personalized job discovery.

> API routes may evolve as new features are added.

---

## 🔐 Environment Variables

### Backend

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=10000

DATABASE_URL="your_postgresql_connection_string"

CLIENT_URL="https://your-vercel-domain.vercel.app"

RESEND_API_KEY="your_resend_api_key"
```

### Frontend

For Vite, configure:

```env
VITE_API_URL="https://your-render-api.onrender.com"
```

### ⚠️ Security

Never commit real credentials or secret keys to GitHub.

Do **not** expose:

```text
DATABASE_URL
RESEND_API_KEY
JWT_SECRET
API keys
SMTP credentials
```

Use environment variables in Vercel and Render instead.

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/yogesh-selvam/ai-placement-portal.git
```

```bash
cd ai-placement-portal
```

---

### 2. Install dependencies

Install root dependencies if required:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

### 3. Configure PostgreSQL

Create/configure a PostgreSQL database and add the connection string to:

```text
server/.env
```

Example:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
```

---

### 4. Generate Prisma Client

From the `server` directory:

```bash
npx prisma generate
```

---

### 5. Validate Prisma Schema

```bash
npx prisma validate --schema=prisma/schema.prisma
```

---

### 6. Start Backend

From the `server` directory:

```bash
npm start
```

The API should be available on the configured backend port.

---

### 7. Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Vite will provide a local development URL, usually similar to:

```text
http://localhost:5173
```

---

## 🏭 Production Deployment

CareerConnect AI is deployed using:

```text
GitHub
   │
   ├──────────────► Render
   │                  │
   │                  ├── Node.js API
   │                  └── PostgreSQL
   │
   └──────────────► Vercel
                      │
                      └── React/Vite Frontend
```

### Backend Deployment

The backend is hosted on Render.

Production API:

```text
https://careerconnect-ai-api.onrender.com
```

### Frontend Deployment

The frontend is hosted on Vercel.

The frontend uses the Render API through:

```env
VITE_API_URL=https://careerconnect-ai-api.onrender.com
```

### CORS

The backend is configured to allow the production frontend origin and Vercel deployment domains.

This allows the browser-based frontend to communicate securely with the Render API.

---

## 🌐 Live Application

### Frontend

**CareerConnect AI**

```text
https://ai-placement-portal-beta.vercel.app
```

### Backend API

```text
https://careerconnect-ai-api.onrender.com
```

### Health Check

```text
https://careerconnect-ai-api.onrender.com/api/health
```

---

## 🧪 Production Verification

After deployment, verify the following:

### Frontend

- [x] Vercel deployment successful
- [x] Application loads successfully
- [x] Dashboard renders correctly
- [x] Navigation works

### Backend

- [x] Render deployment successful
- [x] API is reachable
- [x] Job API returns data
- [x] Authentication API is available
- [x] CORS configuration works

### Database

- [x] PostgreSQL connection configured
- [x] Prisma schema validated
- [x] Job records available
- [x] Application-related tables available

### Integration

- [x] Vercel frontend communicates with Render backend
- [x] Production API URL configured
- [x] CORS issue resolved
- [x] Production application successfully loads backend data

---

## 📊 Current Job Data

The application includes production-style sample job opportunities such as:

| Role | Company | Location | Mode | Type |
|---|---|---|---|---|
| Frontend Developer | WebFlow | San Francisco, CA | On-site | Full-time |
| Data Analyst | InsightCorp | Remote | Remote | Full-time |
| Software Developer | TechNova | San Francisco, CA | Hybrid | Full-time |
| AI/ML Intern | FutureScale | Remote | Remote | Internship |

These records are intended to demonstrate the platform's job discovery and recommendation workflow.

---

## 🔄 Application Workflow

```text
                    START
                      │
                      ▼
              Enter College Email
                      │
                      ▼
                 Request OTP
                      │
                      ▼
                Verify OTP
                      │
                      ▼
                User Dashboard
                      │
          ┌───────────┼────────────┐
          ▼           ▼            ▼
       Search       Profile      AI Match
        Jobs       Completion    Jobs
          │           │            │
          └───────────┼────────────┘
                      ▼
                 View Job
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Save Job          Apply Job
             │                 │
             ▼                 ▼
        Saved Jobs       Application
                              │
                              ▼
                       Track Status
```

---

## 🎯 Project Objectives

CareerConnect AI aims to:

1. Centralize placement opportunities.
2. Reduce the time required to discover relevant jobs.
3. Personalize job recommendations.
4. Simplify the application process.
5. Help students track their career activity.
6. Provide a scalable foundation for future AI-driven placement features.

---

## 🔮 Future Enhancements

Potential future improvements include:

- 🧠 Advanced AI job matching
- 📄 AI-powered resume analysis
- 🎯 Skill-gap detection
- 📚 Personalized learning recommendations
- 🎤 AI mock interviews
- 📝 Resume builder
- 📈 Placement analytics dashboard
- 🏢 Recruiter/company portal
- 🔔 Real-time notifications
- 📊 Advanced application analytics
- 🧩 Skill-based recommendation scoring
- ☁️ Improved production monitoring

---

## 🔒 Security Considerations

The production application should follow these security practices:

- Store secrets only in environment variables.
- Never commit `.env` files.
- Validate user input on the backend.
- Use HTTPS in production.
- Configure CORS carefully.
- Protect authenticated API routes.
- Use secure OTP expiration and verification.
- Avoid exposing database credentials.
- Keep dependencies updated.
- Apply appropriate rate limiting to authentication endpoints.

---

## 🧑‍💻 Git Workflow

Recommended development workflow:

```bash
git pull origin main
```

Make changes, then:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

Connected deployments can then build the latest `main` branch.

---

## 🐛 Troubleshooting

### Frontend cannot connect to backend

Check:

```env
VITE_API_URL=https://careerconnect-ai-api.onrender.com
```

Then verify:

```text
https://careerconnect-ai-api.onrender.com/api/health
```

---

### CORS Error

Verify that the frontend production domain is allowed by the backend CORS configuration.

Also make sure the backend is running and the frontend is using the correct Render API URL.

---

### Prisma Error

Run:

```bash
npx prisma validate --schema=prisma/schema.prisma
```

Then:

```bash
npx prisma generate
```

---

### Render Deployment Failure

Check:

- Build command
- Start command
- Environment variables
- Node.js version
- Prisma generation
- Database connection
- Render deployment logs

---

### Vercel Deployment Failure

Check:

- Root Directory
- Build Command
- Output Directory
- `VITE_API_URL`
- Git branch
- Build logs

For a Vite frontend, typical settings are:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

---

## 📸 Application Preview

The production application provides a clean career-focused interface containing:

- CareerConnect AI branding
- Personalized welcome dashboard
- Profile completion indicator
- Job search
- Applications
- Saved Jobs
- Notifications
- AI-powered recommendations

---

## 📌 Project Status

**Status: Production Deployment Ready / Live**

```text
Frontend        → Vercel       ✅
Backend         → Render       ✅
Database        → PostgreSQL   ✅
ORM             → Prisma       ✅
Authentication  → OTP          ✅
CORS            → Configured   ✅
Git Repository  → GitHub       ✅
Production API  → Live         ✅
```

---

## 👨‍💻 Developer

**Yogesh Selvam**

GitHub:

```text
https://github.com/yogesh-selvam/ai-placement-portal
```

---

## 📄 License

This project is intended for educational, portfolio, and placement-project purposes.

If you plan to distribute or commercialize the project, add an appropriate open-source or proprietary license before publication.

---

## ⭐ Support

If you find the project useful, consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  <strong>CareerConnect AI</strong><br>
  Your career. Your opportunities. Your future. 🚀
</p>
