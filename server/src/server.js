import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtp(email, otp) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`\n[DEV OTP] ${email}: ${otp}\n`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "CareerConnect AI — Your OTP",
    text: `Your CareerConnect AI login OTP is ${otp}. It expires in 10 minutes.`
  });
}

app.get("/api/health", (_, res) => res.json({ ok: true, service: "CareerConnect AI API" }));

app.post("/api/auth/request-otp", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return res.status(400).json({ message: "Enter a valid college email" });

  const otp = makeOtp();
  const codeHash = await bcrypt.hash(otp, 10);
  await prisma.otpCode.create({
    data: { email, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });
  await sendOtp(email, otp);
  res.json({ message: "OTP sent" });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const record = await prisma.otpCode.findFirst({
    where: { email, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });
  if (!record) return res.status(400).json({ message: "OTP expired or not found" });
  if (record.attempts >= 5) return res.status(429).json({ message: "Too many attempts" });

  const ok = await bcrypt.compare(otp, record.codeHash);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email }
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

app.get("/api/auth/me", auth, (req, res) => res.json(req.user));

app.get("/api/jobs", async (req, res) => {
  const { search, mode, type } = req.query;
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  const filtered = jobs.filter(j => {
    const haystack = `${j.title} ${j.company} ${j.location} ${j.skills}`.toLowerCase();
    return (!search || haystack.includes(String(search).toLowerCase()))
      && (!mode || j.mode === mode)
      && (!type || j.type === type);
  });
  res.json(filtered.map(j => ({ ...j, skills: j.skills.split(",").map(s => s.trim()) })));
});

app.get("/api/jobs/:id", async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: Number(req.params.id) } });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json({ ...job, skills: job.skills.split(",").map(s => s.trim()) });
});

app.post("/api/jobs/:id/apply", auth, async (req, res) => {
  const jobId = Number(req.params.id);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ message: "Job not found" });

  try {
    const application = await prisma.application.create({
      data: { userId: req.user.id, jobId, coverLetter: req.body.coverLetter || null }
    });
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: "Application submitted",
        message: `Your application for ${job.title} at ${job.company} has been submitted.`
      }
    });
    res.status(201).json(application);
  } catch {
    res.status(409).json({ message: "You already applied for this job" });
  }
});

app.get("/api/applications", auth, async (req, res) => {
  const rows = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { job: true },
    orderBy: { appliedAt: "desc" }
  });
  res.json(rows);
});

app.get("/api/profile", auth, async (req, res) => {
  const profile = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { skills: true, projects: true }
  });
  res.json(profile);
});

app.put("/api/profile", auth, async (req, res) => {
  const { name, degree, university, graduationYear, gpa, skills, projects, resumeUrl } = req.body;
  const profile = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name, degree, university,
      graduationYear: Number(graduationYear) || 2025,
      gpa, resumeUrl,
      skills: Array.isArray(skills) ? {
        deleteMany: {},
        create: skills.map(name => ({ name }))
      } : undefined,
      projects: Array.isArray(projects) ? {
        deleteMany: {},
        create: projects.map(p => ({ title: p.title, description: p.description }))
      } : undefined
    },
    include: { skills: true, projects: true }
  });
  res.json(profile);
});

app.get("/api/notifications", auth, async (req, res) => {
  res.json(await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" }
  }));
});

app.patch("/api/notifications/read-all", auth, async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { read: true } });
  res.json({ ok: true });
});

app.post("/api/assistant/chat", auth, async (req, res) => {
  const message = String(req.body.message || "").trim();
  const profile = await prisma.user.findUnique({ where: { id: req.user.id }, include: { skills: true } });
  const skills = profile?.skills.map(s => s.name).join(", ") || "your current skills";
  // Safe local fallback. Replace this block with your preferred AI provider call.
  const reply = `Based on your profile, focus on opportunities matching ${skills}. For "${message}", I recommend tailoring your resume to the job description and preparing 2–3 project examples using the required technologies.`;
  res.json({ reply });
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => console.log(`CareerConnect API running on http://localhost:${PORT}`));
