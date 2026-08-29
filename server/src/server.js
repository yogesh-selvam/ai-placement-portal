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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "CareerConnect AI â€” Your OTP",
    text: `Your CareerConnect AI login OTP is ${otp}. It expires in 10 minutes.`,
  });
};

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "CareerConnect AI API" });
});

/* =========================
   AUTH
========================= */

app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid college email" });
    }

    const otp = makeOtp();
    const codeHash = await bcrypt.hash(otp, 10);

    await prisma.otpCode.create({
      data: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtp(email, otp);

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to send OTP" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    const record = await prisma.otpCode.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts" });
    }

    const ok = await bcrypt.compare(otp, record.codeHash);

    if (!ok) {
      await prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to verify OTP" });
  }
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json(req.user);
});

/* =========================
   JOBS
========================= */

app.get("/api/jobs", async (req, res) => {
  try {
    const { search, mode, type, sort } = req.query;

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: sort === "Newest" ? "desc" : "desc" },
    });

    const filtered = jobs.filter((job) => {
      const haystack =
        `${job.title} ${job.company} ${job.location} ${job.skills}`.toLowerCase();

      return (
        (!search ||
          haystack.includes(String(search).toLowerCase())) &&
        (!mode || job.mode === mode) &&
        (!type || job.type === type)
      );
    });

    res.json(
      filtered.map((job) => ({
        ...job,
        skills: job.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load jobs" });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      ...job,
      skills: job.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load job" });
  }
});

app.post("/api/jobs/:id/apply", auth, async (req, res) => {
  try {
    const jobId = Number(req.params.id);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const application = await prisma.$transaction(async (tx) => {
  const createdApplication = await tx.application.create({
    data: {
      userId: req.user.id,
      jobId,
      coverLetter: req.body.coverLetter || null,
      resumeUsed: req.body.resumeUsed || req.user.resumeUrl || null,
    },
  });

  await tx.applicationHistory.create({
    data: {
      applicationId: createdApplication.id,
      status: "APPLIED",
      note: "Application submitted",
    },
  });

  await tx.notification.create({
    data: {
      userId: req.user.id,
      title: "Application submitted",
      message: `Your application for ${job.title} at ${job.company} has been submitted.`,
    },
  });

  return createdApplication;
});

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: "Application submitted",
        message: `Your application for ${job.title} at ${job.company} has been submitted.`,
      },
    });

    res.status(201).json(application);
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "You already applied for this job",
      });
    }

    console.error(err);
    res.status(500).json({ message: "Unable to submit application" });
  }
});

/* =========================
   SAVED JOBS
========================= */

app.get("/api/saved-jobs", auth, async (req, res) => {
  try {
    const rows = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      rows.map((row) => ({
        ...row,
        job: row.job
          ? {
              ...row.job,
              skills: row.job.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),
            }
          : null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load saved jobs" });
  }
});

app.post("/api/saved-jobs", auth, async (req, res) => {
  try {
    const jobId = Number(req.body.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({ message: "Valid jobId is required" });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const saved = await prisma.savedJob.create({
      data: {
        userId: req.user.id,
        jobId,
      },
      include: { job: true },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: "Job saved",
        message: `${job.title} at ${job.company} was added to your saved jobs.`,
      },
    });

    res.status(201).json({
      ...saved,
      job: {
        ...saved.job,
        skills: saved.job.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      },
    });
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "Job is already saved",
      });
    }

    console.error(err);
    res.status(500).json({ message: "Unable to save job" });
  }
});

app.delete("/api/saved-jobs/:jobId", auth, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    await prisma.savedJob.delete({
      where: { id: existing.id },
    });

    res.json({ ok: true, message: "Job removed from saved jobs" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to remove saved job" });
  }
});

/* =========================
   APPLICATIONS
========================= */

/*
  MODULE 5 - APPLICATION DETAILS
*/

/* =========================
   APPLICATIONS LIST
========================= */

app.get("/api/applications", auth, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        job: true
      },
      orderBy: {
        appliedAt: "desc"
      }
    });

    res.json(applications);
  } catch (error) {
    console.error("Applications list error:", error);

    res.status(500).json({
      message: "Unable to load applications"
    });
  }
});

app.get("/api/applications/:id", auth, async (req, res) => {
  try {
    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        message: "Invalid application id",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
      include: {
        job: true,
        history: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({
      ...application,
      job: application.job
        ? {
            ...application.job,
            skills: application.job.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }
        : null,
    });
  } catch (err) {
    console.error("Application details error:", err);

    res.status(500).json({
      message: "Unable to load application details",
    });
  }
});


/*
  MODULE 5 - APPLICATION STATUS UPDATE
*/
app.patch("/api/applications/:id/status", auth, async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const status = String(req.body.status || "").trim().toUpperCase();
    const note = String(req.body.note || "").trim() || null;

    const validStatuses = [
      "APPLIED",
      "UNDER_REVIEW",
      "SHORTLISTED",
      "INTERVIEW",
      "SELECTED",
      "REJECTED",
    ];

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        message: "Invalid application id",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
      include: {
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.status === status) {
      const current = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: true,
          history: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return res.json(current);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.application.update({
        where: {
          id: applicationId,
        },
        data: {
          status,
        },
        include: {
          job: true,
          history: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId,
          status,
          note,
        },
      });

      await tx.notification.create({
        data: {
          userId: req.user.id,
          title: "Application status updated",
          message:
            `Your application for ${application.job.title} at ` +
            `${application.job.company} is now ${status
              .replaceAll("_", " ")
              .toLowerCase()}.`,
        },
      });

      return result;
    });

    res.json(updated);
  } catch (err) {
    console.error("Application status update error:", err);

    res.status(500).json({
      message: "Unable to update application status",
    });
  }
});

/* =========================
   PROFILE
========================= */

app.get("/api/profile", auth, async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true, projects: true },
    });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load profile" });
  }
});

app.put("/api/profile", auth, async (req, res) => {
  try {
    const {
      name,
      degree,
      university,
      graduationYear,
      gpa,
      skills,
      projects,
      resumeUrl,
    } = req.body;

    const profile = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        degree,
        university,
        graduationYear: Number(graduationYear) || 2025,
        gpa,
        resumeUrl,
        skills: Array.isArray(skills)
          ? {
              deleteMany: {},
              create: skills
                .map((name) => String(name).trim())
                .filter(Boolean)
                .map((name) => ({ name })),
            }
          : undefined,
        projects: Array.isArray(projects)
          ? {
              deleteMany: {},
              create: projects
                .filter((project) => project?.title && project?.description)
                .map((project) => ({
                  title: String(project.title).trim(),
                  description: String(project.description).trim(),
                })),
            }
          : undefined,
      },
      include: { skills: true, projects: true },
    });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to save profile" });
  }
});

/* =========================
   NOTIFICATIONS
========================= */

app.get("/api/notifications", auth, async (req, res) => {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to load notifications" });
  }
});

app.patch("/api/notifications/read-all", auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update notifications" });
  }
});

/* =========================
   AI ASSISTANT
========================= */

app.post("/api/assistant/chat", auth, async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { skills: true },
    });

    const skills =
      profile?.skills.map((skill) => skill.name).join(", ") ||
      "your current skills";

    const reply = `Based on your profile, focus on opportunities matching ${skills}. For "${message}", I recommend tailoring your resume to the job description and preparing 2â€“3 project examples using the required technologies.`;

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to contact assistant" });
  }
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`CareerConnect API running on http://localhost:${PORT}`);
});

