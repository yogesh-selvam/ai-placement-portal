import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth as getFirebaseAuth } from "firebase-admin/auth";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

let firebaseAuth = null;

try {
  const firebaseProjectId = String(
    process.env.FIREBASE_PROJECT_ID || ""
  ).trim();

  const firebaseClientEmail = String(
    process.env.FIREBASE_CLIENT_EMAIL || ""
  ).trim();

  const firebasePrivateKey = String(
    process.env.FIREBASE_PRIVATE_KEY || ""
  ).replace(/\\n/g, "\n");

  if (
    !firebaseProjectId ||
    !firebaseClientEmail ||
    !firebasePrivateKey
  ) {
    throw new Error(
      "Firebase Admin environment variables are missing. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  const firebaseAdminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey,
        }),
        projectId: firebaseProjectId,
      });

  firebaseAuth = getFirebaseAuth(firebaseAdminApp);

  console.log(
    `Firebase Admin authentication initialized for project: ${firebaseProjectId}`
  );
} catch (error) {
  console.error(
    "Firebase Admin initialization failed:",
    error?.message || error
  );
}

const resend = new Resend(
  (process.env.RESEND_API_KEY || "").trim()
);

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Vercel production
  "https://ai-placement-portal-beta.vercel.app",

  // Previous Render frontend
  "https://ai-placement-portal-uhmn.onrender.com",

  // Render environment variable
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without Origin header
    // such as Postman/server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
  console.log("CORS allowed Vercel origin:", origin);
  return callback(null, true);
}

    console.warn("CORS blocked origin:", origin);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

/* =========================
   AUTH MIDDLEWARE
========================= */

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!firebaseAuth) {
      return res.status(500).json({
        message: "Firebase Admin authentication is not configured on the server",
      });
    }

    const decoded = await firebaseAuth.verifyIdToken(token);
    const email = String(decoded.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(401).json({
        message: "Firebase account email is required",
      });
    }

    // Keep the existing PostgreSQL user/profile data model.
    // Firebase becomes the source of truth for authentication.
    req.user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    req.firebaseUser = decoded;

    next();
  } catch (error) {
    console.error("Firebase auth error:", error?.message || error);
    return res.status(401).json({
      message: "Invalid or expired Firebase authentication token",
    });
  }
};

/* =========================
   OTP
========================= */

function makeOtp() {
  return String(
    Math.floor(
      100000 + Math.random() * 900000
    )
  );
}

/* =========================
   RESEND EMAIL
========================= */

async function sendOtp(email, otp) {
  const apiKey = (
    process.env.RESEND_API_KEY || ""
  ).trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured on the server"
    );
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Recipient email is missing"
    );
  }

  try {
    console.log(
      "======================================"
    );

    console.log(
      "Sending OTP email with Resend..."
    );

    console.log(
      "OTP recipient:",
      normalizedEmail
    );

    console.log(
      "======================================"
    );

    const { data, error } =
      await resend.emails.send({
        from:
          "CareerConnect AI <onboarding@resend.dev>",

        to: [normalizedEmail],

        subject:
          "CareerConnect AI - Your OTP",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            padding: 24px;
            max-width: 600px;
          ">

            <h2 style="
              margin-bottom: 20px;
            ">
              CareerConnect AI
            </h2>

            <p>
              Your login OTP is:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 10px;
              margin: 24px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP expires in 10 minutes.
            </p>

            <p style="
              color: #666;
            ">
              If you didn't request this OTP,
              you can safely ignore this email.
            </p>

          </div>
        `,
      });

    if (error) {
      console.error(
        "========== RESEND API ERROR =========="
      );

      console.error(
        JSON.stringify(error, null, 2)
      );

      console.error(
        "======================================"
      );

      throw new Error(
        error.message ||
        error.name ||
        "Resend rejected the email"
      );
    }

    if (!data?.id) {
      console.error(
        "Resend returned no email ID:",
        data
      );

      throw new Error(
        "Resend did not return an email ID"
      );
    }

    console.log(
      "OTP EMAIL SENT SUCCESSFULLY:",
      data.id
    );

    return data;

  } catch (error) {

    console.error(
      "========== OTP EMAIL ERROR =========="
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "====================================="
    );

    throw error;
  }
}

/* =========================
   AUTH
========================= */

app.post(
  "/api/auth/request-otp",
  async (req, res) => {
    try {

      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      if (
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
          email
        )
      ) {
        return res.status(400).json({
          message:
            "Enter a valid college email",
        });
      }

      console.log(
        "======================================"
      );

      console.log(
        "OTP REQUEST RECEIVED"
      );

      console.log(
        "Email:",
        email
      );

      console.log(
        "Resend configured:",
        Boolean(
          process.env.RESEND_API_KEY
        )
      );

      console.log(
        "======================================"
      );

      const otp = makeOtp();

      const codeHash =
        await bcrypt.hash(
          otp,
          10
        );

      /* Send email first */
      await sendOtp(
        email,
        otp
      );

      /* Save OTP only after email succeeds */
      await prisma.otpCode.create({
        data: {
          email,
          codeHash,
          expiresAt:
            new Date(
              Date.now() +
              10 * 60 * 1000
            ),
        },
      });

      console.log(
        "OTP REQUEST COMPLETED:",
        email
      );

      return res.json({
        message: "OTP sent",
      });

    } catch (err) {

      console.error(
        "========== REQUEST OTP FAILED =========="
      );

      console.error(
        "Name:",
        err?.name
      );

      console.error(
        "Message:",
        err?.message
      );

      console.error(
        "Stack:",
        err?.stack
      );

      console.error(
        "========================================"
      );

      return res.status(500).json({
        message:
          "Unable to send OTP",
      });
    }
  }
);

/* =========================
   VERIFY OTP
========================= */

app.post(
  "/api/auth/verify-otp",
  async (req, res) => {
    try {

      const email = String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

      const otp = String(
        req.body.otp || ""
      ).trim();

      const record =
        await prisma.otpCode.findFirst({
          where: {
            email,
            expiresAt: {
              gt: new Date(),
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      if (!record) {
        return res.status(400).json({
          message:
            "OTP expired or not found",
        });
      }

      if (record.attempts >= 5) {
        return res.status(429).json({
          message:
            "Too many attempts",
        });
      }

      const ok =
        await bcrypt.compare(
          otp,
          record.codeHash
        );

      if (!ok) {

        await prisma.otpCode.update({
          where: {
            id: record.id,
          },

          data: {
            attempts: {
              increment: 1,
            },
          },
        });

        return res.status(400).json({
          message:
            "Invalid OTP",
        });
      }

      const user =
        await prisma.user.upsert({
          where: {
            email,
          },

          update: {},

          create: {
            email,
          },
        });

      const token =
        jwt.sign(
          {
            userId:
              user.id,
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      res.json({
        token,
        user,
      });

    } catch (err) {

      console.error(
        "Verify OTP error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to verify OTP",
      });
    }
  }
);

/* =========================
   ME
========================= */

app.get(
  "/api/auth/me",
  auth,
  async (req, res) => {
    res.json(
      req.user
    );
  }
);

/* =========================
   HEALTH CHECK
========================= */

app.get(
  "/api/health",
  (_, res) => {
    res.json({
      ok: true,
      service:
        "CareerConnect AI API",
    });
  }
);

/* =========================
   JOBS
========================= */

app.get(
  "/api/jobs",
  async (req, res) => {
    try {

      const {
        search,
        mode,
        type,
        sort,
      } = req.query;

      const jobs =
        await prisma.job.findMany({
          orderBy: {
            createdAt:
              sort === "Newest"
                ? "desc"
                : "desc",
          },
        });

      const filtered =
        jobs.filter(
          (job) => {

            const haystack =
              `${job.title} ${job.company} ${job.location} ${job.skills}`
                .toLowerCase();

            return (
              (!search ||
                haystack.includes(
                  String(search)
                    .toLowerCase()
                )) &&

              (!mode ||
                job.mode === mode) &&

              (!type ||
                job.type === type)
            );
          }
        );

      res.json(
        filtered.map(
          (job) => ({
            ...job,

            skills:
              String(
                job.skills || ""
              )
                .split(",")
                .map(
                  (skill) =>
                    skill.trim()
                )
                .filter(Boolean),
          })
        )
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load jobs",
      });
    }
  }
);

/* =========================
   AI JOB MATCHING

   IMPORTANT:
   This route MUST come before
   /api/jobs/:id
========================= */

app.get(
  "/api/jobs/recommended",
  auth,
  async (req, res) => {

    try {

      const profile =
        await prisma.user.findUnique({
          where: {
            id:
              req.user.id,
          },

          include: {
            skills: true,
          },
        });

      if (!profile) {
        return res.status(404).json({
          message:
            "Profile not found",
        });
      }

      const userSkills =
        profile.skills
          .map(
            (skill) =>
              String(
                skill.name || ""
              )
                .trim()
                .toLowerCase()
          )
          .filter(Boolean);

      const jobs =
        await prisma.job.findMany({
          orderBy: {
            createdAt:
              "desc",
          },
        });

      const recommendedJobs =
        jobs.map(
          (job) => {

            const jobSkills =
              String(
                job.skills || ""
              )
                .split(",")
                .map(
                  (skill) =>
                    skill.trim()
                )
                .filter(Boolean);

            const matchingSkills =
              jobSkills.filter(
                (skill) =>
                  userSkills.includes(
                    skill.toLowerCase()
                  )
              );

            const missingSkills =
              jobSkills.filter(
                (skill) =>
                  !userSkills.includes(
                    skill.toLowerCase()
                  )
              );

            const matchPercentage =
              jobSkills.length === 0
                ? 0
                : Math.round(
                    (
                      matchingSkills.length /
                      jobSkills.length
                    ) * 100
                  );

            return {
              ...job,

              skills:
                jobSkills,

              matchPercentage,

              matchingSkills,

              missingSkills,
            };
          }
        );

      recommendedJobs.sort(
        (a, b) => {

          if (
            b.matchPercentage !==
            a.matchPercentage
          ) {
            return (
              b.matchPercentage -
              a.matchPercentage
            );
          }

          return (
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
          );
        }
      );

      res.json(
        recommendedJobs
      );

    } catch (err) {

      console.error(
        "Job recommendation error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to generate job recommendations",
      });
    }
  }
);

/* =========================
   JOB BY ID
========================= */

app.get(
  "/api/jobs/:id",
  async (req, res) => {
    try {

      const jobId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          jobId
        ) ||
        jobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid job ID",
        });
      }

      const job =
        await prisma.job.findUnique({
          where: {
            id:
              jobId,
          },
        });

      if (!job) {
        return res.status(404).json({
          message:
            "Job not found",
        });
      }

      res.json({
        ...job,

        skills:
          String(
            job.skills || ""
          )
            .split(",")
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(Boolean),
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load job",
      });
    }
  }
);

/* =========================
   APPLY JOB
========================= */

app.post(
  "/api/jobs/:id/apply",
  auth,
  async (req, res) => {

    try {

      const jobId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          jobId
        ) ||
        jobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid job ID",
        });
      }

      const job =
        await prisma.job.findUnique({
          where: {
            id:
              jobId,
          },
        });

      if (!job) {
        return res.status(404).json({
          message:
            "Job not found",
        });
      }

      const application =
        await prisma.$transaction(
          async (tx) => {

            const createdApplication =
              await tx.application.create({
                data: {

                  userId:
                    req.user.id,

                  jobId,

                  coverLetter:
                    req.body
                      .coverLetter ||
                    null,

                  resumeUsed:
                    req.body
                      .resumeUsed ||
                    req.user
                      .resumeUrl ||
                    null,
                },
              });

            await tx.applicationHistory.create({
              data: {

                applicationId:
                  createdApplication.id,

                status:
                  "APPLIED",

                note:
                  "Application submitted",
              },
            });

            await tx.notification.create({
              data: {

                userId:
                  req.user.id,

                title:
                  "Application submitted",

                message:
                  `Your application for ${job.title} at ${job.company} has been submitted.`,
              },
            });

            return createdApplication;
          }
        );

      res.status(201).json(
        application
      );

    } catch (err) {

      if (
        err?.code ===
        "P2002"
      ) {
        return res.status(409).json({
          message:
            "You already applied for this job",
        });
      }

      console.error(err);

      res.status(500).json({
        message:
          "Unable to submit application",
      });
    }
  }
);

/* =========================
   SAVED JOBS
========================= */

app.get(
  "/api/saved-jobs",
  auth,
  async (req, res) => {

    try {

      const rows =
        await prisma.savedJob.findMany({
          where: {
            userId:
              req.user.id,
          },

          include: {
            job: true,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      res.json(
        rows.map(
          (row) => ({
            ...row,

            job:
              row.job
                ? {
                    ...row.job,

                    skills:
                      String(
                        row.job.skills ||
                        ""
                      )
                        .split(",")
                        .map(
                          (skill) =>
                            skill.trim()
                        )
                        .filter(
                          Boolean
                        ),
                  }
                : null,
          })
        )
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load saved jobs",
      });
    }
  }
);

app.post(
  "/api/saved-jobs",
  auth,
  async (req, res) => {

    try {

      const jobId =
        Number(
          req.body.jobId
        );

      if (
        !Number.isInteger(
          jobId
        ) ||
        jobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid jobId is required",
        });
      }

      const job =
        await prisma.job.findUnique({
          where: {
            id:
              jobId,
          },
        });

      if (!job) {
        return res.status(404).json({
          message:
            "Job not found",
        });
      }

      const saved =
        await prisma.savedJob.create({
          data: {

            userId:
              req.user.id,

            jobId,
          },

          include: {
            job: true,
          },
        });

      await prisma.notification.create({
        data: {

          userId:
            req.user.id,

          title:
            "Job saved",

          message:
            `${job.title} at ${job.company} was added to your saved jobs.`,
        },
      });

      res.status(201).json({
        ...saved,

        job: {
          ...saved.job,

          skills:
            String(
              saved.job.skills ||
              ""
            )
              .split(",")
              .map(
                (skill) =>
                  skill.trim()
              )
              .filter(Boolean),
        },
      });

    } catch (err) {

      if (
        err?.code ===
        "P2002"
      ) {
        return res.status(409).json({
          message:
            "Job is already saved",
        });
      }

      console.error(err);

      res.status(500).json({
        message:
          "Unable to save job",
      });
    }
  }
);

app.delete(
  "/api/saved-jobs/:jobId",
  auth,
  async (req, res) => {

    try {

      const jobId =
        Number(
          req.params.jobId
        );

      if (
        !Number.isInteger(
          jobId
        ) ||
        jobId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid job ID",
        });
      }

      const existing =
        await prisma.savedJob.findUnique({
          where: {

            userId_jobId: {
              userId:
                req.user.id,

              jobId,
            },
          },
        });

      if (!existing) {
        return res.status(404).json({
          message:
            "Saved job not found",
        });
      }

      await prisma.savedJob.delete({
        where: {
          id:
            existing.id,
        },
      });

      res.json({
        ok: true,

        message:
          "Job removed from saved jobs",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to remove saved job",
      });
    }
  }
);

/* =========================
   APPLICATIONS
========================= */

app.get(
  "/api/applications",
  auth,
  async (req, res) => {

    try {

      const rows =
        await prisma.application.findMany({
          where: {
            userId:
              req.user.id,
          },

          include: {
            job: true,
          },

          orderBy: {
            appliedAt:
              "desc",
          },
        });

      res.json(
        rows.map(
          (row) => ({
            ...row,

            job:
              row.job
                ? {
                    ...row.job,

                    skills:
                      String(
                        row.job.skills ||
                        ""
                      )
                        .split(",")
                        .map(
                          (skill) =>
                            skill.trim()
                        )
                        .filter(
                          Boolean
                        ),
                  }
                : null,
          })
        )
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load applications",
      });
    }
  }
);

/* =========================
   APPLICATION DETAILS
========================= */

app.get(
  "/api/applications/:id",
  auth,
  async (req, res) => {

    try {

      const applicationId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid application id",
        });
      }

      const application =
        await prisma.application.findFirst({
          where: {

            id:
              applicationId,

            userId:
              req.user.id,
          },

          include: {

            job: true,

            history: {
              orderBy: {
                createdAt:
                  "asc",
              },
            },
          },
        });

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found",
        });
      }

      res.json({
        ...application,

        job:
          application.job
            ? {
                ...application.job,

                skills:
                  String(
                    application.job.skills ||
                    ""
                  )
                    .split(",")
                    .map(
                      (skill) =>
                        skill.trim()
                    )
                    .filter(
                      Boolean
                    ),
              }
            : null,
      });

    } catch (err) {

      console.error(
        "Application details error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to load application details",
      });
    }
  }
);

/* =========================
   APPLICATION STATUS
========================= */

app.patch(
  "/api/applications/:id/status",
  auth,
  async (req, res) => {

    try {

      const applicationId =
        Number(
          req.params.id
        );

      const status =
        String(
          req.body.status || ""
        )
          .trim()
          .toUpperCase();

      const note =
        String(
          req.body.note || ""
        ).trim() || null;

      const validStatuses = [
        "APPLIED",
        "UNDER_REVIEW",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
      ];

      if (
        !Number.isInteger(
          applicationId
        ) ||
        applicationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid application id",
        });
      }

      if (
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid application status",
        });
      }

      const application =
        await prisma.application.findFirst({
          where: {

            id:
              applicationId,

            userId:
              req.user.id,
          },

          include: {
            job: true,
          },
        });

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found",
        });
      }

      if (
        application.status ===
        status
      ) {

        const current =
          await prisma.application.findUnique({
            where: {
              id:
                applicationId,
            },

            include: {

              job: true,

              history: {
                orderBy: {
                  createdAt:
                    "asc",
                },
              },
            },
          });

        return res.json(
          current
        );
      }

      const updated =
        await prisma.$transaction(
          async (tx) => {

            const result =
              await tx.application.update({
                where: {
                  id:
                    applicationId,
                },

                data: {
                  status,
                },

                include: {

                  job: true,

                  history: {
                    orderBy: {
                      createdAt:
                        "asc",
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

                userId:
                  req.user.id,

                title:
                  "Application status updated",

                message:
                  `Your application for ${application.job.title} at ${application.job.company} is now ${status
                    .replaceAll(
                      "_",
                      " "
                    )
                    .toLowerCase()}.`,
              },
            });

            return result;
          }
        );

      res.json(
        updated
      );

    } catch (err) {

      console.error(
        "Application status update error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to update application status",
      });
    }
  }
);

/* =========================
   PROFILE
========================= */

app.get(
  "/api/profile",
  auth,
  async (req, res) => {

    try {

      const profile =
        await prisma.user.findUnique({
          where: {
            id:
              req.user.id,
          },

          include: {
            skills: true,
            projects: true,
          },
        });

      res.json(
        profile
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load profile",
      });
    }
  }
);

app.put(
  "/api/profile",
  auth,
  async (req, res) => {
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
      } = req.body || {};

      const cleanName = String(name || "").trim();
      const cleanDegree = String(degree || "").trim();
      const cleanUniversity = String(university || "").trim();
      const cleanGpa = String(gpa || "").trim();
      const cleanResumeUrl = resumeUrl
        ? String(resumeUrl).trim()
        : null;

      const cleanSkills = Array.isArray(skills)
        ? skills
            .map(skill => String(skill || "").trim())
            .filter(Boolean)
        : [];

      const cleanProjects = Array.isArray(projects)
        ? projects
            .map(project => ({
              title: String(project?.title || "").trim(),
              description: String(project?.description || "").trim(),
            }))
            .filter(project => project.title && project.description)
        : [];

      const profile = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: cleanName,
          degree: cleanDegree,
          university: cleanUniversity,
          graduationYear: Number(graduationYear) || 2025,
          gpa: cleanGpa,
          resumeUrl: cleanResumeUrl,
          skills: {
            deleteMany: {},
            create: cleanSkills.map(name => ({ name })),
          },
          projects: {
            deleteMany: {},
            create: cleanProjects.map(project => ({
              title: project.title,
              description: project.description,
            })),
          },
        },
        include: {
          skills: true,
          projects: true,
        },
      });

      res.json(profile);
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({
        message: "Unable to save profile",
      });
    }
  }
);

/* =========================
   NOTIFICATIONS
========================= */

app.get(
  "/api/notifications",
  auth,
  async (req, res) => {

    try {

      const rows =
        await prisma.notification.findMany({
          where: {
            userId:
              req.user.id,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      res.json(
        rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to load notifications",
      });
    }
  }
);

app.patch(
  "/api/notifications/read-all",
  auth,
  async (req, res) => {

    try {

      await prisma.notification.updateMany({
        where: {

          userId:
            req.user.id,

          read: false,
        },

        data: {
          read: true,
        },
      });

      res.json({
        ok: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to update notifications",
      });
    }
  }
);

/* =========================
   AI ASSISTANT
========================= */

app.post(
  "/api/assistant/chat",
  auth,
  async (req, res) => {

    try {

      const message =
        String(
          req.body.message || ""
        ).trim();

      const profile =
        await prisma.user.findUnique({
          where: {
            id:
              req.user.id,
          },

          include: {
            skills: true,
          },
        });

      const skills =
        profile?.skills
          .map(
            (skill) =>
              skill.name
          )
          .join(", ") ||
        "your current skills";

      const reply =
        `Based on your profile, focus on opportunities matching ${skills}. For "${message}", I recommend tailoring your resume to the job description and preparing 2–3 project examples using the required technologies.`;

      res.json({
        reply,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message:
          "Unable to contact assistant",
      });
    }
  }
);

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(
  (err, _, res, __) => {

    console.error(err);

    res.status(500).json({
      message:
        "Internal server error",
    });
  }
);

/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  () => {
    console.log(
      `CareerConnect API running on http://localhost:${PORT}`
    );
  }
);