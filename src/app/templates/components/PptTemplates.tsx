"use client";

import { useRouter } from "next/navigation";
import { Presentation as PresentationIcon } from "lucide-react";

const GP = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

function mkSlide(bg: string, elements: { type: string; x: number; y: number; width: number; height: number; content: string; style: Record<string, string | number> }[], notes = '') {
  return { id: Math.random().toString(36).slice(2), layout: 'content', background: bg, elements: elements.map(e => ({ ...e, id: Math.random().toString(36).slice(2) })), notes };
}

function titleSlide(bg: string, title: string, subtitle: string) {
  return mkSlide(bg, [
    { type: 'text', x: 80, y: 160, width: 800, height: 80, content: title, style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' } },
    { type: 'text', x: 160, y: 280, width: 640, height: 50, content: subtitle, style: { fontSize: 24, color: '#e0e0e0' } },
  ]);
}

function contentSlide(bg: string, heading: string, bullets: string[]) {
  return mkSlide(bg, [
    { type: 'text', x: 60, y: 30, width: 840, height: 60, content: heading, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } },
    { type: 'text', x: 60, y: 110, width: 840, height: 380, content: bullets.map(b => `• ${b}`).join('\n'), style: { fontSize: 20, color: '#e0e0e0' } },
  ]);
}

const pptContent: Record<string, string> = {
  "Business Proposal (10 slides)": JSON.stringify([
    titleSlide(GP[0], 'Strategic Business Proposal', 'Partnership for Digital Transformation'),
    contentSlide(GP[1], 'Executive Summary', ['$10B addressable market opportunity', 'Proven technology with 200+ enterprise clients', 'Projected 300% ROI within 24 months']),
    contentSlide(GP[2], 'Market Opportunity', ['Digital transformation market growing 23% CAGR', 'Only 15% of mid-market companies fully digital', 'Regulatory tailwinds driving adoption']),
    contentSlide(GP[3], 'Our Solution', ['AI-powered automation platform', 'No-code workflow builder', 'Enterprise-grade security (SOC 2, ISO 27001)', '99.99% uptime SLA with global CDN']),
    contentSlide(GP[4], 'Competitive Advantage', ['3x faster implementation than competitors', 'Proprietary ML models trained on 10M+ workflows', 'Only solution with real-time collaboration']),
    contentSlide(GP[5], 'Case Studies', ['Acme Corp: 45% cost reduction in 6 months', 'TechStart: 200% productivity improvement', 'FinGroup: $2M annual savings on compliance']),
    contentSlide(GP[0], 'Implementation Plan', ['Phase 1 (Wk 1-4): Discovery & assessment', 'Phase 2 (Wk 5-12): Configuration & integration', 'Phase 3 (Wk 13-16): Training & go-live', 'Phase 4 (Ongoing): Optimization & support']),
    contentSlide(GP[2], 'Pricing & Investment', ['Starter: $5K/mo (up to 50 users)', 'Professional: $15K/mo (up to 250 users)', 'Enterprise: Custom (unlimited users)', 'Implementation: $50K one-time']),
    contentSlide(GP[3], 'Financial Projections', ['Year 1: Break-even on implementation cost', 'Year 2: 150% ROI, $500K operational savings', 'Year 3: 300% cumulative ROI', 'NPV over 5 years: $2.8M']),
    contentSlide(GP[4], 'Next Steps & Ask', ['Schedule technical deep-dive (this week)', 'Pilot program with 2 departments (4 weeks)', 'Executive review and decision (Week 6)', 'Full deployment begins (Week 8)']),
  ]),

  "Training Deck (15 slides)": JSON.stringify([
    titleSlide(GP[2], 'Professional Development Training', 'Mastering Modern Project Management'),
    contentSlide(GP[0], 'Course Overview', ['Duration: 2-day intensive workshop', 'Format: Lectures + hands-on exercises + case studies', 'Certification upon completion', 'Materials: Digital workbook + reference guide']),
    contentSlide(GP[3], 'Learning Objectives', ['Understand Agile, Scrum, and Kanban frameworks', 'Apply risk management techniques', 'Master stakeholder communication', 'Use data-driven decision making']),
    contentSlide(GP[4], 'Module 1: Foundations', ['Project lifecycle phases', 'Scope, time, cost triangle', 'Work breakdown structures (WBS)', 'RACI matrix for accountability']),
    contentSlide(GP[5], 'Module 2: Agile Methodologies', ['Scrum ceremonies and artifacts', 'Sprint planning and estimation', 'Kanban boards and WIP limits', 'Scaled Agile Framework (SAFe) overview']),
    contentSlide(GP[0], 'Module 3: Planning & Estimation', ['Story points vs hours estimation', 'Planning poker technique', 'Critical path analysis', 'Buffer management strategies']),
    contentSlide(GP[1], 'Module 4: Risk Management', ['Risk identification techniques', 'Qualitative vs quantitative analysis', 'Risk response strategies (TARA)', 'Monte Carlo simulation basics']),
    contentSlide(GP[2], 'Module 5: Stakeholder Management', ['Stakeholder mapping and analysis', 'Communication plans and cadences', 'Managing expectations effectively', 'Conflict resolution frameworks']),
    contentSlide(GP[3], 'Module 6: Metrics & Reporting', ['Velocity and burndown charts', 'Lead time and cycle time', 'Cumulative flow diagrams', 'Executive dashboard design']),
    contentSlide(GP[4], 'Module 7: Tools & Technology', ['Jira / Linear / Asana comparison', 'CI/CD integration for teams', 'Confluence documentation standards', 'Slack/Teams workflow automation']),
    contentSlide(GP[5], 'Exercise 1: Sprint Planning', ['Scenario: E-commerce platform feature', 'Create user stories from requirements', 'Estimate using planning poker', 'Build your sprint backlog']),
    contentSlide(GP[0], 'Exercise 2: Risk Workshop', ['Identify risks for a migration project', 'Create a risk register with scoring', 'Develop mitigation strategies', 'Present findings to the group']),
    contentSlide(GP[1], 'Exercise 3: Retrospective', ['What went well in our simulated sprint?', 'What could be improved?', 'Action items for improvement', 'Team commitment going forward']),
    contentSlide(GP[2], 'Certification Requirements', ['Attend all sessions (min 90%)', 'Complete all 3 exercises', 'Pass final assessment (70%+)', 'Submit improvement action plan']),
    contentSlide(GP[3], 'Resources & Next Steps', ['Recommended reading list (10 books)', 'Online communities to join', 'Monthly practice group sessions', 'Advanced certification pathway']),
  ]),

  "Weekly Meeting (8 slides)": JSON.stringify([
    titleSlide(GP[2], 'Weekly Team Update', 'Week of March 10-14, 2026'),
    contentSlide(GP[0], 'Agenda', ['Sprint progress review (10 min)', 'Key accomplishments (10 min)', 'Blockers & risks (10 min)', 'Cross-team updates (5 min)', 'Action items & next week plan (10 min)', 'Open discussion (15 min)']),
    contentSlide(GP[3], 'Sprint 24 Progress', ['Total story points: 42/55 completed (76%)', 'Auth module: 100% complete, in QA', 'Dashboard analytics: 60% complete, on track', 'Payment bug fix: Resolved and deployed', 'API v3 migration: Deferred to Sprint 25']),
    contentSlide(GP[4], 'Key Accomplishments', ['Shipped auth module to staging (Mike)', 'Resolved 12 customer-reported bugs (Team)', 'Completed security audit preparation (David)', 'Onboarded 3 new team members (Sarah)', 'Published API documentation v2.5 (Alex)']),
    contentSlide(GP[5], 'Blockers & Risks', ['BLOCKED: Third-party payment API update delayed', 'RISK: Design review needed for mobile checkout', 'RISK: Server capacity may not handle Black Friday', 'MITIGATED: Hired contractor for frontend backlog']),
    contentSlide(GP[1], 'Cross-Team Updates', ['Marketing: Product launch campaign starts Mar 20', 'Sales: 3 enterprise POCs in progress', 'Support: Ticket volume up 15%, hiring 2 more agents', 'Infrastructure: Kubernetes upgrade planned Mar 22']),
    contentSlide(GP[0], 'Action Items', ['Mike: Complete auth integration tests by Wed', 'Sarah: Schedule design review for mobile by Thu', 'David: Submit capacity planning proposal by Fri', 'Alex: Set up monitoring for new API endpoints', 'Team: Review and update Sprint 25 backlog']),
    contentSlide(GP[2], 'Next Week Focus', ['Priority 1: Complete dashboard analytics feature', 'Priority 2: Begin mobile checkout redesign', 'Priority 3: Start API v3 migration planning', 'Friday: Sprint 24 retrospective at 3 PM']),
  ]),

  "Financial Quarterly (12 slides)": JSON.stringify([
    titleSlide(GP[0], 'Financial Report Q4 2025', 'Board of Directors Quarterly Review'),
    contentSlide(GP[2], 'Financial Highlights', ['Revenue: $12.4M (+18% YoY, +5% QoQ)', 'Net Income: $4.2M (34% margin)', 'ARR: $38.2M (+34% YoY)', 'Free Cash Flow: $2.8M', 'Cash on hand: $15.2M']),
    contentSlide(GP[3], 'Revenue Breakdown', ['SaaS Platform: $7.8M (63%)', 'Professional Services: $2.6M (21%)', 'Data Analytics: $1.2M (10%)', 'Support & Training: $0.8M (6%)', 'YoY growth in every segment']),
    contentSlide(GP[4], 'Profitability Analysis', ['Gross Margin: 72% (+3pts YoY)', 'Operating Margin: 28% (+5pts YoY)', 'EBITDA: $3.8M (31% margin)', 'CAC Payback: 10 months (improved from 14)', 'LTV/CAC ratio: 5.2x']),
    contentSlide(GP[5], 'Customer Metrics', ['Total customers: 1,250 (+25% YoY)', 'Enterprise (>$100K): 45 accounts', 'Net revenue retention: 118%', 'Logo churn: 3.2% (annual)', 'NPS: 72 (+8 pts from Q3)']),
    contentSlide(GP[0], 'Expense Analysis', ['R&D: $3.2M (26% of revenue) — 15 new hires', 'Sales & Marketing: $2.8M (23%) — 3 new markets', 'G&A: $1.2M (10%) — office expansion', 'Infrastructure: $0.8M (6%) — cloud optimization']),
    contentSlide(GP[1], 'Balance Sheet Summary', ['Total Assets: $52M (+21% YoY)', 'Total Liabilities: $18M', 'Stockholder Equity: $34M', 'Current Ratio: 3.2x', 'Debt-to-Equity: 0.53']),
    contentSlide(GP[2], 'Cash Flow Statement', ['Operating CF: +$3.5M', 'Investing CF: -$1.8M (DataViz acquisition)', 'Financing CF: -$0.5M (debt service)', 'Net Change: +$1.2M', 'Runway: 18+ months at current burn']),
    contentSlide(GP[3], 'Year-over-Year Comparison', ['Revenue: $48.5M vs $39.8M (+22%)', 'Customers: 1,250 vs 1,000 (+25%)', 'Employees: 210 vs 165 (+27%)', 'Products shipped: 48 features vs 32', 'Markets: 12 countries vs 9']),
    contentSlide(GP[4], 'FY2026 Outlook', ['Revenue target: $65M (+34%)', 'Net income target: $13M (20% margin)', 'Hiring plan: 50 new roles', 'R&D investment: $12M (AI focus)', 'Geographic expansion: APAC, LATAM']),
    contentSlide(GP[5], 'Key Risks & Mitigations', ['Competition: Increased R&D investment', 'Macro environment: Diversified revenue streams', 'Talent retention: Enhanced comp & equity', 'Cybersecurity: SOC 2 + ISO 27001 certified']),
    contentSlide(GP[0], 'Questions & Discussion', ['Financial detail appendix available on request', 'Investor relations: ir@company.com', 'Next board meeting: June 15, 2026', 'Annual shareholder meeting: September 2026']),
  ]),

  "Product Launch (10 slides)": JSON.stringify([
    titleSlide(GP[1], 'Introducing Aurora AI', 'The Next Generation of Intelligent Automation'),
    contentSlide(GP[0], 'Why Aurora AI?', ['Enterprises spend $3.2T annually on manual processes', '73% of workflows can be automated with AI', 'Current solutions require months of implementation', 'Aurora AI deploys in days, not months']),
    contentSlide(GP[2], 'Key Features', ['Natural language workflow creation', 'Self-learning process optimization', 'Real-time anomaly detection & alerting', 'Cross-platform integration (300+ connectors)', 'Enterprise governance & compliance built-in']),
    contentSlide(GP[3], 'How It Works', ['1. Connect your data sources and tools', '2. Describe workflows in plain English', '3. Aurora AI builds and optimizes automatically', '4. Monitor, adjust, and scale effortlessly']),
    contentSlide(GP[4], 'Early Access Results', ['Beta program: 50 enterprise customers', '92% average process accuracy from day one', '68% reduction in manual processing time', '4.8/5.0 user satisfaction rating']),
    contentSlide(GP[5], 'Customer Testimonial', ['"Aurora AI automated our entire invoice processing pipeline in 3 days. What took our team 40 hours/week now runs automatically with 99.5% accuracy." — CFO, Fortune 500 Company']),
    contentSlide(GP[0], 'Pricing Tiers', ['Starter: $2,500/mo — Up to 50 workflows, 5 users', 'Professional: $7,500/mo — Unlimited workflows, 25 users', 'Enterprise: Custom — Dedicated support, SSO, SLA', 'All plans: 14-day free trial, no credit card required']),
    contentSlide(GP[2], 'Launch Timeline', ['March 15: Public beta opens', 'April 1: General availability', 'May 1: Enterprise features release', 'June 1: Partner ecosystem launch', 'Q3 2026: Mobile app release']),
    contentSlide(GP[3], 'Go-to-Market Strategy', ['Launch event: 500+ attendees (virtual + in-person)', 'Content campaign: 20 blog posts, 5 webinars', 'Partner program: 25 system integrators', 'PR: Coverage in TechCrunch, Forbes, WSJ']),
    contentSlide(GP[4], 'Get Started Today', ['Visit: aurora-ai.com/try', 'Schedule a demo: aurora-ai.com/demo', 'Sales: sales@aurora-ai.com', 'Partner inquiries: partners@aurora-ai.com']),
  ]),
};

const pptTemplates = [
  { name: "Business Proposal (10 slides)", desc: "Complete proposal with market analysis, solution, pricing, financials" },
  { name: "Training Deck (15 slides)", desc: "Comprehensive training course with modules, exercises, certification" },
  { name: "Weekly Meeting (8 slides)", desc: "Team status update with sprint progress, blockers, action items" },
  { name: "Financial Quarterly (12 slides)", desc: "Board-level quarterly review with P&L, metrics, outlook" },
  { name: "Product Launch (10 slides)", desc: "Product announcement with features, pricing, GTM strategy" },
];

export default function PptTemplates() {
  const router = useRouter();

  const handleUse = (name: string) => {
    const data = pptContent[name];
    if (data) {
      localStorage.setItem("vidyalaya-ppt-template", data);
      router.push("/presentation");
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
        <PresentationIcon size={16} />
        PPT Templates
        <span className="ml-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}>
          {pptTemplates.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
        {pptTemplates.map((t) => (
          <button
            key={t.name}
            onClick={() => handleUse(t.name)}
            className="rounded-lg border px-4 py-3 text-left transition-all hover:scale-[1.02] hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
