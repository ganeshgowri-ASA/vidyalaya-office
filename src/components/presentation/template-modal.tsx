'use client';

import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import {
  usePresentationStore,
  GRADIENT_PRESETS,
  type Slide,
} from '@/store/presentation-store';
import { generateId } from '@/lib/utils';

type Category = 'All' | 'Business' | 'Sales' | 'Education' | 'Marketing' | 'Finance';

const CATEGORIES: Category[] = ['All', 'Business', 'Sales', 'Education', 'Marketing', 'Finance'];

interface TemplateDefinition {
  name: string;
  description: string;
  category: Category[];
  slides: Slide[];
}

function makeSlide(
  bg: string,
  elements: Slide['elements'],
  notes = '',
): Slide {
  return {
    id: generateId(),
    layout: 'content',
    background: bg,
    elements,
    notes,
  };
}

function textEl(
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  fontSize: number,
  opts: { bold?: boolean; color?: string } = {},
) {
  return {
    id: generateId(),
    type: 'text' as const,
    x,
    y,
    width: w,
    height: h,
    content,
    style: {
      fontSize,
      fontWeight: opts.bold ? 'bold' : 'normal',
      color: opts.color || '#ffffff',
    },
  };
}

function g(i: number) {
  return GRADIENT_PRESETS[i % GRADIENT_PRESETS.length];
}

const TEMPLATES: TemplateDefinition[] = [
  /* ── Startup Pitch (original 5 slides) ─────────────────────────────── */
  {
    name: 'Startup Pitch',
    description: '5 slides: Problem, Solution, Market, Traction, Ask',
    category: ['Sales', 'Business'],
    slides: [
      makeSlide(g(0), [
        textEl(80, 140, 800, 80, 'Your Startup Name', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Revolutionizing [Industry] with [Innovation]', 24),
        textEl(80, 340, 800, 40, 'Seed Round · March 2026', 18, { color: '#c0c0ff' }),
      ], 'Introduce the company and set the stage.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'The Problem', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• 70% of businesses face [pain point]\n• Current solutions are expensive, slow, or unreliable\n• $50B market with no clear leader\n• Customers need a modern, AI-powered approach', 22),
      ], 'Explain the problem with data and empathy.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Our Solution', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• AI-driven platform that cuts costs by 60%\n• Simple integration with existing workflows\n• Real-time analytics dashboard\n• Enterprise-grade security and compliance', 22),
      ], 'Show product screenshots if available.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Traction & Market', 36, { bold: true }),
        textEl(60, 110, 400, 380, '• 50+ paying customers\n• $2M ARR growing 20% MoM\n• 95% retention rate\n• Featured in TechCrunch', 22),
        textEl(500, 110, 400, 380, '• TAM: $50B\n• SAM: $12B\n• SOM: $500M (Year 3)\n• Growing at 25% CAGR', 22),
      ], 'Lead with your strongest metrics.'),
      makeSlide(g(4), [
        textEl(80, 140, 800, 80, 'The Ask', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Raising $5M Series A', 28),
        textEl(80, 320, 800, 100, 'Funds will be used for: Engineering (40%), Sales (30%), Marketing (20%), Operations (10%)', 20, { color: '#e0e0e0' }),
      ], 'Be specific about how funds will be used.'),
    ],
  },

  /* ── Business Proposal (expanded 12 slides) ────────────────────────── */
  {
    name: 'Business Proposal',
    description: '12 slides: Cover, Executive Summary, Background, Problem, Solution, Methodology, Timeline, Team, Budget, Case Studies, Terms, Next Steps',
    category: ['Business', 'Sales'],
    slides: [
      makeSlide(g(0), [
        textEl(80, 120, 800, 80, 'Business Proposal', 48, { bold: true }),
        textEl(80, 220, 800, 50, 'Prepared for [Client Name]', 24),
        textEl(80, 290, 800, 40, '[Your Company] · March 2026', 18, { color: '#d0c0e0' }),
      ], 'Cover slide — customize with client and company names.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Executive Summary', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Objective: Deliver [solution] to address [client challenge]\n• Scope: End-to-end implementation across [areas]\n• Timeline: [X] weeks from kickoff to go-live\n• Investment: $[amount] with flexible payment terms\n• Expected ROI: [X]% improvement within 6 months', 20),
      ], 'Concise overview for decision-makers.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Company Background', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Founded in [year], headquartered in [city]\n• [X]+ years of experience in [industry]\n• Served [X]+ clients including [notable names]\n• Award-winning team of [X]+ professionals\n• Certified in [relevant certifications]', 20),
      ], 'Build credibility and trust.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Problem Statement', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Current pain points identified during discovery:\n  - [Pain point 1]: costing $[X] annually\n  - [Pain point 2]: reducing efficiency by [X]%\n  - [Pain point 3]: impacting customer satisfaction\n• Root cause analysis indicates systemic gaps in [area]\n• Without intervention, projected losses of $[X] over [timeframe]', 20),
      ], 'Frame the problem with data and urgency.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Proposed Solution', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Solution overview: [brief description]\n• Key components:\n  - Component A: [description]\n  - Component B: [description]\n  - Component C: [description]\n• Technology stack: [tools/platforms]\n• Integration with existing systems: [details]\n• Expected outcomes: [measurable results]', 20),
      ], 'Connect the solution directly to the stated problems.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Methodology', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Phase 1 — Discovery & Assessment (2 weeks)\n  Stakeholder interviews, systems audit, requirements doc\n• Phase 2 — Design & Architecture (3 weeks)\n  Wireframes, technical design, approval gates\n• Phase 3 — Build & Iterate (6-8 weeks)\n  Agile sprints, weekly demos, continuous feedback\n• Phase 4 — Testing & QA (2 weeks)\n  UAT, performance testing, security review\n• Phase 5 — Deployment & Support (ongoing)\n  Go-live, monitoring, knowledge transfer', 18),
      ], 'Show a structured, proven approach.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Timeline & Milestones', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Week 1-2:   Kickoff & requirements gathering\nWeek 3-5:   Design approval & architecture sign-off\nWeek 6-8:   Sprint 1 — Core module development\nWeek 9-11:  Sprint 2 — Integrations & advanced features\nWeek 12-13: UAT & bug fixes\nWeek 14:    Go-live & handover\nWeek 15-16: Post-launch support & optimization\n\nKey milestone: Mid-project demo at Week 8', 18),
      ], 'Visual timeline recommended — add a diagram element.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Our Team', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Project Lead\n[Name] — [X] years experience\n\nTechnical Architect\n[Name] — [X] years experience\n\nLead Developer\n[Name] — [X] years experience', 18),
        textEl(500, 110, 400, 380, 'UX Designer\n[Name] — [X] years experience\n\nQA Lead\n[Name] — [X] years experience\n\nAccount Manager\n[Name] — your single point of contact', 18),
      ], 'Showcase the expertise of the delivery team.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Budget & Pricing', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Option A: Standard\n$75,000\n• Core features\n• 3 months support\n• Documentation\n• 2 training sessions', 20),
        textEl(500, 110, 400, 380, 'Option B: Premium\n$120,000\n• All features + AI module\n• 12 months support\n• Full training program\n• Dedicated account manager', 20),
      ], 'Present tiered pricing for flexibility.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Case Studies & References', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Case Study 1: [Company A]\n• Challenge: [description]\n• Solution delivered: [description]\n• Result: [X]% improvement in [metric]\n\nCase Study 2: [Company B]\n• Challenge: [description]\n• Solution delivered: [description]\n• Result: $[X] saved annually\n\nReferences available upon request.', 18),
      ], 'Social proof builds confidence.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Terms & Conditions', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Payment schedule: 30% upfront, 40% at midpoint, 30% on delivery\n• Proposal valid for 30 days from date of issue\n• Intellectual property: All deliverables become client property\n• Confidentiality: Mutual NDA in effect\n• Change requests: Handled via formal change order process\n• Warranty: 90-day defect resolution at no additional cost\n• Termination: 30-day notice with payment for work completed', 18),
      ], 'Keep terms clear and fair.'),
      makeSlide(g(3), [
        textEl(80, 130, 800, 80, 'Next Steps', 48, { bold: true }),
        textEl(80, 240, 800, 180, '1. Review and approve this proposal\n2. Sign the service agreement & NDA\n3. Schedule kickoff meeting (within 1 week)\n4. Begin Discovery phase\n\nContact: [name] · [email] · [phone]', 22),
      ], 'Clear call to action with contact details.'),
    ],
  },

  /* ── Quarterly Review (original 5 slides) ──────────────────────────── */
  {
    name: 'Quarterly Review',
    description: '5 slides: Title, KPIs, Highlights, Challenges, Next Quarter',
    category: ['Business', 'Finance'],
    slides: [
      makeSlide(g(3), [
        textEl(80, 140, 800, 80, 'Q1 2026 Review', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Department / Team Name', 24),
      ]),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Key Performance Indicators', 36, { bold: true }),
        textEl(60, 110, 400, 380, '• Revenue: $4.2M (+15% QoQ)\n• New Customers: 120\n• Churn Rate: 2.1%\n• NPS Score: 72', 22),
        textEl(500, 110, 400, 380, '• MRR: $1.4M\n• CAC: $850\n• LTV: $12,000\n• LTV/CAC: 14.1x', 22),
      ]),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Q1 Highlights', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Launched v2.0 with AI features\n• Expanded to 3 new markets\n• Hired 12 key team members\n• Achieved SOC 2 compliance\n• Partnership with [Major Company]', 22),
      ]),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Challenges & Learnings', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Infrastructure scaling issues (resolved)\n• Longer enterprise sales cycles than expected\n• Need more technical documentation\n• Competition increasing in core segment', 22),
      ]),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Q2 2026 Priorities', 36, { bold: true }),
        textEl(60, 110, 840, 380, '1. Launch mobile app (target: April)\n2. Expand sales team by 5 reps\n3. Achieve $5M quarterly revenue\n4. ISO 27001 certification\n5. Reduce churn below 1.5%', 22),
      ]),
    ],
  },

  /* ── Training & Teaching Deck (expanded 9 slides) ──────────────────── */
  {
    name: 'Training & Teaching Deck',
    description: '9 slides: Title, Agenda, Prerequisites, Module 1, Module 2, Exercise, Takeaways, Assessment, Resources',
    category: ['Education'],
    slides: [
      makeSlide(g(0), [
        textEl(80, 120, 800, 80, 'Training: [Topic Name]', 48, { bold: true }),
        textEl(80, 230, 800, 50, 'Duration: 2 hours · Level: Intermediate', 22),
        textEl(80, 300, 800, 40, 'Instructor: [Your Name]', 18, { color: '#c0c0ff' }),
        textEl(80, 360, 800, 40, '[Date] · [Location / Virtual]', 18, { color: '#c0c0ff' }),
      ], 'Title slide — set expectations for duration and level.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Agenda', 36, { bold: true }),
        textEl(60, 110, 840, 380, '1. Prerequisites & Setup (10 min)\n2. Module 1 — Foundations (25 min)\n3. Module 2 — Advanced Concepts (25 min)\n4. Hands-on Exercise (30 min)\n5. Key Takeaways (10 min)\n6. Assessment / Quiz (10 min)\n7. Resources & Further Reading (5 min)\n8. Q&A (5 min)', 20),
      ], 'Provide a clear roadmap for the session.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Prerequisites', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Before this session, please ensure:\n\n• Software installed: [tool/IDE/platform]\n• Account created at [URL]\n• Basic understanding of [foundational topic]\n• Completed pre-reading: [link or document]\n• Access to [system/environment]\n\nNeed help? Contact [support email/channel]', 20),
      ], 'Reduce friction by setting prerequisites upfront.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Module 1 — Foundations', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Core Concepts:\n\n• Concept A: [definition and explanation]\n• Concept B: [definition and explanation]\n• How A and B relate to each other\n\nKey Terminology:\n• [Term 1]: [brief definition]\n• [Term 2]: [brief definition]\n• [Term 3]: [brief definition]', 20),
      ], 'Build foundational understanding before advanced topics.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Module 2 — Advanced Concepts', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Advanced Patterns:\n• Pattern 1 explained\n• Pattern 2 walkthrough\n• Best practices\n• Common mistakes', 20),
        textEl(500, 110, 400, 380, 'Real-World Applications:\n• Use case 1\n• Use case 2\n• Performance tips\n• Integration strategies', 20),
      ], 'Connect theory to practical applications.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Hands-on Exercise', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Exercise: [Title]\n\nObjective: [what participants will build/accomplish]\n\nSteps:\n1. [Step 1 — setup]\n2. [Step 2 — implement core logic]\n3. [Step 3 — test and validate]\n4. [Step 4 — extend with bonus feature]\n\nTime: 30 minutes · Work individually or in pairs\nAsk for help anytime!', 18),
      ], 'Hands-on practice solidifies learning.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Key Takeaways', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'What you learned today:\n\n1. [Main takeaway — foundational concept]\n2. [Main takeaway — advanced application]\n3. [Main takeaway — practical skill]\n4. [Main takeaway — best practice]\n5. [Main takeaway — common pitfall to avoid]\n\nRemember: Practice makes permanent!', 20),
      ], 'Reinforce the most important lessons.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Assessment / Quiz', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Quick Knowledge Check:\n\nQ1: [Question about Module 1 concept]\n  a) [Option]   b) [Option]   c) [Option]\n\nQ2: [Question about Module 2 concept]\n  a) [Option]   b) [Option]   c) [Option]\n\nQ3: [Practical scenario question]\n  a) [Option]   b) [Option]   c) [Option]\n\nAnswers will be reviewed together.', 18),
      ], 'Gauge comprehension and reinforce key points.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Resources & Further Reading', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Documentation:\n• [Official docs URL]\n• [Internal wiki / knowledge base]\n\nRecommended Reading:\n• [Book / article title]\n• [Tutorial series URL]\n\nCommunity & Support:\n• [Slack channel / forum]\n• [Office hours schedule]\n• [Instructor contact email]', 18),
      ], 'Empower continued learning after the session.'),
    ],
  },

  /* ── Weekly Meeting Update (expanded 7 slides) ─────────────────────── */
  {
    name: 'Weekly Meeting Update',
    description: '7 slides: Cover, Sprint Status, Completed, In Progress, Blockers, Metrics, Action Items',
    category: ['Business'],
    slides: [
      makeSlide(g(1), [
        textEl(80, 120, 800, 80, 'Weekly Meeting Update', 48, { bold: true }),
        textEl(80, 230, 800, 50, 'Week of March 16, 2026', 24),
        textEl(80, 300, 800, 40, 'Team: [Team Name] · Sprint [X]', 20, { color: '#e0d0f0' }),
        textEl(80, 360, 800, 40, 'Overall Status: On Track', 20, { color: '#90ee90' }),
      ], 'Set the context — team, sprint, and overall health.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Sprint Status Overview', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Sprint Goal: [describe the sprint objective]\n\n• Total stories: 18\n• Completed: 12 (67%)\n• In Progress: 4\n• Not Started: 2\n\nBurndown: On pace for full completion\nVelocity: 42 points (avg: 38)', 20),
      ], 'High-level sprint health at a glance.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Completed Items', 36, { bold: true }),
        textEl(60, 110, 840, 380, '✅ [PROJ-101] User authentication module\n✅ [PROJ-102] Fixed 12 bugs from QA backlog\n✅ [PROJ-103] Published API documentation v2\n✅ [PROJ-104] Completed design review — Settings page\n✅ [PROJ-105] Deployed staging environment\n✅ [PROJ-106] Database migration script tested\n✅ [PROJ-107] Performance benchmarks completed', 20),
      ], 'Celebrate wins and show delivery velocity.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'In Progress', 36, { bold: true }),
        textEl(60, 110, 840, 380, '🔄 [PROJ-108] Payment integration — 70% complete\n   Owner: [Name] · ETA: Wednesday\n\n🔄 [PROJ-109] User dashboard redesign — 50% complete\n   Owner: [Name] · ETA: Thursday\n\n🔄 [PROJ-110] Email notification service — 40% complete\n   Owner: [Name] · ETA: Friday\n\n🔄 [PROJ-111] Mobile responsive fixes — 60% complete\n   Owner: [Name] · ETA: Wednesday', 18),
      ], 'Show progress and ownership for transparency.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Blockers & Risks', 36, { bold: true }),
        textEl(60, 110, 840, 380, '🚫 Blocker: Third-party API rate limiting\n   Impact: Payment integration delayed by 1 day\n   Mitigation: Caching layer being implemented\n\n⚠️ Risk: Design assets for onboarding not yet delivered\n   Impact: Could delay Sprint [X+1] stories\n   Mitigation: Escalated to Design lead\n\n⚠️ Risk: QA environment intermittent downtime\n   Impact: Testing velocity reduced\n   Mitigation: DevOps investigating root cause', 17),
      ], 'Surface blockers early for quick resolution.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Metrics Dashboard', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Delivery Metrics:\n• Velocity: 42 pts\n• Cycle Time: 3.2 days\n• Throughput: 12 items\n• Sprint Progress: 67%', 20),
        textEl(500, 110, 400, 380, 'Quality Metrics:\n• Bugs Found: 5\n• Bugs Fixed: 8\n• Test Coverage: 82%\n• Uptime: 99.7%', 20),
      ], 'Data-driven view of team performance.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Action Items', 36, { bold: true }),
        textEl(60, 110, 840, 380, '📋 [Owner] — Resolve API rate-limit blocker by Tuesday\n📋 [Owner] — Follow up with Design on onboarding assets\n📋 [Owner] — Complete payment integration by Wednesday\n📋 [Owner] — Schedule QA environment review with DevOps\n📋 [Owner] — Prepare Sprint [X+1] backlog for grooming\n📋 [Owner] — Share updated roadmap with stakeholders\n\nNext meeting: [Day, Date, Time]', 18),
      ], 'Assign clear owners and deadlines.'),
    ],
  },

  /* ── Financial Quarterly Report (NEW 11 slides) ────────────────────── */
  {
    name: 'Financial Quarterly Report',
    description: '11 slides: Cover, Highlights, Revenue, Expenses, P&L, Cash Flow, Balance Sheet, KPIs, Forecasts, Initiatives, Appendix',
    category: ['Finance', 'Business'],
    slides: [
      makeSlide(g(0), [
        textEl(80, 120, 800, 80, 'Q1 2026 Financial Report', 48, { bold: true }),
        textEl(80, 230, 800, 50, '[Company Name]', 26),
        textEl(80, 300, 800, 40, 'Prepared by Finance Team · Confidential', 18, { color: '#c0c0ff' }),
      ], 'Cover slide — mark as confidential.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Q1 Highlights', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Total Revenue: $12.8M (+18% YoY)\n• Net Income: $2.1M (+22% YoY)\n• Operating Margin: 16.4% (up from 14.2%)\n• Cash Position: $8.5M\n• Headcount: 142 (+12 this quarter)\n• Key win: Signed $3M enterprise contract with [Client]', 20),
      ], 'Lead with the headline numbers.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Revenue Analysis', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'By Segment:\n• Enterprise: $6.2M (48%)\n• Mid-Market: $4.1M (32%)\n• SMB: $2.5M (20%)\n\nRecurring vs One-time:\n• MRR: $3.8M\n• Services: $1.0M', 20),
        textEl(500, 110, 400, 380, 'By Region:\n• North America: $8.3M\n• Europe: $3.1M\n• Asia-Pacific: $1.4M\n\nGrowth Drivers:\n• New logos: $2.4M\n• Expansion: $1.8M\n• Renewals: $8.6M', 20),
      ], 'Break revenue down by segment, region, and type.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Expense Breakdown', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Total Operating Expenses: $10.7M\n\n• Cost of Revenue:     $3.8M  (30%)\n• R&D:                $2.9M  (23%)\n• Sales & Marketing:   $2.5M  (20%)\n• General & Admin:     $1.5M  (12%)\n\nNotable items:\n• Hired 8 engineers ($480K incremental)\n• Marketing campaign spend: $350K\n• Office expansion: $120K one-time', 18),
      ], 'Explain major expense changes.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Profit & Loss Summary', 36, { bold: true }),
        textEl(60, 110, 840, 380, '                          Q1 2026    Q4 2025    Q1 2025\nRevenue                   $12.8M     $11.9M     $10.8M\nCost of Revenue           ($3.8M)    ($3.5M)    ($3.4M)\nGross Profit              $9.0M      $8.4M      $7.4M\nGross Margin              70.3%      70.6%      68.5%\n\nOperating Expenses        ($6.9M)    ($6.5M)    ($5.8M)\nOperating Income          $2.1M      $1.9M      $1.6M\nOperating Margin          16.4%      16.0%      14.8%\n\nNet Income                $2.1M      $1.8M      $1.5M', 16),
      ], 'Quarter-over-quarter and year-over-year comparison.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Cash Flow', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Operating Cash Flow:        $2.6M\n  Net income                $2.1M\n  Depreciation              $0.3M\n  Working capital changes    $0.2M\n\nInvesting Cash Flow:       ($0.8M)\n  Capital expenditures      ($0.5M)\n  Software licenses         ($0.3M)\n\nFinancing Cash Flow:       ($0.1M)\n  Loan repayments           ($0.1M)\n\nNet Cash Change:            $1.7M\nEnding Cash Balance:        $8.5M', 17),
      ], 'Show where cash is generated and spent.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Balance Sheet Summary', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Assets:\n• Cash & Equiv: $8.5M\n• Accounts Recv: $3.2M\n• Other Current: $1.1M\n• Fixed Assets: $2.4M\n• Intangibles: $0.8M\n\nTotal Assets: $16.0M', 20),
        textEl(500, 110, 400, 380, 'Liabilities & Equity:\n• Accounts Pay: $1.8M\n• Deferred Rev: $2.4M\n• Long-term Debt: $1.5M\n• Other Liabilities: $0.6M\n\nTotal Liabilities: $6.3M\nShareholder Equity: $9.7M', 20),
      ], 'Snapshot of financial position.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'KPI Dashboard', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Growth:\n• ARR: $15.2M (+24% YoY)\n• Net Revenue Retention: 118%\n• New Customers: 45\n• Win Rate: 32%', 20),
        textEl(500, 110, 400, 380, 'Efficiency:\n• CAC Payback: 14 months\n• Rule of 40: 42%\n• Burn Multiple: 0.8x\n• Revenue per Employee: $90K', 20),
      ], 'SaaS and efficiency metrics at a glance.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Forecasts & Outlook', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Q2 2026 Forecast:\n• Revenue: $14.0M (+9% QoQ)\n• Operating Margin: 17.0%\n• New Hires: 8 planned\n\nFull Year 2026 Outlook:\n• Revenue: $58M (guidance: $55-60M)\n• Path to 20% operating margin by Q4\n• Cash flow positive for full year\n\nKey assumptions: 15% logo growth, 118% NRR maintained', 18),
      ], 'Forward-looking statements — include assumptions.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Strategic Initiatives', 36, { bold: true }),
        textEl(60, 110, 840, 380, '1. AI Product Line (Investment: $1.2M)\n   Expected revenue impact: $3M in FY2026\n\n2. European Expansion (Investment: $800K)\n   Target: 2 new country offices by Q3\n\n3. Platform Consolidation (Savings: $400K/yr)\n   Migrate to unified infrastructure by Q4\n\n4. Strategic M&A Pipeline\n   2 targets in due diligence phase', 18),
      ], 'Align financial plans with strategic goals.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Appendix', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Detailed revenue by product line — see attached spreadsheet\n• Customer cohort analysis — see page A2\n• Full headcount plan by department — see page A3\n• Detailed assumptions for FY2026 forecast\n• Board-approved budget vs actuals\n• Historical trend data (8 quarters)\n\nQuestions? Contact: [CFO Name] · [email]', 18),
      ], 'Reference supplementary materials.'),
    ],
  },

  /* ── Pitch Deck (NEW 12 slides) ────────────────────────────────────── */
  {
    name: 'Pitch Deck',
    description: '12 slides: Cover, Problem, Solution, Demo, Market, Model, Traction, Competition, Go-to-Market, Team, Financials, The Ask',
    category: ['Sales', 'Business'],
    slides: [
      makeSlide(g(0), [
        textEl(80, 120, 800, 80, '[Company Name]', 48, { bold: true }),
        textEl(80, 220, 800, 50, '[One-line tagline that captures your vision]', 24),
        textEl(80, 300, 800, 40, 'Series A · March 2026', 18, { color: '#c0c0ff' }),
      ], 'First impression — make the tagline memorable.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'The Problem', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• [X]M people face [specific pain point] every day\n• Current solutions cost $[X] and take [X] hours\n• [X]% of [target users] are dissatisfied with existing tools\n• The problem is getting worse because [trend]\n\n"[Compelling quote from a real user about the pain]"\n\nThis is a $[X]B problem waiting for a modern solution.', 20),
      ], 'Make the problem visceral and data-backed.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Our Solution', 36, { bold: true }),
        textEl(60, 110, 840, 380, '[Product name] is a [category] that [core value prop].\n\n• [Key benefit 1] — reduces [pain] by [X]%\n• [Key benefit 2] — saves [X] hours per week\n• [Key benefit 3] — integrates with [existing tools]\n\nHow it works:\n1. [Simple step 1]\n2. [Simple step 2]\n3. [Simple step 3]', 20),
      ], 'Keep the solution explanation to 30 seconds.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Product Demo', 36, { bold: true }),
        textEl(60, 110, 840, 380, '[Insert product screenshots or demo video]\n\nKey screens / workflows to highlight:\n\n• Dashboard — real-time insights at a glance\n• Workflow Builder — intuitive drag-and-drop\n• Analytics — actionable recommendations\n• Mobile — full functionality on the go\n\n"Customers describe it as [adjective] and [adjective]"', 20),
      ], 'Show, don\'t tell — use screenshots or a live demo.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Market Size', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Total Addressable Market (TAM): $[X]B\n• [X]M potential customers worldwide\n\nServiceable Addressable Market (SAM): $[X]B\n• [Region/segment] focus in first 3 years\n\nServiceable Obtainable Market (SOM): $[X]M\n• Realistic capture with current go-to-market\n\nMarket growing at [X]% CAGR\nTailwinds: [regulation, tech shift, behavior change]', 20),
      ], 'Bottom-up analysis is more credible than top-down.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Business Model', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Revenue Model: SaaS subscription\n\n• Starter:     $[X]/mo  — [target segment]\n• Professional: $[X]/mo  — [target segment]\n• Enterprise:   $[X]/mo  — [target segment]\n\nUnit Economics:\n• ACV: $[X]K\n• Gross Margin: [X]%\n• CAC: $[X]\n• LTV: $[X]\n• LTV/CAC: [X]x\n• Payback: [X] months', 18),
      ], 'Prove the economics work.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Traction', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• $[X]M ARR (growing [X]% MoM)\n• [X]+ paying customers\n• [X]% month-over-month growth\n• Net Revenue Retention: [X]%\n• Notable customers: [Logo 1], [Logo 2], [Logo 3]\n\nMilestones:\n• [Month Year]: Product launch\n• [Month Year]: First $1M ARR\n• [Month Year]: [Key partnership or achievement]', 20),
      ], 'Show momentum — growth rate matters most.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Competitive Landscape', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Key competitors:\n• [Competitor A] — strong in [X], weak in [Y]\n• [Competitor B] — legacy player, slow to innovate\n• [Competitor C] — adjacent market, entering our space\n\nOur Unfair Advantages:\n• [Proprietary technology / data moat]\n• [Team expertise / domain knowledge]\n• [First-mover in specific niche]\n• [Strategic partnerships / distribution]\n\nWe win because: [one sentence]', 18),
      ], 'Be honest about competition — investors will check.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Go-to-Market Strategy', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Current Channels (ranked by efficiency):\n1. Product-led growth (40% of new users)\n2. Content marketing & SEO (25%)\n3. Outbound sales — enterprise (20%)\n4. Partnerships & referrals (15%)\n\nNext 12 Months:\n• Build outbound SDR team (5 reps)\n• Launch partner program\n• Expand to [new market / segment]\n• Target: [X]% growth in qualified pipeline', 18),
      ], 'Show a repeatable, scalable acquisition engine.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'The Team', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'CEO — [Name]\n[Previous role at notable company]\n[Relevant achievement]\n\nCTO — [Name]\n[Previous role at notable company]\n[Relevant achievement]\n\nVP Sales — [Name]\n[Previous role at notable company]', 18),
        textEl(500, 110, 400, 380, 'VP Product — [Name]\n[Previous role at notable company]\n[Relevant achievement]\n\nAdvisors:\n• [Name] — [Title at Company]\n• [Name] — [Title at Company]\n\nTeam: [X] people\nKey hires planned: [roles]', 18),
      ], 'Highlight relevant experience and domain expertise.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Financial Overview', 36, { bold: true }),
        textEl(60, 110, 840, 380, '                   2025A      2026E      2027E\nRevenue             $[X]M      $[X]M      $[X]M\nGross Margin        [X]%       [X]%       [X]%\nBurn Rate           $[X]K/mo   $[X]K/mo   —\nRunway              [X] months (pre-raise)\n\nKey Milestones to Profitability:\n• Break-even at $[X]M ARR\n• Expected by [Quarter, Year]\n• Path: [X]% gross margin at scale', 18),
      ], 'Show a realistic path to sustainability.'),
      makeSlide(g(3), [
        textEl(80, 120, 800, 80, 'The Ask', 48, { bold: true }),
        textEl(80, 220, 800, 50, 'Raising $[X]M Series A', 28),
        textEl(80, 290, 800, 160, 'Use of Funds:\n• Engineering & Product: 45%\n• Sales & Marketing: 30%\n• G&A & Operations: 15%\n• Reserve: 10%\n\nThis gets us to: $[X]M ARR and cash-flow positive', 20, { color: '#e0e0e0' }),
      ], 'Be specific about the amount, use of funds, and milestones.'),
    ],
  },

  /* ── Product Launch (NEW 10 slides) ────────────────────────────────── */
  {
    name: 'Product Launch',
    description: '10 slides: Cover, Vision, Features, Deep-Dive, Audience, Advantage, Timeline, Pricing, Marketing, CTA',
    category: ['Marketing', 'Business'],
    slides: [
      makeSlide(g(4), [
        textEl(80, 120, 800, 80, 'Introducing [Product Name]', 48, { bold: true }),
        textEl(80, 230, 800, 50, '[One-line description of the product]', 24),
        textEl(80, 300, 800, 40, 'Launch Date: [Date] · [Company Name]', 18, { color: '#e0d0c0' }),
      ], 'Build excitement with a strong product name and tagline.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Product Vision', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Our vision: [inspiring statement about what this product enables]\n\nWhy now?\n• [Market shift or trend creating opportunity]\n• [Technology advancement enabling the solution]\n• [Customer demand signal — surveys, requests, feedback]\n\nThis product represents the next chapter in our mission to [company mission].', 20),
      ], 'Connect the product to a bigger purpose.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Features Overview', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Core Features:\n\n🔹 [Feature 1]\n    [Brief description]\n\n🔹 [Feature 2]\n    [Brief description]\n\n🔹 [Feature 3]\n    [Brief description]', 20),
        textEl(500, 110, 400, 380, 'Bonus Features:\n\n🔹 [Feature 4]\n    [Brief description]\n\n🔹 [Feature 5]\n    [Brief description]\n\n🔹 [Feature 6]\n    [Brief description]', 20),
      ], 'Give the full picture before diving deep.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Feature Deep-Dive', 36, { bold: true }),
        textEl(60, 110, 840, 380, '[Feature Name] — Our flagship capability\n\n• What it does: [clear explanation]\n• How it works: [brief technical overview]\n• Why it matters: [user benefit]\n\nBefore: [description of old workflow]\nAfter:  [description with new product]\n\nResult: [X]% faster / [X]% cheaper / [X]x better\n\n[Add product screenshot or demo here]', 18),
      ], 'Deep-dive into the most compelling feature.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Target Audience', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Primary Persona: [Role / Title]\n• Demographics: [company size, industry]\n• Pain points: [top 3 challenges]\n• Goals: [what success looks like]\n\nSecondary Persona: [Role / Title]\n• Demographics: [company size, industry]\n• Pain points: [top 3 challenges]\n• Goals: [what success looks like]\n\nTotal addressable users: [X]M', 18),
      ], 'Show you deeply understand the target user.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Competitive Advantage', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Why [Product Name] wins:\n\n• [Advantage 1]: We are [X]x faster than alternatives\n• [Advantage 2]: Only solution with [unique capability]\n• [Advantage 3]: [X]% lower cost than competitors\n• [Advantage 4]: Built on [proprietary technology]\n\nvs [Competitor A]: Lacks [feature], costs [X]% more\nvs [Competitor B]: No [capability], poor [attribute]\nvs DIY / Status Quo: Takes [X]x longer, error-prone', 18),
      ], 'Position clearly against alternatives.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Launch Timeline', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Pre-Launch (Now — [Date]):\n• Beta program with [X] design partners\n• Press embargo & analyst briefings\n• Content creation & landing page live\n\nLaunch Day ([Date]):\n• Product Hunt launch\n• Press release & blog post\n• Email campaign to [X]K subscribers\n• Social media blitz\n\nPost-Launch ([Date] — [Date]):\n• Webinar series (3 sessions)\n• Customer case studies published\n• Feedback sprint & v1.1 release', 17),
      ], 'Show a well-planned launch sequence.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Pricing', 36, { bold: true }),
        textEl(60, 110, 280, 380, 'Free Tier\n$0/mo\n\n• [X] users\n• Core features\n• Community support\n• [Limitation]', 18),
        textEl(360, 110, 260, 380, 'Pro\n$[X]/mo\n\n• Unlimited users\n• All features\n• Priority support\n• API access\n• Integrations', 18),
        textEl(640, 110, 260, 380, 'Enterprise\nCustom\n\n• Everything in Pro\n• SSO & SAML\n• Dedicated CSM\n• Custom SLA\n• On-premise option', 18),
      ], 'Simple, transparent pricing builds trust.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Marketing Strategy', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Launch Campaign Budget: $[X]K\n\nChannels:\n• Content Marketing: Blog series, SEO, thought leadership\n• Paid Acquisition: Google Ads, LinkedIn ($[X]K budget)\n• Social Media: Twitter/X, LinkedIn, YouTube demos\n• Community: Dev communities, Reddit, Discord\n• Partnerships: Co-marketing with [Partner 1], [Partner 2]\n• Events: [Conference Name] booth + speaking slot\n\nTarget: [X]K signups in first 30 days', 18),
      ], 'Show the full go-to-market plan.'),
      makeSlide(g(5), [
        textEl(80, 120, 800, 80, 'Get Started Today', 48, { bold: true }),
        textEl(80, 230, 800, 50, '[product-url.com]', 28),
        textEl(80, 300, 800, 120, '• Sign up for early access at [URL]\n• Book a demo: [calendar link]\n• Join our community: [Slack/Discord link]\n• Questions? [email@company.com]\n\nSpecial launch offer: [X]% off annual plans for early adopters', 20, { color: '#e0e0e0' }),
      ], 'Strong call to action with multiple engagement paths.'),
    ],
  },

  /* ── Company Overview (NEW 10 slides) ──────────────────────────────── */
  {
    name: 'Company Overview',
    description: '10 slides: Cover, Mission, History, Leadership, Products, Market, Achievements, Culture, Partnerships, Contact',
    category: ['Business', 'Marketing'],
    slides: [
      makeSlide(g(6), [
        textEl(80, 120, 800, 80, '[Company Name]', 48, { bold: true }),
        textEl(80, 230, 800, 50, 'Company Overview', 26),
        textEl(80, 300, 800, 40, '[Tagline or mission statement in one line]', 18, { color: '#e0d0f0' }),
      ], 'Clean cover with company identity.'),
      makeSlide(g(7), [
        textEl(60, 30, 840, 60, 'Mission & Vision', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Our Mission:\n[Clear, compelling statement about what the company does and why it matters — 1-2 sentences]\n\nOur Vision:\n[Aspirational statement about the future the company is building — 1-2 sentences]\n\nCore Values:\n• [Value 1] — [brief explanation]\n• [Value 2] — [brief explanation]\n• [Value 3] — [brief explanation]\n• [Value 4] — [brief explanation]', 20),
      ], 'Set the tone with purpose and values.'),
      makeSlide(g(0), [
        textEl(60, 30, 840, 60, 'Company History', 36, { bold: true }),
        textEl(60, 110, 840, 380, '[Year]: Founded by [founders] in [location]\n[Year]: Launched first product — [name]\n[Year]: Reached [milestone] customers\n[Year]: Raised $[X]M Series [X] funding\n[Year]: Expanded to [new markets / regions]\n[Year]: Launched [major product / feature]\n[Year]: Achieved $[X]M in revenue\n[Year]: Today — [X] employees, [X] countries\n\n[X] years of innovation and growth.', 18),
      ], 'Tell the company story as a journey.'),
      makeSlide(g(1), [
        textEl(60, 30, 840, 60, 'Leadership Team', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'CEO — [Name]\n[Brief bio, prior experience]\n\nCTO — [Name]\n[Brief bio, prior experience]\n\nCFO — [Name]\n[Brief bio, prior experience]', 18),
        textEl(500, 110, 400, 380, 'COO — [Name]\n[Brief bio, prior experience]\n\nVP Engineering — [Name]\n[Brief bio, prior experience]\n\nVP Sales — [Name]\n[Brief bio, prior experience]', 18),
      ], 'Highlight leadership credibility and experience.'),
      makeSlide(g(2), [
        textEl(60, 30, 840, 60, 'Products & Services', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Product Portfolio:\n\n🔹 [Product 1] — [one-line description]\n   Key benefit: [primary value proposition]\n\n🔹 [Product 2] — [one-line description]\n   Key benefit: [primary value proposition]\n\n🔹 [Product 3] — [one-line description]\n   Key benefit: [primary value proposition]\n\nServices: [Consulting, Implementation, Training, Support]', 18),
      ], 'Showcase the breadth of the portfolio.'),
      makeSlide(g(3), [
        textEl(60, 30, 840, 60, 'Market Position', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Industry: [Industry Name]\nMarket Size: $[X]B (growing [X]% annually)\n\nOur Position:\n• [X]% market share in [segment]\n• Ranked #[X] by [analyst firm / publication]\n• Leader in [specific capability]\n\nCustomer Base:\n• [X]+ customers across [X] countries\n• [X]% of Fortune 500 in our segment\n• Average customer tenure: [X] years', 20),
      ], 'Quantify market position and credibility.'),
      makeSlide(g(4), [
        textEl(60, 30, 840, 60, 'Key Achievements', 36, { bold: true }),
        textEl(60, 110, 840, 380, '🏆 [Award Name] — [Year] ([Awarding Body])\n🏆 [Award Name] — [Year] ([Awarding Body])\n\n📈 Revenue: $[X]M (FY 2025) — [X]% YoY growth\n📈 Customer Satisfaction: [X]% NPS / CSAT\n📈 Retention Rate: [X]%\n\n🌍 Expanded to [X] new markets in [Year]\n🤝 [X]+ strategic partnerships\n📰 Featured in: [Publication 1], [Publication 2]', 20),
      ], 'Social proof and credibility builders.'),
      makeSlide(g(5), [
        textEl(60, 30, 840, 60, 'Culture & Values', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'What makes us different:\n\n• Innovation First — We dedicate [X]% of time to R&D\n• Customer Obsession — Every decision starts with the user\n• Transparency — Open communication at all levels\n• Diversity & Inclusion — [X] nationalities, [X]% women in leadership\n\nEmployee Highlights:\n• Great Place to Work certified [Year]\n• [X]% employee satisfaction score\n• Average tenure: [X] years\n• Learning budget: $[X] per employee', 18),
      ], 'Culture attracts talent and builds trust.'),
      makeSlide(g(6), [
        textEl(60, 30, 840, 60, 'Partnerships & Clients', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Strategic Technology Partners:\n• [Partner 1] — [type of partnership]\n• [Partner 2] — [type of partnership]\n• [Partner 3] — [type of partnership]\n\nNotable Clients:\n• [Client 1] — [industry]\n• [Client 2] — [industry]\n• [Client 3] — [industry]\n• [Client 4] — [industry]\n\n[X]+ active partnerships across [X] industries', 20),
      ], 'Logos and names build instant credibility.'),
      makeSlide(g(7), [
        textEl(80, 120, 800, 80, 'Get in Touch', 48, { bold: true }),
        textEl(80, 230, 800, 180, 'Website: [company-url.com]\nEmail: [info@company.com]\nPhone: [+1-xxx-xxx-xxxx]\n\nHeadquarters: [Address, City, Country]\nRegional Offices: [City 1], [City 2], [City 3]\n\nFollow us: [Social media handles]', 22, { color: '#e0e0e0' }),
      ], 'Make it easy to connect.'),
    ],
  },
];

export default function TemplateModal() {
  const { showTemplateModal, setShowTemplateModal, loadTemplate } =
    usePresentationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tmpl) => {
      const matchesCategory =
        activeCategory === 'All' || tmpl.category.includes(activeCategory);
      const matchesSearch =
        searchQuery.trim() === '' ||
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  if (!showTemplateModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg shadow-2xl border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
            Presentation Templates
          </h2>
          <button
            onClick={() => setShowTemplateModal(false)}
            className="p-1 rounded hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2" style={{ borderColor: 'var(--border)' }}>
          <div
            className="flex items-center gap-2 rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          >
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--card-foreground)' }}
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'var(--muted)',
                color: activeCategory === cat ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTemplates.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: 'var(--muted-foreground)' }}>
              No templates match your search.
            </p>
          )}
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.name}
              className="border rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => loadTemplate(tmpl.slides.map(s => ({
                ...s,
                id: generateId(),
                elements: s.elements.map(el => ({ ...el, id: generateId(), style: { ...el.style } })),
              })))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    {tmpl.name}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {tmpl.description}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {tmpl.category.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 ml-3 flex-shrink-0">
                  {tmpl.slides.slice(0, 4).map((s, i) => (
                    <div
                      key={i}
                      className="rounded border"
                      style={{
                        width: 48,
                        height: 27,
                        background: s.background,
                        borderColor: 'var(--border)',
                      }}
                    />
                  ))}
                  {tmpl.slides.length > 4 && (
                    <div
                      className="rounded border flex items-center justify-center text-xs"
                      style={{
                        width: 48,
                        height: 27,
                        background: 'var(--muted)',
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      +{tmpl.slides.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
