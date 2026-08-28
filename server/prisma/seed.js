import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const jobs = [
  {
    title: "Frontend Developer", company: "WebFlow", location: "San Francisco, CA (Hybrid)",
    mode: "Hybrid", type: "Full-time", salary: "$120k - $150k",
    skills: "React,TypeScript,CSS",
    description: "Build accessible, scalable web interfaces and collaborate with product and design teams.",
    eligibility: "Bachelor's degree or equivalent experience; strong React and TypeScript skills."
  },
  {
    title: "Data Analyst", company: "InsightCorp", location: "Remote",
    mode: "Remote", type: "Full-time", salary: "$90k - $120k",
    skills: "SQL,Python,Tableau",
    description: "Turn business data into dashboards, insights, and actionable recommendations.",
    eligibility: "Strong SQL and analytical skills; Python experience preferred."
  },
  {
    title: "Software Developer", company: "TechNova", location: "San Francisco, CA (Remote)",
    mode: "Remote", type: "Full-time", salary: "$120k - $150k",
    skills: "React,Node.js,TypeScript,GraphQL,AWS Services",
    description: "Build and maintain scalable software for an AI-driven analytics platform.",
    eligibility: "Bachelor's degree and 3+ years of professional software development experience."
  },
  {
    title: "AI/ML Intern", company: "FutureScale", location: "Remote",
    mode: "Remote", type: "Internship", salary: "$40/hr",
    skills: "Python,PyTorch,Data Analysis",
    description: "Support machine-learning experiments, data analysis, and model evaluation.",
    eligibility: "Student pursuing Computer Science, AI, Data Science, or a related field."
  }
];

for (const job of jobs) {
  await prisma.job.upsert({
    where: { id: jobs.indexOf(job) + 1 },
    update: job,
    create: job
  });
}
console.log("Seeded jobs.");
await prisma.$disconnect();
