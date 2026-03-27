import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { ArrowRight, CheckSquare, Square } from "lucide-react";

/* ─── TOKENS ─────────────────────────────────────────── */
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
  text:    "#E8E4DC",
  muted:   "#6B6965",
};

/* ─── GLOBAL STYLES ──────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; }
  ::-webkit-scrollbar { width: 4px; background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  input::placeholder { color: ${C.muted}; }
  input:focus { outline: none; border-color: ${C.yellow} !important; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  .fade-up { animation: fadeUp .45s ease forwards; }
`;

/* ─── DATA ────────────────────────────────────────────── */
const NAV_SECTIONS = [
  { id: "overview",  label: "Overview"   },
  { id: "funnel",    label: "Quiz Funnel" },
  { id: "pipeline",  label: "CRM Pipeline"},
  { id: "math",      label: "The Math"   },
  { id: "launch",    label: "Launch List" },
];

const QUIZ_STEPS = [
  {
    q: "What type of project are you planning?",
    opts: ["🍳 Kitchen Remodel", "🚿 Bathroom Remodel", "🏠 Full Home Remodel", "🏗️ Addition / ADU"],
  },
  {
    q: "What's your ideal timeline to start?",
    opts: ["🔥 ASAP", "📅 1–3 Months", "🗓️ 3–6 Months", "🤔 Just Exploring"],
  },
  {
    q: "What's your budget range?",
    opts: ["$5K – $15K", "$15K – $50K", "$50K – $100K", "$100K+"],
  },
  { q: "Last step — where do we send your free estimate?", opts: null },
];

const KANBAN = [
  {
    id: "new", label: "New Lead", color: C.yellow,
    leads: [
      { name: "Tiffany M.", project: "Kitchen Remodel", source: "Yelp",     date: "Mar 3"  },
      { name: "James R.",   project: "Bathroom Reno",   source: "Meta Ad",  date: "Mar 22" },
    ],
  },
  {
    id: "contacted", label: "Contacted", color: C.orange,
    leads: [
      { name: "Sarah K.", project: "Full Remodel", source: "Meta Ad", date: "Mar 18" },
    ],
  },
  { id: "estimate", label: "Estimate Sent", color: C.blue,   leads: [] },
  { id: "followup", label: "Follow Up",     color: C.purple, leads: [] },
  { id: "booked",   label: "Booked",        color: C.green,  leads: [] },
];

const ROI_DATA = [
  { budget: "$50/day",  leads: 45,  cpl: 33, revenue: 67500  },
  { budget: "$75/day",  leads: 70,  cpl: 32, revenue: 105000 },
  { budget: "$100/day", leads: 95,  cpl: 31, revenue: 142500 },
  { budget: "$150/day", leads: 145, cpl: 29, revenue: 217500 },
];

const SNRG_TASKS = [
  "Set up Meta Business Manager + Pixel on G3HomeRemodel.com",
  "Build quiz funnel landing page",
  "Design 3 static image ad creatives",
  "Configure Airtable pipeline + lead automations",
  "SMS/email alert to Todd on every new lead",
  "Launch campaign at $50/day",
  "Weekly reporting — CPL, leads, pipeline value",
];

const TODD_TASKS = [
  "3–5 before/after project photos (best work)",
  "Short iPhone walkthrough video of a finished job",
  "Confirm Google Business Profile is claimed",
  "Confirm priority services to push first",
  "Dedicated phone # for lead routing",
  "Mike confirms $50/day spend commitment",
];

/* ─── SMALL COMPONENTS ───────────────────────────────── */
const Tag = ({ children, color = C.yellow }) => (
  <span style={{
    background: `${color}14`, border: `1px solid ${color}30`,
    color, fontSize: 10, fontWeight: 700, padding: "3px 8px",
    borderRadius: 4, letterSpacing: .5,
  }}>
    {children}
  </span>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
    color: C.orange, fontWeight: 700, marginBottom: 10,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(36px, 6vw, 52px)",
    color: C.text, letterSpacing: 1.5, lineHeight: 1, marginBottom: 10,
  }}>
    {children}
  </h2>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, ...style,
  }}>
    {children}
  </div>
);

/* ─── QUIZ FUNNEL ─────────────────────────────────────── */
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

  const reset = () => {
    setStep(0); setAnswers([]); setForm({ name: "", phone: "", email: "" }); setDone(false);
  };

  return (
    <Card style={{ maxWidth: 540, padding: "36px 32px" }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {QUIZ_STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= step && !done ? C.yellow : done ? C.green : C.border,
            transition: "background .3s",
          }} />
        ))}
      </div>

      {done ? (
        /* ── SUCCESS ── */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 32,
            color: C.green, letterSpacing: 1, marginBottom: 8,
          }}>
            LEAD CAPTURED
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: C.text }}>{form.name}</strong> just dropped into the Airtable pipeline.
            Todd gets a text notification in seconds.
          </p>
          <div style={{
            background: `${C.green}10`, border: `1px solid ${C.green}25`,
            borderRadius: 8, padding: "12px 16px", fontSize: 12,
            color: "#86EFAC", lineHeight: 1.8, marginBottom: 20, textAlign: "left",
          }}>
            {answers.map((a, i) => (
              <div key={i}>
                <span style={{ color: C.muted }}>Q{i + 1}:</span> {a}
              </div>
            ))}
            <div><span style={{ color: C.muted }}>Contact:</span> {form.name} · {form.phone}</div>
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
        <>
          <div style={{ fontSize: 11, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>
            Step {step + 1} of {QUIZ_STEPS.length}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.4, marginBottom: 24 }}>
            {QUIZ_STEPS[step].q}
          </div>

          {step < 3 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {QUIZ_STEPS[step].opts.map((opt, i) => (
                <button key={i} onClick={() => pick(opt)} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "14px 12px",
                  color: C.text, fontSize: 13, fontWeight: 600,
                  fontFamily: "'Syne', sans-serif", cursor: "pointer",
                  textAlign: "left", transition: "all .15s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.yellow;
                    e.currentTarget.style.background = `${C.yellow}10`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            /* ── CONTACT FORM ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "name",  placeholder: "Full Name *"        },
                { key: "phone", placeholder: "Phone Number *"     },
                { key: "email", placeholder: "Email (optional)"   },
              ].map(f => (
                <input key={f.key}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 7, padding: "12px 14px",
                    color: C.text, fontSize: 14,
                    fontFamily: "'Syne', sans-serif",
                    transition: "border-color .2s",
                  }}
                />
              ))}
              <button onClick={submit} style={{
                background: C.yellow, color: C.bg,
                border: "none", borderRadius: 7,
                padding: 14, fontSize: 14, fontWeight: 800,
                cursor: "pointer", fontFamily: "'Syne', sans-serif",
                marginTop: 4, letterSpacing: .5,
              }}>
                GET MY FREE ESTIMATE →
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ─── CHECKLIST ──────────────────────────────────────── */
function Checklist({ items, color }) {
  const [checked, setChecked] = useState([]);
  const toggle = (i) => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i}
          onClick={() => toggle(i)}
          style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            cursor: "pointer", opacity: checked.includes(i) ? .45 : 1,
            transition: "opacity .2s",
          }}
        >
          <div style={{ marginTop: 1, color, flexShrink: 0 }}>
            {checked.includes(i)
              ? <CheckSquare size={16} />
              : <Square size={16} style={{ opacity: .5 }} />}
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
  );
}

/* ─── MAIN APP ───────────────────────────────────────── */
export default function BattlePlan() {
  const [activeSection, setActiveSection] = useState("overview");
  const [roiIdx, setRoiIdx]               = useState(0);
  const refs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.35 }
    );
    Object.values(refs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => refs.current[id]?.scrollIntoView({ behavior: "smooth" });

  const roi = ROI_DATA[roiIdx];

  const sectionStyle = {
    maxWidth: 860, margin: "0 auto",
    padding: "96px 28px 72px",
  };

  return (
    <div style={{
      background: C.bg, color: C.text,
      fontFamily: "'Syne', sans-serif",
      minHeight: "100vh",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(8,8,9,0.9)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px", height: 54,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20, color: C.yellow, letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          G3 HOME REMODEL
          <span style={{
            fontSize: 10, color: C.muted,
            fontFamily: "'Syne', sans-serif",
            letterSpacing: 2, textTransform: "uppercase",
            fontWeight: 700,
          }}>
            BATTLE PLAN — MAR 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {NAV_SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{
                background: active ? `${C.yellow}12` : "transparent",
                border: `1px solid ${active ? `${C.yellow}35` : "transparent"}`,
                color: active ? C.yellow : C.muted,
                padding: "5px 14px", borderRadius: 5,
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                transition: "all .2s", letterSpacing: .3,
              }}>
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — OVERVIEW
      ══════════════════════════════════════════════════ */}
      <section id="overview" ref={el => refs.current.overview = el}
        style={{ ...sectionStyle, paddingTop: 120 }}>

        <SectionLabel>Confidential · SNRG Labs · March 2026</SectionLabel>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(56px, 11vw, 104px)",
          lineHeight: .9, letterSpacing: 2, marginBottom: 24,
        }}>
          <span style={{ color: C.yellow }}>MARKETING</span><br />
          <span style={{ color: C.text  }}>BATTLE PLAN</span>
        </h1>

        <p style={{ fontSize: 16, color: C.muted, maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>
          A production-grade Meta Ads lead generation system built specifically
          for G3 Home Remodel — designed to deliver consistent, qualified
          inbound leads for Todd's crew.
        </p>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 40 }}>
          {[
            { n: "1",   sub: "Hot lead generated",     note: "Tiffany — Yelp organic"    },
            { n: "$0",  sub: "Paid traffic running",    note: "That changes today"         },
            { n: "$50", sub: "Daily budget committed",  note: "Mike's confirmed spend"     },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "22px 18px" }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 52, color: C.yellow, lineHeight: 1,
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 10 }}>{s.sub}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.note}</div>
            </Card>
          ))}
        </div>

        {/* Intel box */}
        <div style={{
          background: `${C.orange}08`,
          border: `1px solid ${C.orange}20`,
          borderRadius: 10, padding: "20px 24px",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
            color: C.orange, fontWeight: 700, marginBottom: 10,
          }}>
            🔍 Field Recon — Competitor Intelligence
          </div>
          <p style={{ fontSize: 14, color: "#B0ADA8", lineHeight: 1.75 }}>
            Reviewed a live Meta ads account from an active home services agency currently
            running paid campaigns in this space. Their exact playbook: static image ads for
            cold audiences, short-form video for retargeting, and quiz-based funnels as the
            primary lead capture mechanism. Three of their clients are generating consistent
            inbound on this model right now. That's the framework we're building from —
            scroll through to see every piece of it.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — QUIZ FUNNEL
      ══════════════════════════════════════════════════ */}
      <section id="funnel" ref={el => refs.current.funnel = el}
        style={{ ...sectionStyle, background: "rgba(17,18,20,0.6)" }}>

        <SectionLabel>Phase 01 — Ad Click → Lead Capture</SectionLabel>
        <SectionTitle>THE QUIZ FUNNEL</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>
          This is exactly what someone sees after clicking our Meta ad.
          It qualifies the lead before Todd ever picks up the phone.
        </p>

        {/* Flow indicators */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 36, flexWrap: "wrap",
        }}>
          {["Meta Ad", "Quiz Landing Page", "Contact Capture", "Airtable Pipeline", "Todd's Phone"].map((step, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag color={i === 0 ? C.orange : i === 4 ? C.green : C.yellow}>{step}</Tag>
              {i < arr.length - 1 && <span style={{ color: C.border }}>→</span>}
            </div>
          ))}
        </div>

        <QuizFunnel />

        <p style={{ fontSize: 13, color: C.muted, marginTop: 20, maxWidth: 520, lineHeight: 1.7 }}>
          By the time Todd calls back, he already knows the project type, budget range,
          and timeline. No cold conversations — just qualified conversations.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — AIRTABLE PIPELINE
      ══════════════════════════════════════════════════ */}
      <section id="pipeline" ref={el => refs.current.pipeline = el}
        style={sectionStyle}>

        <SectionLabel>Phase 02 — Lead Management</SectionLabel>
        <SectionTitle>AIRTABLE CRM PIPELINE</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 36 }}>
          Every lead from the funnel lands here automatically. Todd works the board.
          SNRG monitors performance. No CRM subscription needed at launch.
        </p>

        {/* Kanban */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {KANBAN.map(col => (
            <div key={col.id} style={{ minWidth: 172, flex: "0 0 172px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 12, paddingBottom: 10,
                borderBottom: `2px solid ${col.color}`,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: col.color,
                  textTransform: "uppercase", letterSpacing: 1,
                }}>
                  {col.label}
                </span>
                <span style={{
                  background: `${col.color}18`, color: col.color,
                  borderRadius: 10, padding: "1px 8px",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {col.leads.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.leads.map((lead, i) => (
                  <Card key={i} style={{ padding: "12px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{lead.project}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                      <Tag>{lead.source}</Tag>
                      <span style={{ fontSize: 10, color: C.muted }}>{lead.date}</span>
                    </div>
                  </Card>
                ))}

                {col.leads.length === 0 && (
                  <div style={{
                    border: `1px dashed ${C.border}`, borderRadius: 8,
                    padding: "22px 12px", textAlign: "center",
                    color: C.muted, fontSize: 11,
                  }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Card style={{
          padding: "18px 20px", marginTop: 28,
          background: `${C.yellow}06`,
          border: `1px solid ${C.yellow}18`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.yellow, marginBottom: 6 }}>
            Why Airtable?
          </div>
          <p style={{ fontSize: 13, color: "#B0ADA8", lineHeight: 1.75 }}>
            Free tier handles hundreds of leads. Automations fire SMS + email
            alerts to Todd the second a lead hits. Mike gets a weekly view of
            the full pipeline. No per-seat CRM fees — we upgrade only when
            volume demands it.
          </p>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — THE MATH
      ══════════════════════════════════════════════════ */}
      <section id="math" ref={el => refs.current.math = el}
        style={{ ...sectionStyle, background: "rgba(17,18,20,0.6)" }}>

        <SectionLabel>Phase 03 — ROI Projection</SectionLabel>
        <SectionTitle>THE MATH</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
          Conservative numbers. 20% close rate. $15K average job value.
          Select a budget to see the projection.
        </p>

        {/* Budget selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {ROI_DATA.map((d, i) => {
            const active = i === roiIdx;
            return (
              <button key={i} onClick={() => setRoiIdx(i)} style={{
                background: active ? `${C.yellow}14` : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? `${C.yellow}40` : C.border}`,
                color: active ? C.yellow : C.muted,
                padding: "9px 18px", borderRadius: 6, cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                transition: "all .2s",
              }}>
                {d.budget}
              </button>
            );
          })}
        </div>

        {/* ROI stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Monthly Leads",      value: roi.leads,                          color: C.yellow },
            { label: "Avg. Cost Per Lead",  value: `$${roi.cpl}`,                      color: C.orange },
            { label: "Projected Revenue",   value: `$${(roi.revenue/1000).toFixed(0)}K`, color: C.green  },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "20px 18px" }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 48, color: s.color, lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8, fontWeight: 600 }}>
                {s.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Bar chart */}
        <Card style={{ padding: "24px 16px 12px" }}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROI_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={C.border} vertical={false} />
                <XAxis
                  dataKey="budget"
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "'Syne', sans-serif" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 8, fontFamily: "'Syne', sans-serif",
                  }}
                  labelStyle={{ color: C.yellow, fontWeight: 700 }}
                  itemStyle={{ color: C.text }}
                  formatter={(v, name) =>
                    name === "revenue"
                      ? [`$${v.toLocaleString()}`, "Projected Revenue"]
                      : [v, "Monthly Leads"]
                  }
                />
                <Bar dataKey="leads"   fill={C.yellow} radius={[4,4,0,0]} />
                <Bar dataKey="revenue" fill={C.orange} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>
            Yellow = Monthly Leads · Orange = Projected Revenue · 20% close rate × $15K avg job
          </p>
        </Card>

        {/* Key insight */}
        <div style={{
          display: "flex", gap: 14, alignItems: "flex-start",
          background: `${C.green}08`, border: `1px solid ${C.green}20`,
          borderRadius: 10, padding: "18px 20px", marginTop: 24,
        }}>
          <div style={{ fontSize: 22 }}>📐</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 5 }}>The Core Math</div>
            <p style={{ fontSize: 13, color: "#B0ADA8", lineHeight: 1.7 }}>
              At $50/day, if our CPL lands at $33 and Todd closes 20% of leads,
              each booked job costs us <strong style={{ color: C.text }}>~$165</strong>.
              Against a conservative $15K average job value, that's a
              <strong style={{ color: C.green }}> 90x return</strong> on ad spend.
              That math is undeniable.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — LAUNCH LIST
      ══════════════════════════════════════════════════ */}
      <section id="launch" ref={el => refs.current.launch = el}
        style={sectionStyle}>

        <SectionLabel>Activation — What Happens Next</SectionLabel>
        <SectionTitle>LAUNCH LIST</SectionTitle>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 36 }}>
          Checklist is interactive — click items to mark them done.
          Most of this is on us. We just need a few things from Todd.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { owner: "SNRG",  color: C.yellow, items: SNRG_TASKS  },
            { owner: "TODD",  color: C.orange, items: TODD_TASKS  },
          ].map((col, i) => (
            <Card key={i} style={{ padding: "24px" }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 14, letterSpacing: 3,
                color: col.color, marginBottom: 18,
              }}>
                {col.owner} HANDLES THIS
              </div>
              <Checklist items={col.items} color={col.color} />
            </Card>
          ))}
        </div>

        {/* Phase timeline */}
        <Card style={{ padding: "24px", marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            Timeline
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { phase: "01", label: "Launch",   time: "Week 1–2",   color: C.yellow, desc: "Pixel, funnel, 3 creatives live. $50/day running." },
              { phase: "02", label: "Optimize", time: "Week 3–5",   color: C.orange, desc: "Kill high-CPL ad sets. Add video. Launch retargeting." },
              { phase: "03", label: "Scale",    time: "Month 2+",   color: C.green,  desc: "Proven CPL. Layer in Google LSA. Grow the budget." },
            ].map(p => (
              <div key={p.phase} style={{
                borderLeft: `3px solid ${p.color}`,
                paddingLeft: 14,
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: p.color, fontWeight: 700 }}>
                  PHASE {p.phase} · {p.time}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "4px 0" }}>{p.label}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Final CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${C.yellow}0A, ${C.orange}08)`,
          border: `1px solid ${C.yellow}22`,
          borderRadius: 12, padding: "40px 32px",
          textAlign: "center", marginTop: 32,
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 5vw, 42px)",
            color: C.yellow, letterSpacing: 2, marginBottom: 12,
          }}>
            READY TO PULL THE TRIGGER?
          </div>
          <p style={{ color: C.muted, fontSize: 14, maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Yelp brought Tiffany organically. That won't scale.
            $50/day is a real budget — and competitors in this space
            are spending it right now. We start today, we learn fast,
            and we build Todd a <strong style={{ color: C.text }}>pipeline</strong> — not a prayer.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.yellow, color: C.bg,
            borderRadius: 8, padding: "13px 32px",
            marginTop: 24, fontSize: 14, fontWeight: 800,
            fontFamily: "'Syne', sans-serif", cursor: "pointer",
            letterSpacing: .5,
          }}>
            LET'S LAUNCH <ArrowRight size={16} />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: C.muted }}>
            Built by SNRG Labs · snrglabs.com
          </div>
        </div>
      </section>
    </div>
  );
}
