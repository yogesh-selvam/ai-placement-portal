import React, { useState } from "react";
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

const jobs = [
  { id: 1, title: "Frontend Developer", company: "WebFlow", location: "San Francisco, CA (Hybrid)", skills: ["React","TypeScript","CSS"], salary: "$120k - $150k", icon: Code2, mode: "Hybrid", type: "Full-time" },
  { id: 2, title: "Data Analyst", company: "InsightCorp", location: "Remote", skills: ["SQL","Python","Tableau"], salary: "$90k - $120k", icon: BarChart3, mode: "Remote", type: "Full-time" },
  { id: 3, title: "Software Developer", company: "TechNova", location: "San Francisco, CA (Remote)", skills: ["React","Node.js","TypeScript"], salary: "$120k - $150k", icon: BriefcaseBusiness, mode: "Remote", type: "Full-time" },
  { id: 4, title: "AI/ML Intern", company: "FutureScale", location: "Remote", skills: ["Python","PyTorch","Data Analysis"], salary: "$40/hr", icon: Sparkles, mode: "Remote", type: "Internship" }
];

const applications = [
  { title:"Senior Frontend Engineer", company:"TechNova Systems", location:"San Francisco, CA", status:"Interview", date:"Oct 12, 2023", skills:["React","TypeScript"], salary:"$140k - $170k" },
  { title:"Product Designer", company:"EcoSolutions", location:"Remote", status:"Shortlisted", date:"Oct 18, 2023", skills:["Figma","UX Research"] },
  { title:"Data Analyst", company:"FinCorp Global", location:"New York, NY", status:"Under Review", date:"Oct 20, 2023", skills:["SQL","Python"] }
];

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
  return <aside className="assistant">
    <div className="assistant-head"><div className="bot"><Sparkles size={18}/></div><div><strong>CareerConnect AI Assistant</strong><small>Your personal career mentor</small></div><button onClick={close}><X/></button></div>
    <div className="assistant-body">
      <div className="assistant-msg"><div className="bot tiny"><Sparkles size={14}/></div><div className="bubble">Hi Alex! How can I help you today? I can analyze your resume, find matching jobs, or help with interview prep.</div></div>
      <div className="suggestions">
        <button>Find jobs matching my skills</button>
        <button>Improve my resume</button>
        <button>Interview prep for TechNova</button>
      </div>
    </div>
    <div className="assistant-input"><Paperclip size={20}/><input placeholder="Type a message..."/><button><Send size={18}/></button></div>
    <small className="disclaimer">AI can make mistakes. Consider verifying important information.</small>
  </aside>
}

function Layout({page,setPage,children,onProfile}) {
  const [assistant,setAssistant] = useState(false);
  return <div className="app"><Header page={page} setPage={setPage} onProfile={onProfile}/>{children}<AIButton open={assistant} onClick={()=>setAssistant(!assistant)}/>{assistant && <Assistant close={()=>setAssistant(false)}/>}<Footer/></div>
}

function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  return <div className="login-page">
    <section className="login-left">
      <div className="login-brand">CareerConnect AI</div>
      <p>Your career. Your opportunities. Your future.</p>
      <div className="login-visual"><div className="visual-card"><Sparkles size={38}/><strong>AI-powered career matching</strong><span>Discover opportunities built around your skills.</span></div></div>
      <small>© 2024 CareerConnect AI. All rights reserved.</small>
    </section>
    <section className="login-right">
      <div className="login-card">
        <h1>Welcome back</h1><p>Sign in to continue to your placement journey.</p>
        {!sent ? <>
          <label>College Email</label>
          <div className="input-icon"><FileText size={20}/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@college.edu"/></div>
          <button className="primary wide" onClick={()=>setSent(true)}>Send OTP <ArrowRight size={18}/></button>
        </> : <>
          <label>Enter OTP</label><div className="input-icon"><ShieldCheck size={20}/><input placeholder="6-digit OTP"/></div>
          <button className="primary wide" onClick={onLogin}>Verify & Continue <ArrowRight size={18}/></button>
          <button className="text-btn" onClick={()=>setSent(false)}>Change email</button>
        </>}
        <hr/><p className="legal">By continuing, you agree to our <b>Terms of Service</b> and <b>Privacy Policy</b>.</p>
      </div>
    </section>
  </div>
}

function Home({setPage}) {
  return <Layout page="home" setPage={setPage} onProfile={()=>setPage("profile")}>
    <main className="container home">
      <div className="hero-row"><div><h1>Good morning, Alex 👋</h1><p>Let's find your next great opportunity.</p></div><div className="completion"><span>Profile Completion <b>80%</b></span><div className="progress"><i style={{width:"80%"}}/></div><button className="primary" onClick={()=>setPage("profile")}>Complete Profile</button></div></div>
      <div className="search-box"><Search/><input placeholder="Search for jobs, skills, or locations..."/><button className="primary">Search</button></div>
      <div className="stats">
        <Stat icon={<FileText/>} title="Applications" value="12"/><Stat icon={<UsersRound/>} title="Shortlisted" value="4"/><Stat icon={<Video/>} title="Interviews" value="2" active/><Stat icon={<Bookmark/>} title="Saved" value="8"/>
      </div>
      <div className="section-title"><h2>Recommended for you</h2><span><Sparkles size={16}/> AI Matched</span></div>
      <div className="job-grid">{jobs.slice(2,4).map(j=><JobCard key={j.id} job={j} compact onView={()=>setPage("job-detail")}/>)}</div>
    </main>
  </Layout>
}
function Stat({icon,title,value,active}) { return <div className={"stat "+(active?"stat-active":"")}><div className="stat-label">{icon}{title}</div><strong>{value}</strong></div> }

function JobCard({job,compact=false,onView}) {
  const [saved,setSaved]=useState(false);
  const Icon=job.icon;
  return <article className={"job-card "+(compact?"compact":"")}>
    <div className="job-top"><div className="job-icon"><Icon size={26}/></div><button className={"bookmark "+(saved?"saved":"")} onClick={()=>setSaved(!saved)}><Bookmark fill={saved?"currentColor":"none"}/></button></div>
    <h3>{job.title}</h3><p className="company">{job.company} • {job.location}</p>
    <div className="chips">{job.skills.map(s=><span key={s}>{s}</span>)}</div>
    <div className="job-bottom"><b>{job.salary}</b><button className="secondary" onClick={onView}>View Details</button></div>
  </article>
}

function Jobs({setPage}) {
  const [remote,setRemote]=useState(true), [hybrid,setHybrid]=useState(true), [intern,setIntern]=useState(true);
  const visible=jobs.filter(j => (remote && j.mode==="Remote") || (hybrid && j.mode==="Hybrid") || (intern && j.type==="Internship"));
  return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}><main className="container jobs-page">
    <div className="page-heading"><h1>Find your next opportunity</h1><select><option>Most Relevant</option><option>Newest</option></select></div>
    <div className="jobs-layout">
      <aside className="filters"><div className="filter-head"><h3>Filters</h3><button className="text-btn">Clear all</button></div><h4>Job Type</h4><Check label="Full-time" checked/><Check label="Part-time"/><Check label="Internship" checked={intern} setChecked={setIntern}/><hr/><h4>Work Mode</h4><Check label="Remote" checked={remote} setChecked={setRemote}/><Check label="Hybrid" checked={hybrid} setChecked={setHybrid}/><Check label="On-site"/><hr/><button className="secondary wide">Apply Filters</button></aside>
      <section className="job-list">{visible.map(j=><div className="list-job" key={j.id}><div className="job-icon"><j.icon/></div><div className="list-main"><h3>{j.title}</h3><p>{j.company} • {j.location}</p><div className="chips">{j.skills.map(s=><span key={s}>{s}</span>)}</div></div><Bookmark className="list-bookmark"/><div className="list-bottom"><b>{j.salary}</b><div><button className="secondary">Save</button><button className="primary" onClick={()=>setPage("job-detail")}>Apply Now</button></div></div></div>)}</section>
    </div>
  </main></Layout>
}
function Check({label,checked,setChecked}) { return <label className="check"><input type="checkbox" checked={!!checked} onChange={e=>setChecked?.(e.target.checked)}/><span>{label}</span></label> }

function JobDetail({setPage}) {
  return <Layout page="jobs" setPage={setPage} onProfile={()=>setPage("profile")}><main className="container detail">
    <div className="breadcrumb">Jobs <span>›</span> Software Developer</div>
    <div className="detail-head"><div className="job-icon"><BriefcaseBusiness/></div><div><h1>Software Developer</h1><h3>TechNova</h3><p><MapPin/> San Francisco, CA (Remote) &nbsp; <Clock3/> Full-time &nbsp; <CalendarDays/> Posted 2 days ago</p></div><div className="detail-actions"><button className="secondary">🔖 Save Job</button><button className="primary" onClick={()=>setPage("applications")}>Apply Now</button></div></div>
    <div className="detail-grid"><article className="detail-main"><h2>About the Role</h2><p>TechNova is seeking a passionate and driven Software Developer to join our core product team. You will be instrumental in building the next generation of our AI-driven analytics platform, working closely with cross-functional teams to design, develop, and deploy scalable solutions.</p><p>In this role, you will have the opportunity to tackle complex technical challenges, leverage cutting-edge technologies, and directly impact the performance and reliability of systems used by thousands of enterprise clients globally.</p><hr/><h2>Key Responsibilities</h2>{["Design, implement, and maintain high-performance, reusable, and reliable code for our web applications.","Collaborate with product managers, designers, and other engineers to define system architecture and feature specifications.","Identify and resolve performance and scalability issues in existing infrastructure.","Participate in code reviews to ensure code quality and adherence to best practices."].map(x=><p className="bullet" key={x}><CheckCircle2/> {x}</p>)}<hr/><h2>Required Skills & Technologies</h2><div className="chips">{["React","Node.js","TypeScript","GraphQL","AWS Services"].map(s=><span key={s}>{s}</span>)}</div><hr/><h2>Eligibility</h2><div className="notice">Bachelor's degree in Computer Science, Engineering, or a related field (or equivalent practical experience). Minimum of 3 years of professional software development experience. Must be eligible to work remotely within the United States.</div></article>
    <aside><div className="side-card"><div>Application Status <b>Not Applied</b></div><div>Application Deadline <em>⚠ Oct 30, 2024</em></div><div className="ai-insight"><Sparkles/> Based on your profile, you have an <strong>85% skill match</strong> for this role. Consider highlighting your React experience.</div></div><div className="side-card"><h2>About TechNova</h2><div className="office-image">TechNova</div><p>TechNova is a leading provider of AI-driven analytics software for enterprise resource planning. Founded in 2018, our mission is to simplify complex data workflows and empower organizations to make smarter, data-backed decisions.</p><div className="company-meta"><span>Industry <b>Software / AI</b></span><span>Company Size <b>200-500 Employees</b></span><span>Website <b>technova.ai</b></span></div></div></aside></div>
    <section className="perks"><h2>Perks & Benefits</h2><div className="perk-grid">{[[HeartPulse,"Health & Wellness","Comprehensive medical, dental, and vision coverage for you and your dependents."],[Laptop2,"Remote-First Culture","Work from anywhere with a generous home office stipend."],[TrendingUp,"Professional Growth","Annual learning budget and dedicated time for upskilling."],[Plane,"Unlimited PTO","Take the time you need to recharge, with a minimum required time off."]].map(([I,t,d])=><div key={t}><I/><b>{t}</b><p>{d}</p></div>)}</div></section>
  </main></Layout>
}

function Applications({setPage}) {
  const [tab,setTab]=useState("All Applications");
  return <Layout page="applications" setPage={setPage} onProfile={()=>setPage("profile")}><main className="container apps"><div className="apps-heading"><div><h1>My Applications</h1><p>Track and manage your job applications across various companies.</p></div><button className="primary" onClick={()=>setPage("jobs")}>◉ Browse More Jobs</button></div><div className="tabs">{["All Applications","Applied","Under Review","Shortlisted","Interview","Selected","Rejected"].map(t=><button className={tab===t?"tab active":"tab"} onClick={()=>setTab(t)}>{t}{t==="All Applications"&&<small>12</small>}</button>)}</div><div className="application-grid">{applications.filter(a=>tab==="All Applications" || a.status===tab).map(a=><article className="application-card"><div className="company-logo"><Building2/></div><div><h2>{a.title}</h2><p>{a.company} • {a.location}</p><div className="chips">{a.skills.map(s=><span>{s}</span>)}{a.salary&&<span>{a.salary}</span>}</div></div><div className={"status "+a.status.replaceAll(" ","-").toLowerCase()}>{a.status==="Interview"&&"▣ "}{a.status==="Shortlisted"&&"☆ "}{a.status==="Under Review"&&"◉ "}{a.status}</div><time>Applied: {a.date}</time></article>)}</div></main></Layout>
}

function Profile({setPage}) {
  return <Layout page="home" setPage={setPage} onProfile={()=>setPage("profile")}><main className="container profile"><div className="profile-card"><div className="profile-cover"></div><div className="avatar profile-avatar">A</div><h1>Alex Johnson</h1><p>B.Tech in Computer Science</p><span><GraduationCap/> Stanford University</span><div className="profile-progress"><b>Profile Completion <strong>85%</strong></b><div className="progress"><i style={{width:"85%"}}/></div></div></div><div className="profile-content"><Panel title="Education" icon={<GraduationCap/>}><div className="education"><div><b>Stanford University</b><span>B.Tech in Computer Science</span></div><div><small>Class of 2025</small><b>GPA: 3.8/4.0</b></div></div></Panel><Panel title="Technical Skills" icon={<Code2/>}><div className="chips big">{["Java","Python","React","SQL","Git"].map(s=><span>{s}</span>)}</div></Panel><Panel title="Projects" icon={<BriefcaseBusiness/>}><div className="projects"><Project title="AI Resume Parser" text="Developed a Python-based NLP tool to extract key information from unstructured resume PDFs, improving sorting efficiency by 40%."/><Project title="Campus Connect Platform" text="Built a full-stack React and Node.js application for students to organize study groups, serving over 500 active users."/></div></Panel><div className="resume-card"><h2><FileText/> Resume</h2><div className="resume-file">📄 Alex_Resume_2024.pdf <small>2.4 MB</small></div><button className="primary wide">◉ View</button><div className="two-btn"><button className="secondary">⇩ Download</button><button className="secondary">⇧ Update</button></div></div><div className="ai-profile"><Sparkles/><h3>AI Profile Insight</h3><p>Based on your current resume and skills, you are a strong match for Junior React Developer roles. Consider adding a brief summary emphasizing your front-end and architecture experience to boost your match rate.</p></div></div></main></Layout>
}
function Panel({title,icon,children}){return <section className="panel"><h2>{icon}{title}<Pencil size={18}/></h2>{children}</section>}
function Project({title,text}){return <div className="project"><b>{title}</b><p>{text}</p><a><Link2 size={14}/> View Project</a></div>}

function Notifications({setPage}) {
  return <Layout page="notifications" setPage={setPage} onProfile={()=>setPage("profile")}><main className="container notifications"><div className="notif-heading"><div><h1>Notifications</h1><p>Stay updated with your placement activities.</p></div><button className="secondary">Mark all as read</button></div><h2>New</h2><Notification icon={<Star/>} title="Shortlisted!" text="You have been shortlisted for Software Developer at TechNova." time="2m ago" success/><Notification icon={<CalendarDays/>} title="Interview Scheduled" text="Technical interview scheduled for Sept 4 at 10:00 AM." time="1h ago"/><h2>Earlier</h2><Notification icon={<Sparkles/>} title="New Recommendation" text="AI suggests applying for Frontend Developer at WebFlow." time="Yesterday" old button/></main></Layout>
}
function Notification({icon,title,text,time,success,old,button}){return <div className={"notification "+(success?"success":"")}><div className="notif-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p>{button&&<button className="secondary">View Job</button>}</div><time>{time}{!old&&<i/>}</time></div>}

function App(){
  const [page,setPage]=useState("login");
  if(page==="login") return <Login onLogin={()=>setPage("home")}/>;
  const pages={home:<Home setPage={setPage}/>,jobs:<Jobs setPage={setPage}/>, "job-detail":<JobDetail setPage={setPage}/>,applications:<Applications setPage={setPage}/>,profile:<Profile setPage={setPage}/>,notifications:<Notifications setPage={setPage}/>};
  return pages[page] || pages.home;
}
createRoot(document.getElementById("root")).render(<App/>);