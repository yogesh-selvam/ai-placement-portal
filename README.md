# AI Placement Portal — Full Stack

Full-stack version of the CareerConnect AI placement portal.

## Architecture

- Frontend: React + Vite + Lucide React
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Authentication: Email OTP + JWT
- Email: Nodemailer/SMTP (development fallback prints OTP to server console)
- AI Assistant: `/api/assistant/chat` backend endpoint with a safe local fallback

## 8 modules

1. Authentication
2. Student Dashboard
3. Job Management
4. Job Details & Application
5. Application Tracking
6. Notifications
7. Student Profile
8. AI Career Assistant

## Local setup

### 1. PostgreSQL
Create a database named `careerconnect`.

### 2. Backend
```bash
cd server
copy .env.example .env
```
On macOS/Linux use:
```bash
cp .env.example .env
```

Set `DATABASE_URL` and `JWT_SECRET` in `.env`.

Then:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### 3. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## OTP development mode

If SMTP is not configured, request an OTP and read the six-digit code printed in the backend terminal. For production, configure SMTP in `server/.env`.

## Important

Do not commit `.env` or API keys. The included `.gitignore` already excludes them.
