import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, UserCircle, Bookmark, FileText, UsersRound, Video,
  Bell, BriefcaseBusiness, CalendarDays, Eye, Star, Sparkles,
  ArrowRight, MapPin, Clock3, CheckCircle2, Code2, BarChart3,
  GraduationCap, Pencil, Download, Upload, Send, Paperclip, X,
  ChevronDown, LogIn, ShieldCheck, HeartPulse, Laptop2, TrendingUp,
  Plane, Building2, Link2
} from "lucide-react";
import "./styles.css";
import {
  authApi,
  jobsApi,
  applicationsApi,
  profileApi,
  notificationsApi,
  assistantApi,
} from "./api.js";




function Header({ page, setPage, onProfile }) {
  return <header className="header">
    <div className="brand" onClick={()=>setPage("home")}>CareerConnect AI</div>
    <nav>
      {["home","jobs","applications","notifications"].map(p =>
        <button key={p} className={page===p ? "nav active" : "nav"} onClick={()=>setPage(p)}>
          {p[0].toUpperCase()+p.slice(1)}
        </button>
      )}
    </nav>
    <div className="header-right">
      <div className="mini-search"><Search size={19}/><input placeholder={`Search ${page === "applications" ? "applications" : "jobs"}...`}/></div>
      <button className="profile-link" onClick={onProfile}>My Profile</button>
      <div className="avatar small">A</div>
    </div>
  </header>
}

function Footer(){ return <footer><b>CareerConnect AI</b><span>© 2024 CareerConnect AI. All rights reserved.</span><div><span>Privacy Policy</span><span>Terms of Service</span><span>Support</span></div></footer> }

function AIButton({open,onClick}) { return <button className="ai-fab" onClick={onClick} title="CareerConnect AI Assistant">{open ? <X/> : <Sparkles/>}</button> }

function Assistant({close}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! How can I help you today? I can help with job matching, resume improvement, and interview preparation.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text = message) {
    const value = text.trim();
    if (!value || loading) return;

    setMessages(prev => [...prev, { role: "user", text: value }]);
    setMessage("");
    setLoading(true);

    try {
      const data = await assistantApi.chat(value);
      setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: err.message || "Unable to contact the AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return <aside className="assistant">
    <div className="assistant-head">
      <div className="bot"><Sparkles size={18}/></div>
      <div><strong>CareerConnect AI Assistant</strong><small>Your personal career mentor</small></div>
      <button onClick={close}><X/></button>
    </div>

    <div className="assistant-body">
      {messages.map((m, index) => (
        <div className="assistant-msg" key={index}>
          {m.role === "assistant" && <div className="bot tiny"><Sparkles size={14}/></div>}
          <div className="bubble">{m.text}</div>
        </div>
      ))}

      {loading && (
        <div className="assistant-msg">
          <div className="bot tiny"><Sparkles size={14}/></div>
          <div className="bubble">Thinking...</div>
        </div>
      )}

      <div className="suggestions">
        <button onClick={() => sendMessage("Find jobs matching my skills")}>Find jobs matching my skills</button>
        <button onClick={() => sendMessage("Improve my resume")}>Improve my resume</button>
        <button onClick={() => sendMessage("Help me prepare for an interview")}>Interview prep</button>
      </div>
    </div>

    <div className="assistant-input">
      <Paperclip size={20}/>
      <input
        placeholder="Type a message..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        disabled={loading}
      />
      <button onClick={() => sendMessage()} disabled={loading || !message.trim()}>
        <Send size={18}/>
      </button>
    </div>
    <small className="disclaimer">AI can make mistakes. Consider verifying important information.</small>
  </aside>
}

function Layout({page,setPage,children,onProfile}) {
  const [assistant,setAssistant] = useState(false);
  return <div className="app"><Header page={page} setPage={setPage} onProfile={onProfile}/>{children}<AIButton open={assistant} onClick={()=>setAssistant(!assistant)}/>{assistant && <Assistant close={()=>setAssistant(false)}/>}<Footer/></div>
}

function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [otp,setOtp]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function handleSendOtp(){
    setError("");
    const value=email.trim().toLowerCase();
    if(!value){
      setError("Please enter your college email.");
      return;
    }
    try{
      setLoading(true);
      await authApi.requestOtp(value);
      setSent(true);
    }catch(err){
      setError(err.message || "Unable to send OTP.");
    }finally{
      setLoading(false);
    }
  }

  async function handleVerifyOtp(){
    setError("");
    if(!/^\d{6}$/.test(otp)){
      setError("Please enter the 6-digit OTP.");
      return;
    }
    try{
      setLoading(true);
      const data=await authApi.verifyOtp(email.trim().toLowerCase(),otp);
      localStorage.setItem("cc_token",data.token);
      onLogin(data.user);
    }catch(err){
      setError(err.message || "Invalid or expired OTP.");
    }finally{
      setLoading(false);
    }
  }

  return <div className="login-page">
    <section className="login-left">
      <div className="login-brand">CareerConnect AI</div>
      <p>Your career. Your opportunities. Your future.</p>
      <div className="login-visual"><div className="visual-card"><Sparkles size={38}/><strong>AI-powered career matching</strong><span>Discover opportunities built around your skills.</span></div></div>
      <small>© 2024 CareerConnect AI. All rights reserved.</small>
    </section>
    <section className="login-right">
      <div className="login-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your placement journey.</p>
        {!sent ? <>
          <label>College Email</label>
          <div className="input-icon">
            <FileText size={20}/>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSendOtp()} placeholder="name@college.edu" autoComplete="email"/>
          </div>
          {error&&<div className="auth-error">{error}</div>}
          <button className="primary wide" onClick={handleSendOtp} disabled={loading}>
            {loading?"Sending...":"Send OTP"} <ArrowRight size={18}/>
          </button>
        </> : <>
          <div className="otp-sent">OTP sent to <strong>{email}</strong></div>
          <label>Enter OTP</label>
          <div className="input-icon">
            <ShieldCheck size={20}/>
            <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handleVerifyOtp()} placeholder="6-digit OTP" autoComplete="one-time-code"/>
          </div>
          {error&&<div className="auth-error">{error}</div>}
          <button className="primary wide" onClick={handleVerifyOtp} disabled={loading}>
            {loading?"Verifying...":"Verify & Continue"} <ArrowRight size={18}/>
          </button>
          <button className="text-btn" onClick={()=>{setSent(false);setOtp("");setError("");}} disabled={loading}>Change email</button>
        </>}
        <hr/><p className="legal">By continuing, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.</p>
      </div>
    </section>
  </div>;
}

function Home({setPage, user}) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const [jobsData, applicationsData, profileData] = await Promise.all([
          jobsApi.getAll(),
          applicationsApi.getAll(),
          profileApi.get(),
        ]);

        if (!active) return;
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        setProfile(profileData);
      } catch (err) {
        if (active) setError(err.message || "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => { active = false; };
  }, []);

  const shortlisted = applications.filter(a => a.status === "SHORTLISTED").length;
  const interviews = applications.filter(a => a.status === "INTERVIEW").length;

  const completion = profile
    ? Math.min(
        100,
        20 +
        (profile.name ? 15 : 0) +
        (profile.degree ? 15 : 0) +
        (profile.university ? 10 : 0) +
        (profile.graduationYear ? 10 : 0) +
        (profile.gpa ? 10 : 0) +
        (profile.skills?.length ? 10 : 0) +
        (profile.projects?.length ? 10 : 0)
      )
    : 0;

  return <Layout page="home" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container home">
      <div className="hero-row">
        <div>
          <h1>Good morning, {profile?.name || user?.name || "there"} 👋</h1>
          <p>Let's find your next great opportunity.</p>
        </div>
        <div className="completion">
          <span>Profile Completion <b>{completion}%</b></span>
          <div className="progress"><i style={{width:`${completion}%`}}/></div>
          <button className="primary" onClick={()=>setPage("profile")}>Complete Profile</button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="search-box">
        <Search/>
        <input
          placeholder="Search for jobs, skills, or locations..."
          onKeyDown={e => {
            if (e.key === "Enter") setPage("jobs");
          }}
        />
        <button className="primary" onClick={()=>setPage("jobs")}>Search</button>
      </div>

      <div className="stats">
        <Stat icon={<FileText/>} title="Applications" value={loading ? "—" : applications.length}/>
        <Stat icon={<UsersRound/>} title="Shortlisted" value={loading ? "—" : shortlisted}/>
        <Stat icon={<Video/>} title="Interviews" value={loading ? "—" : interviews} active/>
        <Stat icon={<Bookmark/>} title="Saved" value="0"/>
      </div>

      <div className="section-title">
        <h2>Recommended for you</h2>
        <span><Sparkles size={16}/> AI Matched</span>
      </div>

      {loading ? (
        <p>Loading recommended jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs available yet. Open the Jobs page to refresh.</p>
      ) : (
        <div className="job-grid">
          {jobs.slice(0, 2).map(j =>
            <JobCard key={j.id} job={j} compact onView={()=>setPage("job-detail", j.id)}/>
          )}
        </div>
      )}
    </main>
  </Layout>
}
function Stat({icon,title,value,active}) { return <div className={"stat "+(active?"stat-active":"")}><div className="stat-label">{icon}{title}</div><strong>{value}</strong></div> }

function JobCard({job,compact=false,onView}) {
  const [saved,setSaved]=useState(false);
  const Icon=job.icon || BriefcaseBusiness;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return <article className={"job-card "+(compact?"compact":"")}>
    <div className="job-top">
      <div className="job-icon"><Icon size={26}/></div>
      <button className={"bookmark "+(saved?"saved":"")} onClick={()=>setSaved(!saved)}>
        <Bookmark fill={saved?"currentColor":"none"}/>
      </button>
    </div>
    <h3>{job.title}</h3>
    <p className="company">{job.company} • {job.location}</p>
    <div className="chips">{skills.map(s=><span key={s}>{s}</span>)}</div>
    <div className="job-bottom">
      <b>{job.salary || "Salary not specified"}</b>
      <button className="secondary" onClick={onView}>View Details</button>
    </div>
  </article>
}

function Jobs({setPage, setSelectedJob}) {
  const [jobs,setJobs]=useState([]);
  const [search,setSearch]=useState("");
  const [mode,setMode]=useState("");
  const [type,setType]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function loadJobs(filters = {}) {
    try {
      setLoading(true);
      setError("");
      const data = await jobsApi.getAll(filters);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  function applyFilters() {
    loadJobs({ search, mode, type });
  }

  function openJob(job) {
    setSelectedJob(job);
    setPage("job-detail");
  }

  function clearFilters() {
    setSearch("");
    setMode("");
    setType("");
    loadJobs();
  }

  return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container jobs-page">
      <div className="page-heading">
        <div>
          <h1>Find your next opportunity</h1>
          <p>Search jobs directly from the CareerConnect database.</p>
        </div>
        <select onChange={e => loadJobs({ search, mode, type, sort: e.target.value })}>
          <option>Most Relevant</option>
          <option>Newest</option>
        </select>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="search-box">
        <Search/>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&applyFilters()}
          placeholder="Search jobs, skills, companies, or locations..."
        />
        <button className="primary" onClick={applyFilters}>Search</button>
      </div>

      <div className="jobs-layout">
        <aside className="filters">
          <div className="filter-head">
            <h3>Filters</h3>
            <button className="text-btn" onClick={clearFilters}>Clear all</button>
          </div>

          <h4>Job Type</h4>
          <Check label="All types" checked={type === ""} setChecked={() => setType("")}/>
          <Check label="Full-time" checked={type === "Full-time"} setChecked={() => setType("Full-time")}/>
          <Check label="Part-time" checked={type === "Part-time"} setChecked={() => setType("Part-time")}/>
          <Check label="Internship" checked={type === "Internship"} setChecked={() => setType("Internship")}/>

          <hr/>

          <h4>Work Mode</h4>
          <Check label="All modes" checked={mode === ""} setChecked={() => setMode("")}/>
          <Check label="Remote" checked={mode === "Remote"} setChecked={() => setMode("Remote")}/>
          <Check label="Hybrid" checked={mode === "Hybrid"} setChecked={() => setMode("Hybrid")}/>
          <Check label="On-site" checked={mode === "On-site"} setChecked={() => setMode("On-site")}/>

          <hr/>
          <button className="secondary wide" onClick={applyFilters}>Apply Filters</button>
        </aside>

        <section className="job-list">
          {loading ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found for the selected filters.</p>
          ) : jobs.map(j => (
            <div className="list-job" key={j.id}>
              <div className="job-icon"><BriefcaseBusiness/></div>
              <div className="list-main">
                <h3>{j.title}</h3>
                <p>{j.company} • {j.location}</p>
                <div className="chips">
                  {(Array.isArray(j.skills) ? j.skills : []).map(s=><span key={s}>{s}</span>)}
                </div>
              </div>
              <Bookmark className="list-bookmark"/>
              <div className="list-bottom">
                <b>{j.salary || "Salary not specified"}</b>
                <div>
                  <button className="secondary" onClick={()=>openJob(j)}>View</button>
                  <button className="primary" onClick={()=>openJob(j)}>Apply Now</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  </Layout>
}
function Check({label,checked,setChecked}) { return <label className="check"><input type="checkbox" checked={!!checked} onChange={e=>setChecked?.(e.target.checked)}/><span>{label}</span></label> }

function JobDetail({setPage, job, refreshApplications}) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [applied,setApplied]=useState(false);

  if (!job) {
    return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}>
      <main className="container detail">
        <h1>Job not selected</h1>
        <button className="primary" onClick={()=>setPage("jobs")}>Back to Jobs</button>
      </main>
    </Layout>;
  }

  async function apply() {
    try {
      setLoading(true);
      setError("");
      await jobsApi.apply(job.id, "");
      setApplied(true);
      refreshApplications?.();
    } catch (err) {
      setError(err.message || "Unable to apply for this job.");
    } finally {
      setLoading(false);
    }
  }

  return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container detail">
      <div className="breadcrumb">
        Jobs <span>›</span> {job.title}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="detail-head">
        <div className="job-icon"><BriefcaseBusiness/></div>
        <div>
          <h1>{job.title}</h1>
          <h3>{job.company}</h3>
          <p>
            <MapPin/> {job.location} &nbsp;
            <Clock3/> {job.type} &nbsp;
            <CalendarDays/> {job.mode}
          </p>
        </div>
        <div className="detail-actions">
          <button className="secondary">🔖 Save Job</button>
          <button className="primary" onClick={apply} disabled={loading || applied}>
            {loading ? "Applying..." : applied ? "Applied ✓" : "Apply Now"}
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <article className="detail-main">
          <h2>About the Role</h2>
          <p>{job.description || "No job description provided."}</p>

          <hr/>
          <h2>Required Skills & Technologies</h2>
          <div className="chips">
            {(Array.isArray(job.skills) ? job.skills : []).map(s=><span key={s}>{s}</span>)}
          </div>

          <hr/>
          <h2>Eligibility</h2>
          <div className="notice">
            {job.eligibility || "Eligibility details were not provided by the employer."}
          </div>

          <hr/>
          <h2>Job Information</h2>
          <div className="notice">
            <b>Salary:</b> {job.salary || "Not specified"}<br/>
            <b>Work Mode:</b> {job.mode || "Not specified"}<br/>
            <b>Job Type:</b> {job.type || "Not specified"}
          </div>
        </article>

        <aside>
          <div className="side-card">
            <div>Application Status <b>{applied ? "Applied" : "Not Applied"}</b></div>
            <div>Company <b>{job.company}</b></div>
            <div className="ai-insight">
              <Sparkles/>
              Review the required skills and tailor your resume before applying.
            </div>
          </div>

          <div className="side-card">
            <h2>About {job.company}</h2>
            <p>
              Explore this opportunity and highlight the projects and skills
              that best match the role.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </Layout>
}

function Applications({setPage}) {
  const [tab,setTab]=useState("All Applications");
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");
      const data = await applicationsApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  const filtered = rows.filter(a =>
    tab === "All Applications" ||
    a.status === tab.toUpperCase().replaceAll(" ", "_")
  );

  return <Layout page="applications" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container apps">
      <div className="apps-heading">
        <div>
          <h1>My Applications</h1>
          <p>Track and manage your job applications.</p>
        </div>
        <button className="primary" onClick={()=>setPage("jobs")}>◉ Browse More Jobs</button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="tabs">
        {["All Applications","Applied","Under Review","Shortlisted","Interview","Selected","Rejected"].map(t=>
          <button
            key={t}
            className={tab===t?"tab active":"tab"}
            onClick={()=>setTab(t)}
          >
            {t}
            {t==="All Applications"&&<small>{rows.length}</small>}
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : filtered.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="application-grid">
          {filtered.map(a => {
            const statusLabel = a.status.replaceAll("_", " ");
            return <article className="application-card" key={a.id}>
              <div className="company-logo"><Building2/></div>
              <div>
                <h2>{a.job?.title || "Job Application"}</h2>
                <p>{a.job?.company || "Company"} • {a.job?.location || "Location not available"}</p>
                <div className="chips">
                  {(Array.isArray(a.job?.skills) ? a.job.skills : String(a.job?.skills || "").split(",").filter(Boolean)).map(s=>
                    <span key={s}>{String(s).trim()}</span>
                  )}
                  {a.job?.salary&&<span>{a.job.salary}</span>}
                </div>
              </div>
              <div className={"status "+statusLabel.replaceAll(" ","-").toLowerCase()}>
                {statusLabel}
              </div>
              <time>Applied: {new Date(a.appliedAt).toLocaleDateString()}</time>
            </article>;
          })}
        </div>
      )}
    </main>
  </Layout>
}

function Profile({setPage}) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    degree: "",
    university: "",
    graduationYear: "",
    gpa: "",
    resumeUrl: "",
    skills: [],
    projects: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const data = await profileApi.get();

      setProfile(data);
      setForm({
        name: data.name || "",
        degree: data.degree || "",
        university: data.university || "",
        graduationYear: data.graduationYear || "",
        gpa: data.gpa || "",
        resumeUrl: data.resumeUrl || "",
        skills: (data.skills || []).map(skill => skill.name),
        projects: (data.projects || []).map(project => ({
          title: project.title,
          description: project.description,
        })),
      });
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess("");
  }

  function addSkill() {
    const skill = newSkill.trim();
    if (!skill) return;

    if (!form.skills.some(item => item.toLowerCase() === skill.toLowerCase())) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }

    setNewSkill("");
    setSuccess("");
  }

  function removeSkill(skillToRemove) {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
    setSuccess("");
  }

  function addProject() {
    const title = newProject.title.trim();
    const description = newProject.description.trim();

    if (!title || !description) return;

    setForm(prev => ({
      ...prev,
      projects: [...prev.projects, { title, description }],
    }));

    setNewProject({ title: "", description: "" });
    setSuccess("");
  }

  function removeProject(index) {
    setForm(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    setSuccess("");
  }

  function cancelEdit() {
    if (profile) {
      setForm({
        name: profile.name || "",
        degree: profile.degree || "",
        university: profile.university || "",
        graduationYear: profile.graduationYear || "",
        gpa: profile.gpa || "",
        resumeUrl: profile.resumeUrl || "",
        skills: (profile.skills || []).map(skill => skill.name),
        projects: (profile.projects || []).map(project => ({
          title: project.title,
          description: project.description,
        })),
      });
    }

    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function saveProfile() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await profileApi.update({
        name: form.name.trim(),
        degree: form.degree.trim(),
        university: form.university.trim(),
        graduationYear: Number(form.graduationYear) || 2025,
        gpa: form.gpa.trim(),
        resumeUrl: form.resumeUrl.trim() || null,
        skills: form.skills,
        projects: form.projects,
      });

      setProfile(updated);
      setForm({
        name: updated.name || "",
        degree: updated.degree || "",
        university: updated.university || "",
        graduationYear: updated.graduationYear || "",
        gpa: updated.gpa || "",
        resumeUrl: updated.resumeUrl || "",
        skills: (updated.skills || []).map(skill => skill.name),
        projects: (updated.projects || []).map(project => ({
          title: project.title,
          description: project.description,
        })),
      });

      setEditing(false);
      setSuccess("Profile saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const completion = form
    ? Math.min(
        100,
        20 +
          (form.name ? 15 : 0) +
          (form.degree ? 15 : 0) +
          (form.university ? 10 : 0) +
          (form.graduationYear ? 10 : 0) +
          (form.gpa ? 10 : 0) +
          (form.skills.length ? 10 : 0) +
          (form.projects.length ? 10 : 0)
      )
    : 0;

  if (loading) {
    return (
      <Layout page="home" setPage={setPage} onProfile={() => setPage("profile")}>
        <main className="container profile">
          <p>Loading profile...</p>
        </main>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout page="home" setPage={setPage} onProfile={() => setPage("profile")}>
        <main className="container profile">
          <div className="auth-error">{error}</div>
          <button className="primary" onClick={loadProfile}>Try Again</button>
        </main>
      </Layout>
    );
  }

  return (
    <Layout page="home" setPage={setPage} onProfile={() => setPage("profile")}>
      <main className="container profile">

        <div className="profile-card">
          <div className="profile-cover"></div>

          <div className="avatar profile-avatar">
            {(form.name || "A").charAt(0).toUpperCase()}
          </div>

          <h1>{form.name || "Your Name"}</h1>
          <p>{form.degree || "Degree not added"}</p>

          <span>
            <GraduationCap/>
            {form.university || "University not added"}
          </span>

          <div className="profile-progress">
            <b>
              Profile Completion <strong>{completion}%</strong>
            </b>

            <div className="progress">
              <i style={{ width: `${completion}%` }}/>
            </div>
          </div>
        </div>

        <div className="profile-toolbar">
          {!editing ? (
            <button className="primary" onClick={() => {
              setEditing(true);
              setSuccess("");
              setError("");
            }}>
              <Pencil size={17}/> Edit Profile
            </button>
          ) : (
            <div className="profile-edit-actions">
              <button className="secondary" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>

              <button className="primary" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <div className="profile-content">

          {editing && (
            <Panel title="Personal Information" icon={<UserCircle/>}>
              <div className="profile-form-grid">

                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => updateField("name", e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-field">
                  <label>Degree</label>
                  <input
                    value={form.degree}
                    onChange={e => updateField("degree", e.target.value)}
                    placeholder="B.Tech in Computer Science"
                  />
                </div>

                <div className="form-field">
                  <label>University</label>
                  <input
                    value={form.university}
                    onChange={e => updateField("university", e.target.value)}
                    placeholder="University name"
                  />
                </div>

                <div className="form-field">
                  <label>Graduation Year</label>
                  <input
                    type="number"
                    value={form.graduationYear}
                    onChange={e => updateField("graduationYear", e.target.value)}
                    placeholder="2025"
                  />
                </div>

                <div className="form-field">
                  <label>GPA</label>
                  <input
                    value={form.gpa}
                    onChange={e => updateField("gpa", e.target.value)}
                    placeholder="3.8/4.0"
                  />
                </div>

                <div className="form-field">
                  <label>Resume URL</label>
                  <input
                    type="url"
                    value={form.resumeUrl}
                    onChange={e => updateField("resumeUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

              </div>
            </Panel>
          )}

          <Panel title="Education" icon={<GraduationCap/>}>
            <div className="education">
              <div>
                <b>{form.university || "University not added"}</b>
                <span>{form.degree || "Degree not added"}</span>
              </div>

              <div>
                <small>Class of {form.graduationYear || "—"}</small>
                <b>GPA: {form.gpa || "—"}</b>
              </div>
            </div>
          </Panel>

          <Panel title="Technical Skills" icon={<Code2/>}>
            <div className="chips big">
              {form.skills.length === 0 ? (
                <p>No skills added yet.</p>
              ) : (
                form.skills.map(skill => (
                  <span key={skill}>
                    {skill}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        title={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {editing && (
              <div className="inline-add">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  placeholder="Add a skill e.g. Java"
                />
                <button className="secondary" onClick={addSkill}>
                  + Add Skill
                </button>
              </div>
            )}
          </Panel>

          <Panel title="Projects" icon={<BriefcaseBusiness/>}>
            <div className="projects">
              {form.projects.length === 0 ? (
                <p>No projects added yet.</p>
              ) : (
                form.projects.map((project, index) => (
                  <div className="project" key={`${project.title}-${index}`}>
                    <b>{project.title}</b>
                    <p>{project.description}</p>

                    {editing && (
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => removeProject(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {editing && (
              <div className="project-add">
                <input
                  value={newProject.title}
                  onChange={e =>
                    setNewProject(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Project title"
                />

                <textarea
                  value={newProject.description}
                  onChange={e =>
                    setNewProject(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Project description"
                  rows={3}
                />

                <button className="secondary" onClick={addProject}>
                  + Add Project
                </button>
              </div>
            )}
          </Panel>

          <div className="resume-card">
            <h2><FileText/> Resume</h2>

            <div className="resume-file">
              {form.resumeUrl || "No resume uploaded"}
            </div>

            {form.resumeUrl ? (
              <a
                className="primary wide"
                href={form.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Eye size={17}/> View Resume
              </a>
            ) : editing ? (
              <button
                className="secondary wide"
                onClick={() => document.querySelector(".resume-card")?.scrollIntoView({ behavior: "smooth" })}
              >
                Add Resume URL above
              </button>
            ) : (
              <button className="secondary wide" disabled>
                No Resume
              </button>
            )}
          </div>

          <div className="ai-profile">
            <Sparkles/>
            <h3>AI Profile Insight</h3>
            <p>
              Keep your skills, projects, education, and resume updated to
              improve job matching accuracy.
            </p>
          </div>

        </div>
      </main>
    </Layout>
  );
}
function Panel({title,icon,children}){return <section className="panel"><h2>{icon}{title}<Pencil size={18}/></h2>{children}</section>}
function Project({title,text}){return <div className="project"><b>{title}</b><p>{text}</p><a><Link2 size={14}/> View Project</a></div>}

function Notifications({setPage}) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAllRead() {
    try {
      await notificationsApi.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      setError(err.message || "Unable to update notifications.");
    }
  }

  return <Layout page="notifications" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container notifications">
      <div className="notif-heading">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your placement activities.</p>
        </div>
        <button className="secondary" onClick={markAllRead}>Mark all as read</button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <p>Loading notifications...</p>
      ) : rows.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <>
          <h2>Recent</h2>
          {rows.map(n =>
            <Notification
              key={n.id}
              icon={<Bell/>}
              title={n.title}
              text={n.message}
              time={new Date(n.createdAt).toLocaleString()}
              success={!n.read}
            />
          )}
        </>
      )}
    </main>
  </Layout>
}
function Notification({icon,title,text,time,success,old,button}){return <div className={"notification "+(success?"success":"")}><div className="notif-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p>{button&&<button className="secondary">View Job</button>}</div><time>{time}{!old&&<i/>}</time></div>}

function App(){
  const [page,setPage]=useState(localStorage.getItem("cc_token")?"home":"login");
  const [user,setUser]=useState(null);
  const [selectedJob,setSelectedJob]=useState(null);

  useEffect(() => {
    if (!localStorage.getItem("cc_token")) return;

    authApi.me()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem("cc_token");
        setPage("login");
      });
  }, []);

  function handleLogin(data) {
    setUser(data);
    setPage("home");
  }

  if(page==="login") return <Login onLogin={handleLogin}/>;

  const pages = {
    home:<Home setPage={setPage} user={user}/>,
    jobs:<Jobs setPage={setPage} setSelectedJob={setSelectedJob}/>,
    "job-detail":<JobDetail setPage={setPage} job={selectedJob}/>,
    applications:<Applications setPage={setPage}/>,
    profile:<Profile setPage={setPage}/>,
    notifications:<Notifications setPage={setPage}/>,
  };

  return pages[page] || pages.home;
}
createRoot(document.getElementById("root")).render(<App/>);