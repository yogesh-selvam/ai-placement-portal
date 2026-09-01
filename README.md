# 🎓 CareerConnect AI

<p align="center">

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Authentication-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Resume%20Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />

</p>

<p align="center">

  <img src="https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
  <img src="https://img.shields.io/badge/Firebase%20Admin-Secure%20API%20Access-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" />

</p>

<p align="center">
  <strong>A full-stack career and placement management platform for students and job seekers.</strong>
</p>

<p align="center">
  Discover opportunities • Build your profile • Track applications • Get career guidance
</p>

---

# 🌟 Overview

**CareerConnect AI** is a full-stack career and placement platform designed to help students and job seekers manage their career journey from a single application.

The platform combines:

- 🔐 Secure Firebase authentication
- ✉️ Email verification
- 👤 Student profile management
- 💼 Job discovery and filtering
- 🎯 Skill-based job matching
- 📝 Job applications
- 📊 Application tracking
- 🔖 Saved jobs
- 🔔 Notifications
- 🤖 Career assistant
- 📄 PDF resume upload
- ☁️ Cloudinary resume storage
- ☁️ Production deployment

The application follows a modern client-server architecture with a React frontend, Express backend, Firebase authentication, PostgreSQL database, and Prisma ORM.

---

# ✨ Key Features

## 🔐 Authentication

- Firebase Email/Password authentication
- User registration
- Secure login
- Email verification
- Protected application access
- Firebase ID token authentication
- Firebase Admin SDK token verification
- Automatic authenticated user synchronization with backend

> Users must verify their email before accessing the main application dashboard.

---

## 👤 Profile Management

Users can create and maintain a professional career profile.

### Profile Information

- Personal information
- Education details
- Skills
- Projects
- PDF resume upload
- Cloudinary-hosted resume
- Career-related information

Profile data is stored securely in PostgreSQL through Prisma. Uploaded PDF resumes are stored in Cloudinary, with the Cloudinary secure URL saved in the user's `resumeUrl` field.

---

## 📄 Resume Management

CareerConnect AI allows users to upload their resume directly from the profile instead of entering a manual resume URL.

### Resume Upload Flow

```text
Select PDF Resume
      │
      ▼
Frontend Upload
      │
      ▼
Express Backend
      │
      ▼
Cloudinary
      │
      ▼
Secure Resume URL
      │
      ▼
PostgreSQL
      │
      ▼
View Resume
```

### Resume Features

- PDF-only resume upload
- Maximum file size: 5 MB
- Resume upload handled by the backend
- Cloudinary used for cloud file storage
- Cloudinary `secure_url` saved in PostgreSQL
- View uploaded resume
- Replace an existing resume
- No manual resume URL entry required

---

## 💼 Job Management

CareerConnect AI provides a centralized job discovery experience.

### Job Features

- View available jobs
- Search jobs
- Filter jobs
- View job details
- Check required skills
- Compare skills with profile
- Apply for jobs
- Save jobs for later

---

## 🎯 Skill-Based Job Matching

The platform compares the user's profile skills with the skills required by each job.

### Matching Logic

```text
User Skills
     │
     ▼
Required Job Skills
     │
     ▼
Compare Skills
     │
     ├── Matching Skills
     │
     └── Missing Skills
     │
     ▼
Match Percentage
     │
     ▼
Recommended Opportunities
````

Jobs can be ranked based on the percentage of required skills matching the user's profile.

---

# 📊 Applications

Users can manage their job applications from one place.

### Application Features

- Apply to jobs
- View submitted applications
- Track application status
- View application history
- Monitor shortlisted applications
- Receive application-related notifications

### Application Flow

```text
Browse Jobs
    │
    ▼
View Job Details
    │
    ▼
Apply
    │
    ▼
Application Created
    │
    ▼
Application Tracking
    │
    ├── Applied
    ├── Shortlisted
    ├── Interview
    ├── Selected
    └── Rejected
```

---

# 🔖 Saved Jobs

Users can save interesting opportunities and manage them later.

- Save a job
- View saved jobs
- Remove saved jobs
- Quickly return to interesting opportunities

---

# 🔔 Notifications

The application provides notification management for authenticated users.

### Notification Features

- View notifications
- Display latest notifications first
- Track read/unread state
- Mark all notifications as read

---

# 🤖 Career Assistant

CareerConnect AI includes an authenticated career assistant interface.

The assistant can provide profile-based career guidance using the user's stored skills.

### Example Assistance

- Job matching guidance
- Resume improvement suggestions
- Interview preparation guidance
- Technology-focused project preparation
- Career-related questions

```text
User Question
      │
      ▼
Authenticated Request
      │
      ▼
Load User Profile
      │
      ▼
Read User Skills
      │
      ▼
Generate Career Guidance
      │
      ▼
Assistant Response
```

> The current assistant implementation provides profile-based guidance using the user's stored skills. It does not claim to use an external LLM provider unless one is explicitly integrated.

---

# 🧩 Modules

| ModuleStatus                 |            |
| ---------------------------- | ---------- |
| 🔐 Firebase Authentication   | ✅ Complete |
| ✉️ Email Verification        | ✅ Complete |
| 👤 Profile Management        | ✅ Complete |
| 🎓 Education Details         | ✅ Complete |
| 🛠️ Skills Management        | ✅ Complete |
| 🚀 Project Management        | ✅ Complete |
| 📄 Resume Upload             | ✅ Complete |
| ☁️ Cloudinary Resume Storage | ✅ Complete |
| 💼 Job Listing               | ✅ Complete |
| 🔎 Job Search & Filtering    | ✅ Complete |
| 🎯 Skill Matching            | ✅ Complete |
| 📝 Job Applications          | ✅ Complete |
| 📊 Application Tracking      | ✅ Complete |
| 🔖 Saved Jobs                | ✅ Complete |
| 🔔 Notifications             | ✅ Complete |
| 🤖 Career Assistant          | ✅ Complete |
| ☁️ Vercel Deployment         | ✅ Complete |
| 🚀 Render Backend Deployment | ✅ Complete |
| 🗄️ PostgreSQL Database      | ✅ Complete |

---

# 🏗️ Application Workflow

```text
                    ┌─────────────────────┐
                    │       USER          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Firebase Auth       │
                    │ Email + Password    │
                    └──────────┬──────────┘
                               │
                         Email Verified
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │     + Vite          │
                    └──────────┬──────────┘
                               │
                         API Requests
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Express Backend    │
                    │   + Auth Middleware │
                    └──────────┬──────────┘
                               │
                     Firebase ID Token
                        Verification
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Prisma ORM        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PostgreSQL DB     │
                    └─────────────────────┘
```

---

# 🧱 Tech Stack

## Frontend

| TechnologyPurpose |                   |
| ----------------- | ----------------- |
| React 18          | User interface    |
| Vite              | Frontend tooling  |
| JavaScript        | Application logic |
| CSS               | Styling           |
| Lucide React      | UI icons          |
| Firebase Web SDK  | Authentication    |

---

## Backend

| TechnologyPurpose  |                             |
| ------------------ | --------------------------- |
| Node.js            | Runtime                     |
| Express.js         | REST API                    |
| Firebase Admin SDK | Authentication verification |
| Prisma             | Database ORM                |
| PostgreSQL         | Persistent database         |
| CORS               | Cross-origin communication  |
| Cloudinary         | Resume file storage         |
| Multer             | Resume file upload handling |

---

## Deployment

| PlatformResponsibility |                     |
| ---------------------- | ------------------- |
| Vercel                 | React frontend      |
| Render                 | Express backend     |
| Render PostgreSQL      | Production database |
| Firebase               | Authentication      |
| Cloudinary             | Resume file storage |

---

# 🏛️ System Architecture

```text
                         INTERNET
                             │
                             ▼
                ┌────────────────────────┐
                │        VERCEL          │
                │    React + Vite App    │
                └────────────┬───────────┘
                             │
                             │ HTTPS API
                             ▼
                ┌────────────────────────┐
                │        RENDER          │
                │   Express REST API     │
                └────────────┬───────────┘
                             │
                    Firebase ID Token
                       Verification
                             │
                             ▼
                ┌────────────────────────┐
                │    FIREBASE ADMIN      │
                │ Authentication Layer   │
                └────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │        PRISMA          │
                │       ORM Layer        │
                └────────────┬───────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │      POSTGRESQL        │
                │    Application Data    │
                └────────────────────────┘
```

---

# 📁 Project Structure

```text
ai-placement-portal-fullstack/
│
├── client/
│   ├── src/
│   │   ├── api.js
│   │   ├── firebase.js
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

> Firebase service-account credentials, Cloudinary API secrets, database passwords, and other environment secrets must never be committed to the repository.

---

# 🔐 Authentication Architecture

CareerConnect AI uses **Firebase Authentication** for identity management.

```text
Register
   │
   ▼
Firebase Email/Password
   │
   ▼
Verification Email
   │
   ▼
User Verifies Email
   │
   ▼
Login
   │
   ▼
Firebase ID Token
   │
   ▼
Authorization Header
   │
   ▼
Express Auth Middleware
   │
   ▼
Firebase Admin SDK
   │
   ▼
Verified User
   │
   ▼
Protected API
```

### Security Layers

- 🔐 Firebase Authentication
- ✉️ Email verification
- 🛡️ Firebase Admin token verification
- 🔑 Bearer token authorization
- 🌐 HTTPS production communication
- 🚫 CORS configuration
- 🔒 Environment-based secrets
- 🗄️ Protected database operations
- 🚫 No production credentials committed to Git

---

# 🔌 API Overview

All protected endpoints require a valid Firebase ID token.

## Authentication

```text
GET /auth/me
```

Returns the currently authenticated application user.

---

## Profile

```text
GET  /api/profile
PUT  /api/profile
```

Used to load and update user profile information.

---

## Notifications

```text
GET   /api/notifications
PATCH /api/notifications/read-all
```

Used to retrieve and manage notifications.

---

## Career Assistant

```text
POST /api/assistant/chat
```

Accepts a career-related message and returns profile-based career guidance.

---

# ⚙️ Environment Variables

## Frontend

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

Firebase web configuration is provided through the application's Firebase configuration.

---

## Backend

Create:

```text
server/.env
```

Typical production configuration includes:

```env
DATABASE_URL=your_postgresql_connection_string

CLIENT_URL=your_frontend_url

FIREBASE_PROJECT_ID=your_firebase_project_id

FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email

FIREBASE_PRIVATE_KEY=your_firebase_private_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### ⚠️ Important

Never commit:

```text
.env
firebase-service-account.json
Firebase private keys
Database passwords
API secrets
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/yogesh-selvam/ai-placement-portal.git
cd ai-placement-portal
```

---

## 2. Install Dependencies

From the project root:

```bash
npm run install:all
```

Or install manually:

```bash
cd server
npm install

cd ../client
npm install
```

---

# 🔥 Firebase Setup

Create or configure a Firebase project and enable:

```text
Authentication
    │
    └── Sign-in method
          │
          └── Email/Password
```

Configure the Firebase web application for the frontend.

For the backend, configure Firebase Admin SDK using environment variables.

> Never place Firebase Admin private credentials directly inside source code.

---

# 🗄️ Database Setup

Configure PostgreSQL and add the connection string:

```env
DATABASE_URL=your_postgresql_connection_string
```

Then configure Prisma according to the project's schema.

Example commands:

```bash
cd server
npx prisma generate
```

For development database changes, use the Prisma workflow appropriate to your schema and migration setup.

---

# ☁️ Cloudinary Resume Storage

Cloudinary is used to store uploaded PDF resumes in the production application.

### Backend Configuration

Add these variables to `server/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For Render production deployment, add the same variables under the backend service's Environment settings.

### Upload Rules

```text
File Type : PDF only
Max Size  : 5 MB
Storage   : Cloudinary
Database  : PostgreSQL
```

The backend uploads the PDF to Cloudinary and stores the returned `secure_url` in the user's existing `resumeUrl` database field.

> Never commit `CLOUDINARY_API_SECRET` or any other Cloudinary credentials to Git.

---

# ▶️ Run the Application

## Start Backend

From the root:

```bash
npm run dev:server
```

Backend:

```text
http://localhost:5000
```

---

## Start Frontend

Open another terminal:

```bash
npm run dev:client
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Production Build

Build the frontend:

```bash
npm run build
```

The production frontend output is generated in:

```text
client/dist
```

---

# ☁️ Deployment

## Frontend — Vercel

Recommended configuration:

```text
Framework:
Vite

Root Directory:
client

Build Command:
npm run build

Output Directory:
dist
```

Configure:

```env
VITE_API_URL=<production-backend-url>
```

---

## Backend — Render

Configure the backend as a Node.js web service.

Production environment should include:

```env
DATABASE_URL
CLIENT_URL
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

The backend listens on the Render-provided `PORT`.

---

## PostgreSQL

The production backend uses PostgreSQL for persistent application data.

Prisma provides the database access layer between the Express server and PostgreSQL.

---

# 🧪 Validation Checklist

Before production release, verify:

```text
Authentication
    ├── Register
    ├── Login
    ├── Email verification
    └── Logout

Profile
    ├── View profile
    ├── Update profile
    ├── Skills
    ├── Education
    ├── Projects
    └── Resume PDF upload
         ├── PDF validation
         ├── 5 MB limit
         ├── Cloudinary upload
         └── View uploaded resume

Jobs
    ├── View jobs
    ├── Search
    ├── Filter
    ├── Job details
    ├── Skill matching
    └── Save job

Applications
    ├── Apply
    ├── View applications
    ├── Track status
    └── Application history

Notifications
    ├── View notifications
    └── Mark as read

Assistant
    └── Career guidance

Deployment
    ├── Vercel frontend
    ├── Render backend
    ├── PostgreSQL
    ├── Firebase authentication
    └── CORS
```

---

# 🐛 Troubleshooting

## Frontend Cannot Connect to Backend

Check:

```env
VITE_API_URL=http://localhost:5000
```

Make sure the backend is running:

```bash
npm run dev:server
```

---

## Firebase Authentication Error

Check:

- Firebase project configuration
- Email/Password provider
- Firebase web configuration
- Email verification status
- Firebase Admin environment variables
- Backend Firebase project ID

---

## Email Verification Issue

Confirm that:

1. The user registered successfully.
2. Firebase sent the verification email.
3. The email was verified.
4. The user logs in again after verification.

Unverified users should not proceed to the authenticated dashboard.

---

## CORS Error

Check the backend environment:

```env
CLIENT_URL=<your-frontend-url>
```

After changing Render environment variables, redeploy the backend.

---

## Prisma Error

Try:

```bash
cd server
npx prisma generate
```

Then restart the backend.

---

## Vercel Build Error

Check:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

Also verify:

```env
VITE_API_URL
```

is configured in Vercel.

---

# 📈 Future Enhancements

Potential future improvements:

- 🧠 Advanced AI job matching
- 📄 AI resume analysis
- 📝 Resume builder
- 🎤 AI mock interviews
- 🧠 Adaptive interview preparation
- 📊 Placement analytics
- 🎯 Skill-gap analysis
- 📚 Personalized learning recommendations
- 🏢 Recruiter portal
- 🔔 Real-time notifications
- 📈 Career progress dashboard
- 🧩 Advanced recommendation scoring
- ☁️ Enhanced monitoring and observability

---

# 🎯 Project Objectives

CareerConnect AI aims to:

1. Centralize career opportunities in one platform.
2. Help users maintain a professional career profile.
3. Simplify job discovery and filtering.
4. Compare user skills with job requirements.
5. Make application tracking easier.
6. Provide personalized career guidance.
7. Demonstrate a production-oriented full-stack architecture.
8. Implement secure authentication using Firebase.
9. Practice REST API development and database integration.
10. Deploy a complete application to cloud platforms.

---

# 💡 Engineering Highlights

This project demonstrates practical experience with:

- ⚛️ Component-based React development
- ⚡ Vite-based frontend development
- 🌐 REST API architecture
- 🟢 Node.js + Express backend
- 🔐 Firebase authentication
- 🛡️ Firebase Admin SDK
- 🗄️ PostgreSQL database design
- 🔷 Prisma ORM
- 🔑 Token-based API authorization
- 🔎 Search and filtering logic
- 🎯 Skill matching algorithms
- 📊 Application state management
- 🔔 Notification systems
- ☁️ Cloudinary file storage
- ☁️ Cloud deployment
- 🔧 Environment-based configuration
- 🔄 Frontend-backend integration

---

# 📦 Production Stack

```text
Frontend
   │
   ├── React
   ├── Vite
   ├── JavaScript
   └── Firebase Web SDK
        │
        ▼
     Vercel
        │
        ▼
Backend
   │
   ├── Node.js
   ├── Express
   ├── Firebase Admin SDK
   └── Prisma
        │
        ▼
Database
   │
   └── PostgreSQL
        │
        ▼
     Render
```

---

# 🏆 Release Status

```text
╔══════════════════════════════════════════════╗
║             CAREERCONNECT AI                 ║
║                                              ║
║  Authentication        ✅                   ║
║  Email Verification     ✅                   ║
║  Profile Management     ✅                   ║
║  Job Management         ✅                   ║
║  Skill Matching         ✅                   ║
║  Applications           ✅                   ║
║  Saved Jobs             ✅                   ║
║  Notifications          ✅                   ║
║  Career Assistant       ✅                   ║
║  PostgreSQL             ✅                   ║
║  Firebase               ✅                   ║
║  Production Deployment  ✅                   ║
║                                              ║
║          🚀 PROJECT DEPLOYED 🚀             ║
╚══════════════════════════════════════════════╝
```

---

# 🌍 Vision

CareerConnect AI is designed to become a centralized career ecosystem where students and job seekers can:

```text
Build Profile
      ↓
Discover Jobs
      ↓
Understand Skill Requirements
      ↓
Find Matching Opportunities
      ↓
Apply
      ↓
Track Applications
      ↓
Improve Skills
      ↓
Grow Career
```

The long-term vision is to make the entire placement and career discovery process more organized, accessible, and personalized.

---

# 🔗 Repository

[GitHub Repository](https://github.com/yogesh-selvam/ai-placement-portal)

---

# 👨‍💻 Author

Yogesh Selvam

Full-Stack Developer | Software Developer

Building practical applications with modern web technologies.

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

🎓 CareerConnect AI

Build your profile. Discover opportunities. Grow your career. 🚀
