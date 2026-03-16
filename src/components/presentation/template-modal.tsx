'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  usePresentationStore,
  GRADIENT_PRESETS,
  type Slide,
} from '@/store/presentation-store';
import { generateId } from '@/lib/utils';

interface TemplateDefinition {
  name: string;
  description: string;
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

const TEMPLATES: TemplateDefinition[] = [
  {
    name: 'Startup Pitch',
    description: '5 slides: Problem, Solution, Market, Traction, Ask',
    slides: [
      makeSlide(GRADIENT_PRESETS[0], [
        textEl(80, 140, 800, 80, 'Your Startup Name', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Revolutionizing [Industry] with [Innovation]', 24),
        textEl(80, 340, 800, 40, 'Seed Round · March 2026', 18, { color: '#c0c0ff' }),
      ], 'Introduce the company and set the stage.'),
      makeSlide(GRADIENT_PRESETS[1], [
        textEl(60, 30, 840, 60, 'The Problem', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• 70% of businesses face [pain point]\n• Current solutions are expensive, slow, or unreliable\n• $50B market with no clear leader\n• Customers need a modern, AI-powered approach', 22),
      ], 'Explain the problem with data and empathy.'),
      makeSlide(GRADIENT_PRESETS[2], [
        textEl(60, 30, 840, 60, 'Our Solution', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• AI-driven platform that cuts costs by 60%\n• Simple integration with existing workflows\n• Real-time analytics dashboard\n• Enterprise-grade security and compliance', 22),
      ], 'Show product screenshots if available.'),
      makeSlide(GRADIENT_PRESETS[3], [
        textEl(60, 30, 840, 60, 'Traction & Market', 36, { bold: true }),
        textEl(60, 110, 400, 380, '• 50+ paying customers\n• $2M ARR growing 20% MoM\n• 95% retention rate\n• Featured in TechCrunch', 22),
        textEl(500, 110, 400, 380, '• TAM: $50B\n• SAM: $12B\n• SOM: $500M (Year 3)\n• Growing at 25% CAGR', 22),
      ], 'Lead with your strongest metrics.'),
      makeSlide(GRADIENT_PRESETS[4], [
        textEl(80, 140, 800, 80, 'The Ask', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Raising $5M Series A', 28),
        textEl(80, 320, 800, 100, 'Funds will be used for: Engineering (40%), Sales (30%), Marketing (20%), Operations (10%)', 20, { color: '#e0e0e0' }),
      ], 'Be specific about how funds will be used.'),
    ],
  },
  {
    name: 'Business Proposal',
    description: '6 slides: Cover, Overview, Approach, Timeline, Pricing, Next Steps',
    slides: [
      makeSlide(GRADIENT_PRESETS[5], [
        textEl(80, 130, 800, 80, 'Business Proposal', 48, { bold: true }),
        textEl(80, 240, 800, 50, 'Prepared for [Client Name]', 24),
        textEl(80, 310, 800, 40, '[Your Company] · March 2026', 18, { color: '#d0c0e0' }),
      ]),
      makeSlide(GRADIENT_PRESETS[6], [
        textEl(60, 30, 840, 60, 'Executive Overview', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Understanding of your business needs\n• Our proposed approach and methodology\n• Expected outcomes and deliverables\n• Investment required and timeline', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[7], [
        textEl(60, 30, 840, 60, 'Our Approach', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Phase 1: Discovery & Assessment (2 weeks)\nPhase 2: Design & Planning (3 weeks)\nPhase 3: Implementation (8 weeks)\nPhase 4: Testing & Deployment (2 weeks)\nPhase 5: Support & Optimization (ongoing)', 20),
      ]),
      makeSlide(GRADIENT_PRESETS[0], [
        textEl(60, 30, 840, 60, 'Project Timeline', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'Week 1-2: Kickoff and requirements gathering\nWeek 3-5: Architecture design and approval\nWeek 6-13: Core development sprints\nWeek 14-15: UAT and bug fixes\nWeek 16: Go-live and handover', 20),
      ]),
      makeSlide(GRADIENT_PRESETS[1], [
        textEl(60, 30, 840, 60, 'Investment', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Option A: Standard\n$75,000\n• Core features\n• 3 months support\n• Documentation', 22),
        textEl(500, 110, 400, 380, 'Option B: Premium\n$120,000\n• All features + AI\n• 12 months support\n• Training included', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[2], [
        textEl(80, 140, 800, 80, 'Next Steps', 48, { bold: true }),
        textEl(80, 250, 800, 100, '1. Approve proposal and sign agreement\n2. Schedule kickoff meeting\n3. Begin discovery phase', 24),
      ]),
    ],
  },
  {
    name: 'Quarterly Review',
    description: '5 slides: Title, KPIs, Highlights, Challenges, Next Quarter',
    slides: [
      makeSlide(GRADIENT_PRESETS[3], [
        textEl(80, 140, 800, 80, 'Q1 2026 Review', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Department / Team Name', 24),
      ]),
      makeSlide(GRADIENT_PRESETS[4], [
        textEl(60, 30, 840, 60, 'Key Performance Indicators', 36, { bold: true }),
        textEl(60, 110, 400, 380, '• Revenue: $4.2M (+15% QoQ)\n• New Customers: 120\n• Churn Rate: 2.1%\n• NPS Score: 72', 22),
        textEl(500, 110, 400, 380, '• MRR: $1.4M\n• CAC: $850\n• LTV: $12,000\n• LTV/CAC: 14.1x', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[5], [
        textEl(60, 30, 840, 60, 'Q1 Highlights', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Launched v2.0 with AI features\n• Expanded to 3 new markets\n• Hired 12 key team members\n• Achieved SOC 2 compliance\n• Partnership with [Major Company]', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[6], [
        textEl(60, 30, 840, 60, 'Challenges & Learnings', 36, { bold: true }),
        textEl(60, 110, 840, 380, '• Infrastructure scaling issues (resolved)\n• Longer enterprise sales cycles than expected\n• Need more technical documentation\n• Competition increasing in core segment', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[7], [
        textEl(60, 30, 840, 60, 'Q2 2026 Priorities', 36, { bold: true }),
        textEl(60, 110, 840, 380, '1. Launch mobile app (target: April)\n2. Expand sales team by 5 reps\n3. Achieve $5M quarterly revenue\n4. ISO 27001 certification\n5. Reduce churn below 1.5%', 22),
      ]),
    ],
  },
  {
    name: 'Training Deck',
    description: '4 slides: Title, Objectives, Content, Summary',
    slides: [
      makeSlide(GRADIENT_PRESETS[0], [
        textEl(80, 140, 800, 80, 'Training: [Topic Name]', 48, { bold: true }),
        textEl(80, 260, 800, 50, 'Duration: 2 hours · Level: Intermediate', 22),
        textEl(80, 330, 800, 40, 'Instructor: [Your Name]', 18, { color: '#c0c0ff' }),
      ]),
      makeSlide(GRADIENT_PRESETS[2], [
        textEl(60, 30, 840, 60, 'Learning Objectives', 36, { bold: true }),
        textEl(60, 110, 840, 380, 'By the end of this training, you will:\n\n1. Understand the core concepts of [topic]\n2. Be able to apply [skill] in daily work\n3. Know how to troubleshoot common issues\n4. Have hands-on experience with [tool/system]', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[4], [
        textEl(60, 30, 840, 60, 'Key Concepts', 36, { bold: true }),
        textEl(60, 110, 400, 380, 'Fundamentals:\n• Concept A explained\n• Concept B walkthrough\n• Best practices', 20),
        textEl(500, 110, 400, 380, 'Advanced:\n• Edge cases\n• Performance tips\n• Integration patterns', 20),
      ]),
      makeSlide(GRADIENT_PRESETS[6], [
        textEl(80, 140, 800, 80, 'Summary & Q&A', 48, { bold: true }),
        textEl(80, 260, 800, 100, 'Key Takeaways:\n• [Main point 1]\n• [Main point 2]\n• [Main point 3]', 22),
      ]),
    ],
  },
  {
    name: 'Weekly Update',
    description: '3 slides: Status, Completed, Upcoming',
    slides: [
      makeSlide(GRADIENT_PRESETS[1], [
        textEl(80, 140, 800, 80, 'Weekly Update', 48, { bold: true }),
        textEl(80, 250, 800, 50, 'Week of March 9, 2026', 24),
        textEl(80, 320, 800, 40, 'Status: On Track', 20, { color: '#90ee90' }),
      ]),
      makeSlide(GRADIENT_PRESETS[3], [
        textEl(60, 30, 840, 60, 'Completed This Week', 36, { bold: true }),
        textEl(60, 110, 840, 380, '✅ Finished user authentication module\n✅ Fixed 12 bugs from QA backlog\n✅ Published API documentation v2\n✅ Completed design review for Settings page\n✅ Deployed staging environment', 22),
      ]),
      makeSlide(GRADIENT_PRESETS[5], [
        textEl(60, 30, 840, 60, 'Upcoming Next Week', 36, { bold: true }),
        textEl(60, 110, 840, 380, '📋 Start payment integration development\n📋 User interviews for new feature\n📋 Performance testing sprint\n📋 Team retrospective on Friday\n📋 Release v2.1 to production', 22),
      ]),
    ],
  },
];

export default function TemplateModal() {
  const { showTemplateModal, setShowTemplateModal, loadTemplate } =
    usePresentationStore();

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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {TEMPLATES.map((tmpl) => (
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
                </div>
                <div className="flex gap-1">
                  {tmpl.slides.slice(0, 3).map((s, i) => (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
