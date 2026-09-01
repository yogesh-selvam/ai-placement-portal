console.log("🔥 MAIN JSX LOADED");

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase.js";
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

function getVerificationActionSettings() {
  return {
    url: `${window.location.origin}/?emailVerified=1`,
    handleCodeInApp: false,
  };
}

function VerifyEmailResult({ onContinue }) {
  return (
    <div className="login-page">
      <section className="login-right">
        <div className="login-card">
          <h1>Email verified successfully! ✅</h1>
          <p>Your email address has been verified. You can now sign in to CareerConnect AI.</p>
          <button className="primary wide" onClick={onContinue}>
            Continue to Sign In <ArrowRight size={18}/>
          </button>
        </div>
      </section>
    </div>
  );
}

function normalizeSavedJobs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.savedJobs)) return data.savedJobs;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeJobSkills(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");

  return raw
    .map(skill => {
      if (typeof skill === "string" || typeof skill === "number") return String(skill).trim();
      return String(skill?.name ?? skill?.skill ?? skill?.title ?? "").trim();
    })
    .filter(Boolean);
}

function normalizeJobForDisplay(job) {
  if (!job || typeof job !== "object") return job;
  return { ...job, skills: normalizeJobSkills(job.skills) };
}

function savedJobId(item) {
  return Number(item?.jobId ?? item?.job?.id ?? item?.id);
}

function buildRecommendedJobs(jobs, profile) {
  const userSkills = (profile?.skills || [])
    .map(skill => String(skill?.name || skill || "").trim().toLowerCase())
    .filter(Boolean);

  return (Array.isArray(jobs) ? jobs : [])
    .map(job => {
      const jobSkills = normalizeJobSkills(job?.skills);

      const matchingSkills = jobSkills.filter(skill =>
        userSkills.includes(skill.toLowerCase())
      );

      const missingSkills = jobSkills.filter(skill =>
        !userSkills.includes(skill.toLowerCase())
      );

      const matchPercentage = jobSkills.length
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 0;

      return { ...job, skills: jobSkills, matchingSkills, missingSkills, matchPercentage };
    })
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
}

function Header({ page, setPage, onProfile, onLogout }) {
  return (
    <header className="header">
      <div className="brand" onClick={() => setPage("home")}>
        CareerConnect AI
      </div>

      <nav>
        {[
          ["home", "Home"],
          ["jobs", "Jobs"],
          ["applications", "Applications"],
          ["saved-jobs", "Saved Jobs"],
          ["notifications", "Notifications"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={page === key ? "nav active" : "nav"}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-right">
        <button
          type="button"
          className="profile-link"
          onClick={onProfile}
        >
          My Profile
        </button>

        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>

        <div className="avatar small">A</div>
      </div>
    </header>
  );
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

function Layout({page,setPage,children,onProfile,onLogout}) {
  const [assistant,setAssistant] = useState(false);

  const logout = onLogout || (async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem("cc_token");
    sessionStorage.clear();
    setPage("login");
    window.location.reload();
  });

  return (
    <div className="app">
      <Header
        page={page}
        setPage={setPage}
        onProfile={onProfile}
        onLogout={logout}
      />
      {children}
      <AIButton open={assistant} onClick={()=>setAssistant(!assistant)}/>
      {assistant && <Assistant close={()=>setAssistant(false)}/>}
      <Footer/>
    </div>
  );
}

function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [mode,setMode]=useState("login");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  function friendlyFirebaseError(err) {
    const code = err?.code || "";
    const messages = {
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/missing-password": "Please enter your password.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/email-already-in-use": "An account already exists with this email.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/user-not-found": "No account found. Please create an account first.",
      "auth/wrong-password": "Invalid email or password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your internet connection.",
      "auth/user-disabled": "This account has been disabled.",
    };
    return messages[code] || err?.message || "Authentication failed.";
  }

  async function authenticate() {
    setError("");
    const value=email.trim().toLowerCase();

    if(!value){
      setError("Please enter your email.");
      return;
    }

    if(!password){
      setError("Please enter your password.");
      return;
    }

    if(mode==="register" && password !== confirmPassword){
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const credential = mode === "register"
        ? await createUserWithEmailAndPassword(auth, value, password)
        : await signInWithEmailAndPassword(auth, value, password);

      if (mode === "register") {
        await sendEmailVerification(
          credential.user,
          getVerificationActionSettings()
        );

        setError("");
        alert("Verification email sent! Please check your email and verify your account.");

        // Do not keep an unverified Firebase session active.
        await signOut(auth);
        localStorage.removeItem("cc_token");
        setLoading(false);
        return;
      }

      // Refresh Firebase user state before allowing dashboard access.
      await credential.user.reload();

      if (!credential.user.emailVerified) {
        await signOut(auth).catch(() => {});
        localStorage.removeItem("cc_token");
        setError("Please verify your email before signing in. Check your inbox for the Firebase verification email.");
        setLoading(false);
        return;
      }

      const token = await credential.user.getIdToken(true);
      localStorage.setItem("cc_token", token);

      // Sync the Firebase-authenticated user with the existing PostgreSQL user.
      const data = await authApi.me();

      onLogin(data || {
        id: credential.user.uid,
        email: credential.user.email,
      });

    } catch(err) {
      localStorage.removeItem("cc_token");
      setError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  return <div className="login-page">
    <section className="login-left">
      <div className="login-brand">CareerConnect AI</div>
      <p>Your career. Your opportunities. Your future.</p>
      <div className="login-visual">
        <div className="visual-card">
          <Sparkles size={38}/>
          <strong>AI-powered career matching</strong>
          <span>Discover opportunities built around your skills.</span>
        </div>
      </div>
      <small>© 2024 CareerConnect AI. All rights reserved.</small>
    </section>

    <section className="login-right">
      <div className="login-card">
        <h1>{mode==="login" ? "Welcome back" : "Create your account"}</h1>
        <p>
          {mode==="login"
            ? "Sign in to continue to your placement journey."
            : "Create your CareerConnect AI account to get started."}
        </p>

        <label>Email</label>
        <div className="input-icon">
          <FileText size={20}/>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&authenticate()}
            placeholder="name@college.edu"
            autoComplete="email"
          />
        </div>

        <label>Password</label>
        <div className="input-icon">
          <ShieldCheck size={20}/>
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&authenticate()}
            placeholder="Enter your password"
            autoComplete={mode==="login" ? "current-password" : "new-password"}
          />
        </div>

        {mode==="register" && (
          <>
            <label>Confirm Password</label>
            <div className="input-icon">
              <ShieldCheck size={20}/>
              <input
                type="password"
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&authenticate()}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        {error&&<div className="auth-error">{error}</div>}

        <button className="primary wide" onClick={authenticate} disabled={loading}>
          {loading
            ? (mode==="login" ? "Signing in..." : "Creating account...")
            : (mode==="login" ? "Sign In" : "Create Account")}
          <ArrowRight size={18}/>
        </button>

        <button
          className="text-btn"
          onClick={()=>{
            setMode(mode==="login" ? "register" : "login");
            setError("");
            setPassword("");
            setConfirmPassword("");
          }}
          disabled={loading}
        >
          {mode==="login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>

        <hr/>
        <p className="legal">
          By continuing, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.
        </p>
      </div>
    </section>
  </div>;
}

function Home({setPage, user, setSelectedJob}) {
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const [jobsResult, recommendedResult, applicationsResult, profileResult, savedResult] =
        await Promise.allSettled([
          jobsApi.getAll(),
          jobsApi.getRecommended(),
          applicationsApi.getAll(),
          profileApi.get(),
          savedJobsApi.getAll(),
        ]);

      if (!active) return;

      const jobsData = jobsResult.status === "fulfilled" ? jobsResult.value : [];
      const profileData = profileResult.status === "fulfilled" ? profileResult.value : null;
      const applicationsData = applicationsResult.status === "fulfilled" ? applicationsResult.value : [];
      const savedJobsData = savedResult.status === "fulfilled" ? savedResult.value : [];
      const normalizedJobs = Array.isArray(jobsData) ? jobsData : [];
      const apiRecommended = recommendedResult.status === "fulfilled" ? recommendedResult.value : [];
      const normalizedRecommended = Array.isArray(apiRecommended) && apiRecommended.length
        ? apiRecommended.map(normalizeJobForDisplay)
        : buildRecommendedJobs(normalizedJobs, profileData);

      setJobs(normalizedJobs);
      setRecommendedJobs(normalizedRecommended);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setProfile(profileData);
      setSavedJobs(normalizeSavedJobs(savedJobsData));

      if (jobsResult.status === "rejected") {
        console.error("Jobs API error:", jobsResult.reason);
        setError(jobsResult.reason?.message || "Unable to load jobs.");
      }

      setLoading(false);
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
    ? Math.min(100, 20 +
        (profile.name ? 15 : 0) +
        (profile.degree ? 15 : 0) +
        (profile.university ? 10 : 0) +
        (profile.graduationYear ? 10 : 0) +
        (profile.gpa ? 10 : 0) +
        (profile.skills?.length ? 10 : 0) +
        (profile.projects?.length ? 10 : 0))
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
        <input placeholder="Search for jobs, skills, or locations..." onKeyDown={e => e.key === "Enter" && setPage("jobs")}/>
        <button className="primary" onClick={()=>setPage("jobs")}>Search</button>
      </div>

      <div className="stats">
        <Stat icon={<FileText/>} title="Applications" value={loading ? "—" : applications.length}/>
        <Stat icon={<UsersRound/>} title="Shortlisted" value={loading ? "—" : shortlisted}/>
        <Stat icon={<Video/>} title="Interviews" value={loading ? "—" : interviews} active/>
        <Stat icon={<Bookmark/>} title="Saved" value={loading ? "—" : new Set(savedJobs.map(savedJobId).filter(Number.isFinite)).size}/>
      </div>

      <div className="section-title">
        <h2>Recommended for you</h2>
        <span><Sparkles size={16}/> AI Matched</span>
      </div>

      {loading ? <p>Loading recommended jobs...</p> : recommendedJobs.length === 0 ? (
        <p>No matching jobs available yet. Add technical skills to your profile to improve recommendations.</p>
      ) : (
        <div className="job-grid">
          {recommendedJobs.slice(0, 2).map(j => (
            <JobCard
              key={j.id}
              job={j}
              compact
              initialSaved={savedJobs.some(item => savedJobId(item) === Number(j.id))}
              onView={() => { setSelectedJob?.(j); setPage("job-detail"); }}
              onSavedChange={(saved) => setSavedJobs(prev =>
                saved
                  ? [...prev, { jobId: j.id, job: j }]
                  : prev.filter(item => savedJobId(item) !== Number(j.id))
              )}
            />
          ))}
        </div>
      )}
    </main>
  </Layout>;
}
function Stat({icon,title,value,active}) { return <div className={"stat "+(active?"stat-active":"")}><div className="stat-label">{icon}{title}</div><strong>{value}</strong></div> }

function JobCard({job,compact=false,onView,initialSaved=false,onSavedChange}) {
  const [saved,setSaved]=useState(!!initialSaved);
  const [saving,setSaving]=useState(false);
  const Icon=job.icon || BriefcaseBusiness;
  const skills = normalizeJobSkills(job.skills);

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
    <p className="company">{job.company} • {job.location}</p>
    {typeof job.matchPercentage === "number" && (
      <div className="match-score">
        <Sparkles size={15}/>
        <b>{job.matchPercentage}% Match</b>
      </div>
    )}
    <div className="chips">{skills.map(s=><span key={s}>{s}</span>)}</div>
    {Array.isArray(job.matchingSkills) && job.matchingSkills.length > 0 && (
      <div className="ai-match-block">
        <strong>Matching Skills</strong>
        <div className="chips compact-chips">
          {job.matchingSkills.map(skill => <span key={skill}>✓ {skill}</span>)}
        </div>
      </div>
    )}
    {Array.isArray(job.missingSkills) && job.missingSkills.length > 0 && (
      <div className="ai-match-block missing">
        <strong>Skills to Improve</strong>
        <div className="chips compact-chips">
          {job.missingSkills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}
        </div>
      </div>
    )}
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
                <p>{j.company} • {j.location}</p>
                <div className="chips">
                  {normalizeJobSkills(j.skills).map(s=><span key={s}>{s}</span>)}
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
          <button className={"secondary "+(saved ? "saved-action" : "")} onClick={toggleSaved} disabled={saving}>
            <Bookmark size={17} fill={saved ? "currentColor" : "none"}/>
            {saving ? "Saving..." : saved ? "Saved" : "Save Job"}
          </button>
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
            {normalizeJobSkills(job.skills).map(s=><span key={s}>{s}</span>)}
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
      setRows(normalizeSavedJobs(data));
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
                  {normalizeJobSkills(a.job?.skills).map(s=><span key={s}>{s}</span>)}
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
    name: "", degree: "", university: "", graduationYear: "", gpa: "",
    resumeUrl: "", skills: [], projects: [],
  });
  const [editingSection, setEditingSection] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function makeForm(data) {
    return {
      name: data?.name || "",
      degree: data?.degree || "",
      university: data?.university || "",
      graduationYear: data?.graduationYear || "",
      gpa: data?.gpa || "",
      resumeUrl: data?.resumeUrl || "",
      skills: (data?.skills || []).map(skill => typeof skill === "string" ? skill : skill?.name).filter(Boolean),
      projects: (data?.projects || []).map(project => ({ title: project?.title || "", description: project?.description || "" })),
    };
  }

  async function loadProfile() {
    try {
      setLoading(true); setError("");
      const data = await profileApi.get();
      setProfile(data);
      setForm(makeForm(data));
    } catch (err) {
      setError(err.message || "Unable to load profile.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProfile(); }, []);

  function startEdit(section) {
    setEditingSection(section);
    setError(""); setSuccess("");
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(""); setSuccess("");
  }

  function cancelEdit() {
    setForm(makeForm(profile));
    setEditingSection(null);
    setNewSkill("");
    setNewProject({ title: "", description: "" });
    setEditingProject(null);
    setError(""); setSuccess("");
  }

  async function saveSection() {
    try {
      setSaving(true); setError(""); setSuccess("");
      const payload = {
        name: form.name.trim(),
        degree: form.degree.trim(),
        university: form.university.trim(),
        graduationYear: Number(form.graduationYear) || 2025,
        gpa: form.gpa.trim(),
        resumeUrl: form.resumeUrl.trim() || null,
        skills: form.skills.map(s => String(s).trim()).filter(Boolean),
        projects: form.projects
          .map(p => ({ title: String(p.title || "").trim(), description: String(p.description || "").trim() }))
          .filter(p => p.title && p.description),
      };

      const updated = await profileApi.update(payload);
      setProfile(updated);
      setForm(makeForm(updated));
      setEditingSection(null);
      setEditingProject(null);
      setNewSkill("");
      setNewProject({ title: "", description: "" });
      setSuccess("Changes saved successfully!");
    } catch (err) {
      console.error("Profile save error:", err);
      setError(err.message || "Unable to save changes.");
    } finally { setSaving(false); }
  }

  function addSkill() {
    const skill = newSkill.trim();
    if (!skill) return;
    if (form.skills.some(item => item.toLowerCase() === skill.toLowerCase())) {
      setError("Skill already added."); return;
    }
    setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill(""); setError(""); setSuccess("");
  }

  function removeSkill(skill) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(item => item !== skill) }));
    setSuccess("");
  }

  function addProject() {
    const title = newProject.title.trim();
    const description = newProject.description.trim();
    if (!title || !description) { setError("Enter both project title and description."); return; }
    setForm(prev => ({ ...prev, projects: [...prev.projects, { title, description }] }));
    setNewProject({ title: "", description: "" }); setError(""); setSuccess("");
  }

  function removeProject(index) {
    setForm(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
    if (editingProject === index) setEditingProject(null);
  }

  function editProject(index) {
    setEditingProject(index);
    setEditingSection("projects");
    setSuccess(""); setError("");
  }

  function updateProject(index, field, value) {
    setForm(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => i === index ? { ...project, [field]: value } : project),
    }));
    setSuccess(""); setError("");
  }

  const completion = Math.min(100, 20 +
    (form.name ? 15 : 0) + (form.degree ? 15 : 0) + (form.university ? 10 : 0) +
    (form.graduationYear ? 10 : 0) + (form.gpa ? 10 : 0) +
    (form.skills.length ? 10 : 0) + (form.projects.length ? 10 : 0));

  if (loading) return <Layout page="profile" setPage={setPage} onProfile={() => setPage("profile")}><main className="container profile"><p>Loading profile...</p></main></Layout>;

  if (!profile) return <Layout page="profile" setPage={setPage} onProfile={() => setPage("profile")}><main className="container profile"><div className="auth-error">{error || "Unable to load profile."}</div><button className="primary" onClick={loadProfile}>Try Again</button></main></Layout>;

  const editing = section => editingSection === section;

  return <Layout page="profile" setPage={setPage} onProfile={() => setPage("profile")}>
    <main className="container profile">
      <div className="profile-card">
        <div className="profile-cover"></div>
        <div className="avatar profile-avatar">{(form.name || "A").charAt(0).toUpperCase()}</div>
        <h1>{form.name || "Your Name"}</h1>
        <p>{form.degree || "Degree not added"}</p>
        <span><GraduationCap/> {form.university || "University not added"}</span>
        <div className="profile-progress"><b>Profile Completion <strong>{completion}%</strong></b><div className="progress"><i style={{width:`${completion}%`}}/></div></div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="profile-content">
        <Panel title="Personal Information" icon={<UserCircle/>} editing={editing("personal")} onEdit={() => startEdit("personal")}>
          {editing("personal") ? <div className="profile-form-grid">
            <div className="form-field"><label>Full Name</label><input value={form.name} onChange={e=>updateField("name",e.target.value)} /></div>
          </div> : <div className="education"><div><b>{form.name || "Name not added"}</b><span>Profile name</span></div></div>}
          {editing("personal") && <SectionActions saving={saving} onCancel={cancelEdit} onSave={saveSection}/>}
        </Panel>

        <Panel title="Education" icon={<GraduationCap/>} editing={editing("education")} onEdit={() => startEdit("education")}>
          {editing("education") ? <div className="profile-form-grid">
            <div className="form-field"><label>Degree</label><input value={form.degree} onChange={e=>updateField("degree",e.target.value)} placeholder="B.Tech in Computer Science" /></div>
            <div className="form-field"><label>University</label><input value={form.university} onChange={e=>updateField("university",e.target.value)} placeholder="University name" /></div>
            <div className="form-field"><label>Graduation Year</label><input type="number" value={form.graduationYear} onChange={e=>updateField("graduationYear",e.target.value)} /></div>
            <div className="form-field"><label>GPA</label><input value={form.gpa} onChange={e=>updateField("gpa",e.target.value)} placeholder="3.8/4.0" /></div>
          </div> : <div className="education"><div><b>{form.university || "University not added"}</b><span>{form.degree || "Degree not added"}</span></div><div><small>Class of {form.graduationYear || "—"}</small><b>GPA: {form.gpa || "—"}</b></div></div>}
          {editing("education") && <SectionActions saving={saving} onCancel={cancelEdit} onSave={saveSection}/>}
        </Panel>

        <Panel title="Technical Skills" icon={<Code2/>} editing={editing("skills")} onEdit={() => startEdit("skills")}>
          <div className="chips big">{form.skills.length === 0 ? <p>No skills added yet.</p> : form.skills.map(skill => <span key={skill}>{skill}{editing("skills") && <button type="button" onClick={()=>removeSkill(skill)} title={`Remove ${skill}`}>×</button>}</span>)}</div>
          {editing("skills") && <><div className="inline-add"><input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>e.key === "Enter" && addSkill()} placeholder="Add a skill e.g. Java"/><button className="secondary" onClick={addSkill}>+ Add Skill</button></div><SectionActions saving={saving} onCancel={cancelEdit} onSave={saveSection}/></>}
        </Panel>

        <Panel title="Projects" icon={<BriefcaseBusiness/>} editing={editing("projects")} onEdit={() => startEdit("projects")}>
          <div className="projects">{form.projects.length === 0 ? <p>No projects added yet.</p> : form.projects.map((project,index) => <div className="project" key={`${project.title}-${index}`}>
            {editing("projects") && editingProject === index ? <><input value={project.title} onChange={e=>updateProject(index,"title",e.target.value)} placeholder="Project title"/><textarea value={project.description} onChange={e=>updateProject(index,"description",e.target.value)} rows={3} placeholder="Project description"/></> : <><b>{project.title}</b><p>{project.description}</p></>}
            {editing("projects") && <div><button type="button" className="text-btn" onClick={()=>editProject(index)}>{editingProject === index ? "Editing" : "Edit"}</button><button type="button" className="text-btn" onClick={()=>removeProject(index)}>Remove</button></div>}
          </div>)}</div>
          {editing("projects") && <><div className="project-add"><input value={newProject.title} onChange={e=>setNewProject(prev=>({...prev,title:e.target.value}))} placeholder="Project title"/><textarea value={newProject.description} onChange={e=>setNewProject(prev=>({...prev,description:e.target.value}))} rows={3} placeholder="Project description"/><button className="secondary" onClick={addProject}>+ Add Project</button></div><SectionActions saving={saving} onCancel={cancelEdit} onSave={saveSection}/></>}
        </Panel>

        <Panel title="Resume" icon={<FileText/>} editing={editing("resume")} onEdit={() => startEdit("resume")}>
          {editing("resume") ? <div className="form-field"><label>Resume URL</label><input type="url" value={form.resumeUrl} onChange={e=>updateField("resumeUrl",e.target.value)} placeholder="https://..."/></div> : <div className="resume-file">{form.resumeUrl || "No resume uploaded"}</div>}
          {form.resumeUrl && !editing("resume") && <a className="primary wide" href={form.resumeUrl} target="_blank" rel="noreferrer"><Eye size={17}/> View Resume</a>}
          {editing("resume") && <SectionActions saving={saving} onCancel={cancelEdit} onSave={saveSection}/>}
        </Panel>

        <div className="ai-profile"><Sparkles/><h3>AI Profile Insight</h3><p>Keep your skills, projects, education, and resume updated to improve job matching accuracy.</p></div>
      </div>
    </main>
  </Layout>;
}

function SectionActions({saving,onCancel,onSave}) {
  return <div className="profile-edit-actions" style={{marginTop:16,display:"flex",gap:10}}><button className="secondary" onClick={onCancel} disabled={saving}>Cancel</button><button className="primary" onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>;
}

function Panel({title,icon,children,editing,onEdit}) {
  return <section className="panel">
    <div className="panel-title-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
      <h2 style={{display:"flex",alignItems:"center",gap:8}}>{icon}{title}</h2>
      {!editing && <button type="button" className="panel-edit-btn" onClick={onEdit} title={`Edit ${title}`} aria-label={`Edit ${title}`}><Pencil size={18}/></button>}
    </div>
    {children}
  </section>;
}

function Project({title,text}) { return <div className="project"><b>{title}</b><p>{text}</p><a><Link2 size={14}/> View Project</a></div>; }

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
            const skills = normalizeJobSkills(job.skills);

            return <article className="list-job" key={item.id}>
              <div className="job-icon"><BriefcaseBusiness/></div>

              <div className="list-main">
                <h3>{job.title}</h3>
                <p>{job.company} • {job.location}</p>
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
    const unreadCount = rows.filter(
      (notification) => !notification.read
    ).length;

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

  const unreadCount = rows.filter(
    (notification) => !notification.read
  ).length;

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
                  time={new Date(
                    notification.createdAt
                  ).toLocaleString()}
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
        <span
          className="unread-dot"
          title="Unread notification"
        />
      )}

    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Refresh Firebase state so emailVerified is always current.
        await firebaseUser.reload().catch(() => {});

        if (!firebaseUser.emailVerified) {
          await signOut(auth).catch(() => {});
          localStorage.removeItem("cc_token");
          setUser(null);
          setLoading(false);
          return;
        }
      }

      if (!firebaseUser) {
        localStorage.removeItem("cc_token");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem("cc_token", token);

        const profile = await authApi.me();
        setUser(profile || {
          id: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } catch (err) {
        console.error("Firebase session sync failed:", err);
        localStorage.removeItem("cc_token");
        await signOut(auth).catch(() => {});
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser || {});
    setPage("home");
  }

  async function handleLogout() {
    await signOut(auth).catch(() => {});
    localStorage.removeItem("cc_token");
    sessionStorage.clear();
    setUser(null);
    setPage("login");
  }

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>CareerConnect AI</h1>
          <p>Loading your placement portal...</p>
        </div>
      </div>
    );
  }

  const verificationCompleted = new URLSearchParams(window.location.search).get("emailVerified") === "1";

  if (verificationCompleted) {
    return (
      <VerifyEmailResult
        onContinue={() => {
          window.history.replaceState({}, "", window.location.pathname);
          setPage("login");
          setUser(null);
        }}
      />
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  switch (page) {
    case "jobs":
      return (
        <Jobs
          setPage={setPage}
          setSelectedJob={setSelectedJob}
        />
      );

    case "job-detail":
      return (
        <JobDetail
          setPage={setPage}
          job={selectedJob}
          refreshApplications={() => {}}
        />
      );

    case "applications":
      return <Applications setPage={setPage} />;

    case "saved-jobs":
      return (
        <SavedJobs
          setPage={setPage}
          setSelectedJob={setSelectedJob}
        />
      );

    case "notifications":
      return <Notifications setPage={setPage} />;

    case "profile":
      return <Profile setPage={setPage} />;

    case "home":
    default:
      return (
        <Home
          setPage={setPage}
          user={user}
          setSelectedJob={setSelectedJob}
        />
      );
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
