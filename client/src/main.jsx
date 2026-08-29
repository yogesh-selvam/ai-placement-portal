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
  savedJobsApi,
  notificationsApi,
  assistantApi,
 } from "./api.js";

function normalizeSavedJobs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.savedJobs)) return data.savedJobs;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function savedJobId(item) {
  return Number(item?.jobId ?? item?.job?.id ?? item?.id);
}




function Header({ page, setPage, onProfile }) {
  return <header className="header">
    <div className="brand" onClick={()=>setPage("home")}>CareerConnect AI</div>
    <nav>
      {[
        ["home","Home"],
        ["jobs","Jobs"],
        ["applications","Applications"],
        ["saved-jobs","Saved Jobs"],
        ["notifications","Notifications"],
        ["career-insights","Career Insights"],
      ].map(([key,label]) =>
        <button key={key} className={page===key ? "nav active" : "nav"} onClick={()=>setPage(key)}>
          {label}
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

function Footer(){ return <footer><b>CareerConnect AI</b><span>Â© 2024 CareerConnect AI. All rights reserved.</span><div><span>Privacy Policy</span><span>Terms of Service</span><span>Support</span></div></footer> }

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
      <small>Â© 2024 CareerConnect AI. All rights reserved.</small>
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

function Home({setPage, user, setSelectedJob}) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const [jobsData, applicationsData, profileData, savedJobsData] = await Promise.all([
          jobsApi.getAll(),
          applicationsApi.getAll(),
          profileApi.get(),
          savedJobsApi.getAll(),
        ]);

        if (!active) return;
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        setProfile(profileData);
        setSavedJobs(normalizeSavedJobs(savedJobsData));
      } catch (err) {
        if (active) setError(err.message || "Unable to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadDashboard();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
          <h1>Good morning, {profile?.name || user?.name || "there"} ðŸ‘‹</h1>
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
        <Stat icon={<FileText/>} title="Applications" value={loading ? "â€”" : applications.length}/>
        <Stat icon={<UsersRound/>} title="Shortlisted" value={loading ? "â€”" : shortlisted}/>
        <Stat icon={<Video/>} title="Interviews" value={loading ? "â€”" : interviews} active/>
        <Stat icon={<Bookmark/>} title="Saved" value={loading ? "â€”" : new Set(savedJobs.map(savedJobId).filter(Number.isFinite)).size}/>
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
            <JobCard
              key={j.id}
              job={j}
              compact
              initialSaved={savedJobs.some(item => savedJobId(item) === Number(j.id))}
              onView={() => {
                setSelectedJob?.(j);
                setPage("job-detail");
              }}
              onSavedChange={(saved) => setSavedJobs(prev =>
                saved
                  ? [...prev, { jobId: j.id, job: j }]
                  : prev.filter(item => savedJobId(item) !== Number(j.id))
              )}
            />
          )}
        </div>
      )}
    </main>
  </Layout>
}
function Stat({icon,title,value,active}) { return <div className={"stat "+(active?"stat-active":"")}><div className="stat-label">{icon}{title}</div><strong>{value}</strong></div> }

function JobCard({job,compact=false,onView,initialSaved=false,onSavedChange}) {
  const [saved,setSaved]=useState(!!initialSaved);
  const [saving,setSaving]=useState(false);
  const Icon=job.icon || BriefcaseBusiness;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  useEffect(() => {
    setSaved(!!initialSaved);
  }, [initialSaved]);

  async function toggleSaved() {
    if (saving) return;

    try {
      setSaving(true);

      if (saved) {
        await savedJobsApi.remove(job.id);
        setSaved(false);
        onSavedChange?.(false);
      } else {
        await savedJobsApi.save(job.id);
        setSaved(true);
        onSavedChange?.(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to update saved job.");
    } finally {
      setSaving(false);
    }
  }

  return <article className={"job-card "+(compact?"compact":"")}>
    <div className="job-top">
      <div className="job-icon"><Icon size={26}/></div>
      <button
        className={"bookmark "+(saved?"saved":"")}
        onClick={toggleSaved}
        disabled={saving}
        title={saved ? "Remove from saved jobs" : "Save job"}
        aria-label={saved ? "Remove from saved jobs" : "Save job"}
      >
        <Bookmark fill={saved?"currentColor":"none"}/>
      </button>
    </div>
    <h3>{job.title}</h3>
    <p className="company">{job.company} â€¢ {job.location}</p>
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
  const [savedJobs,setSavedJobs]=useState([]);

  async function loadJobs(filters = {}) {
    try {
      setLoading(true);
      setError("");
      const [data, savedData] = await Promise.all([
        jobsApi.getAll(filters),
        savedJobsApi.getAll(),
      ]);
      setJobs(Array.isArray(data) ? data : []);
      setSavedJobs(normalizeSavedJobs(savedData));
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
                <p>{j.company} â€¢ {j.location}</p>
                <div className="chips">
                  {(Array.isArray(j.skills) ? j.skills : []).map(s=><span key={s}>{s}</span>)}
                </div>
              </div>
              <button
                className={"list-bookmark "+(savedJobs.some(item => savedJobId(item) === Number(j.id)) ? "saved" : "")}
                onClick={async () => {
                  const isSaved = savedJobs.some(item => savedJobId(item) === Number(j.id));
                  try {
                    if (isSaved) {
                      await savedJobsApi.remove(j.id);
                      setSavedJobs(prev => prev.filter(item => savedJobId(item) !== Number(j.id)));
                    } else {
                      await savedJobsApi.save(j.id);
                      setSavedJobs(prev => [...prev, { jobId: j.id, job: j }]);
                    }
                  } catch (err) {
                    setError(err.message || "Unable to update saved job.");
                  }
                }}
                title={savedJobs.some(item => savedJobId(item) === Number(j.id)) ? "Remove saved job" : "Save job"}
                aria-label={savedJobs.some(item => savedJobId(item) === Number(j.id)) ? "Remove saved job" : "Save job"}
              >
                <Bookmark fill={savedJobs.some(item => savedJobId(item) === Number(j.id)) ? "currentColor" : "none"}/>
              </button>
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
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);

  useEffect(() => {
    if (!job) return;
    savedJobsApi.getAll()
      .then(data => setSaved(normalizeSavedJobs(data).some(item => savedJobId(item) === Number(job.id))))
      .catch(() => {});
  }, [job]);

  if (!job) {
    return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}>
      <main className="container detail">
        <h1>Job not selected</h1>
        <button className="primary" onClick={()=>setPage("jobs")}>Back to Jobs</button>
      </main>
    </Layout>;
  }

  async function toggleSaved() {
    try {
      setSaving(true);
      if (saved) {
        await savedJobsApi.remove(job.id);
        setSaved(false);
      } else {
        await savedJobsApi.save(job.id);
        setSaved(true);
      }
    } catch (err) {
      setError(err.message || "Unable to update saved job.");
    } finally {
      setSaving(false);
    }
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
        Jobs <span>â€º</span> {job.title}
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
          <button className={"secondary "+(saved ? "saved-action" : "")} onClick={toggleSaved} disabled={saving}>
            <Bookmark size={17} fill={saved ? "currentColor" : "none"}/>
            {saving ? "Saving..." : saved ? "Saved" : "Save Job"}
          </button>
          <button className="primary" onClick={apply} disabled={loading || applied}>
            {loading ? "Applying..." : applied ? "Applied âœ“" : "Apply Now"}
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

function InterviewPrep({setPage}) {
  const [applications, setApplications] = useState([]);
  const [jobId, setJobId] = useState("");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");
      const data = await applicationsApi.getAll();
      const rows = Array.isArray(data) ? data : [];
      setApplications(rows);
      if (!jobId && rows[0]?.job?.id) setJobId(String(rows[0].job.id));
    } catch (err) {
      setError(err.message || "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApplications(); }, []);

  async function generateQuestion() {
    if (!jobId) return;
    try {
      setGenerating(true);
      setError("");
      setResult(null);
      setAnswer("");
      const data = await interviewApi.getQuestion(jobId);
      setQuestion(data);
    } catch (err) {
      setError(err.message || "Unable to generate interview question.");
    } finally {
      setGenerating(false);
    }
  }

  async function evaluateAnswer() {
    if (!question || !answer.trim()) return;
    try {
      setEvaluating(true);
      setError("");
      const data = await interviewApi.evaluate({
        jobId: Number(jobId),
        questionId: question.id,
        answer: answer.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to evaluate your answer.");
    } finally {
      setEvaluating(false);
    }
  }

  const selectedApplication = applications.find(a => Number(a.job?.id) === Number(jobId));
  const job = selectedApplication?.job;

  return (
    <Layout page="interview-prep" setPage={setPage} onProfile={() => setPage("profile")}>
      <main className="container interview-page">
        <div className="interview-hero">
          <div>
            <div className="eyebrow"><Sparkles size={16}/> MODULE 7</div>
            <h1>AI Interview Preparation</h1>
            <p>Practice role-specific questions and get instant feedback on your answers.</p>
          </div>
          <div className="interview-hero-icon"><ClipboardCheck size={34}/></div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <div className="empty-state"><p>Loading your applied jobs...</p></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <ClipboardCheck size={42}/>
            <h2>Apply to a job first</h2>
            <p>Your interview practice questions are generated from jobs you have applied to.</p>
            <button className="primary" onClick={() => setPage("jobs")}>Browse Jobs</button>
          </div>
        ) : (
          <>
            <section className="interview-card">
              <div className="interview-card-head">
                <div>
                  <h2>Choose an applied role</h2>
                  <p>Select a job and generate a practice question.</p>
                </div>
                <span className="interview-badge"><Sparkles size={15}/> AI Practice</span>
              </div>

              <div className="interview-controls">
                <select value={jobId} onChange={e => { setJobId(e.target.value); setQuestion(null); setResult(null); setAnswer(""); }}>
                  {applications.map(a => (
                    <option key={a.id} value={a.job?.id}>
                      {a.job?.title || "Job"} â€” {a.job?.company || "Company"}
                    </option>
                  ))}
                </select>
                <button className="primary" onClick={generateQuestion} disabled={generating}>
                  {generating ? "Generating..." : "Generate Question"} <Sparkles size={17}/>
                </button>
              </div>

              {job && (
                <div className="interview-job-summary">
                  <strong>{job.title}</strong>
                  <span>{job.company} â€¢ {job.location}</span>
                  <div className="chips">
                    {(Array.isArray(job.skills) ? job.skills : String(job.skills || "").split(",").map(s => s.trim()).filter(Boolean)).slice(0, 6).map(skill => <span key={skill}>{skill}</span>)}
                  </div>
                </div>
              )}
            </section>

            {question && (
              <section className="interview-card question-card">
                <div className="question-meta">
                  <span>{question.category}</span>
                  <span>Question {question.number}</span>
                </div>
                <h2>{question.text}</h2>
                <p className="question-hint">Keep your answer specific. Mention your approach, tools, and a real example where possible.</p>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your interview answer here..."
                  rows={8}
                />
                <div className="answer-actions">
                  <span>{answer.trim().length} characters</span>
                  <button className="primary" onClick={evaluateAnswer} disabled={evaluating || answer.trim().length < 20}>
                    {evaluating ? "Evaluating..." : "Evaluate My Answer"} <CheckCircle2 size={17}/>
                  </button>
                </div>
              </section>
            )}

            {result && (
              <section className="interview-card result-card">
                <div className="result-top">
                  <div>
                    <span className="result-label">AI FEEDBACK</span>
                    <h2>Your score</h2>
                  </div>
                  <div className="score-circle"><strong>{result.score}</strong><span>/100</span></div>
                </div>

                <div className="feedback-grid">
                  <div><h3>Strengths</h3><ul>{result.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                  <div><h3>Improve next</h3><ul>{result.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                </div>

                <div className="model-answer">
                  <h3>Better answer structure</h3>
                  <p>{result.betterAnswer}</p>
                </div>

                <button className="secondary" onClick={generateQuestion}>Practice Another Question <ArrowRight size={17}/></button>
              </section>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}


function CareerInsights({ setPage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      try {
        setLoading(true);
        setError("");
        const result = await careerInsightsApi.get();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err.message || "Unable to load career insights.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInsights();

    return () => {
      active = false;
    };
  }, []);

  const statusLabels = [
    ["APPLIED", "Applied"],
    ["UNDER_REVIEW", "Under Review"],
    ["SHORTLISTED", "Shortlisted"],
    ["INTERVIEW", "Interview"],
    ["SELECTED", "Selected"],
    ["REJECTED", "Rejected"],
  ];

  if (loading) {
    return (
      <Layout page="career-insights" setPage={setPage} onProfile={() => setPage("profile")}>
        <main className="container insights-page">
          <div className="insights-loading">
            <BarChart3 size={42} />
            <h2>Loading your career insights...</h2>
            <p>We're analyzing your profile, skills, and application progress.</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout page="career-insights" setPage={setPage} onProfile={() => setPage("profile")}>
        <main className="container insights-page">
          <div className="auth-error">{error}</div>
          <button className="primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </main>
      </Layout>
    );
  }

  const score = Number(data?.readinessScore || 0);
  const scoreLabel =
    score >= 80 ? "Excellent readiness" :
    score >= 60 ? "Good progress" :
    score >= 40 ? "Keep building" :
    "Getting started";

  return (
    <Layout page="career-insights" setPage={setPage} onProfile={() => setPage("profile")}>
      <main className="container insights-page">
        <div className="insights-hero">
          <div>
            <span className="eyebrow"><Sparkles size={15}/> AI CAREER INSIGHTS</span>
            <h1>Your placement progress, at a glance.</h1>
            <p>Use your application activity, profile completeness, and skills to focus your next career move.</p>
          </div>
          <div className="readiness-card">
            <div className="readiness-ring" style={{ "--score": `${score * 3.6}deg` }}>
              <div>
                <strong>{score}</strong>
                <span>/100</span>
              </div>
            </div>
            <b>{scoreLabel}</b>
            <small>Profile & placement readiness</small>
          </div>
        </div>

        <section className="insight-stats">
          <div className="insight-stat"><FileText/><span>Applications</span><strong>{data.totals.applications}</strong></div>
          <div className="insight-stat"><UsersRound/><span>Shortlisted</span><strong>{data.totals.shortlisted}</strong></div>
          <div className="insight-stat"><Video/><span>Interviews</span><strong>{data.totals.interviews}</strong></div>
          <div className="insight-stat"><CheckCircle2/><span>Selected</span><strong>{data.totals.selected}</strong></div>
        </section>

        <div className="insights-grid">
          <section className="insight-panel">
            <div className="panel-heading">
              <div><BarChart3/><div><h2>Application Overview</h2><p>Where your applications stand right now.</p></div></div>
            </div>
            <div className="status-bars">
              {statusLabels.map(([key, label]) => {
                const value = data.statusCounts?.[key] || 0;
                const max = Math.max(1, data.totals.applications);
                return (
                  <div className="status-row" key={key}>
                    <span>{label}</span>
                    <div className="status-track"><i style={{ width: `${Math.min(100, (value / max) * 100)}%` }}/></div>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="insight-panel">
            <div className="panel-heading">
              <div><Code2/><div><h2>Your Strong Skills</h2><p>Skills you can highlight with confidence.</p></div></div>
            </div>
            {data.strongSkills?.length ? (
              <div className="insight-chips">{data.strongSkills.map(skill => <span key={skill}>{skill}</span>)}</div>
            ) : (
              <div className="insight-empty">Add technical skills to your profile to see your strengths.</div>
            )}
          </section>

          <section className="insight-panel">
            <div className="panel-heading">
              <div><TrendingUp/><div><h2>Skills to Improve</h2><p>Frequently requested skills you don't list yet.</p></div></div>
            </div>
            {data.skillsToImprove?.length ? (
              <div className="improve-list">
                {data.skillsToImprove.map((skill, index) => (
                  <div key={skill}><span>{index + 1}</span><b>{skill}</b><small>High relevance</small></div>
                ))}
              </div>
            ) : (
              <div className="insight-empty">No major skill gaps found from your current applications.</div>
            )}
          </section>

          <section className="insight-panel recommendations-panel">
            <div className="panel-heading">
              <div><Sparkles/><div><h2>AI Career Recommendations</h2><p>Practical next steps based on your current activity.</p></div></div>
            </div>
            <div className="recommendation-list">
              {(data.recommendations || []).map((item, index) => (
                <div key={index}><CheckCircle2/><p>{item}</p></div>
              ))}
            </div>
          </section>
        </div>

        {data.recommendedJobs?.length > 0 && (
          <section className="insight-panel insight-jobs">
            <div className="panel-heading">
              <div><Star/><div><h2>Best Matching Opportunities</h2><p>Roles from your job pool with at least 50% skill alignment.</p></div></div>
              <button className="secondary" onClick={() => setPage("jobs")}>View Jobs <ArrowRight size={16}/></button>
            </div>
            <div className="insight-job-grid">
              {data.recommendedJobs.map(job => (
                <div className="insight-job" key={`${job.company}-${job.title}`}>
                  <div><b>{job.title}</b><span>{job.company}</span></div>
                  <strong>{job.matchPercentage}% Match</strong>
                  <div className="insight-job-skills">
                    {job.matchingSkills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}



function Applications({ setPage }) {
  const [tab, setTab] = useState("All Applications");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function openDetails(applicationId) {
    try {
      setDetailsLoading(true);
      setError("");

      const data = await applicationsApi.getById(applicationId);

      setSelected(data);
    } catch (err) {
      setError(err.message || "Unable to load application details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setSelected(null);
  }

  const filtered = rows.filter((application) => {
    const matchesStatus =
      tab === "All Applications" ||
      application.status === tab.toUpperCase().replaceAll(" ", "_");

    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return matchesStatus;
    }

    const title = application.job?.title || "";
    const company = application.job?.company || "";

    const matchesSearch =
      title.toLowerCase().includes(searchText) ||
      company.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  const statusLabel = (status) => {
    if (!status) return "Applied";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const statusClass = (status) => {
    return String(status || "APPLIED")
      .replaceAll("_", "-")
      .toLowerCase();
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const timelineStatuses = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
  ];

  return (
    <Layout
      page="applications"
      setPage={setPage}
      onProfile={() => setPage("profile")}
    >
      <main className="container apps">

        {/* HEADER */}
        <div className="apps-heading">
          <div>
            <h1>My Applications</h1>
            <p>
              Track and manage your job applications across companies.
            </p>
          </div>

          <button
            className="primary"
            onClick={() => setPage("jobs")}
          >
            <BriefcaseBusiness size={17} />
            Browse More Jobs
          </button>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
          />

          {search && (
            <button
              className="text-btn"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* STATUS FILTERS */}
        <div className="tabs">
          {[
            "All Applications",
            "Applied",
            "Under Review",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected",
          ].map((status) => (
            <button
              key={status}
              className={tab === status ? "tab active" : "tab"}
              onClick={() => setTab(status)}
            >
              {status}

              {status === "All Applications" && (
                <small>{rows.length}</small>
              )}
            </button>
          ))}
        </div>

        {/* APPLICATION LIST */}
        {loading ? (
          <div className="notification-empty">
            <BriefcaseBusiness size={40} />
            <h3>Loading applications...</h3>
            <p>Please wait while we fetch your applications.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notification-empty">
            <FileText size={42} />

            <h2>
              {search
                ? "No matching applications"
                : "No applications yet"}
            </h2>

            <p>
              {search
                ? "Try another job title or company name."
                : "Start applying for jobs to track them here."}
            </p>

            {!search && (
              <button
                className="primary"
                onClick={() => setPage("jobs")}
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="application-grid">

            {filtered.map((application) => {
              const status = application.status || "APPLIED";

              return (
                <article
                  className="application-card"
                  key={application.id}
                >

                  {/* COMPANY ICON */}
                  <div className="company-logo">
                    <Building2 />
                  </div>

                  {/* APPLICATION INFO */}
                  <div className="application-main">

                    <h2>
                      {application.job?.title || "Job Application"}
                    </h2>

                    <p>
                      {application.job?.company || "Company"}
                      {" â€¢ "}
                      {application.job?.location || "Location not available"}
                    </p>

                    <div className="chips">

                      {(Array.isArray(application.job?.skills)
                        ? application.job.skills
                        : String(application.job?.skills || "")
                            .split(",")
                            .filter(Boolean)
                      ).map((skill) => (
                        <span key={skill}>
                          {String(skill).trim()}
                        </span>
                      ))}

                    </div>

                    <div className="application-meta">
                      <span>
                        <CalendarDays size={15} />
                        Applied {formatDate(application.appliedAt)}
                      </span>
                    </div>

                  </div>

                  {/* STATUS */}
                  <div
                    className={`status ${statusClass(status)}`}
                  >
                    {statusLabel(status)}
                  </div>

                  {/* VIEW */}
                  <button
                    className="secondary"
                    onClick={() => openDetails(application.id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                </article>
              );
            })}

          </div>
        )}

        {/* DETAILS MODAL */}
        {selected && (
          <div
            className="modal-backdrop"
            onClick={closeDetails}
          >
            <div
              className="application-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="modal-header">

                <div>
                  <span className="modal-kicker">
                    APPLICATION DETAILS
                  </span>

                  <h2>
                    {selected.job?.title || "Job Application"}
                  </h2>

                  <p>
                    {selected.job?.company || "Company"}
                  </p>
                </div>

                <button
                  className="icon-btn"
                  onClick={closeDetails}
                  aria-label="Close"
                >
                  <X />
                </button>

              </div>

              {detailsLoading ? (
                <div className="notification-empty">
                  <p>Loading details...</p>
                </div>
              ) : (
                <>

                  {/* STATUS */}
                  <div className="detail-status-card">

                    <div>
                      <span>Current Status</span>

                      <strong
                        className={`status ${statusClass(
                          selected.status
                        )}`}
                      >
                        {statusLabel(selected.status)}
                      </strong>
                    </div>

                    <div>
                      <span>Applied Date</span>
                      <b>{formatDate(selected.appliedAt)}</b>
                    </div>

                  </div>

                  {/* JOB INFORMATION */}
                  <section className="application-detail-section">

                    <h3>Job Information</h3>

                    <div className="detail-info-grid">

                      <div>
                        <span>Job Title</span>
                        <b>
                          {selected.job?.title || "Not available"}
                        </b>
                      </div>

                      <div>
                        <span>Company</span>
                        <b>
                          {selected.job?.company || "Not available"}
                        </b>
                      </div>

                      <div>
                        <span>Location</span>
                        <b>
                          {selected.job?.location || "Not available"}
                        </b>
                      </div>

                      <div>
                        <span>Work Mode</span>
                        <b>
                          {selected.job?.mode || "Not available"}
                        </b>
                      </div>

                      <div>
                        <span>Job Type</span>
                        <b>
                          {selected.job?.type || "Not available"}
                        </b>
                      </div>

                      <div>
                        <span>Salary</span>
                        <b>
                          {selected.job?.salary || "Not specified"}
                        </b>
                      </div>

                    </div>

                  </section>

                  {/* RESUME */}
                  <section className="application-detail-section">

                    <h3>Application Documents</h3>

                    <div className="document-card">
                      <FileText size={22} />

                      <div>
                        <b>Resume Used</b>
                        <p>
                          {selected.resumeUsed ||
                            "Profile resume"}
                        </p>
                      </div>

                      {selected.resumeUsed && (
                        <a
                          href={selected.resumeUsed}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary"
                        >
                          <Eye size={15} />
                          View
                        </a>
                      )}

                    </div>

                  </section>

                  {/* COVER LETTER */}
                  {selected.coverLetter && (
                    <section className="application-detail-section">

                      <h3>Cover Letter</h3>

                      <div className="notice">
                        {selected.coverLetter}
                      </div>

                    </section>
                  )}

                  {/* INTERVIEW */}
                  {(selected.status === "INTERVIEW" ||
                    selected.interviewDate ||
                    selected.interviewTime ||
                    selected.interviewMode) && (
                    <section className="application-detail-section interview-card">

                      <h3>
                        <Video size={20} />
                        Interview Information
                      </h3>

                      <div className="detail-info-grid">

                        <div>
                          <span>Date</span>
                          <b>
                            {formatDate(selected.interviewDate)}
                          </b>
                        </div>

                        <div>
                          <span>Time</span>
                          <b>
                            {selected.interviewTime ||
                              "Not specified"}
                          </b>
                        </div>

                        <div>
                          <span>Mode</span>
                          <b>
                            {selected.interviewMode ||
                              "Not specified"}
                          </b>
                        </div>

                      </div>

                      {selected.interviewInstructions && (
                        <div className="notice">
                          <b>Instructions</b>
                          <p>
                            {selected.interviewInstructions}
                          </p>
                        </div>
                      )}

                    </section>
                  )}

                  {/* TIMELINE */}
                  <section className="application-detail-section">

                    <h3>
                      <Clock3 size={20} />
                      Application Timeline
                    </h3>

                    <div className="application-timeline">

                      {(selected.history?.length
                        ? selected.history
                        : [
                            {
                              status: selected.status,
                              createdAt: selected.appliedAt,
                              note: "Application submitted",
                            },
                          ]
                      ).map((item, index) => {

                        const isLast =
                          index ===
                          (selected.history?.length || 1) - 1;

                        return (
                          <div
                            className="timeline-item"
                            key={`${item.status}-${item.createdAt}-${index}`}
                          >

                            <div className="timeline-marker">
                              {isLast
                                ? <CheckCircle2 size={18} />
                                : <CheckCircle2 size={16} />}
                            </div>

                            <div className="timeline-content">

                              <div className="timeline-top">
                                <strong>
                                  {statusLabel(item.status)}
                                </strong>

                                <time>
                                  {formatDate(item.createdAt)}
                                </time>
                              </div>

                              {item.note && (
                                <p>{item.note}</p>
                              )}

                            </div>

                          </div>
                        );
                      })}

                    </div>

                  </section>

                  {/* PROGRESS */}
                  <section className="application-detail-section">

                    <h3>Application Progress</h3>

                    <div className="progress-track">

                      {timelineStatuses.map((status, index) => {

                        const currentIndex =
                          timelineStatuses.indexOf(
                            selected.status
                          );

                        const completed =
                          currentIndex >= index &&
                          selected.status !== "REJECTED";

                        return (
                          <div
                            className={
                              `progress-step ${
                                completed ? "completed" : ""
                              }`
                            }
                            key={status}
                          >

                            <div className="progress-dot">
                              {completed
                                ? <CheckCircle2 size={15} />
                                : index + 1}
                            </div>

                            <span>
                              {statusLabel(status)}
                            </span>

                          </div>
                        );
                      })}

                    </div>

                    {selected.status === "REJECTED" && (
                      <div className="rejected-message">
                        This application was not selected for
                        the next stage.
                      </div>
                    )}

                  </section>

                </>
              )}

            </div>
          </div>
        )}

      </main>
    </Layout>
  );
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
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  function makeForm(data) {
    return {
      name: data?.name || "",
      degree: data?.degree || "",
      university: data?.university || "",
      graduationYear: data?.graduationYear || "",
      gpa: data?.gpa || "",
      resumeUrl: data?.resumeUrl || "",
      skills: (data?.skills || []).map(skill =>
        typeof skill === "string" ? skill : skill.name
      ),
      projects: (data?.projects || []).map(project => ({
        title: project.title || "",
        description: project.description || "",
      })),
    };
  }

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const data = await profileApi.get();

      setProfile(data);
      setForm(makeForm(data));
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess("");
    setError("");
  }

  function startEdit(section) {
    setEditingSection(section);
    setNewSkill("");
    setNewProject({ title: "", description: "" });
    setSuccess("");
    setError("");
  }

  function cancelEdit() {
    if (profile) {
      setForm(makeForm(profile));
    }

    setEditingSection(null);
    setNewSkill("");
    setNewProject({ title: "", description: "" });
    setError("");
    setSuccess("");
  }

  async function saveSection() {
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
      setForm(makeForm(updated));
      setEditingSection(null);
      setNewSkill("");
      setNewProject({ title: "", description: "" });
      setSuccess("Changes saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
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

  const isEditing = section => editingSection === section;

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

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <div className="profile-content">

          <Panel
            title="Personal Information"
            icon={<UserCircle/>}
            editing={isEditing("personal")}
            onEdit={() => startEdit("personal")}
          >
            {isEditing("personal") ? (
              <>
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
                    <label>Resume URL</label>
                    <input
                      type="url"
                      value={form.resumeUrl}
                      onChange={e => updateField("resumeUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button className="secondary" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primary" onClick={saveSection} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            ) : (
              <div className="detail-info-grid">
                <div>
                  <span>Full Name</span>
                  <b>{form.name || "Not added"}</b>
                </div>
                <div>
                  <span>Resume</span>
                  <b>{form.resumeUrl ? "Resume available" : "Not added"}</b>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Education"
            icon={<GraduationCap/>}
            editing={isEditing("education")}
            onEdit={() => startEdit("education")}
          >
            {isEditing("education") ? (
              <>
                <div className="profile-form-grid">
                  <div className="form-field">
                    <label>Degree</label>
                    <input
                      value={form.degree}
                      onChange={e => updateField("degree", e.target.value)}
                      placeholder="B.E in Computer Science"
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
                      placeholder="2027"
                    />
                  </div>

                  <div className="form-field">
                    <label>GPA</label>
                    <input
                      value={form.gpa}
                      onChange={e => updateField("gpa", e.target.value)}
                      placeholder="4.0/4.0"
                    />
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button className="secondary" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primary" onClick={saveSection} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            ) : (
              <div className="education">
                <div>
                  <b>{form.university || "University not added"}</b>
                  <span>{form.degree || "Degree not added"}</span>
                </div>

                <div>
                  <small>Class of {form.graduationYear || "â€”"}</small>
                  <b>GPA: {form.gpa || "â€”"}</b>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Technical Skills"
            icon={<Code2/>}
            editing={isEditing("skills")}
            onEdit={() => startEdit("skills")}
          >
            <div className="chips big">
              {form.skills.length === 0 ? (
                <p>No skills added yet.</p>
              ) : (
                form.skills.map(skill => (
                  <span key={skill}>
                    {skill}
                    {isEditing("skills") && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        title={`Remove ${skill}`}
                      >
                        Ã—
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {isEditing("skills") && (
              <>
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

                <div className="profile-edit-actions">
                  <button className="secondary" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primary" onClick={saveSection} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </Panel>

          <Panel
            title="Projects"
            icon={<BriefcaseBusiness/>}
            editing={isEditing("projects")}
            onEdit={() => startEdit("projects")}
          >
            <div className="projects">
              {form.projects.length === 0 ? (
                <p>No projects added yet.</p>
              ) : (
                form.projects.map((project, index) => (
                  <div className="project" key={`${project.title}-${index}`}>
                    <b>{project.title}</b>
                    <p>{project.description}</p>

                    {isEditing("projects") && (
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

            {isEditing("projects") && (
              <>
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

                <div className="profile-edit-actions">
                  <button className="secondary" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primary" onClick={saveSection} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </Panel>

          <div className="resume-card">
            <div className="panel-title-row">
              <h2><FileText/> Resume</h2>
              {!isEditing("resume") && (
                <button
                  type="button"
                  className="panel-edit-btn"
                  onClick={() => startEdit("resume")}
                  title="Edit resume"
                  aria-label="Edit resume"
                >
                  <Pencil size={18}/>
                </button>
              )}
            </div>

            {isEditing("resume") ? (
              <>
                <div className="profile-form-grid">
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

                <div className="profile-edit-actions">
                  <button className="secondary" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="primary" onClick={saveSection} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            ) : (
              <>
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
                ) : (
                  <button className="secondary wide" disabled>
                    No Resume
                  </button>
                )}
              </>
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

function Panel({title, icon, children, editing, onEdit}) {
  return (
    <section className="panel">
      <div className="panel-title-row">
        <h2>{icon}{title}</h2>

        {!editing && (
          <button
            type="button"
            className="panel-edit-btn"
            onClick={onEdit}
            title={`Edit ${title}`}
            aria-label={`Edit ${title}`}
          >
            <Pencil size={18}/>
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

function Project({title,text}){return <div className="project"><b>{title}</b><p>{text}</p><a><Link2 size={14}/> View Project</a></div>}

function SavedJobs({setPage,setSelectedJob}) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function loadSavedJobs() {
    try {
      setLoading(true);
      setError("");
      const data = await savedJobsApi.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load saved jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function removeSaved(jobId) {
    try {
      await savedJobsApi.remove(jobId);
      setRows(prev => prev.filter(item => savedJobId(item) !== Number(jobId)));
    } catch (err) {
      setError(err.message || "Unable to remove saved job.");
    }
  }

  function openJob(job) {
    setSelectedJob(job);
    setPage("job-detail");
  }

  return <Layout page="saved-jobs" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container jobs-page">
      <div className="page-heading">
        <div>
          <h1>Saved Jobs</h1>
          <p>Keep track of opportunities you want to revisit.</p>
        </div>
        <button className="primary" onClick={()=>setPage("jobs")}>
          Browse More Jobs <ArrowRight size={17}/>
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <p>Loading saved jobs...</p>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={42}/>
          <h2>No saved jobs yet</h2>
          <p>Save interesting opportunities from the Jobs page and they will appear here.</p>
          <button className="primary" onClick={()=>setPage("jobs")}>Find Jobs</button>
        </div>
      ) : (
        <section className="job-list">
          {rows.map(item => {
            const job = item.job;
            if (!job) return null;
            const skills = Array.isArray(job.skills)
              ? job.skills
              : String(job.skills || "").split(",").map(s=>s.trim()).filter(Boolean);

            return <article className="list-job" key={item.id}>
              <div className="job-icon"><BriefcaseBusiness/></div>

              <div className="list-main">
                <h3>{job.title}</h3>
                <p>{job.company} â€¢ {job.location}</p>
                <div className="chips">
                  {skills.map(skill => <span key={skill}>{skill}</span>)}
                </div>
              </div>

              <button
                className="list-bookmark saved"
                onClick={()=>removeSaved(job.id)}
                title="Remove from saved jobs"
                aria-label="Remove from saved jobs"
              >
                <Bookmark fill="currentColor"/>
              </button>

              <div className="list-bottom">
                <b>{job.salary || "Salary not specified"}</b>
                <div>
                  <button className="secondary" onClick={()=>openJob(job)}>View</button>
                  <button className="primary" onClick={()=>openJob(job)}>Apply Now</button>
                </div>
              </div>
            </article>;
          })}
        </section>
      )}
    </main>
  </Layout>
}

function Notifications({ setPage }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setError("");
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
    const unreadCount = rows.filter((notification) => !notification.read).length;

    if (unreadCount === 0) return;

    try {
      setError("");
      setMarkingRead(true);

      await notificationsApi.markAllAsRead();

      setRows((currentRows) =>
        currentRows.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      setError(err.message || "Unable to update notifications.");
    } finally {
      setMarkingRead(false);
    }
  }

  const unreadCount = rows.filter((notification) => !notification.read).length;

  return (
    <Layout
      page="notifications"
      setPage={setPage}
      onProfile={() => setPage("profile")}
    >
      <main className="container notifications">

        <div className="notif-heading">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your placement activities.</p>
          </div>

          <button
            className="secondary"
            onClick={markAllRead}
            disabled={markingRead || unreadCount === 0}
          >
            {markingRead
              ? "Marking..."
              : unreadCount > 0
                ? `Mark all as read (${unreadCount})`
                : "All notifications read"}
          </button>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="notification-empty">
            <Bell size={36} />
            <h3>Loading notifications...</h3>
            <p>Please wait while we fetch your latest updates.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="notification-empty">
            <Bell size={42} />
            <h2>No notifications yet</h2>
            <p>
              Your application and placement updates will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="notification-summary">
              <div>
                <strong>{rows.length}</strong>
                <span>Total</span>
              </div>

              <div>
                <strong>{unreadCount}</strong>
                <span>Unread</span>
              </div>

              <div>
                <strong>{rows.length - unreadCount}</strong>
                <span>Read</span>
              </div>
            </div>

            <h2>Recent</h2>

            <div className="notification-list">
              {rows.map((notification) => (
                <Notification
                  key={notification.id}
                  icon={<Bell />}
                  title={notification.title}
                  text={notification.message}
                  time={new Date(notification.createdAt).toLocaleString()}
                  unread={!notification.read}
                />
              ))}
            </div>
          </>
        )}

      </main>
    </Layout>
  );
}

function Notification({
  icon,
  title,
  text,
  time,
  unread,
}) {
  return (
    <div className={`notification ${unread ? "unread" : "read"}`}>

      <div className="notif-icon">
        {icon}
      </div>

      <div className="notif-content">
        <div className="notif-title-row">
          <h3>{title}</h3>

          {unread && (
            <span className="unread-badge">
              NEW
            </span>
          )}
        </div>

        <p>{text}</p>


        <time>{time}</time>
      </div>

      {unread && (
        <span className="unread-dot" title="Unread notification" />
      )}

    </div>
  );
}
function App() {
  const [page, setPage] = useState(
    localStorage.getItem("cc_token") ? "home" : "login"
  );

  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setPage("home");
  }

  function handleProfile() {
    setPage("profile");
  }

  function refreshApplications() {
    // Applications page reloads automatically when opened.
  }

  if (page === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (page === "home") {
    return (
      <Home
        setPage={setPage}
        user={user}
        setSelectedJob={setSelectedJob}
      />
    );
  }

  if (page === "jobs") {
    return (
      <Jobs
        setPage={setPage}
        setSelectedJob={setSelectedJob}
      />
    );
  }

  if (page === "job-detail") {
    return (
      <JobDetail
        setPage={setPage}
        job={selectedJob}
        refreshApplications={refreshApplications}
      />
    );
  }

  if (page === "applications") {
    return <Applications setPage={setPage} />;
  }

  if (page === "profile") {
    return <Profile setPage={setPage} />;
  }

  if (page === "saved-jobs") {
    return (
      <SavedJobs
        setPage={setPage}
        setSelectedJob={setSelectedJob}
      />
    );
  }

  if (page === "career-insights") return <CareerInsights setPage={setPage}/>;
  if (page === "notifications") {
    return <Notifications setPage={setPage} />;
  }

  return <Home setPage={setPage} user={user} setSelectedJob={setSelectedJob} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
