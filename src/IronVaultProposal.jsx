import { useEffect, useState } from 'react'

const heroMeta = [
  ['Platform', 'GoHighLevel'],
  ['Traffic', 'Meta · Google · TikTok'],
  ['Launch', 'November 1, 2026'],
  ['Target', 'Presale + Royalty Buyers'],
]

const opportunityCards = [
  {
    icon: '🎯',
    title: 'Lead Quality',
    body:
      'Traffic is filtered before it ever reaches the sales floor. The system prioritizes intent, not volume.',
  },
  {
    icon: '⚙️',
    title: 'Conversion Control',
    body:
      'Every lead enters a defined process — follow-up, pipeline tracking, and rep visibility. No guesswork. No missed opportunities.',
  },
  {
    icon: '📊',
    title: 'Revenue Visibility',
    body:
      'Every dollar can be traced back to its source. Decisions are made based on performance, not assumptions.',
  },
]

const pillars = [
  {
    phase: 'Foundation',
    name: 'Controlled Conversion Environment',
    items: [
      'All paid traffic routes through a controlled conversion environment',
      'Lead capture happens immediately — no friction, no confusion',
      'Trust is established before the call, not during it',
      'Every action is tracked and attributed at entry',
    ],
    outcome:
      'Higher opt-in rates per dollar spent. Every visitor who leaves without converting enters a retargeting pipeline automatically.',
  },
  {
    phase: 'Traffic',
    name: 'Intent-Based Traffic Acquisition',
    items: [
      'Traffic is sourced based on intent, not guesswork',
      'Each channel is tracked independently and compared against revenue',
      'Budget follows performance — not preference',
      'Creative is tested continuously and scaled based on conversion data',
    ],
    outcome:
      'Consistent, trackable lead flow across multiple channels — every dollar accountable, every decision backed by data.',
  },
  {
    phase: 'Infrastructure',
    name: 'CRM — Structured Pipeline Control',
    items: [
      'Every lead enters a structured pipeline immediately',
      'Source attribution is attached at entry and never lost',
      'Follow-up is automatic, immediate, and consistent',
      'No lead exists without a defined next action',
    ],
    outcome:
      'Zero leads fall through the cracks. Every rep has full context. Every follow-up is enforced.',
  },
  {
    phase: 'Revenue Recovery',
    name: 'Retargeting — Recapture Paid Traffic',
    items: [
      'Every visitor who leaves without converting enters a retargeting sequence automatically',
      'Leads who did not respond are re-engaged through coordinated SMS and ad exposure',
      'Objection-based retargeting addresses specific hesitations surfaced on calls',
      'Past buyers activate a referral loop — expanding reach at zero acquisition cost',
    ],
    outcome:
      'Revenue already paid for is recovered. Retargeting delivers 3–5x the conversion rate of cold traffic at a fraction of the cost.',
  },
  {
    phase: 'Intelligence Loop',
    name: 'Sales Floor Feedback — The System Learns',
    items: [
      'Sales outcomes directly influence traffic strategy',
      'Ad messaging evolves based on real objections from calls',
      'Lead quality is measured by conversion, not volume',
      'The system improves itself through continuous feedback',
    ],
    outcome:
      'Every week the machine gets sharper. Traffic, messaging, and conversion tighten in a loop that compounds.',
  },
]

const metrics = [
  ['Cost Per Lead', 'How much we are paying per opt-in by channel and campaign', 'GHL + Ads Manager'],
  ['Contact Rate', '% of leads that actually pick up the phone — broken down by source', 'GHL Pipeline'],
  ['Appointment Rate', '% of contacted leads that agree to a full presentation', 'GHL Calendar'],
  ['Close Rate', '% of presentations that turn into presale purchases', 'GHL Pipeline'],
  ['Cost Per Closed Deal', 'Total ad spend ÷ total customers — the number that matters most', 'Weekly Report'],
  ['Speed to First Touch', 'Time between opt-in and first rep contact — goal is under 5 minutes', 'GHL Automation Log'],
  ['Revenue by Source', 'Which channel is generating actual collected revenue, not just leads', 'GHL + Weekly Reconcile'],
]

const timeline = [
  {
    dot: 'W1–2',
    phase: 'Phase 1 — Foundation',
    title: 'Build the Infrastructure',
    items: [
      'GoHighLevel full setup: pipeline stages, automations, source tagging, appointment calendar',
      'Dedicated landing page built and tested on mobile',
      'Call tracking numbers assigned and routed to the right reps',
      'Facebook Pixel + Google Tag + Meta CAPI installed and verified',
      'Speed-to-lead automation: 60-second SMS + email sequence live and tested',
    ],
  },
  {
    dot: 'W3–4',
    phase: 'Phase 2 — Ignition',
    title: 'Launch Traffic + Retargeting',
    items: [
      'Meta ad campaigns live: 3–4 creative variations testing different hooks and CTAs',
      'Google Search campaigns live: intent-based keywords for presale crypto buyers',
      'Retargeting audiences built and warming up from Day 1',
      'First weekly report delivered — baseline metrics established',
      'Rep disposition tagging live and enforced on every call',
    ],
  },
  {
    dot: 'W5–8',
    phase: 'Phase 3 — Optimization',
    title: 'Scale What’s Working',
    items: [
      'Cut underperforming creative, double budget on winners',
      'Retargeting converting — cost per close dropping week over week',
      'Sales floor objection data feeding into new ad creative angles',
      'TikTok layer added once Meta + Google data supports expansion',
      'Referral program activation for existing presale buyers',
    ],
  },
  {
    dot: 'Q3+',
    phase: 'Phase 4 — Scale',
    title: 'Pre-Launch Push to November',
    items: [
      'Full system running on all channels with a proven cost per close',
      'VIP/Partner Pump program with dedicated campaigns and landing pages',
      'Royalty program traffic campaigns targeting passive income audiences',
      'Pre-launch urgency: token availability countdown, exchange listing hype',
      'Community growth loop: buyers referring buyers through the tracked referral system',
    ],
  },
]

const ghlCards = [
  ['🏗️', 'Pipeline Architecture', 'Custom pipeline stages mapped to the IVT sales process. Every lead has a clear next step. Nothing sits without an owner and a follow-up action.'],
  ['⚡', 'Automated Follow-Up', '60-second SMS + email on every new lead. 5-day nurture sequence for no-responses. Appointment reminders. All automated, all tracked, running 24/7.'],
  ['📞', 'Call Center Integration', 'Call tracking, disposition tagging, rep performance dashboards. The call center and the ad campaigns talk to each other through real data.'],
  ['🏷️', 'Source Attribution', 'Every lead tagged at entry — platform, campaign, ad, landing page. Revenue traced back to its origin. Every dollar of ad spend is accountable.'],
  ['📅', 'Appointment Booking', 'Integrated GHL calendar so leads can self-book a call. No back-and-forth. Confirmation + reminder sequence fires automatically. Show rate improves immediately.'],
  ['📈', 'Weekly Dashboard', 'One view: all KPIs, all channels, all rep performance. Delivered every Monday before the week starts. Decisions made on data, not feelings.'],
]

const visionCards = [
  ['🚀', 'Before November', 'Presale pipeline full. Royalty program members locked in. VIP/Partner network activated. Retargeting turning fence-sitters into buyers. Exchange launch arrives with an existing community ready to move.'],
  ['🌐', 'After November', 'The same system pivots to post-launch acquisition. New audiences: people who want to buy IVT on the open market. The infrastructure built for presale becomes the infrastructure for everything that comes next.'],
]

const navLinks = [
  ['opportunity', 'The Opportunity'],
  ['system', 'The System'],
  ['metrics', 'What We Track'],
  ['timeline', 'Rollout Plan'],
  ['ghl', 'GoHighLevel Setup'],
  ['vision', 'The Vision'],
]

function SectionHeader({ number, title }) {
  return (
    <div className="section-header">
      <span className="section-number">{number}</span>
      <h2 className="section-title">{title}</h2>
      <div className="section-line" />
    </div>
  )
}

function FeatureCard({ icon, title, body }) {
  return (
    <article className="feature-card">
      <div className="fc-icon" aria-hidden="true">{icon}</div>
      <h3 className="fc-title">{title}</h3>
      <p className="fc-body">{body}</p>
    </article>
  )
}

function Pillar({ index, phase, name, items, outcome, isOpen, onToggle }) {
  return (
    <article className={`pillar${isOpen ? ' open' : ''}`}>
      <button
        type="button"
        className="pillar-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="pillar-num">{String(index + 1).padStart(2, '0')}</div>
        <div className="pillar-meta">
          <div className="pillar-phase">{phase}</div>
          <div className="pillar-name">{name}</div>
        </div>
        <div className="pillar-toggle" aria-hidden="true">+</div>
      </button>
      <div className="pillar-body">
        <div className="pillar-content">
          <ul className="pillar-items">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="pillar-outcome">
            <div className="out-label">Result</div>
            <p>{outcome}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function IronVaultProposal() {
  const [openPillar, setOpenPillar] = useState(0)

  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll('.reveal'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )

    reveals.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section className="hero">
        <div className="vault-ring" />
        <div className="vault-ring" />
        <div className="vault-ring" />
        <div className="hero-eyebrow">Iron Vault Token — Acquisition Infrastructure</div>
        <h1 className="hero-title">
          Revenue Comes From Systems
          <span>Not Traffic</span>
        </h1>
        <p className="hero-sub">Common Wealth Ventures LLC | Lead Generation · Conversion · Revenue Control</p>
        <div className="hero-divider" />
        <p className="hero-tagline">
          Right now, traffic is optional. Structure is not.
          Without a controlled acquisition system, every dollar spent is guesswork.
          With the right system in place, revenue becomes measurable, repeatable, and scalable.
        </p>
        <div className="hero-meta">
          {heroMeta.map(([label, value]) => (
            <div className="hero-meta-item" key={label}>
              <span className="hero-meta-label">{label}</span>
              <span className="hero-meta-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <nav className="toc" aria-label="Section navigation">
        <div className="toc-inner">
          {navLinks.map(([id, label]) => (
            <a href={`#${id}`} className="toc-link" key={id}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main>
        <section className="section reveal" id="opportunity">
          <SectionHeader number="01" title="The Opportunity" />
          <div className="vision-card">
            <p>
              The opportunity is not the token. The opportunity is the system around it.
              Right now, demand exists — but it is not structured, tracked, or optimized.
              That means revenue is inconsistent, attribution is unclear, and scaling becomes risky.
              Fix the system, and everything changes:
              more qualified leads, higher contact rates, more consistent closes, predictable growth.
              This is not about getting more traffic.
              This is about controlling what happens after the lead comes in.
            </p>
            <div className="vc-label">🎯 The Mission</div>
          </div>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value">Controlled</div>
              <div className="stat-label">Lead Flow</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Measured</div>
              <div className="stat-label">Conversion</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Tracked</div>
              <div className="stat-label">Attribution</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Scalable</div>
              <div className="stat-label">Revenue</div>
            </div>
          </div>

          <div className="grid-3">
            {opportunityCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section className="section reveal" id="system">
          <SectionHeader number="02" title="The 5-Pillar Acquisition System" />
          <div className="vision-card vision-card-muted">
            <p>
              Five layers. Each one feeds the next. Together they form a closed loop where
              every lead is sourced, tracked, followed up, and measured — and the data
              flows back to make the next dollar more effective than the last.
            </p>
            <div className="vc-label">Click each pillar to expand</div>
          </div>

          {pillars.map((pillar, index) => (
            <Pillar
              key={pillar.name}
              index={index}
              isOpen={openPillar === index}
              onToggle={() => setOpenPillar(openPillar === index ? -1 : index)}
              {...pillar}
            />
          ))}
        </section>

        <section className="section reveal" id="metrics">
          <SectionHeader number="03" title="What We Track Every Week" />
          <div className="vision-card vision-card-muted compact-card">
            <p>
              These numbers expose where revenue is won, where it leaks, and where spend
              should move next. Every decision is backed by data — no guessing, no gut feelings.
            </p>
            <div className="vc-label">Full visibility — weekly dashboard</div>
          </div>

          <div className="table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>What It Tells Us</th>
                  <th>Where It Lives</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(([metric, description, location]) => (
                  <tr key={metric}>
                    <td>{metric}</td>
                    <td>{description}</td>
                    <td>{location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section reveal" id="timeline">
          <SectionHeader number="04" title="Rollout Plan" />
          <div className="timeline">
            {timeline.map((phase) => (
              <div className="timeline-item" key={phase.title}>
                <div className="timeline-dot">{phase.dot}</div>
                <div className="timeline-content">
                  <div className="timeline-phase">{phase.phase}</div>
                  <div className="timeline-title">{phase.title}</div>
                  <ul className="timeline-list">
                    {phase.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section reveal" id="ghl">
          <SectionHeader number="05" title="GoHighLevel — Full Build-Out" />
          <div className="grid-3">
            {ghlCards.map(([icon, title, body]) => (
              <FeatureCard key={title} icon={icon} title={title} body={body} />
            ))}
          </div>
        </section>

        <section className="section reveal" id="vision">
          <SectionHeader number="06" title="The Bigger Picture" />
          <div className="close-section">
            <div className="close-label">🔐 What This Produces</div>
            <p className="close-headline">Revenue becomes predictable when the system is controlled.</p>
            <p className="close-sub">
              The difference between growth and scale is structure.
              Once lead flow, conversion, and attribution are aligned,
              every decision becomes clearer.
              Spend increases with confidence.
              Conversion improves with data.
              Revenue scales without guesswork.
              That is the system being built here.
            </p>
          </div>

          <div className="grid-2 vision-grid">
            {visionCards.map(([icon, title, body]) => (
              <FeatureCard key={title} icon={icon} title={title} body={body} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>
          Iron Vault Token | <span>Acquisition Infrastructure</span> | Common Wealth Ventures LLC |
          {' '}2026
        </p>
      </footer>
    </>
  )
}