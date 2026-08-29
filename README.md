# 🎓 AI Placement Portal

<p align="center">
  <img src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-6%2B-646CFF?logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/AI-Powered-7C3AED">
  <img src="https://img.shields.io/badge/Status-Complete-0A8F3D">
</p>

<p align="center">
  <b>Prepare. Practice. Improve. Get Placed.</b><br>
  A full-stack AI-powered placement preparation and career management platform.
</p>

---

## 🌟 Overview

**AI Placement Portal** brings the major placement activities into one platform.

### ✨ Key Features

- 👤 Student profile management
- 💼 Job discovery, search and filtering
- 📄 Job applications and status tracking
- 🔔 Placement notifications
- 🤖 AI interview preparation
- 📝 Interview answer evaluation
- 💬 AI career assistant
- ✨ Personalized career insights
- 🎯 Job recommendations
- 📈 Skill-gap and preparation guidance
- 🔐 Protected authentication and APIs
- 📱 Responsive UI

---

## 🧠 Placement Workflow

```text
🎓 Student
   ↓
👤 Profile
   ↓
💼 Explore Jobs
   ↓
🔎 Search / Filter
   ↓
📄 Apply
   ↓
📊 Track Application
   ↓
🤖 Interview Practice
   ↓
📝 AI Evaluation
   ↓
✨ Career Insights
   ↓
🎯 Recommendations
   ↓
🚀 Placement
```

---

## 🧩 Modules

| Module | Feature | Status |
|---|---|:---:|
| 01 | Core Application Foundation | ✅ |
| 02 | Student Profile | ✅ |
| 03 | Job Discovery | ✅ |
| 04 | Application Management | ✅ |
| 05 | Placement Tracking | ✅ |
| 06 | Notifications | ✅ |
| 07 | AI Interview Preparation | ✅ |
| 08 | AI Career Insights | ✅ |
| — | AI Career Assistant | ✅ |

---

## 🤖 AI Features

### Interview Preparation

```text
💼 Select Job
    ↓
🤖 Interview Question
    ↓
👤 Student Answer
    ↓
📊 AI Evaluation
    ↓
💪 Strengths + ⚠️ Improvements
    ↓
✨ Better Answer
```

### Career Insights

Career insights use available profile, skills, education, projects, applications and jobs to provide:

- 💪 Skill strengths
- ⚠️ Skill gaps
- 🎯 Recommended jobs
- 📈 Career direction
- 💡 Preparation suggestions
- 📝 Profile improvements

> The current application provides AI-assisted workflows through the backend. A production LLM provider can be integrated/configured as required.

---

## 🧰 Tech Stack

**Frontend**
- React
- Vite
- JavaScript / JSX
- CSS
- Lucide React

**Backend**
- Node.js
- Express.js
- REST APIs
- Authentication middleware

**Database**
- PostgreSQL
- Prisma ORM
- Prisma migrations

**Tools**
- Git
- GitHub
- npm

---

## 🏗️ Architecture

```text
🌍 User
  │
  ▼
⚛️ React + Vite
  │
  │ HTTPS / REST API
  ▼
🟢 Node.js + Express
  │
  ▼
🗄️ Prisma ORM
  │
  ▼
🐘 PostgreSQL
```

---

## 🗂️ Project Structure

```text
ai-placement-portal-fullstack/
├── client/
│   ├── src/
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🔌 Main APIs

```text
/api
├── /auth
├── /profile
├── /jobs
├── /applications
├── /notifications
├── /interview
│   ├── /questions
│   └── /evaluate
├── /career-insights
├── /assistant
│   └── /chat
└── /health
```

### Career Insights

```http
GET /api/career-insights
```

### Interview

```http
GET  /api/interview/questions
POST /api/interview/evaluate
```

### AI Assistant

```http
POST /api/assistant/chat
```

### Health Check

```http
GET /api/health
```

---

## ⚙️ Environment Variables

### Backend — `server/.env`

```env
DATABASE_URL="your-production-database-url"
PORT=5000
JWT_SECRET="your-production-secret"
```

### Frontend

```env
VITE_API_URL="https://YOUR-BACKEND-DOMAIN.com/api"
```

> Never commit `.env` files or production secrets to GitHub.

---

## 🚀 Local Setup

### 1. Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd ai-placement-portal-fullstack
```

### 2. Install

```bash
npm install

cd client
npm install

cd ../server
npm install
```

### 3. Database

```bash
npx prisma generate
npx prisma migrate dev
```

If seed data is available:

```bash
node prisma/seed.js
```

### 4. Run Backend

```bash
cd server
npm run dev
```

### 5. Run Frontend

Open another terminal:

```bash
cd client
npm run dev
```

---

## 🏭 Production Build

### Frontend

```bash
cd client
npm install
npm run build
```

Production output:

```text
client/dist/
```

### Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

---

## ☁️ Production Deployment

The recommended production architecture is:

```text
🌍 Users
   │
   ▼
🌐 Frontend Hosting
React + Vite
   │
   │ HTTPS
   ▼
🟢 Backend Hosting
Node + Express
   │
   ▼
🐘 Managed PostgreSQL
```

### Deployment Checklist

**Database**
- [ ] PostgreSQL created
- [ ] `DATABASE_URL` configured
- [ ] Prisma generated
- [ ] Production migrations deployed

**Backend**
- [ ] Node/Express deployed
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] Authentication secrets configured
- [ ] `/api/health` verified

**Frontend**
- [ ] `VITE_API_URL` configured
- [ ] `npm run build` successful
- [ ] `client/dist` deployed
- [ ] Production frontend tested

**Final**
- [ ] HTTPS enabled
- [ ] End-to-end testing completed
- [ ] Multi-user testing completed
- [ ] Mobile UI tested
- [ ] Security review completed
- [ ] Database backup configured

---

## 🧪 Validation

### Backend Syntax

```bash
node --check server/src/server.js
```

### Frontend Build

```bash
cd client
npm run build
```

### Prisma

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

### Health Check

```text
GET /api/health
```

---

## 🔐 Security

The application uses protected APIs and authentication middleware.

Production requirements:

- 🔐 Authentication and authorization
- 🛡️ Protected routes
- 🔑 Environment-based secrets
- 🌐 HTTPS
- 🚫 Restricted CORS
- 🧹 Input validation
- 🗄️ Secure database access
- 📊 Error handling

> Complete a final security review before public release.

---

## 🧪 Testing Checklist

- [ ] Register / Login / Logout
- [ ] Profile management
- [ ] Job search and filtering
- [ ] Job application
- [ ] Application tracking
- [ ] Notifications
- [ ] Interview questions
- [ ] AI answer evaluation
- [ ] Career insights
- [ ] AI assistant
- [ ] Job recommendations
- [ ] Unauthorized access testing
- [ ] Mobile/responsive testing
- [ ] End-to-end testing

---

## 📊 Release Status

```text
Frontend              ✅ Complete
Backend               ✅ Complete
Database              ✅ Complete
Authentication        ✅ Complete
Job Management        ✅ Complete
Applications          ✅ Complete
Notifications         ✅ Complete
AI Interview          ✅ Complete
AI Career Insights    ✅ Complete
AI Assistant          ✅ Complete
Production Build      ✅ Verified
GitHub                ✅ Configured
Deployment Setup      ✅ Ready
Production Deployment 🚀
```

### 🎉 Current Milestone

**AI Placement Portal — Full-Stack MVP Complete**

---

## 🌍 Vision

AI Placement Portal aims to become a complete digital career companion for students by combining:

```text
💼 Jobs
+
📄 Applications
+
🤖 Interview Practice
+
💬 AI Career Assistance
+
✨ Career Insights
+
🎯 Recommendations
=
🚀 Better Placement Preparation
```

> ### 🎓 Prepare smarter. Practice better. Get placed faster.

---

## 👨‍💻 Project

### 🎓 AI Placement Portal

**Full-Stack AI-Powered Placement Preparation Platform**

Built with ❤️ using:

**React + Vite + Node.js + Express + Prisma + PostgreSQL**

---

## ⭐ Final

```text
╔══════════════════════════════════════╗
║       🎓 AI PLACEMENT PORTAL         ║
║                                      ║
║       Prepare. Practice. Improve.    ║
║              Get Placed. 🚀          ║
╚══════════════════════════════════════╝
```
