import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRight, CheckSquare, Square, DollarSign, TrendingUp, Target, Zap } from "lucide-react";

const C = {
  bg: "#080809", card: "#18191D", border: "#252729",
  yellow: "#F5C518", orange: "#E8740C", green: "#22C55E",
  blue: "#3B82F6", purple: "#8B5CF6", red: "#EF4444",
  text: "#E8E4DC", muted: "#6B6965",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080809; }
  ::-webkit-scrollbar { width: 4px; background: #080809; }
  ::-webkit-scrollbar-thumb { background: #252729; border-radius: 2px; }
  input:focus { outline: none; border-color: #F5C518 !important; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.15); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.35); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }
  .fade-up { animation: fadeUp .4s ease forwards; }
  .adu-glow { animation: glow 3s ease-in-out infinite; }
  .pulse { animation: pulse 2s ease-in-out infinite; }
`;

const NAV_SECTIONS = [
  { id: "partnership", label: "Partnership"   },
  { id: "deal",        label: "Deal Structure"},
  { id: "campaigns",   label: "Campaigns"     },
  { id: "funnel",      label: "Quiz Funnel"   },
  { id: "pipeline",    label: "Pipeline"      },
  { id: "math",        label: "The Math"      },
  { id: "sla",         label: "SLA"           },
  { id: "launch",      label: "Launch"        },
];

const QUIZ_STEPS = [
  {
    q: "What are you looking to upgrade?",
    opts: ["🗄️ Cabinet Refacing / Resurfacing","🍳 Full Kitchen Remodel","🚿 Bathroom Remodel","🏠 Dream Home / ADU Build"],
  },
  {
    q: "Current state of the space?",
    opts: ["📦 Solid bones, outdated look","🔨 Needs repairs + refresh","💥 Full gut — scratch build","🤷 Not sure — need assessment"],
  },
  {
    q: "Timeline to get started?",
    opts: ["🔥 ASAP","📅 Within 30 Days","🗓️ 1–3 Months","🤔 Just Exploring"],
  },
  {
    q: "Budget range?",
    opts: ["$5K – $15K","$15K – $50K","$50K – $150K","$150K+"],
  },
  { q: "Last step — where do we send your free estimate?", opts: null },
];

const KANBAN = [
  {
    id: "new", label: "New Lead", color: C.yellow,
    leads: [
      { name: "Tiffany M.",  project: "Cabinet Refacing", source: "Yelp",    budget: "$5K–$15K",  date: "Mar 3"  },
      { name: "James R.",    project: "Kitchen Remodel",  source: "Meta Ad", budget: "$15K–$50K", date: "Mar 22" },
    ],
  },
  {
    id: "contacted", label: "Contacted", color: C.orange,
    leads: [
      { name: "Sarah K.",  project: "Cabinet Refacing", source: "Meta Ad", budget: "$5K–$15K", date: "Mar 18" },
      { name: "Marcus D.", project: "ADU Build",         source: "Meta Ad", budget: "$150K+",   date: "Mar 20" },
    ],
  },
  {
    id: "estimate", label: "Estimate Sent", color: C.blue,
    leads: [{ name: "Linda H.", project: "Cabinet Refacing", source: "Meta Ad", budget: "$5K–$15K", date: "Mar 15" }],
  },
  { id: "followup", label: "Follow Up", color: C.purple, leads: [] },
  {
    id: "booked", label: "Booked ✓", color: C.green,
    leads: [{ name: "Tom R.", project: "Cabinet Refacing", source: "Meta Ad", budget: "$5K–$15K", date: "Mar 10" }],
  },
];

const ROI_SCENARIOS = [
  { label: "Conservative", cpl: 40, leads: 38, refacingJobs: 4, remodeJobs: 0, aduJobs: 0, color: C.orange },
  { label: "Realistic",    cpl: 33, leads: 45, refacingJobs: 6, remodeJobs: 1, aduJobs: 0, color: C.yellow },
  { label: "Strong Month", cpl: 27, leads: 56, refacingJobs: 9, remodeJobs: 2, aduJobs: 0, color: C.green  },
  { label: "ADU Lands 🏠", cpl: 33, leads: 45, refacingJobs: 5, remodeJobs: 1, aduJobs: 1, color: C.purple },
];

const SNRG_TASKS = [
  "Meta Business Manager + Pixel setup on G3HomeRemodel.com",
  "Build quiz funnel landing page (refacing-first, ADU tier included)",
  "Design 3 static image ad creatives — refacing focus",
  "Design 1 ADU/Dream Home creative — premium tier",
  "Configure Airtable pipeline + lead automations",
  "SMS + email alert to Todd on every new lead",
  "Launch all campaigns — 70/20/10 budget split",
  "Weekly reporting: CPL, leads, pipeline, closed jobs, revenue share",
];

const TODD_TASKS = [
  "5–8 before/after cabinet refacing photos",
  "Short iPhone walkthrough of a finished refacing job",
  "Any ADU or large project photos (credibility for that tier)",
  "Google Business Profile confirmed and updated",
  "Service area confirmed — full Maricopa County",
  "Deal structure agreed and signed",
];

/* ─── SMALL COMPONENTS ─── */
const Tag = ({ children, color = C.yellow }) => (
  <span style={{
    background: `${color}14`, border: `1px solid ${color}30`,
    color, fontSize: 10, fontWeight: 700, padding: "3px 8px",
    borderRadius: 4, letterSpacing: .5, whiteSpace: "nowrap",
  }}>{children}</span>
);

const SL = ({ children }) => (
  <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 10 }}>
    {children}
  </div>
);

const ST = ({ children, color = C.text }) => (
  <h2 style={{
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(34px, 5.5vw, 50px)",
    color, letterSpacing: 1.5, lineHeight: 1, marginBottom: 12,
  }}>{children}</h2>
);

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, ...style }}>
    {children}
  </div>
);

/* ─── QUIZ ─── */
function QuizFunnel() {
  const [step, setStep]   = useState(0);
  const [answers, setAns] = useState([]);
  const [form, setForm]   = useState({ name: "", phone: "", email: "" });
  const [done, setDone]   = useState(false);

  const pick  = (opt) => { const n=[...answers,opt]; setAns(n); if(step<QUIZ_STEPS.length-1) setStep(step+1); };
  const submit= () => { if(form.name&&form.phone) setDone(true); };
  const reset = () => { setStep(0);setAns([]);setForm({name:"",phone:"",email:""});setDone(false); };

  return (
    <Card style={{ maxWidth:540, padding:"36px 32px" }}>
      <div style={{ height:3, background:C.border, borderRadius:2, marginBottom:28, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:2,
          width:`${done?100:(step/QUIZ_STEPS.length)*100}%`,
          background: done ? C.green : C.yellow,
          transition:"width .4s ease, background .3s",
        }}/>
      </div>
      {done ? (
        <div style={{textAlign:"center"}} className="fade-up">
          <div style={{fontSize:44,marginBottom:12}}>✅</div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:28,color:C.green,letterSpacing:1,marginBottom:8}}>
            LEAD CAPTURED — TODD GETS A TEXT
          </div>
          <p style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:16}}>
            <strong style={{color:C.text}}>{form.name}</strong> landed in the Airtable pipeline. SMS fires to Todd in seconds.
          </p>
          <div style={{background:`${C.green}0C`,border:`1px solid ${C.green}22`,borderRadius:8,padding:"14px 16px",fontSize:12,color:"#86EFAC",lineHeight:2,marginBottom:20,textAlign:"left"}}>
            {answers.map((a,i)=><div key={i}><span style={{color:C.muted}}>Q{i+1}:</span> {a}</div>)}
            <div><span style={{color:C.muted}}>Name:</span> {form.name}</div>
            <div><span style={{color:C.muted}}>Phone:</span> {form.phone}</div>
          </div>
          <button onClick={reset} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"'Syne', sans-serif"}}>
            Restart Demo
          </button>
        </div>
      ) : (
        <div className="fade-up" key={step}>
          <div style={{fontSize:11,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:8}}>
            Step {step+1} of {QUIZ_STEPS.length} · Free Estimate
          </div>
          <div style={{fontSize:18,fontWeight:700,color:C.text,lineHeight:1.45,marginBottom:24}}>
            {QUIZ_STEPS[step].q}
          </div>
          {step<4 ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {QUIZ_STEPS[step].opts.map((opt,i)=>(
                <button key={i} onClick={()=>pick(opt)} style={{
                  background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,
                  borderRadius:8,padding:"14px 12px",color:C.text,fontSize:13,fontWeight:600,
                  fontFamily:"'Syne', sans-serif",cursor:"pointer",textAlign:"left",transition:"all .15s",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow;e.currentTarget.style.background=`${C.yellow}0E`;e.currentTarget.style.color=C.yellow;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.color=C.text;}}
                >{opt}</button>
              ))}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[{key:"name",placeholder:"Full Name *"},{key:"phone",placeholder:"Phone Number *"},{key:"email",placeholder:"Email (optional)"}].map(f=>(
                <input key={f.key} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:7,padding:"12px 14px",color:C.text,fontSize:14,fontFamily:"'Syne', sans-serif",transition:"border-color .2s"}}
                />
              ))}
              <button onClick={submit} style={{background:C.yellow,color:C.bg,border:"none",borderRadius:7,padding:14,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Syne', sans-serif",marginTop:4,letterSpacing:.5}}>
                GET MY FREE ESTIMATE →
              </button>
              <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>
                Serving all of Maricopa County · Licensed Contractor · G3HomeRemodel.com
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ─── CHECKLIST ─── */
function Checklist({ items, color }) {
  const [checked, setChecked] = useState([]);
  const toggle = (i) => setChecked(c=>c.includes(i)?c.filter(x=>x!==i):[...c,i]);
  const pct = Math.round((checked.length/items.length)*100);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:11,color:C.muted}}>{checked.length}/{items.length} done</div>
        <div style={{fontSize:11,color,fontWeight:700}}>{pct}%</div>
      </div>
      <div style={{height:2,background:C.border,borderRadius:1,marginBottom:16,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:1,transition:"width .3s"}}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {items.map((item,i)=>(
          <div key={i} onClick={()=>toggle(i)} style={{display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",opacity:checked.includes(i)?.4:1,transition:"opacity .2s"}}>
            <div style={{marginTop:1,color,flexShrink:0}}>
              {checked.includes(i) ? <CheckSquare size={15}/> : <Square size={15} style={{opacity:.5}}/>}
            </div>
            <span style={{fontSize:13,color:"#C5C2BC",lineHeight:1.55,textDecoration:checked.includes(i)?"line-through":"none"}}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DEAL STRUCTURE COMPONENT ─── */
function DealStructure() {
  const [active, setActive] = useState(1);

  const models = [
    {
      num: "01", label: "% of Revenue", badge: "CLEANEST", color: C.yellow,
      desc: "Everyone wins when deals close. No arguments about risk. Scales clean.",
      rows: [
        { who: "Mike (ad spend partner)", pct: "10–20%", example: "$1,000–$2,000", color: C.blue },
        { who: "SNRG (system operator)",  pct: "10–20%", example: "$1,000–$2,000", color: C.yellow },
        { who: "Todd (fulfillment)",       pct: "60–80%", example: "$6,000–$8,000", color: C.green },
      ],
      basis: "$10K refacing job",
    },
    {
      num: "02", label: "Cost Recovery + %", badge: "RECOMMENDED", color: C.orange,
      desc: "Mike gets ad spend paid back first, then everyone splits. Protects Mike, doesn't rob Todd upfront.",
      rows: [
        { who: "Mike — ad spend back first", pct: "Cost recovery", example: "$1,500/mo first",  color: C.blue },
        { who: "Mike — profit split",         pct: "15%",           example: "~$1,275 after",    color: C.blue },
        { who: "SNRG — profit split",         pct: "15%",           example: "~$1,275",          color: C.yellow },
        { who: "Todd — keeps the rest",       pct: "70%",           example: "~$5,950",          color: C.green },
      ],
      basis: "$10K refacing job after $1,500 ad spend covered",
    },
    {
      num: "03", label: "Per Lead / Per Job", badge: "AVOID", color: C.red,
      desc: "Caps your upside. Kills long-term leverage. Only if you're desperate.",
      rows: [
        { who: "Per lead",      pct: "$100", example: "Fixed",   color: C.red },
        { who: "Per booked job",pct: "$500", example: "Fixed",   color: C.red },
      ],
      basis: "Flat fee model — no skin in the game",
    },
  ];

  const m = models[active];

  return (
    <div>
      {/* Model selector */}
      <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
        {models.map((mod,i)=>{
          const a = i===active;
          return (
            <button key={i} onClick={()=>setActive(i)} style={{
              background: a ? `${mod.color}14` : "rgba(255,255,255,0.03)",
              border:`1px solid ${a?`${mod.color}40`:C.border}`,
              color: a ? mod.color : C.muted,
              padding:"10px 18px",borderRadius:6,cursor:"pointer",
              fontSize:13,fontWeight:700,fontFamily:"'Syne', sans-serif",
              transition:"all .2s",
            }}>
              <span style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:16,letterSpacing:1}}>MODEL {mod.num}</span>
              {" · "}{mod.label}
              {a && <span style={{
                background:`${mod.color}20`,marginLeft:8,padding:"2px 8px",
                borderRadius:3,fontSize:9,fontWeight:800,letterSpacing:1,
              }}>{mod.badge}</span>}
            </button>
          );
        })}
      </div>

      <Card style={{padding:"28px",borderColor: active===1?`${C.orange}30`:active===0?`${C.yellow}25`:C.border}} className="fade-up">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{
            fontFamily:"'Bebas Neue', sans-serif",fontSize:48,
            color: m.color, lineHeight:1,
          }}>
            {m.num}
          </div>
          <div>
            <div style={{
              display:"inline-block",
              background:`${m.color}14`,border:`1px solid ${m.color}30`,
              color:m.color,fontSize:9,fontWeight:800,letterSpacing:2,
              padding:"3px 10px",borderRadius:3,marginBottom:6,
            }}>{m.badge}</div>
            <div style={{fontSize:20,fontWeight:700,color:C.text}}>{m.label}</div>
          </div>
        </div>

        <p style={{fontSize:14,color:"#B0ADA8",lineHeight:1.7,marginBottom:20}}>{m.desc}</p>

        <div style={{fontSize:11,color:C.muted,marginBottom:12,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>
          Split — {m.basis}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {m.rows.map((row,i)=>(
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 16px",
              background:"rgba(255,255,255,0.025)",
              borderRadius:7,borderLeft:`3px solid ${row.color}`,
            }}>
              <div style={{fontSize:13,color:"#C5C2BC",fontWeight:500}}>{row.who}</div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:700,color:row.color}}>{row.pct}</div>
                <div style={{fontSize:11,color:C.muted}}>{row.example}</div>
              </div>
            </div>
          ))}
        </div>

        {active===1 && (
          <div style={{
            background:`${C.green}08`,border:`1px solid ${C.green}20`,
            borderRadius:8,padding:"16px",
          }}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:8}}>💬 Say This in the Room</div>
            <div style={{fontSize:13,color:"#B0ADA8",lineHeight:1.8}}>
              <em style={{color:C.text}}>"One $10K job: $1.5K covers ads, ~$1.5K to us combined, Todd still clears ~$7K."</em>
              <br/>
              <em style={{color:C.text}}>"We only make money if you make money. We're aligned with you — not charging you blindly."</em>
            </div>
          </div>
        )}

        {active===2 && (
          <div style={{
            background:`${C.red}08`,border:`1px solid ${C.red}20`,
            borderRadius:8,padding:"16px",
          }}>
            <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>⚠️ Why We're Not Doing This</div>
            <div style={{fontSize:13,color:"#B0ADA8",lineHeight:1.7}}>
              Flat fees cap our upside and kill long-term leverage. If Todd lands a $200K ADU job from our system, we get $500? No. We built the machine — we ride the revenue.
            </div>
          </div>
        )}
      </Card>

      {/* Walk-in script */}
      <div style={{
        background:"rgba(245,197,24,0.05)",border:`1px solid ${C.yellow}20`,
        borderRadius:10,padding:"22px 24px",marginTop:20,
      }}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.yellow,fontWeight:700,marginBottom:14}}>
          🚀 Walk-In Script — Say This Verbatim
        </div>
        <div style={{
          fontSize:16,fontWeight:700,color:C.text,lineHeight:1.8,
          borderLeft:`3px solid ${C.yellow}`,paddingLeft:16,
        }}>
          "Mike funds traffic. I build and run the system. Todd closes jobs. We split the results. Nobody gets paid unless it works."
        </div>
      </div>

      {/* Todd objection handler */}
      <div style={{
        background:"rgba(232,116,12,0.05)",border:`1px solid ${C.orange}20`,
        borderRadius:10,padding:"22px 24px",marginTop:14,
      }}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.orange,fontWeight:700,marginBottom:14}}>
          ⚖️ When Todd Says "That's 30% of my job"
        </div>
        <div style={{fontSize:14,color:"#B0ADA8",lineHeight:1.8}}>
          <strong style={{color:C.text}}>Todd thinks:</strong> "Damn, I'm giving up 30%."
          <br/>
          <strong style={{color:C.yellow}}>You respond:</strong>{" "}
          <em style={{color:C.text}}>"Right now you're getting 0%. This turns it into something."</em>
          <br/><br/>
          <strong style={{color:C.text}}>And reframe Mike:</strong>{" "}
          <em style={{color:C.text}}>"Mike isn't paying for ads — he's investing in deal flow."</em>
        </div>
      </div>

      {/* Non-negotiables */}
      <Card style={{padding:"22px",marginTop:14}}>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.red,fontWeight:700,marginBottom:14}}>
          ⚠️ Non-Negotiables — Set These Today or Chaos Later
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[
            { icon:"📍", label:"Tracking", desc:"Every lead tagged by source — Meta, referral, organic. No attribution disputes." },
            { icon:"💸", label:"Payment Timing", desc:"Paid when the job closes. Not when the lead comes in. Not on estimate." },
            { icon:"🔗", label:"Lead Ownership", desc:"Leads from the system are shared pipeline. Not Todd's personal rolodex." },
          ].map((n,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:"14px"}}>
              <div style={{fontSize:22,marginBottom:8}}>{n.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{n.label}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{n.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── ROI CALC ─── */
function ROICalc() {
  const [idx, setIdx] = useState(1);
  const s = ROI_SCENARIOS[idx];

  const refRev  = s.refacingJobs * 10000;
  const refMgn  = s.refacingJobs * 6500;
  const remRev  = s.remodeJobs   * 40000;
  const remMgn  = s.remodeJobs   * 16000;
  const aduRev  = s.aduJobs      * 200000;
  const aduMgn  = s.aduJobs      * 75000;
  const totRev  = refRev + remRev + aduRev;
  const totMgn  = refMgn + remMgn + aduMgn;
  const netMgn  = totMgn - 1500;
  const roas    = (totRev / 1500).toFixed(1);
  const breakEven = Math.ceil(1500 / 6500);

  // Revenue share at Model 2
  const mikeShare = Math.round((totMgn - 1500) * 0.15);
  const snrgShare = Math.round((totMgn - 1500) * 0.15);
  const toddShare = Math.round((totMgn - 1500) * 0.70);

  const chartData = ROI_SCENARIOS.map(sc => ({
    name:    sc.label,
    revenue: (sc.refacingJobs*10000)+(sc.remodeJobs*40000)+(sc.aduJobs*200000),
    margin:  (sc.refacingJobs*6500)+(sc.remodeJobs*16000)+(sc.aduJobs*75000),
    spend:   1500,
  }));

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {ROI_SCENARIOS.map((sc,i)=>{
          const a=i===idx;
          return (
            <button key={i} onClick={()=>setIdx(i)} style={{
              background: a?`${sc.color}14`:"rgba(255,255,255,0.03)",
              border:`1px solid ${a?`${sc.color}40`:C.border}`,
              color: a?sc.color:C.muted,
              padding:"9px 18px",borderRadius:6,cursor:"pointer",
              fontSize:12,fontWeight:700,fontFamily:"'Syne', sans-serif",
              transition:"all .2s",
            }}>{sc.label}</button>
          );
        })}
      </div>

      {idx===3 && (
        <div className="adu-glow" style={{
          background:`${C.purple}10`,border:`1px solid ${C.purple}35`,
          borderRadius:10,padding:"18px 20px",marginBottom:20,
        }}>
          <div style={{fontSize:12,fontWeight:700,color:C.purple,marginBottom:6}}>🏠 ADU SCENARIO — ONE CALL CHANGES EVERYTHING</div>
          <div style={{fontSize:14,color:"#C5C2BC",lineHeight:1.75}}>
            One $200K ADU project at $75K margin produces <strong style={{color:C.purple}}>50x ROAS</strong> on the $1,500 ad spend.
            Todd's crew keeps $52.5K. Mike recoups 50 months of ad spend in a single close.
            This is why we keep a $5/day retargeting campaign alive — the lottery ticket that costs almost nothing.
          </div>
        </div>
      )}

      <div style={{background:`${C.yellow}08`,border:`1px solid ${C.yellow}20`,borderRadius:8,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:28}}>🔑</div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.yellow,marginBottom:3}}>Break-Even Point</div>
          <div style={{fontSize:13,color:"#C5C2BC"}}>
            We only need <strong style={{color:C.yellow}}>{breakEven} cabinet refacing close</strong> per month to cover the full $1,500 ad spend.
            Everything after that is split profit.
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
        {[
          {icon:<Target size={15}/>,    label:"Monthly Leads",  value:s.leads,                      color:C.yellow},
          {icon:<DollarSign size={15}/>,label:"Cost Per Lead",  value:`$${s.cpl}`,                  color:C.orange},
          {icon:<TrendingUp size={15}/>,label:"Est. Revenue",   value:`$${totRev.toLocaleString()}`, color:C.green },
          {icon:<DollarSign size={15}/>,label:"Net Margin",     value:`$${netMgn.toLocaleString()}`, color:C.blue  },
        ].map((st,i)=>(
          <Card key={i} style={{padding:"18px"}}>
            <div style={{color:st.color,marginBottom:8}}>{st.icon}</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:40,color:st.color,lineHeight:1}}>{st.value}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:6,fontWeight:600,letterSpacing:.5}}>{st.label}</div>
          </Card>
        ))}
      </div>

      {/* Jobs breakdown */}
      <Card style={{padding:"20px",marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:14}}>
          Jobs Breakdown — {s.label}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {label:"Cabinet Refacing",  n:s.refacingJobs, revenue:refRev, margin:refMgn, color:C.yellow},
            {label:"Kitchen/Bath",       n:s.remodeJobs,   revenue:remRev, margin:remMgn, color:C.orange},
            {label:"Dream Home / ADU",   n:s.aduJobs,      revenue:aduRev, margin:aduMgn, color:C.purple},
          ].map((row,i)=>(
            <div key={i} style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 14px",
              background: i===2&&row.n>0 ? `${C.purple}08` : "rgba(255,255,255,0.025)",
              borderRadius:7,
              border: i===2&&row.n>0 ? `1px solid ${C.purple}25` : "none",
              borderLeft:`3px solid ${row.color}`,
            }}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{row.label}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Revenue: ${row.revenue.toLocaleString()} · Margin: ${row.margin.toLocaleString()}</div>
              </div>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:40,color:row.color,lineHeight:1}}>{row.n}</div>
            </div>
          ))}

          {/* Revenue share breakdown */}
          <div style={{background:`${C.green}08`,borderRadius:7,border:`1px solid ${C.green}20`,padding:"14px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:10,letterSpacing:1,textTransform:"uppercase"}}>
              Revenue Share After Ad Spend — Model 2
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                {who:"Mike",color:C.blue,  amount:mikeShare},
                {who:"SNRG",color:C.yellow,amount:snrgShare},
                {who:"Todd",color:C.green, amount:toddShare},
              ].map((p,i)=>(
                <div key={i} style={{textAlign:"center",padding:"10px",background:"rgba(255,255,255,0.025)",borderRadius:6}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{p.who}</div>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:26,color:p.color,lineHeight:1}}>
                    ${p.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.muted,marginTop:10,textAlign:"center"}}>
              {roas}x ROAS · $1,500 ad spend subtracted before split
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card style={{padding:"24px 16px 12px"}}>
        <div style={{height:200}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
              <CartesianGrid stroke={C.border} vertical={false}/>
              <XAxis dataKey="name" tick={{fill:C.muted,fontSize:10,fontFamily:"'Syne', sans-serif"}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip
                contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"'Syne', sans-serif"}}
                labelStyle={{color:C.yellow,fontWeight:700}}
                itemStyle={{color:C.text}}
                formatter={(v,name)=>[`$${v.toLocaleString()}`,name==="revenue"?"Revenue":name==="margin"?"Margin":"Ad Spend"]}
              />
              <Bar dataKey="spend"   fill={C.red}    radius={[4,4,0,0]}/>
              <Bar dataKey="margin"  fill={C.orange} radius={[4,4,0,0]}/>
              <Bar dataKey="revenue" fill={C.yellow} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:8}}>Red = Ad Spend · Orange = Margin · Yellow = Revenue · Purple scenario includes ADU close</p>
      </Card>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function BattlePlan() {
  const [activeSection, setActiveSection] = useState("partnership");
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if(e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.2 }
    );
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => refs.current[id]?.scrollIntoView({ behavior:"smooth" });
  const sec = { maxWidth:880, margin:"0 auto", padding:"96px 28px 72px" };

  return (
    <div style={{background:C.bg,color:C.text,fontFamily:"'Syne', sans-serif",minHeight:"100vh"}}>
      <style>{GLOBAL_CSS}</style>

      {/* NAV */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:200,
        background:"rgba(8,8,9,0.92)",backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 28px",height:52,
      }}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:18,color:C.yellow,letterSpacing:2,display:"flex",alignItems:"center",gap:12}}>
          G3 HOME REMODEL
          <span style={{fontSize:9,color:C.muted,fontFamily:"'Syne', sans-serif",letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>
            REVENUE PARTNERSHIP
          </span>
        </div>
        <div style={{display:"flex",gap:2}}>
          {NAV_SECTIONS.map(s=>{
            const a=activeSection===s.id;
            return (
              <button key={s.id} onClick={()=>scrollTo(s.id)} style={{
                background:a?`${C.yellow}12`:"transparent",
                border:`1px solid ${a?`${C.yellow}35`:"transparent"}`,
                color:a?C.yellow:C.muted,
                padding:"5px 11px",borderRadius:5,cursor:"pointer",
                fontSize:10,fontWeight:700,fontFamily:"'Syne', sans-serif",
                transition:"all .2s",
              }}>{s.label}</button>
            );
          })}
        </div>
      </nav>

      {/* ═══ 1. PARTNERSHIP ═══ */}
      <section id="partnership" ref={el=>refs.current.partnership=el} style={{...sec,paddingTop:120}}>
        <SL>Confidential · SNRG Labs · Maricopa County · March 2026</SL>
        <h1 style={{
          fontFamily:"'Bebas Neue', sans-serif",
          fontSize:"clamp(48px,9vw,88px)",
          lineHeight:.9,letterSpacing:2,marginBottom:10,
        }}>
          <span style={{color:C.yellow}}>THIS ISN'T</span><br/>
          <span style={{color:C.text}}>MARKETING.</span>
        </h1>
        <h2 style={{
          fontFamily:"'Bebas Neue', sans-serif",
          fontSize:"clamp(28px,5vw,48px)",
          color:C.orange,letterSpacing:2,marginBottom:28,lineHeight:1,
        }}>
          IT'S A REVENUE PARTNERSHIP.
        </h2>

        <p style={{fontSize:16,color:C.muted,maxWidth:560,lineHeight:1.75,marginBottom:40}}>
          Three people. Three roles. One shared goal: closed jobs.
          Nobody gets paid unless it works. That's the deal.
        </p>

        {/* 3-role breakdown */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:36}}>
          {[
            { role:"MIKE",  label:"Funding Acquisition", icon:"💰", color:C.blue,   desc:"Invests in deal flow. Not paying for ads — buying into a revenue pipeline." },
            { role:"SNRG",  label:"System Operator",     icon:"⚙️", color:C.yellow, desc:"Builds and runs the entire machine. Ads, funnel, CRM, reporting. All of it." },
            { role:"TODD",  label:"Fulfillment",          icon:"🔨", color:C.orange, desc:"Closes jobs. Does the work. Gets the lion's share of every dollar earned." },
          ].map((p,i)=>(
            <div key={i} style={{
              background:C.card,border:`1px solid ${p.color}25`,
              borderRadius:10,padding:"22px 18px",
              borderTop:`3px solid ${p.color}`,
            }}>
              <div style={{fontSize:28,marginBottom:10}}>{p.icon}</div>
              <div style={{
                fontFamily:"'Bebas Neue', sans-serif",
                fontSize:22,color:p.color,letterSpacing:1,marginBottom:4,
              }}>{p.role}</div>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>{p.label}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.65}}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Reframe callout */}
        <div style={{
          background:`${C.yellow}07`,border:`1px solid ${C.yellow}20`,
          borderRadius:10,padding:"22px 26px",marginBottom:20,
        }}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.yellow,fontWeight:700,marginBottom:12}}>
            🔥 Reframe for the Room
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[
              {old:"Mike is paying for ads",    fresh:"Mike is investing in deal flow"},
              {old:"I'm doing marketing for Todd", fresh:"I'm operating a revenue system we all own"},
              {old:"Todd is a client",           fresh:"Todd is our fulfillment partner"},
              {old:"We're spending $1,500/month", fresh:"We're deploying $1,500 to generate $60K+"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{flexShrink:0}}>
                  <div style={{fontSize:11,color:C.red,textDecoration:"line-through",lineHeight:1.5}}>{r.old}</div>
                  <div style={{fontSize:12,color:C.green,fontWeight:600,lineHeight:1.5,marginTop:2}}>→ {r.fresh}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADU teaser */}
        <div className="adu-glow" style={{
          background:`${C.purple}08`,border:`1px solid ${C.purple}30`,
          borderRadius:10,padding:"22px 26px",
        }}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.purple,fontWeight:700,marginBottom:10}}>
            🏠 The Big Picture — Why This Partnership Matters Long-Term
          </div>
          <p style={{fontSize:14,color:"#C5C2BC",lineHeight:1.75,marginBottom:10}}>
            Refacing is the entry point. But Todd is a <strong style={{color:C.text}}>fully licensed contractor</strong>.
            The same system that generates refacing leads can surface a $200K ADU project.
            One ADU close covers <strong style={{color:C.purple}}>over 4 years of ad spend</strong>.
            That's not marketing ROI — that's a business asset we're building together.
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Tag color={C.yellow}>Cabinet Refacing — $10K avg</Tag>
            <Tag color={C.orange}>Kitchen/Bath Remodel — $30K–$60K</Tag>
            <Tag color={C.purple}>ADU / Dream Home — $150K–$250K</Tag>
          </div>
        </div>
      </section>

      {/* ═══ 2. DEAL STRUCTURE ═══ */}
      <section id="deal" ref={el=>refs.current.deal=el} style={{...sec,background:"rgba(17,18,20,0.5)"}}>
        <SL>The Agreement — How We Get Paid</SL>
        <ST>DEAL STRUCTURE</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:32}}>
          Three viable models. We're recommending Model 2. Interact with each one below.
        </p>
        <DealStructure/>
      </section>

      {/* ═══ 3. CAMPAIGNS ═══ */}
      <section id="campaigns" ref={el=>refs.current.campaigns=el} style={sec}>
        <SL>Ad Strategy — Budget Allocation</SL>
        <ST>3 CAMPAIGNS. 1 SYSTEM.</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:28}}>
          $1,500/month. Three campaigns. Refacing anchors. Remodels multiply. ADU is the lottery ticket that costs $5/day.
        </p>

        <Card style={{padding:"24px",marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:14}}>
            Daily Budget Split — $50/Day
          </div>
          <div style={{display:"flex",height:42,borderRadius:6,overflow:"hidden",gap:2,marginBottom:14}}>
            {[
              {label:"REFACING 70%",    pct:70,color:C.yellow},
              {label:"KITCHEN/BATH 20%",pct:20,color:C.orange},
              {label:"ADU 10%",         pct:10,color:C.purple},
            ].map((b,i)=>(
              <div key={i} style={{
                flex:b.pct,background:b.color,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:10,fontWeight:800,color:C.bg,letterSpacing:.5,
              }}>{b.label}</div>
            ))}
          </div>
          <div style={{display:"flex",gap:24}}>
            {[
              {label:"Refacing",    amount:"$35/day",color:C.yellow},
              {label:"Kitchen/Bath",amount:"$10/day",color:C.orange},
              {label:"ADU/Dream",   amount:"$5/day", color:C.purple},
            ].map((l,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:2,background:l.color}}/>
                <span style={{fontSize:12,color:C.muted}}>{l.label}:</span>
                <span style={{fontSize:12,fontWeight:700,color:l.color}}>{l.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Campaign cards */}
        {[
          {
            tier:"PRIMARY — 70%", label:"Cabinet Refacing", budget:"$35/day", color:C.yellow,
            avgJob:"$10K", margin:"$6K–$7K", closeRate:"20%",
            tags:["Image Ads","Quiz Funnel","Maricopa County"],
            desc:"Fast close cycle. High homeowner demand. One close covers the month. This is the volume driver.",
            targeting:"Homeowners 35–65, Maricopa County · Interests: home improvement, kitchen design, HGTV, Houzz, home equity",
          },
          {
            tier:"SECONDARY — 20%", label:"Kitchen & Bath Remodel", budget:"$10/day", color:C.orange,
            avgJob:"$30K–$60K", margin:"~40%", closeRate:"15%",
            tags:["Video Ads","Quiz Funnel","Maricopa County"],
            desc:"Higher ticket. Longer cycle. Refacing leads naturally convert up into this tier. Before/after video closes it.",
            targeting:"Homeowners 35–65, Maricopa County · Lookalike from refacing leads · Interests: kitchen renovation, bathroom remodel",
          },
          {
            tier:"ADU / DREAM HOME — 10%", label:"Dream Home / ADU Build", budget:"$5/day", color:C.purple,
            avgJob:"$150K–$250K", margin:"$50K–$100K+", closeRate:"5–10%",
            tags:["Retargeting Only","Quiz Funnel","High-Intent"],
            desc:"One close funds 4+ years of ads. $5/day retargeting against warm audiences. This is the reason Todd's contractor license matters.",
            targeting:"Retargeting: website visitors + quiz non-completers · Interests: luxury home builds, ADU, custom home, home addition, land development",
            highlight: true,
          },
        ].map((c,i)=>(
          <div key={i} className={c.highlight?"adu-glow":""} style={{
            background: c.highlight ? `${C.purple}08` : C.card,
            border: c.highlight ? `1px solid ${C.purple}35` : `1px solid ${C.border}`,
            borderRadius:10,padding:"24px",marginBottom:12,
            borderLeft:`3px solid ${c.color}`,
          }}>
            {c.highlight && (
              <div className="pulse" style={{
                display:"inline-block",
                background:`${C.purple}20`,border:`1px solid ${C.purple}40`,
                color:C.purple,fontSize:9,fontWeight:800,letterSpacing:2,
                padding:"4px 12px",borderRadius:3,marginBottom:12,
              }}>
                🏠 THE LOTTERY TICKET — DON'T SLEEP ON THIS
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:12}}>
              <div>
                <div style={{fontSize:10,letterSpacing:2.5,color:c.color,fontWeight:700,marginBottom:4}}>{c.tier}</div>
                <div style={{fontSize:18,fontWeight:700,color:C.text}}>{c.label}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:28,color:c.color,lineHeight:1}}>{c.budget}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>daily</div>
              </div>
            </div>
            <p style={{fontSize:13,color:"#B0ADA8",lineHeight:1.7,marginBottom:14}}>{c.desc}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
              {[{label:"Avg Job",value:c.avgJob},{label:"Margin",value:c.margin},{label:"Close Rate",value:c.closeRate}].map((st,j)=>(
                <div key={j} style={{background:"rgba(255,255,255,0.025)",borderRadius:6,padding:"10px 12px"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{st.label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{st.value}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {c.tags.map(t=><Tag key={t} color={c.color}>{t}</Tag>)}
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
              🎯 <strong style={{color:"#B0ADA8"}}>Targeting:</strong> {c.targeting}
            </div>
          </div>
        ))}
      </section>

      {/* ═══ 4. QUIZ FUNNEL ═══ */}
      <section id="funnel" ref={el=>refs.current.funnel=el} style={{...sec,background:"rgba(17,18,20,0.5)"}}>
        <SL>Lead Capture — What the Ad Clicks Into</SL>
        <ST>THE QUIZ FUNNEL</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:16}}>
          Live demo — click through it right now. This is what a Maricopa County homeowner sees after clicking our ad. ADU option is in there.
        </p>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:32,flexWrap:"wrap"}}>
          {["Meta Ad","Quiz Landing Page","Qualify + Capture","Airtable Pipeline","Todd Gets a Text"].map((s,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <Tag color={i===0?C.orange:i===4?C.green:C.yellow}>{s}</Tag>
              {i<arr.length-1&&<span style={{color:C.border,fontSize:12}}>→</span>}
            </div>
          ))}
        </div>
        <QuizFunnel/>
      </section>

      {/* ═══ 5. PIPELINE ═══ */}
      <section id="pipeline" ref={el=>refs.current.pipeline=el} style={sec}>
        <SL>Lead Management — Airtable CRM</SL>
        <ST>THE PIPELINE</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:32}}>
          Every lead lands here automatically. ADU lead from Marcus D. is already in Contacted.
          One call could change the math on this entire operation.
        </p>
        <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:16}}>
          {KANBAN.map(col=>(
            <div key={col.id} style={{minWidth:178,flex:"0 0 178px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:10,borderBottom:`2px solid ${col.color}`}}>
                <span style={{fontSize:11,fontWeight:700,color:col.color,textTransform:"uppercase",letterSpacing:1}}>{col.label}</span>
                <span style={{background:`${col.color}18`,color:col.color,borderRadius:10,padding:"1px 8px",fontSize:11,fontWeight:700}}>
                  {col.leads.length}
                </span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {col.leads.map((lead,i)=>(
                  <Card key={i} style={{
                    padding:"12px",
                    border: lead.project.includes("ADU") ? `1px solid ${C.purple}35` : `1px solid ${C.border}`,
                    background: lead.project.includes("ADU") ? `${C.purple}08` : C.card,
                  }}>
                    {lead.project.includes("ADU") && (
                      <div className="pulse" style={{fontSize:9,color:C.purple,fontWeight:800,letterSpacing:2,marginBottom:6}}>🏠 ADU LEAD</div>
                    )}
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{lead.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{lead.project}</div>
                    <div style={{fontSize:11,color:C.muted}}>{lead.budget}</div>
                    <div style={{display:"flex",gap:5,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
                      <Tag color={lead.project.includes("ADU")?C.purple:col.color}>{lead.source}</Tag>
                      <span style={{fontSize:10,color:C.muted}}>{lead.date}</span>
                    </div>
                  </Card>
                ))}
                {col.leads.length===0&&(
                  <div style={{border:`1px dashed ${C.border}`,borderRadius:8,padding:"22px 12px",textAlign:"center",color:C.muted,fontSize:11}}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Card style={{padding:"18px 20px",marginTop:24,background:`${C.yellow}06`,border:`1px solid ${C.yellow}18`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.yellow,marginBottom:10}}>Automations live at launch</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12,color:"#B0ADA8",lineHeight:1.8}}>
            <div>→ SMS to Todd the second a lead hits</div>
            <div>→ Email confirmation to the lead</div>
            <div>→ Weekly digest to Mike — CPL, leads, pipeline</div>
            <div>→ Follow-up reminder if no contact in 24 hours</div>
          </div>
        </Card>
      </section>

      {/* ═══ 6. THE MATH ═══ */}
      <section id="math" ref={el=>refs.current.math=el} style={{...sec,background:"rgba(17,18,20,0.5)"}}>
        <SL>ROI Projection — Real Numbers + Revenue Share</SL>
        <ST>THE MATH</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:32}}>
          Conservative through ADU scenarios. Revenue share calculated at Model 2 (recommended).
          Hit the ADU scenario to see what one $200K project does to everyone's number.
        </p>
        <ROICalc/>
      </section>

      {/* ═══ 7. SLA ═══ */}
      <section id="sla" ref={el=>refs.current.sla=el} style={{...sec,background:"rgba(17,18,20,0.5)"}}>
        <SL>Service Level Agreement — How We Operate</SL>
        <ST>SPEED WINS.<br/><span style={{color:C.orange}}>ALWAYS.</span></ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:36}}>
          The system generates leads. Todd's response time determines if they close.
          This isn't theory — it's peer-reviewed data from MIT, Harvard, and Velocify.
        </p>

        {/* Stat wall */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:28}}>
          {[
            {
              stat:"100×",
              label:"More likely to connect",
              source:"MIT / InsideSales",
              desc:"Responding within 5 minutes vs. waiting 30 minutes.",
              color:C.yellow,
            },
            {
              stat:"80%",
              label:"Lead quality drops",
              source:"Harvard Business Review",
              desc:"After the first 5 minutes, lead quality falls off a cliff.",
              color:C.red,
            },
            {
              stat:"78%",
              label:"Buyers choose first responder",
              source:"Lead Response Management Study",
              desc:"Nearly 8 in 10 go with whoever picks up the phone first.",
              color:C.green,
            },
            {
              stat:"391%",
              label:"Conversion lift",
              source:"Velocify Research",
              desc:"Responding in under 1 minute vs. any longer.",
              color:C.blue,
            },
          ].map((s,i)=>(
            <Card key={i} style={{padding:"22px 20px",borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:56,color:s.color,lineHeight:1,marginBottom:6}}>
                {s.stat}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:12,color:"#B0ADA8",lineHeight:1.65,marginBottom:8}}>{s.desc}</div>
              <Tag color={s.color}>{s.source}</Tag>
            </Card>
          ))}
        </div>

        {/* Decay timeline */}
        <Card style={{padding:"24px",marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:20}}>
            Lead Decay Timeline — Probability of Contact
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {time:"&lt; 1 min",  pct:100, label:"Optimal",        color:C.green },
              {time:"1–5 min",   pct:80,  label:"Strong",          color:C.yellow},
              {time:"5–15 min",  pct:45,  label:"Declining Fast",  color:C.orange},
              {time:"15–30 min", pct:15,  label:"Nearly Gone",     color:C.red   },
              {time:"30+ min",   pct:3,   label:"Opportunity Lost",color:"#4B4B4B"},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:72,fontSize:11,fontWeight:700,color:C.muted,flexShrink:0,textAlign:"right"}}
                  dangerouslySetInnerHTML={{__html:row.time}}
                />
                <div style={{flex:1,height:28,background:"rgba(255,255,255,0.04)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{
                    height:"100%",width:`${row.pct}%`,background:row.color,
                    borderRadius:4,display:"flex",alignItems:"center",
                    paddingLeft:10,transition:"width .5s ease",
                  }}>
                    {row.pct > 15 && (
                      <span style={{fontSize:11,fontWeight:800,color:row.pct===3?"transparent":C.bg,letterSpacing:.5}}>
                        {row.pct}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize:10,fontWeight:700,color:row.color,
                  letterSpacing:1,textTransform:"uppercase",width:110,flexShrink:0,
                }}>
                  {row.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:C.muted,marginTop:16,lineHeight:1.7,textAlign:"center"}}>
            ⏱ <strong style={{color:C.text}}>Every minute you wait, your chances drop 5–10%.</strong>
            <br/>After 30 minutes, 90–99% of the opportunity is gone.
          </div>
        </Card>

        {/* SLA commitments */}
        <div style={{
          background:`${C.yellow}07`,border:`1px solid ${C.yellow}20`,
          borderRadius:10,padding:"24px",marginBottom:14,
        }}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.yellow,fontWeight:700,marginBottom:16}}>
            ⚡ Our SLA — What We're Committing To
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {icon:"📲",commitment:"SMS to Todd fires instantly",detail:"Airtable automation triggers the second a lead submits. Zero manual steps."},
              {icon:"📊",commitment:"Lead data pre-qualified",detail:"Todd knows project type, budget, and timeline before the first call."},
              {icon:"📅",commitment:"Weekly performance report",detail:"CPL, leads, pipeline, closed jobs — every Monday. No surprises."},
              {icon:"🔁",commitment:"Follow-up reminders at 24h",detail:"If Todd hasn't contacted a lead in 24 hours, automated reminder fires."},
            ].map((item,i)=>(
              <div key={i} style={{
                background:"rgba(255,255,255,0.03)",borderRadius:8,
                padding:"16px",border:`1px solid ${C.border}`,
              }}>
                <div style={{fontSize:24,marginBottom:8}}>{item.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{item.commitment}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Todd's obligation */}
        <div style={{
          background:`${C.orange}07`,border:`1px solid ${C.orange}20`,
          borderRadius:10,padding:"22px 24px",
        }}>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.orange,fontWeight:700,marginBottom:12}}>
            ⚖️ Todd's Side of the SLA
          </div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10}}>
            We build it. We send it. You answer it — within 5 minutes.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              "Call or text every new lead within 5 minutes of the SMS alert",
              "Never let a lead sit more than 24 hours without contact",
              "Report every booked job back to SNRG for revenue share calculation",
              "Don't price out leads before you've had the consultation call",
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{color:C.orange,flexShrink:0,marginTop:1}}>→</div>
                <div style={{fontSize:13,color:"#C5C2BC",lineHeight:1.55}}>{item}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop:16,padding:"12px 16px",
            background:`${C.red}08`,border:`1px solid ${C.red}20`,borderRadius:6,
            fontSize:13,color:C.muted,lineHeight:1.65,
          }}>
            <strong style={{color:C.red}}>Hard truth:</strong> The best ad system in the world loses to a slow response.
            If Todd waits 30 minutes to call back, Harvard's data says the lead is already gone.
            Speed isn't a courtesy — it's the close.
          </div>
        </div>
      </section>

      {/* ═══ 8. LAUNCH ═══ */}
      <section id="launch" ref={el=>refs.current.launch=el} style={sec}>
        <SL>Activation — What Happens Next</SL>
        <ST>LAUNCH LIST</ST>
        <p style={{color:C.muted,fontSize:14,marginBottom:32}}>
          Click items to check them off. Most is on us.
          We need Todd's assets. We need Mike's verbal commitment. That's it.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
          {[
            {owner:"SNRG Labs",color:C.yellow,items:SNRG_TASKS},
            {owner:"Todd / G3",color:C.orange,items:TODD_TASKS},
          ].map((col,i)=>(
            <Card key={i} style={{padding:"24px"}}>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:14,letterSpacing:3,color:col.color,marginBottom:20}}>
                {col.owner} HANDLES THIS
              </div>
              <Checklist items={col.items} color={col.color}/>
            </Card>
          ))}
        </div>

        <Card style={{padding:"24px",marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.muted,textTransform:"uppercase",marginBottom:16}}>
            Launch Timeline
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {phase:"01",label:"Launch",  time:"Week 1–2",color:C.yellow,desc:"Pixel, funnel, 3 creatives. ADU campaign live on retargeting. $50/day running."},
              {phase:"02",label:"Optimize",time:"Week 3–5",color:C.orange,desc:"Kill high-CPL sets. Add video. Build lookalike from closed jobs."},
              {phase:"03",label:"Scale",   time:"Month 2+",color:C.green, desc:"Layer Google LSA. Raise budget on proven CPL. ADU audience grows."},
            ].map(p=>(
              <div key={p.phase} style={{borderLeft:`3px solid ${p.color}`,paddingLeft:14}}>
                <div style={{fontSize:10,letterSpacing:2,color:p.color,fontWeight:700}}>PHASE {p.phase} · {p.time}</div>
                <div style={{fontSize:14,fontWeight:700,color:C.text,margin:"4px 0"}}>{p.label}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Final */}
        <div style={{
          background:`linear-gradient(135deg,${C.yellow}0A,${C.orange}07,${C.purple}06)`,
          border:`1px solid ${C.yellow}22`,
          borderRadius:12,padding:"44px 32px",textAlign:"center",
        }}>
          <div style={{
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize:"clamp(26px,5vw,42px)",
            letterSpacing:2,lineHeight:1.1,marginBottom:18,
          }}>
            <span style={{color:C.yellow}}>MIKE FUNDS TRAFFIC.</span><br/>
            <span style={{color:C.text}}>I BUILD THE SYSTEM.</span><br/>
            <span style={{color:C.orange}}>TODD CLOSES JOBS.</span><br/>
            <span style={{color:C.green}}>WE SPLIT THE RESULTS.</span>
          </div>
          <p style={{color:C.muted,fontSize:14,maxWidth:500,margin:"0 auto 10px",lineHeight:1.8}}>
            Nobody gets paid unless it works. One $10K refacing job covers the month.
            One ADU changes the entire operation.
          </p>
          <p style={{
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize:18,color:C.purple,letterSpacing:2,marginBottom:28,
          }}>
            WE CAN TWEAK PERCENTAGES LATER — RIGHT NOW WE NEED TO TURN THE SYSTEM ON.
          </p>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:C.yellow,color:C.bg,
            borderRadius:8,padding:"13px 32px",
            fontSize:14,fontWeight:800,
            fontFamily:"'Syne', sans-serif",letterSpacing:.5,
          }}>
            LET'S LAUNCH <ArrowRight size={16}/>
          </div>
          <div style={{marginTop:16,fontSize:11,color:C.muted}}>
            Built by SNRG Labs · snrglabs.com · Maricopa County, AZ
          </div>
        </div>
      </section>
    </div>
  );
}
