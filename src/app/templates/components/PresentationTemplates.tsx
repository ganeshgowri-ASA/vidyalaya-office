"use client";

import { useRouter } from "next/navigation";
import { Presentation as PresentationIcon, Eye } from "lucide-react";
import { useState } from "react";

// ── Slide helpers ─────────────────────────────────────────────────────────────
const GP = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
];

let _sid = 0;
function sid() { return `slide_${++_sid}_${Math.random().toString(36).slice(2, 6)}`; }

function mkSlide(
  bg: string,
  elements: { type: string; x: number; y: number; width: number; height: number; content: string; style: Record<string, string | number> }[],
  notes = ""
) {
  return {
    id: sid(),
    layout: "content",
    background: bg,
    elements: elements.map((e) => ({ ...e, id: sid() })),
    notes,
  };
}

function titleSlide(bg: string, title: string, subtitle: string, notes = "") {
  return mkSlide(
    bg,
    [
      { type: "text", x: 80, y: 150, width: 800, height: 90, content: title, style: { fontSize: 44, fontWeight: "bold", color: "#ffffff" } },
      { type: "text", x: 160, y: 270, width: 640, height: 60, content: subtitle, style: { fontSize: 24, color: "#e0e0e0" } },
    ],
    notes
  );
}

function contentSlide(bg: string, heading: string, bullets: string[], notes = "") {
  return mkSlide(
    bg,
    [
      { type: "text", x: 60, y: 30, width: 840, height: 60, content: heading, style: { fontSize: 36, fontWeight: "bold", color: "#ffffff" } },
      { type: "text", x: 60, y: 110, width: 840, height: 380, content: bullets.map((b) => `• ${b}`).join("\n"), style: { fontSize: 20, color: "#e0e0e0" } },
    ],
    notes
  );
}

function twoColumnSlide(bg: string, heading: string, leftBullets: string[], rightBullets: string[], notes = "") {
  return mkSlide(
    bg,
    [
      { type: "text", x: 60, y: 30, width: 840, height: 60, content: heading, style: { fontSize: 36, fontWeight: "bold", color: "#ffffff" } },
      { type: "text", x: 60, y: 110, width: 400, height: 380, content: leftBullets.map((b) => `• ${b}`).join("\n"), style: { fontSize: 18, color: "#e0e0e0" } },
      { type: "text", x: 500, y: 110, width: 400, height: 380, content: rightBullets.map((b) => `• ${b}`).join("\n"), style: { fontSize: 18, color: "#e0e0e0" } },
    ],
    notes
  );
}

// ── 1. Business Pitch Deck (10 slides) ────────────────────────────────────────
const pitchDeck = JSON.stringify([
  titleSlide(GP[7], "NexaFlow", "Revolutionizing Supply Chain Intelligence\nSeed Round — $3M", "Welcome investors. Today we present NexaFlow."),
  contentSlide(GP[6], "The Problem", [
    "Global supply chains lose $1.6T annually to inefficiencies",
    "82% of companies lack real-time visibility across their supply chain",
    "Average lead time uncertainty: ±35% causing excess inventory",
    "Manual processes dominate: 60% still use spreadsheets for planning",
    "Climate disruptions increasing 3x — existing tools can't adapt",
  ], "Set up the problem with data."),
  contentSlide(GP[2], "Our Solution — NexaFlow Platform", [
    "AI-powered predictive supply chain analytics",
    "Real-time visibility across all tiers of suppliers",
    "Automated risk detection and mitigation recommendations",
    "Natural language interface — ask questions, get insights",
    "Carbon footprint tracking integrated into every decision",
  ]),
  contentSlide(GP[3], "Market Opportunity", [
    "Total Addressable Market: $28B (Supply Chain Analytics)",
    "Serviceable Market: $8.5B (Mid-market & Enterprise)",
    "Growing at 17.3% CAGR through 2030",
    "Only 12% market penetration for AI-driven solutions",
    "Regulatory tailwinds: EU supply chain due diligence laws",
  ]),
  contentSlide(GP[0], "Traction & Metrics", [
    "12 paying customers, $480K ARR (growing 25% MoM)",
    "3 Fortune 500 pilots underway — $1.2M pipeline",
    "Net Revenue Retention: 135%",
    "Average contract value: $40K/year",
    "Customer ROI: 8x within first year",
  ]),
  contentSlide(GP[4], "Business Model", [
    "SaaS subscription: $2K-$15K/month based on supply chain complexity",
    "Implementation fee: $10K-$50K (one-time)",
    "Data enrichment add-on: $500/month",
    "Gross margins: 78% (target 85% at scale)",
    "CAC payback period: 9 months",
  ]),
  twoColumnSlide(GP[6], "Competitive Landscape", [
    "Legacy ERP (SAP, Oracle):",
    "  — Slow, expensive, rigid",
    "  — 12-18 month implementations",
    "Point solutions:",
    "  — Fragmented, no AI",
    "  — Single-tier visibility only",
  ], [
    "NexaFlow advantages:",
    "  — Deploy in 2 weeks",
    "  — AI-native architecture",
    "  — Multi-tier visibility",
    "  — 10x lower TCO",
    "  — Carbon tracking built-in",
  ]),
  contentSlide(GP[7], "Team", [
    "CEO: Arjun Mehta — Ex-McKinsey, 15 yrs supply chain",
    "CTO: Dr. Priya Raman — Ex-Google AI, PhD Stanford",
    "VP Sales: David Chen — Scaled SaaS from $0 to $50M ARR",
    "VP Product: Sarah Kim — Ex-Amazon, led Supply Chain AI",
    "Advisory: Former CPO of Maersk, CTO of FourKites",
  ]),
  contentSlide(GP[2], "Financial Projections", [
    "2026: $2.5M ARR — 50 customers",
    "2027: $8M ARR — 150 customers",
    "2028: $22M ARR — 400 customers (break even)",
    "2029: $45M ARR — target Series B",
    "Path to $100M ARR in 5 years",
  ]),
  contentSlide(GP[0], "The Ask — $3M Seed Round", [
    "Engineering & AI R&D: $1.5M (50%)",
    "Sales & Marketing: $900K (30%)",
    "Operations & Infrastructure: $600K (20%)",
    "18-month runway to Series A milestones",
    "Target: 100 customers, $5M ARR, proven unit economics",
  ], "Key ask slide — be confident."),
]);

// ── 2. Quarterly Business Review ──────────────────────────────────────────────
const quarterlyReview = JSON.stringify([
  titleSlide(GP[6], "Q4 2025 Business Review", "Acme Corporation\nPresented to Board of Directors — January 2026"),
  contentSlide(GP[2], "Executive Summary", [
    "Record revenue quarter: $18.2M (+22% YoY, +8% QoQ)",
    "Net income: $4.8M — highest margin quarter at 26.4%",
    "Launched 3 new products, entered 2 new markets",
    "Employee NPS improved from 62 to 71",
    "On track for FY2026 targets across all KPIs",
  ]),
  twoColumnSlide(GP[7], "Financial Performance", [
    "Revenue: $18.2M (+22% YoY)",
    "Gross Margin: 68% (+3pts)",
    "EBITDA: $5.8M (32% margin)",
    "Free Cash Flow: $3.2M",
    "Cash Position: $22M",
  ], [
    "ARR: $52M (+35% YoY)",
    "Net Revenue Retention: 122%",
    "CAC Payback: 11 months",
    "LTV/CAC: 4.8x",
    "Rule of 40: 57 (healthy)",
  ]),
  contentSlide(GP[3], "Revenue by Segment", [
    "Enterprise SaaS: $10.8M (59%) — up 28% YoY",
    "Professional Services: $3.6M (20%) — up 15% YoY",
    "SMB Self-Serve: $2.4M (13%) — up 45% YoY (fastest growing)",
    "Data & Analytics: $1.4M (8%) — new segment, exceeding plan",
    "Geographic: 65% Americas, 25% EMEA, 10% APAC",
  ]),
  contentSlide(GP[0], "Customer Metrics", [
    "Total customers: 1,450 (+280 net new this quarter)",
    "Enterprise accounts (>$100K): 52 (up from 38)",
    "Logo churn: 2.8% (annual) — industry best-in-class",
    "NPS: 74 (+6 from Q3, +12 from Q4 last year)",
    "Top expansion: FinServ sector +42%, Healthcare +38%",
  ]),
  contentSlide(GP[4], "Product & Engineering", [
    "Shipped 28 features (vs 22 planned) — 127% velocity",
    "Platform uptime: 99.98% (SLA target: 99.95%)",
    "Launched Aurora AI assistant — 40% adoption in first month",
    "Mobile app v2.0 released — 4.7★ rating",
    "Technical debt reduction: 15% of sprint capacity allocated",
  ]),
  contentSlide(GP[1], "Team & Culture", [
    "Headcount: 215 (+18 this quarter, 0 unplanned departures)",
    "12-month voluntary attrition: 8% (industry avg: 18%)",
    "DEI: 42% women in leadership (up from 35%)",
    "Launched mentorship program — 80 pairs matched",
    "Glassdoor rating: 4.5★ (up from 4.2★)",
  ]),
  contentSlide(GP[6], "Risks & Challenges", [
    "RISK: Enterprise deal cycles lengthening (+15 days avg)",
    "MITIGATION: Introduced self-serve trial for enterprise prospects",
    "RISK: Key competitor raised $50M — aggressive pricing",
    "MITIGATION: Doubled down on product differentiation & customer success",
    "RISK: APAC expansion slower than planned",
    "MITIGATION: Hired regional GM, partnering with local SIs",
  ]),
  contentSlide(GP[2], "Q1 2026 Priorities", [
    "Revenue target: $19.5M (+7% QoQ growth)",
    "Launch AI-powered analytics dashboard",
    "Expand to Japan and Australia markets",
    "Hire 25 new team members (Engineering + Sales focus)",
    "Complete SOC 2 Type II certification",
    "Begin Series C preparation",
  ]),
  contentSlide(GP[7], "FY2026 Annual Targets", [
    "Revenue: $82M (+42% YoY)",
    "Net Income: $16M (20% margin)",
    "Customers: 2,200 total",
    "Headcount: 300 by year-end",
    "Product: Launch 4 major platform capabilities",
    "Market: Presence in 15 countries",
  ]),
]);

// ── 3. Product Launch ─────────────────────────────────────────────────────────
const productLaunch = JSON.stringify([
  titleSlide(GP[8], "Introducing Prism Analytics", "See Your Data in a New Light\nProduct Launch — March 2026"),
  contentSlide(GP[7], "Why Prism?", [
    "Data teams spend 70% of their time on data prep, not insights",
    "Existing BI tools require SQL expertise — excludes 80% of teams",
    "Average time-to-insight: 2 weeks (should be 2 minutes)",
    "Companies with data-driven cultures are 23x more likely to acquire customers",
    "The gap between data and decisions has never been wider",
  ]),
  contentSlide(GP[2], "Product Vision", [
    "Ask questions in plain English — get visual answers instantly",
    "AI understands your business context, not just your data",
    "Collaborative analytics — share, annotate, discuss insights",
    "Real-time dashboards that build themselves",
    "From spreadsheet to boardroom presentation in one click",
  ]),
  twoColumnSlide(GP[3], "Key Features", [
    "Natural Language Queries",
    "  Ask: 'What drove Q4 revenue?'",
    "  Get: Interactive charts + narrative",
    "",
    "Smart Dashboards",
    "  Auto-generated based on your data",
    "  Real-time refresh every 30 seconds",
  ], [
    "Anomaly Detection",
    "  AI spots trends before you do",
    "  Proactive alerts via Slack/email",
    "",
    "Collaboration Hub",
    "  Comment on any data point",
    "  Share insights as live links",
  ]),
  contentSlide(GP[0], "Architecture & Integrations", [
    "300+ data source connectors (databases, APIs, SaaS tools)",
    "Sub-second query performance on datasets up to 10B rows",
    "SOC 2 Type II, HIPAA, GDPR compliant",
    "SSO/SAML, row-level security, audit logging",
    "SDK for custom integrations and embedded analytics",
  ]),
  contentSlide(GP[4], "Beta Program Results", [
    "42 beta customers across 8 industries",
    "Average time-to-insight reduced from 14 days to 3 minutes",
    "89% of users created their first dashboard within 10 minutes",
    "NPS: 78 (vs industry average of 32 for BI tools)",
    "\"This is what BI should have been all along\" — VP Analytics, Fortune 100",
  ]),
  contentSlide(GP[6], "Pricing & Packaging", [
    "Starter: Free — Up to 3 users, 1 data source, 5 dashboards",
    "Team: $49/user/month — Unlimited sources, 50 dashboards, Slack integration",
    "Business: $99/user/month — Unlimited everything, API access, priority support",
    "Enterprise: Custom — Dedicated instance, SLA, custom connectors, on-prem option",
    "Annual billing: 20% discount | Volume discounts available",
  ]),
  contentSlide(GP[7], "Go-to-Market Strategy", [
    "Product-led growth: Free tier → Team → Business conversion funnel",
    "Content: 30 blog posts, 10 video tutorials, 4 webinars at launch",
    "Partnerships: Snowflake, Databricks, dbt certified integrations",
    "Events: Launch keynote (2,000 registrations), 6 industry conferences",
    "PR: Exclusives with TechCrunch, VentureBeat, Analytics India Magazine",
  ]),
  contentSlide(GP[2], "Launch Timeline", [
    "March 15: Public launch announcement & free tier opens",
    "March 20: Launch keynote event (virtual + SF in-person)",
    "April 1: Team & Business tiers available",
    "April 15: Enterprise pilot program opens",
    "May 1: Partner ecosystem goes live",
    "June 1: Mobile app release (iOS & Android)",
  ]),
  contentSlide(GP[8], "Get Started Today", [
    "Sign up free: prism-analytics.io/start",
    "Watch the demo: prism-analytics.io/demo",
    "Read the docs: docs.prism-analytics.io",
    "Contact sales: sales@prism-analytics.io",
    "Join our community: community.prism-analytics.io",
  ]),
]);

// ── 4. Educational / Training Deck ────────────────────────────────────────────
const trainingDeck = JSON.stringify([
  titleSlide(GP[0], "Introduction to Data Science", "A Comprehensive Training Workshop\nDuration: 3 Days | Instructor: Dr. Ananya Kapoor"),
  contentSlide(GP[7], "Course Overview", [
    "Day 1: Foundations — Statistics, Python, Data Wrangling",
    "Day 2: Machine Learning — Supervised & Unsupervised Methods",
    "Day 3: Applied Projects — Real-world Case Studies",
    "Format: 60% hands-on labs, 30% lectures, 10% discussion",
    "Prerequisites: Basic programming knowledge, laptop with Python 3.9+",
  ]),
  contentSlide(GP[2], "Learning Objectives", [
    "Understand the data science lifecycle end-to-end",
    "Perform exploratory data analysis with pandas and matplotlib",
    "Build and evaluate classification and regression models",
    "Apply clustering and dimensionality reduction techniques",
    "Communicate findings through effective visualizations",
  ]),
  contentSlide(GP[3], "Module 1: Statistical Foundations", [
    "Descriptive statistics: mean, median, mode, standard deviation",
    "Probability distributions: Normal, Binomial, Poisson",
    "Hypothesis testing: t-tests, chi-square, ANOVA",
    "Correlation vs causation — real-world examples",
    "Lab: Analyzing COVID-19 vaccination data with Python",
  ]),
  contentSlide(GP[4], "Module 2: Data Wrangling with Python", [
    "pandas DataFrame operations: filter, group, merge, pivot",
    "Handling missing data: imputation strategies",
    "Feature engineering: encoding, scaling, transformation",
    "Working with time series data",
    "Lab: Cleaning and preparing a messy e-commerce dataset",
  ]),
  twoColumnSlide(GP[0], "Module 3: Data Visualization", [
    "Principles of effective viz:",
    "  Edward Tufte's data-ink ratio",
    "  Choosing the right chart type",
    "  Color theory for data",
    "  Accessibility considerations",
  ], [
    "Tools & libraries:",
    "  matplotlib for static plots",
    "  seaborn for statistical viz",
    "  plotly for interactive charts",
    "  Dashboard design principles",
  ]),
  contentSlide(GP[6], "Module 4: Supervised Learning", [
    "Linear & logistic regression — theory and implementation",
    "Decision trees and random forests",
    "Support vector machines (SVM)",
    "Model evaluation: accuracy, precision, recall, F1, ROC-AUC",
    "Lab: Predicting customer churn for a telecom company",
  ]),
  contentSlide(GP[1], "Module 5: Unsupervised Learning", [
    "K-means clustering and elbow method",
    "Hierarchical clustering and dendrograms",
    "PCA for dimensionality reduction",
    "Association rules and market basket analysis",
    "Lab: Customer segmentation for a retail chain",
  ]),
  contentSlide(GP[7], "Module 6: Model Deployment", [
    "From notebook to production: best practices",
    "Building APIs with FastAPI / Flask",
    "Model monitoring and drift detection",
    "A/B testing for model evaluation",
    "Ethics in AI: bias detection and fairness metrics",
  ]),
  contentSlide(GP[2], "Capstone Project", [
    "Teams of 3-4 will tackle a real business problem",
    "Dataset: 2M rows of e-commerce transaction data",
    "Tasks: EDA → Feature Engineering → Modeling → Presentation",
    "Evaluation: Technical rigor (40%), Business impact (30%), Presentation (30%)",
    "Winning team presents to company leadership",
  ]),
  contentSlide(GP[3], "Assessment & Certification", [
    "Daily quizzes: 10 questions each (30% of final score)",
    "Lab submissions: Jupyter notebooks graded on completeness (30%)",
    "Capstone project: Team presentation (40%)",
    "Passing score: 70% overall",
    "Certificate valid for 2 years, renewable with continuing education",
  ]),
  contentSlide(GP[0], "Resources & Next Steps", [
    "Course materials: Available on internal learning portal",
    "Recommended books: ISLR, Hands-On ML, Python for Data Analysis",
    "Practice: Kaggle competitions, DataCamp exercises",
    "Community: Join #data-science Slack channel",
    "Advanced courses: Deep Learning (Q2), NLP (Q3), MLOps (Q4)",
  ]),
]);

// ── 5. Company Introduction ───────────────────────────────────────────────────
const companyIntro = JSON.stringify([
  titleSlide(GP[6], "Welcome to Vidyalaya Technologies", "Empowering Businesses Through Innovation\nEstablished 2018 | Bangalore, India"),
  contentSlide(GP[7], "Who We Are", [
    "A leading B2B SaaS company serving 2,000+ businesses globally",
    "Mission: Make enterprise software accessible, intelligent, and delightful",
    "220+ team members across 4 offices (Bangalore, Mumbai, Singapore, London)",
    "Backed by Tier 1 VCs: $45M raised across Series A, B, and C",
    "Recognized as a Gartner Cool Vendor 2025",
  ]),
  contentSlide(GP[2], "Our Products", [
    "Vidyalaya Office — Complete office productivity suite",
    "Vidyalaya Flow — Workflow automation platform",
    "Vidyalaya Connect — Team collaboration & messaging",
    "Vidyalaya Analytics — Business intelligence dashboard",
    "All products: Cloud-native, AI-powered, mobile-ready",
  ]),
  contentSlide(GP[3], "By the Numbers", [
    "2,000+ enterprise customers in 35 countries",
    "$52M Annual Recurring Revenue",
    "99.99% platform uptime (last 12 months)",
    "4.7/5 average customer satisfaction score",
    "3.2M daily active users across all products",
  ]),
  twoColumnSlide(GP[0], "Our Values", [
    "Customer Obsession",
    "  Every decision starts with the customer",
    "",
    "Innovation First",
    "  20% time for experimentation",
    "",
    "Radical Transparency",
    "  Open books, open doors, open minds",
  ], [
    "Inclusive Excellence",
    "  Diverse teams build better products",
    "",
    "Sustainable Growth",
    "  Profitable & responsible scaling",
    "",
    "Continuous Learning",
    "  $5K annual learning budget per person",
  ]),
  contentSlide(GP[4], "Leadership Team", [
    "CEO: Vikram Sundaram — Ex-Microsoft, 20 yrs enterprise software",
    "CTO: Dr. Meera Krishnan — Ex-Google, PhD in Distributed Systems",
    "CFO: Rahul Agarwal — Ex-Goldman Sachs, CFA",
    "CPO: Lisa Chen — Ex-Salesforce, led 3 products from 0 to $100M",
    "CHRO: Priya Nair — Ex-Infosys, built teams of 5,000+",
  ]),
  contentSlide(GP[6], "Awards & Recognition", [
    "Gartner Cool Vendor 2025 — Workplace Applications",
    "Deloitte Technology Fast 500 — 3 consecutive years",
    "Great Place to Work Certified — 2024, 2025",
    "NASSCOM Emerge 50 — Top Emerging Product Company",
    "Red Herring Top 100 — Asia 2024",
  ]),
  contentSlide(GP[7], "Customer Success Stories", [
    "Tata Motors: 40% reduction in document processing time",
    "HDFC Bank: Consolidated 12 tools into Vidyalaya suite",
    "Flipkart: 3x faster cross-team collaboration",
    "Apollo Hospitals: HIPAA-compliant document management",
    "Infosys: Deployed to 15,000 employees in 6 weeks",
  ]),
  contentSlide(GP[2], "What's Next — 2026 Roadmap", [
    "Q1: AI Copilot for all products (launched March 2026)",
    "Q2: Enterprise API marketplace",
    "Q3: Vidyalaya Mobile Suite v3.0",
    "Q4: On-premise deployment option for regulated industries",
    "Ongoing: SOC 2 Type II, ISO 27001, HIPAA compliance",
  ]),
  contentSlide(GP[3], "Let's Connect", [
    "Website: vidyalaya.tech",
    "Sales: sales@vidyalaya.tech | +91 80 4567 8900",
    "Partnerships: partners@vidyalaya.tech",
    "Careers: careers.vidyalaya.tech (25+ open roles)",
    "Follow us: @VidyalayaTech on LinkedIn, Twitter",
  ]),
]);

// ── 6. Marketing Plan ─────────────────────────────────────────────────────────
const marketingPlan = JSON.stringify([
  titleSlide(GP[8], "2026 Marketing Strategy", "From Awareness to Revenue\nMarketing Team | Annual Planning"),
  contentSlide(GP[7], "Marketing Objectives", [
    "Increase brand awareness by 60% (measured by branded search volume)",
    "Generate 5,000 Marketing Qualified Leads (MQLs)",
    "Achieve $8M in marketing-sourced pipeline",
    "Reduce Customer Acquisition Cost (CAC) by 20%",
    "Grow social media following to 100K across platforms",
  ]),
  contentSlide(GP[2], "Target Audience", [
    "Primary: CTOs & IT Directors at mid-market companies (500-5000 employees)",
    "Secondary: Startup founders & operations leaders",
    "Tertiary: Individual knowledge workers & team leads",
    "Key industries: Technology, Financial Services, Healthcare, Manufacturing",
    "Geography: India (60%), SEA (20%), Middle East (10%), Europe (10%)",
  ]),
  twoColumnSlide(GP[0], "Channel Strategy", [
    "Digital Channels:",
    "  SEO/Content: 35% of budget",
    "  Paid Search (Google): 20%",
    "  LinkedIn Ads: 15%",
    "  Email Marketing: 5%",
  ], [
    "Offline/Events:",
    "  Industry conferences: 10%",
    "  Webinars & workshops: 8%",
    "  PR & analyst relations: 5%",
    "  Community building: 2%",
  ]),
  contentSlide(GP[3], "Content Strategy", [
    "Blog: 4 posts/week (2 SEO, 1 thought leadership, 1 product)",
    "Video: Bi-weekly YouTube series \"Office Productivity Masterclass\"",
    "Podcast: Monthly interviews with industry leaders",
    "Whitepapers: 6 research reports on productivity & AI trends",
    "Case studies: 12 customer success stories (1 per month)",
  ]),
  contentSlide(GP[4], "Campaign Calendar", [
    "Q1: \"Future of Work\" campaign — AI productivity focus",
    "Q2: Product launch campaign — Prism Analytics",
    "Q3: Back-to-business campaign — enterprise push",
    "Q4: Year-end deals + \"Productivity Awards\" event",
    "Ongoing: Monthly webinars, weekly newsletters, daily social",
  ]),
  contentSlide(GP[6], "Budget Allocation — $2.4M Annual", [
    "Content & SEO: $840K (35%) — Writers, designers, tools",
    "Paid Acquisition: $840K (35%) — Google, LinkedIn, retargeting",
    "Events & Sponsorships: $360K (15%) — 8 conferences, 24 webinars",
    "Brand & Creative: $240K (10%) — Video production, design",
    "Tools & Technology: $120K (5%) — HubSpot, analytics, testing",
  ]),
  contentSlide(GP[7], "KPIs & Measurement", [
    "Website traffic: 500K monthly visitors (from 200K)",
    "Lead conversion: 3% visitor → MQL, 25% MQL → SQL",
    "Content: 50K monthly blog readers, 10K email subscribers",
    "Social: 100K followers, 5% engagement rate",
    "ROI: 5:1 marketing-sourced revenue to marketing spend",
  ]),
  contentSlide(GP[2], "Team & Resources", [
    "Current team: 12 marketers (Content: 4, Growth: 3, Brand: 2, Events: 2, Ops: 1)",
    "Hiring plan: +4 in Q1 (SEO specialist, video editor, demand gen, analyst)",
    "Agency partners: PR agency, paid media agency, design studio",
    "Freelancers: 6 content writers, 2 videographers",
    "Training: Each team member gets $2K learning budget",
  ]),
  contentSlide(GP[8], "Next Steps", [
    "Week 1: Finalize Q1 campaign creative and messaging",
    "Week 2: Launch updated website and blog redesign",
    "Week 3: Begin paid campaigns (Google + LinkedIn)",
    "Week 4: Host first webinar of the year",
    "Monthly: Review KPIs, adjust channel mix, report to leadership",
  ]),
]);

// ── 7. Research / Thesis Defense ──────────────────────────────────────────────
const thesisDefense = JSON.stringify([
  titleSlide(GP[7], "Federated Learning for Privacy-Preserving Healthcare Analytics", "Ph.D. Thesis Defense\nCandidate: Ravi Shankar | Advisor: Prof. Anitha Kumari\nDepartment of Computer Science, IIT Bangalore"),
  contentSlide(GP[6], "Research Motivation", [
    "Healthcare data is highly sensitive — strict privacy regulations (HIPAA, GDPR)",
    "Traditional ML requires centralized data — impractical for hospitals",
    "400+ hospitals willing to collaborate but cannot share patient data",
    "Federated learning promises collaborative ML without data movement",
    "Gap: Existing FL approaches struggle with heterogeneous medical data",
  ]),
  contentSlide(GP[2], "Research Questions", [
    "RQ1: How can federated learning handle non-IID medical data distributions across hospitals?",
    "RQ2: What aggregation strategies minimize accuracy loss while maximizing privacy?",
    "RQ3: Can differential privacy guarantees be maintained with clinical-grade accuracy?",
    "RQ4: How does communication efficiency scale with the number of participating institutions?",
  ]),
  contentSlide(GP[0], "Literature Review", [
    "McMahan et al. (2017): FedAvg — foundational but assumes IID data",
    "Li et al. (2020): FedProx — addresses heterogeneity, limited medical validation",
    "Rieke et al. (2020): FL in medicine — comprehensive survey, identified 12 open challenges",
    "Sheller et al. (2020): Brain tumor segmentation — first large-scale medical FL study",
    "Gap: No work addresses all four challenges simultaneously in clinical settings",
  ]),
  contentSlide(GP[3], "Proposed Framework: MedFed", [
    "Hierarchical aggregation: Hospital → Regional → Global model updates",
    "Adaptive weighting: Contributions weighted by data quality, not just quantity",
    "Privacy module: Rényi differential privacy (ε=1.0) with secure aggregation",
    "Communication: Gradient compression reduces bandwidth by 85%",
    "Novel: Dynamic clustering of hospitals with similar patient demographics",
  ]),
  twoColumnSlide(GP[4], "Methodology", [
    "Datasets (3 benchmarks):",
    "  MIMIC-III: 58K ICU patients",
    "  eICU: 200K patients, 208 hospitals",
    "  ChestX-ray14: 112K images",
    "",
    "Baselines compared:",
    "  FedAvg, FedProx, SCAFFOLD",
    "  Centralized (upper bound)",
    "  Local-only (lower bound)",
  ], [
    "Evaluation metrics:",
    "  AUROC, F1-score, sensitivity",
    "  Privacy budget (ε, δ)",
    "  Communication rounds",
    "  Convergence speed",
    "",
    "Statistical tests:",
    "  Paired t-test (p < 0.05)",
    "  Wilcoxon signed-rank test",
  ]),
  contentSlide(GP[6], "Key Results", [
    "MedFed achieves 94.2% AUROC on mortality prediction (vs 96.1% centralized)",
    "Only 1.9% accuracy gap vs centralized — smallest in literature",
    "Privacy guarantee: ε = 1.0 (strong privacy) with < 3% accuracy loss",
    "Communication: 85% fewer bytes transferred vs FedAvg",
    "Convergence: 40% fewer rounds needed vs FedProx",
    "Validated across 15 simulated hospital sites with real demographics",
  ]),
  contentSlide(GP[7], "Contributions", [
    "C1: Novel hierarchical FL framework for heterogeneous medical data",
    "C2: Adaptive weighting scheme — first to use data quality metrics in FL",
    "C3: Proven that ε=1.0 DP is achievable with clinical-grade accuracy",
    "C4: Open-source implementation (2.1K GitHub stars, 340 forks)",
    "Publications: 3 top-tier (NeurIPS, ICML, Nature Medicine), 2 workshops",
  ]),
  contentSlide(GP[2], "Limitations & Future Work", [
    "Limitation: Tested on retrospective data — prospective validation needed",
    "Limitation: Maximum 15 sites — scalability to 100+ sites untested",
    "Future: Real-world deployment with 5 partner hospitals (IRB approved)",
    "Future: Extension to medical imaging (CT, MRI) beyond chest X-rays",
    "Future: Integration with hospital EHR systems (FHIR standard)",
  ]),
  contentSlide(GP[0], "Thank You — Questions?", [
    "Thesis document: Available in university repository",
    "Code: github.com/ravishankar/medfed",
    "Publications list: scholar.google.com/citations?user=example",
    "Contact: ravi.shankar@iitb.ac.in",
    "Special thanks to: Advisor, committee, lab colleagues, funding agencies",
  ]),
]);

// ── 8. Project Status Update ──────────────────────────────────────────────────
const projectStatus = JSON.stringify([
  titleSlide(GP[2], "Project Phoenix — Status Update", "Sprint 18 Review | Week of March 10-14, 2026\nProject Lead: Neha Kapoor"),
  contentSlide(GP[7], "Project Overview", [
    "Objective: Migrate legacy monolith to microservices architecture",
    "Timeline: 9 months (July 2025 – March 2026)",
    "Budget: $1.2M (currently at $980K — 82% utilized)",
    "Team: 18 engineers, 3 QA, 2 DevOps, 1 PM",
    "Current Phase: Phase 4 of 5 — Integration Testing",
  ]),
  twoColumnSlide(GP[6], "Sprint 18 Summary", [
    "Completed (32 of 38 points):",
    "  ✅ Auth service migration (8 pts)",
    "  ✅ Payment gateway integration (8 pts)",
    "  ✅ User profile API v2 (5 pts)",
    "  ✅ Notification service deploy (5 pts)",
    "  ✅ E2E test suite: auth flow (3 pts)",
    "  ✅ Monitoring dashboards (3 pts)",
  ], [
    "In Progress (6 points):",
    "  🔄 Order processing migration (5 pts)",
    "  🔄 Data migration scripts (1 pt)",
    "",
    "Rolled Over:",
    "  None — clean sprint",
    "",
    "Velocity: 32 pts (avg: 30)",
  ]),
  contentSlide(GP[3], "Overall Project Progress", [
    "Services migrated: 14 of 18 (78%) — on track for March 31 deadline",
    "API endpoints converted: 245 of 280 (87.5%)",
    "Test coverage: 91% (target: 90%) ✅",
    "Performance benchmarks: All services within latency targets",
    "Zero production incidents related to migrated services",
  ]),
  contentSlide(GP[4], "Blockers & Risks", [
    "🔴 BLOCKER: Legacy database schema conflict in Order service",
    "  → Impact: 2-day delay on order processing migration",
    "  → Action: DBA team working on schema reconciliation (ETA: March 17)",
    "🟡 RISK: Third-party payment API deprecation on April 1",
    "  → Mitigation: New API integration complete, testing in progress",
    "🟢 RESOLVED: CI/CD pipeline timeout issues (fixed March 12)",
  ]),
  contentSlide(GP[0], "Key Metrics & Health", [
    "Schedule: GREEN — 2 days ahead of baseline plan",
    "Budget: GREEN — $220K remaining (18% buffer, target was 15%)",
    "Quality: GREEN — 0 P1 bugs, 3 P2 bugs (all assigned)",
    "Team morale: GREEN — Sprint retro score 4.2/5",
    "Stakeholder satisfaction: GREEN — Weekly demos well received",
  ]),
  contentSlide(GP[6], "Next Sprint (Sprint 19) Plan", [
    "Complete order processing migration (5 pts, carry-over)",
    "Migrate inventory management service (8 pts)",
    "Migrate reporting & analytics service (8 pts)",
    "Load testing all migrated services (5 pts)",
    "Documentation update (3 pts)",
    "Sprint goal: Reach 16/18 services migrated",
  ]),
  contentSlide(GP[7], "Timeline to Completion", [
    "Sprint 19 (Mar 17-28): Inventory + Reporting services",
    "Sprint 20 (Mar 31-Apr 11): Final 2 services + integration",
    "Week of Apr 14: Full regression testing",
    "Week of Apr 21: UAT with stakeholders",
    "April 28: Production cutover (planned Go-Live)",
    "May 1-15: Hypercare period with rollback plan ready",
  ]),
  contentSlide(GP[2], "Decisions Needed", [
    "DECISION 1: Approve 2-week hypercare period (DevOps on-call rotation)",
    "DECISION 2: Legacy system decommission date — May 31 vs June 30?",
    "DECISION 3: Budget request for additional load testing tools ($15K)",
    "FYI: Architecture review board presentation scheduled for March 20",
    "Next status update: March 21, 2026 — same time",
  ]),
]);

// ── Template metadata ─────────────────────────────────────────────────────────
const presentationTemplateList = [
  { name: "Business Pitch Deck", desc: "10-slide investor pitch with problem, solution, market, traction, financials, and ask", color: "#1a237e", slides: 10 },
  { name: "Quarterly Business Review", desc: "Comprehensive QBR with financials, customer metrics, product updates, and roadmap", color: "#0d47a1", slides: 10 },
  { name: "Product Launch", desc: "Product announcement with features, beta results, pricing, GTM strategy, and timeline", color: "#b71c1c", slides: 10 },
  { name: "Training & Education", desc: "12-slide training workshop with modules, labs, exercises, and certification", color: "#1565c0", slides: 12 },
  { name: "Company Introduction", desc: "Company overview with products, team, values, customer stories, and roadmap", color: "#004d40", slides: 10 },
  { name: "Marketing Plan", desc: "Annual marketing strategy with channels, content plan, budget, and KPIs", color: "#e65100", slides: 10 },
  { name: "Research / Thesis Defense", desc: "Academic thesis defense with methodology, results, contributions, and Q&A", color: "#311b92", slides: 10 },
  { name: "Project Status Update", desc: "Sprint review with progress, blockers, metrics, next steps, and decisions needed", color: "#006064", slides: 9 },
];

const presentationContent: Record<string, string> = {
  "Business Pitch Deck": pitchDeck,
  "Quarterly Business Review": quarterlyReview,
  "Product Launch": productLaunch,
  "Training & Education": trainingDeck,
  "Company Introduction": companyIntro,
  "Marketing Plan": marketingPlan,
  "Research / Thesis Defense": thesisDefense,
  "Project Status Update": projectStatus,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PresentationTemplates() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const handleUse = (name: string) => {
    const data = presentationContent[name];
    if (data) {
      localStorage.setItem("vidyalaya-ppt-template", data);
      router.push("/presentation");
    }
  };

  return (
    <div>
      <h2
        className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--muted-foreground)" }}
      >
        <PresentationIcon size={16} />
        Presentation Templates
        <span
          className="ml-1 rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          {presentationTemplateList.length}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {presentationTemplateList.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border px-4 py-3 transition-all hover:border-[var(--primary)] group"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)" }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-sm font-medium group-hover:text-[var(--primary)]">{t.name}</span>
            </div>
            <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
              {t.desc}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1">
                <button
                  onClick={() => handleUse(t.name)}
                  className="px-2 py-1 rounded text-[10px] text-white"
                  style={{ backgroundColor: t.color }}
                >
                  Use Template
                </button>
                <button
                  onClick={() => setPreview(preview === t.name ? null : t.name)}
                  className="px-2 py-1 rounded text-[10px] border"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <Eye size={10} className="inline mr-1" />
                  Preview
                </button>
              </div>
              <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
                {t.slides} slides
              </span>
            </div>
            {preview === t.name && (
              <div className="mt-2 space-y-1">
                {(() => {
                  const slides = JSON.parse(presentationContent[t.name]) as { background: string; elements: { content: string; style: Record<string, string | number> }[] }[];
                  return slides.slice(0, 4).map((slide, i) => (
                    <div
                      key={i}
                      className="rounded p-2 text-[9px]"
                      style={{ background: slide.background, color: "#ffffff" }}
                    >
                      {slide.elements.slice(0, 2).map((el, j) => (
                        <div
                          key={j}
                          className="truncate"
                          style={{ fontWeight: el.style.fontWeight === "bold" ? "bold" : "normal", fontSize: j === 0 ? "10px" : "8px" }}
                        >
                          {el.content.split("\n")[0]}
                        </div>
                      ))}
                    </div>
                  ));
                })()}
                <div className="text-center text-[9px] pt-1" style={{ color: "var(--muted-foreground)" }}>
                  +{JSON.parse(presentationContent[t.name]).length - 4} more slides
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
