import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { ArrowRight, CheckSquare, Square, DollarSign, TrendingUp, Target } from "lucide-react";

const C = {
  bg:      "#080809",
  surface: "#111214",
  card:    "#18191D",
  border:  "#252729",
  yellow:  "#F5C518",
  orange:  "#E8740C",
  green:   "#22C55E",
  blue:    "#3B82F6",
  purple:  "#8B5CF6",
  red:     "#EF4444",
  text:    "#E8E4DC",
  muted:   "#6B6965",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080809; }
  ::-webkit-scrollbar { width: 4px; background: #080809; }
  ::-webkit-scrollbar-thumb { background: #252729; border-radius: 2px; }
  input:focus { outline: none; border-color: #F5C518 !important; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp .4s ease forwards; }
`;

const NAV_SECTIONS = [
  { id: "overview",   label: "Overview"     },
  { id: "campaigns",  label: "Campaigns"    },
  { id: "funnel",     label: "Quiz Funnel"  },
  { id: "pipeline",   label: "CRM Pipeline" },
  { id: "math",       label: "The Math"     },
  { id: "launch",     label: "Launch List"  },
];

const QUIZ_STEPS = [
  {
    q: "What are you looking to upgrade in your home?",
    opts: [
      "🗄️ Cabinet Refacing / Resurfacing",
      "🍳 Full Kitchen Remodel",
      "🚿 Bathroom Remodel",
      "🏠 Dream Home / Full Remodel",
    ],
  },
  {
    q: "How would you describe the current state of your space?",
    opts: [
      "📦 Solid structure, just outdated look",
      "🔨 Needs some repairs + refresh",
      "💥 Full gut — starting from scratch",
      "🤷 Not sure — I need an assessment",
    ],
  },
  {
    q: "What's your ideal timeline to get started?",
    opts: ["🔥 ASAP — Ready Now", "📅 Within 30 Days", "🗓️ 1–3 Months Out", "🤔 Just Exploring"],
  },
  {
    q: "What's your rough budget range for this project?",
    opts: ["$5K – $15K", "$15K – $50K", "$50K – $150K", "$150K+"],
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
      { name: "Marcus D.", project: "Full Remodel",     source: "Meta Ad", budget: "$150K+",   date: "Mar 20" },
    ],
  },
  {
    id: "estimate", label: "Estimate Sent", color: C.blue,
    leads: [
      { name: "Linda H.", project: "Cabinet Refacing", source: "Meta Ad", budget: "$5K–$15K", date: "Mar 15" },
    ],
  },
  { id: "followup", label: "Follow Up", color: C.purple, leads: [] },
  {
    id: "booked", label: "Booked ✓", color: C.green,
    leads: [
      { name: "Tom R.", project: "Cabinet Refacing", source: "Meta Ad", budget: "$5K–$15K", date: "Mar 10" },
    ],
  },
];

const CAMPAIGNS = [
  {
    label: "Cabinet Refacing",
    tier: "PRIMARY — 70%",
    budget: "$35/day",
    color: C.yellow,
    avgJob: "$10K",
    margin: "$6K–$7K",
    closeRate: "20%",
    tags: ["Image Ads", "Quiz Funnel", "Maricopa County"],
    desc: "Fast close cycle. High homeowner demand. Primary volume driver. One close covers the entire month's ad spend with margin left over.",
    targeting: "Homeowners 35–65, Maricopa County · Interests: home improvement, kitchen design, HGTV, Houzz, home equity loans",
  },
  {
    label: "Kitchen & Bath Remodel",
    tier: "SECONDARY — 20%",
    budget: "$10/day",
    color: C.orange,
    avgJob: "$30K–$60K",
    margin: "~40%",
    closeRate: "15%",
    tags: ["Video Ads", "Quiz Funnel", "Maricopa County"],
    desc: "Higher ticket, longer cycle. Video ads before/after walkthroughs close this tier. Refacing leads naturally convert up here over time.",
    targeting: "Homeowners 35–65, Maricopa County · Lookalike from refacing leads · Interests: kitchen renovation, bathroom remodel",
  },
  {
    label: "Dream Home / Full Remodel + ADU",
    tier: "STRATEGIC — 10%",
    budget: "$5/day",
    color: C.green,
    avgJob: "$150K–$250K",
    margin: "$50K–$100K+",
    closeRate: "5–10%",
    tags: ["Retargeting Only", "Quiz Funnel", "Maricopa County"],
    desc: "One close funds 6 months of ads. Retargeting only at launch — warm audiences who already touched refacing content. ADU is the lottery ticket.",
    targeting: "Retargeting: website visitors + quiz non-completers · Interests: luxury home, custom builds, ADU, home addition",
  },
];

const ROI_SCENARIOS = [
  {
    label: "Conservative",
    cpl: 40, leads: 38, refacingJobs: 4, remodeJobs: 0, color: C.orange,
  },
  {
    label: "Realistic",
    cpl: 33, leads: 45, refacingJobs: 6, remodeJobs: 1, color: C.yellow,
  },
  {
    label: "Strong Month",
    cpl: 27, leads: 56, refacingJobs: 9, remodeJobs: 2, color: C.green,
  },
];

const SNRG_TASKS = [
  "Meta Business Manager + Pixel setup on G3HomeRemodel.com",
  "Build quiz funnel landing page (refacing-first flow)",
  "Design 3 static image ad creatives — cabinet refacing focus",
  "Write video ad script for Todd (iPhone walkthrough)",
  "Configure Airtable pipeline + lead automations",
  "SMS + email alert to Todd on every new lead captured",
  "Launch all 3 campaigns — 70/20/10 budget split",
  "Weekly reporting: CPL, leads, pipeline, booked jobs",
];

const TODD_TASKS = [
  "5–8 before/after cabinet refacing photos (best transformations)",
  "Short iPhone video walking a finished refacing job",
  "Google Business Profile confirmed claimed + updated",
  "Confirm any city limits / areas to exclude in Maricopa County",
  "Dedicated phone line or inbox confirmed for lead routing",
  "Mike's $1,500/month spend commitment locked in",
];

/* ─── SMALL COMPONENTS ─────────────────────────────────── */
const Tag = ({ children, color = C.yellow }) => (
  <span style={{
    background: `${color}14`, border: `1px solid ${color}30`,
    color, fontSize: 10, fontWeight: 700, padding: "3px 8px",
    borderRadius: 4, letterSpacing: .5, whiteSpace: "nowrap",
  }}>
    {children}
  </span>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 10 }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(36px, 6vw, 52px)",
    color: C.text, letterSpacing: 1.5, lineHeight: 1, marginBottom: 12,
  }}>
    {children}
  </h2>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, ...style }}>
    {children}
  </div>
);

/* ─── QUIZ FUNNEL ──────────────────────────────────────── */
function QuizFunnel() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState([]);
  const [form, setForm]       = useState({ name: "", phone: "", email: "" });
  const [done, setDone]       = useState(false);

  const pick = (opt) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (step < QUIZ_STEPS.length - 1) setStep(step + 1);
  };
  const submit = () => { if (form.name && form.phone) setDone(true); };
  const reset  = () => { setStep(0); setAnswers([]); setForm({ name:"", phone:"", email:"" }); setDone(false); };

  return (
    <Card style={{ maxWidth: 540, padding: "36px 32px" }}>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          width: `${done ? 100 : (step / QUIZ_STEPS.length) * 100}%`,
          background: done ? C.green : C.yellow,
          transition: "width .4s ease, background .3s",
        }} />
      </div>

      {done ? (
        <div style={{ textAlign: "center" }} className="fade-up">
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: C.green, letterSpacing: 1, marginBottom: 8 }}>
            LEAD CAPTURED — TODD GETS A TEXT
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: C.text }}>{form.name}</strong> just landed in the Airtable pipeline.
            Automatic SMS fires to Todd within seconds.
          </p>
          <div style={{
            background: `${C.green}0C`, border: `1px solid ${C.green}22`,
            borderRadius: 8, padding: "14px 16px", fontSize: 12,
            color: "#86EFAC", lineHeight: 2, marginBottom: 20, textAlign: "left",
          }}>
            {answers.map((a, i) => <div key={i}><span style={{ color: C.muted }}>Q{i+1}:</span> {a}</div>)}
            <div><span style={{ color: C.muted }}>Name:</span> {form.name}</div>
            <div><span style={{ color: C.muted }}>Phone:</span> {form.phone}</div>
          </div>
          <button onClick={reset} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            color: C.muted, padding: "8px 20px", borderRadius: 6,
            cursor: "pointer", fontSize: 12, fontFamily: "'Syne', sans-serif",
          }}>
            Restart Demo
          </button>
        </div>
      ) : (
        <div className="fade-up" key={step}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
            Step {step + 1} of {QUIZ_STEPS.length} · Free Estimate
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.45, marginBottom: 24 }}>
            {QUIZ_STEPS[step].q}
          </div>

          {step < 4 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {QUIZ_STEPS[step].opts.map((opt, i) => (
                <button key={i} onClick={() => pick(opt)} style={{
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "14px 12px",
                  color: C.text, fontSize: 13, fontWeight: 600,
                  fontFamily: "'Syne', sans-serif", cursor: "pointer",
                  textAlign: "left", transition: "all .15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.background = `${C.yellow}0E`; e.currentTarget.style.color = C.yellow; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = C.text; }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "name",  placeholder: "Full Name *"      },
                { key: "phone", placeholder: "Phone Number *"   },
                { key: "email", placeholder: "Email (optional)" },
              ].map(f => (
                <input key={f.key} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                    borderRadius: 7, padding: "12px 14px", color: C.text, fontSize: 14,
                    fontFamily: "'Syne', sans-serif", transition: "border-color .2s",
                  }}
                />
              ))}
              <button onClick={submit} style={{
                background: C.yellow, color: C.bg, border: "none", borderRadius: 7,
                padding: 14, fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "'Syne', sans-serif", marginTop: 4, letterSpacing: .5,
              }}>
                GET MY FREE ESTIMATE →
              </button>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
                Serving all of Maricopa County · Licensed Contractor · G3HomeRemodel.com
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ─── CHECKLIST ────────────────────────────────────────── */
function Checklist({ items, color }) {
  const [checked, setChecked] = useState([]);
  const toggle = (i) => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
  const pct = Math.round((checked.length / items.length) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.muted }}>{checked.length}/{items.length} done</div>
        <div style={{ fontSize: 11, color, fontWeight: 700 }}>{pct}%</div>
      </div>
      <div style={{ height: 2, background: C.border, borderRadius: 1, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 1, transition: "width .3s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => toggle(i)} style={{
            display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
            opacity: checked.includes(i) ? .4 : 1, transition: "opacity .2s",
          }}>
            <div style={{ marginTop: 1, color, flexShrink: 0 }}>
              {checked.includes(i) ? <CheckSquare size={15} /> : <Square size={15} style={{ opacity: .5 }} />}
            </div>
            <span style={{
              fontSize: 13, color: "#C5C2BC", lineHeight: 1.55,
              textDecoration: checked.includes(i) ? "line-through" : "none",
            }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ROI CALCULATOR ───────────────────────────────────── */
function ROICalc() {
  const [idx, setIdx] = useState(1);
  const s = ROI_SCENARIOS[idx];

  const refRev   = s.refacingJobs * 10000;
  const refMgn   = s.refacingJobs * 6500;
  const remRev   = s.remodeJobs   * 35000;
  const remMgn   = s.remodeJobs   * 14000;
  const totRev   = refRev + remRev;
  const totMgn   = refMgn + remMgn;
  const netMgn   = totMgn - 1500;
  const roas     = (totRev / 1500).toFixed(1);
  const breakEven = Math.ceil(1500 / 6500);

  const chartData = ROI_SCENARIOS.map(sc => ({
    name:    sc.label,
    revenue: (sc.refacingJobs * 10000) + (sc.remodeJobs * 35000),
    margin:  (sc.refacingJobs * 6500)  + (sc.remodeJobs * 14000),
    spend:   1500,
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {ROI_SCENARIOS.map((sc, i) => {
          const active = i === idx;
          return (
            <button key={i} onClick={() => setIdx(i)} style={{
              background: active ? `${sc.color}14` : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? `${sc.color}40` : C.border}`,
              color: active ? sc.color : C.muted,
              padding: "9px 18px", borderRadius: 6, cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif",
              transition: "all .2s",
            }}>
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Break-even */}
      <div style={{
        background: `${C.yellow}08`, border: `1px solid ${C.yellow}20`,
        borderRadius: 8, padding: "14px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ fontSize: 28 }}>🔑</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.yellow, marginBottom: 3 }}>Break-Even Point</div>
          <div style={{ fontSize: 13, color: "#C5C2BC" }}>
            We only need <strong style={{ color: C.yellow }}>{breakEven} cabinet refacing close{breakEven > 1 ? "s" : ""}</strong> per month to cover the full $1,500 ad spend.
            At $6,500 margin per job — that's it. Every additional close is pure profit for Todd.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { icon: <Target size={15} />,     label: "Monthly Leads",   value: s.leads,                        color: C.yellow },
          { icon: <DollarSign size={15} />, label: "Cost Per Lead",   value: `$${s.cpl}`,                    color: C.orange },
          { icon: <TrendingUp size={15} />, label: "Est. Revenue",    value: `$${totRev.toLocaleString()}`,   color: C.green  },
          { icon: <DollarSign size={15} />, label: "Net Margin",      value: `$${netMgn.toLocaleString()}`,   color: C.blue   },
        ].map((st, i) => (
          <Card key={i} style={{ padding: "18px" }}>
            <div style={{ color: st.color, marginBottom: 8 }}>{st.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: st.color, lineHeight: 1 }}>
              {st.value}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600, letterSpacing: .5 }}>{st.label}</div>
          </Card>
        ))}
      </div>

      {/* Jobs breakdown */}
      <Card style={{ padding: "20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 14 }}>
          Jobs Breakdown — {s.label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Cabinet Refacing Booked",  n: s.refacingJobs, revenue: refRev, margin: refMgn, color: C.yellow },
            { label: "Kitchen/Bath Remodel Booked", n: s.remodeJobs, revenue: remRev, margin: remMgn, color: C.orange },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px", background: "rgba(255,255,255,0.025)",
              borderRadius: 7, borderLeft: `3px solid ${row.color}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Revenue: ${row.revenue.toLocaleString()} · Margin: ${row.margin.toLocaleString()}
                </div>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: row.color, lineHeight: 1 }}>
                {row.n}
              </div>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 14px",
            background: `${C.green}08`, borderRadius: 7, border: `1px solid ${C.green}20`,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Margin After Ad Spend</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>$1,500 ad spend subtracted · {roas}x ROAS</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: C.green, lineHeight: 1 }}>
                ${netMgn.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card style={{ padding: "24px 16px 12px" }}>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="name"
                tick={{ fill: C.muted, fontSize: 11, fontFamily: "'Syne', sans-serif" }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: "'Syne', sans-serif" }}
                labelStyle={{ color: C.yellow, fontWeight: 700 }}
                itemStyle={{ color: C.text }}
                formatter={(v, name) => [`$${v.toLocaleString()}`, name === "revenue" ? "Revenue" : name === "margin" ? "Margin" : "Ad Spend"]}
              />
              <Bar dataKey="spend"   fill={C.red}    radius={[4,4,0,0]} />
              <Bar dataKey="margin"  fill={C.orange} radius={[4,4,0,0]} />
              <Bar dataKey="revenue" fill={C.yellow} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>
          Red = Ad Spend · Orange = Margin · Yellow = Revenue
        </p>
      </Card>
    </div>
  );
}

/* ─── MAIN APP ─────────────────────────────────────────── */
export default function BattlePlan() {
  const [activeSection, setActiveSection] = useState("overview");
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => refs.current[id]?.scrollIntoView({ behavior: "smooth" });

  const sec = { maxWidth: 860, margin: "0 auto", padding: "96px 28px 72px" };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Syne', sans-serif", minHeight: "100vh" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(8,8,9,0.92)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 52,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 19,
          color: C.yellow, letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          G3 HOME REMODEL
          <span style={{ fontSize: 9, color: C.muted, fontFamily: "'Syne', sans-serif", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
            BATTLE PLAN
          </span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {NAV_SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{
                background: active ? `${C.yellow}12` : "transparent",
                border: `1px solid ${active ? `${C.yellow}35` : "transparent"}`,
                color: active ? C.yellow : C.muted,
                padding: "5px 13px", borderRadius: 5, cursor: "pointer",
                fontSize: 11, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                transition: "all .2s",
              }}>
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════ 1. OVERVIEW ═══════════════ */}
      <section id="overview" ref={el => refs.current.overview = el} style={{ ...sec, paddingTop: 120 }}>
        <SectionLabel>Confidential · SNRG Labs · Maricopa County · March 2026</SectionLabel>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(52px, 10vw, 96px)",
          lineHeight: .9, letterSpacing: 2, marginBottom: 24,
        }}>
          <span style={{ color: C.yellow }}>G3 MARKETING</span><br />
          <span style={{ color: C.text }}>BATTLE PLAN</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 540, lineHeight: 1.7, marginBottom: 44 }}>
          A Meta Ads lead generation system built for Todd's crew — cabinet refacing as
          the primary driver, kitchen/bath and dream home remodels as the upside.
          $1,500/month in. Real jobs out.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { n: "$10K",     sub: "Avg. Refacing Job",      note: "$6K–$7K margin"           },
            { n: "1",        sub: "Close Covers the Month", note: "$6.5K margin > $1.5K spend"},
            { n: "70/30",    sub: "Budget Split",           note: "Refacing / Remodel"        },
            { n: "MARICOPA", sub: "Full County Targeting",  note: "All cities, all zones"     },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "20px 16px" }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: i === 3 ? 26 : 44, color: C.yellow, lineHeight: 1,
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 10 }}>{s.sub}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.note}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Cabinet Refacing",       icon: "🗄️", desc: "Fast close. $10K avg. 70% of budget. The bread and butter.", color: C.yellow },
            { label: "Kitchen & Bath Remodel", icon: "🍳", desc: "Mid-ticket. $30K–$60K. Feeds from refacing audiences naturally.", color: C.orange },
            { label: "Dream Home / ADU",       icon: "🏠", desc: "One $200K close = entire year's ad spend is noise. Retarget only.", color: C.green },
          ].map((t, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${t.color}`, paddingLeft: 16, paddingTop: 2 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: `${C.orange}07`, border: `1px solid ${C.orange}20`,
          borderRadius: 10, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 10 }}>
            🔍 Field Recon — Direct Competitor Intelligence
          </div>
          <p style={{ fontSize: 14, color: "#B0ADA8", lineHeight: 1.75 }}>
            Reviewed a live Meta ads account from an active home services agency running paid
            campaigns in this exact space. Playbook confirmed: static image ads for cold audiences,
            short-form video for retargeting, quiz funnels as primary lead capture.
            Three clients generating consistent inbound on this model right now.
            We're not guessing — we saw it working. We're building the same machine for Todd.
          </p>
        </div>
      </section>

      {/* ═══════════════ 2. CAMPAIGNS ═══════════════ */}
      <section id="campaigns" ref={el => refs.current.campaigns = el}
        style={{ ...sec, background: "rgba(17,18,20,0.5)" }}>
        <SectionLabel>Ad Strategy — Budget Allocation</SectionLabel>
        <SectionTitle>3 CAMPAIGNS. 1 SYSTEM.</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          $1,500/month. Three campaigns. Refacing anchors the spend.
          Remodels are the multiplier. ADU is the lottery ticket that costs us $5/day.
        </p>

        <Card style={{ padding: "24px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 14 }}>
            Daily Budget Split — $50/Day Total
          </div>
          <div style={{ display: "flex", height: 42, borderRadius: 6, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            {[
              { label: "REFACING 70%",    pct: 70, color: C.yellow },
              { label: "KITCHEN/BATH 20%",pct: 20, color: C.orange },
              { label: "DREAM 10%",       pct: 10, color: C.green  },
            ].map((b, i) => (
              <div key={i} style={{
                flex: b.pct, background: b.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, color: C.bg, letterSpacing: .5,
              }}>
                {b.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Refacing",     amount: "$35/day", color: C.yellow },
              { label: "Kitchen/Bath", amount: "$10/day", color: C.orange },
              { label: "Dream Home",   amount: "$5/day",  color: C.green  },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 12, color: C.muted }}>{l.label}:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        {CAMPAIGNS.map((c, i) => (
          <Card key={i} style={{ padding: "24px", marginBottom: 12, borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2.5, color: c.color, fontWeight: 700, marginBottom: 4 }}>{c.tier}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{c.label}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: c.color, lineHeight: 1 }}>{c.budget}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>daily</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#B0ADA8", lineHeight: 1.7, marginBottom: 14 }}>{c.desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Avg Job",    value: c.avgJob      },
                { label: "Margin",     value: c.margin      },
                { label: "Close Rate", value: c.closeRate   },
              ].map((st, j) => (
                <div key={j} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{st.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{st.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {c.tags.map(t => <Tag key={t} color={c.color}>{t}</Tag>)}
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              🎯 <strong style={{ color: "#B0ADA8" }}>Targeting:</strong> {c.targeting}
            </div>
          </Card>
        ))}
      </section>

      {/* ═══════════════ 3. QUIZ FUNNEL ═══════════════ */}
      <section id="funnel" ref={el => refs.current.funnel = el} style={sec}>
        <SectionLabel>Lead Capture — What the Ad Clicks Into</SectionLabel>
        <SectionTitle>THE QUIZ FUNNEL</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>
          Live demo — click through it right now. This is the exact experience
          a Maricopa County homeowner sees after clicking Todd's Meta ad.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 32, flexWrap: "wrap" }}>
          {["Meta Ad", "Quiz Landing Page", "Qualify + Capture", "Airtable Pipeline", "Todd Gets a Text"].map((s, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag color={i === 0 ? C.orange : i === 4 ? C.green : C.yellow}>{s}</Tag>
              {i < arr.length - 1 && <span style={{ color: C.border, fontSize: 12 }}>→</span>}
            </div>
          ))}
        </div>
        <QuizFunnel />
        <p style={{ fontSize: 13, color: C.muted, marginTop: 20, maxWidth: 520, lineHeight: 1.7 }}>
          No cold calls. No "what's this about." Todd calls back knowing exactly
          what they need, what they're budgeting, and when they want to start.
        </p>
      </section>

      {/* ═══════════════ 4. PIPELINE ═══════════════ */}
      <section id="pipeline" ref={el => refs.current.pipeline = el}
        style={{ ...sec, background: "rgba(17,18,20,0.5)" }}>
        <SectionLabel>Lead Management — Airtable CRM</SectionLabel>
        <SectionTitle>THE PIPELINE</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Every lead lands here automatically. Todd works it. Mike watches it.
          No monthly CRM subscription at launch — Airtable free tier handles this volume.
        </p>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {KANBAN.map(col => (
            <div key={col.id} style={{ minWidth: 175, flex: "0 0 175px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${col.color}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: 1 }}>
                  {col.label}
                </span>
                <span style={{ background: `${col.color}18`, color: col.color, borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                  {col.leads.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.leads.map((lead, i) => (
                  <Card key={i} style={{ padding: "12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lead.project}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{lead.budget}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <Tag color={col.color}>{lead.source}</Tag>
                      <span style={{ fontSize: 10, color: C.muted }}>{lead.date}</span>
                    </div>
                  </Card>
                ))}
                {col.leads.length === 0 && (
                  <div style={{ border: `1px dashed ${C.border}`, borderRadius: 8, padding: "22px 12px", textAlign: "center", color: C.muted, fontSize: 11 }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Card style={{ padding: "18px 20px", marginTop: 24, background: `${C.yellow}06`, border: `1px solid ${C.yellow}18` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.yellow, marginBottom: 10 }}>Automations wired in at launch</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#B0ADA8", lineHeight: 1.8 }}>
            <div>→ SMS to Todd the second a lead hits</div>
            <div>→ Email confirmation auto-sent to the lead</div>
            <div>→ Weekly digest to Mike — CPL, leads, pipeline</div>
            <div>→ Follow-up reminder if no contact in 24 hours</div>
          </div>
        </Card>
      </section>

      {/* ═══════════════ 5. THE MATH ═══════════════ */}
      <section id="math" ref={el => refs.current.math = el} style={sec}>
        <SectionLabel>ROI Projection — Real Numbers</SectionLabel>
        <SectionTitle>THE MATH</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Conservative, realistic, and strong-month scenarios.
          Cabinet refacing at $10K avg / $6.5K margin.
          $1,500 is the floor — it must pay for itself.
        </p>
        <ROICalc />
      </section>

      {/* ═══════════════ 6. LAUNCH LIST ═══════════════ */}
      <section id="launch" ref={el => refs.current.launch = el}
        style={{ ...sec, background: "rgba(17,18,20,0.5)" }}>
        <SectionLabel>Activation — What Happens Next</SectionLabel>
        <SectionTitle>LAUNCH LIST</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Click items to check them off. Most is on us.
          Todd's list is short — we just need his assets and his commitment.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { owner: "SNRG Labs", color: C.yellow, items: SNRG_TASKS },
            { owner: "Todd / G3", color: C.orange, items: TODD_TASKS },
          ].map((col, i) => (
            <Card key={i} style={{ padding: "24px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 3, color: col.color, marginBottom: 20 }}>
                {col.owner} HANDLES THIS
              </div>
              <Checklist items={col.items} color={col.color} />
            </Card>
          ))}
        </div>

        <Card style={{ padding: "24px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 16 }}>
            Launch Timeline
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { phase: "01", label: "Launch",   time: "Week 1–2", color: C.yellow, desc: "Pixel live. Funnel built. 3 creatives running. $50/day out the door." },
              { phase: "02", label: "Optimize", time: "Week 3–5", color: C.orange, desc: "Kill high-CPL ad sets. Add video creative. Retargeting goes live." },
              { phase: "03", label: "Scale",    time: "Month 2+", color: C.green,  desc: "Proven CPL confirmed. Layer in Google LSA. Raise budget where math confirms." },
            ].map(p => (
              <div key={p.phase} style={{ borderLeft: `3px solid ${p.color}`, paddingLeft: 14 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: p.color, fontWeight: 700 }}>
                  PHASE {p.phase} · {p.time}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "4px 0" }}>{p.label}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{
          background: `linear-gradient(135deg, ${C.yellow}0A, ${C.orange}08)`,
          border: `1px solid ${C.yellow}22`,
          borderRadius: 12, padding: "40px 32px", textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 5vw, 44px)",
            color: C.yellow, letterSpacing: 2, marginBottom: 14, lineHeight: 1,
          }}>
            ONE CLOSE COVERS THE MONTH.<br />
            <span style={{ color: C.text }}>EVERYTHING ELSE IS PROFIT.</span>
          </div>
          <p style={{ color: C.muted, fontSize: 14, maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.8 }}>
            At $6,500 margin per refacing job and a $1,500 monthly ad spend —
            Todd needs to close <strong style={{ color: C.text }}>one job</strong> to break even.
            At 6 closes, we're looking at{" "}
            <strong style={{ color: C.green }}>$37,500 in margin</strong> on a $1,500 investment.
            The math doesn't lie.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.yellow, color: C.bg,
            borderRadius: 8, padding: "13px 32px",
            fontSize: 14, fontWeight: 800,
            fontFamily: "'Syne', sans-serif", letterSpacing: .5,
          }}>
            LET'S LAUNCH <ArrowRight size={16} />
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: C.muted }}>
            Built by SNRG Labs · snrglabs.com · Maricopa County, AZ
          </div>
        </div>
      </section>
    </div>
  );
}
