"use client";
import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type Layout =
  | "title"
  | "content"
  | "two-column"
  | "blank"
  | "image"
  | "comparison";
export type ShapeType = "rectangle" | "circle" | "arrow" | "star";

export interface TextElement {
  id: string;
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  placeholder?: string;
}

export interface ShapeElement {
  id: string;
  type: "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ImageElement {
  id: string;
  type: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  src: string;
  alt: string;
}

export type SlideElement = TextElement | ShapeElement | ImageElement;

export interface Slide {
  id: string;
  layout: Layout;
  background: string;
  elements: SlideElement[];
  notes: string;
  accentColor: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "bg1",
    name: "Blue Depth",
    value: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
  },
  {
    id: "bg2",
    name: "Purple Dream",
    value: "linear-gradient(135deg, #4a0080 0%, #9c27b0 100%)",
  },
  {
    id: "bg3",
    name: "Sunset",
    value: "linear-gradient(135deg, #e96c19 0%, #f0a500 100%)",
  },
  {
    id: "bg4",
    name: "Ocean",
    value: "linear-gradient(135deg, #006994 0%, #00b4d8 100%)",
  },
  {
    id: "bg5",
    name: "Forest",
    value: "linear-gradient(135deg, #1a472a 0%, #2d8a4e 100%)",
  },
  {
    id: "bg6",
    name: "Rose",
    value: "linear-gradient(135deg, #c94b4b 0%, #7b1fa2 100%)",
  },
  {
    id: "bg7",
    name: "Midnight",
    value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    id: "bg8",
    name: "Gold",
    value: "linear-gradient(135deg, #f79c1e 0%, #ffd200 100%)",
  },
  {
    id: "bg9",
    name: "Teal",
    value: "linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)",
  },
  { id: "bg10", name: "Charcoal", value: "#2d3748" },
  { id: "bg11", name: "White", value: "#ffffff" },
  { id: "bg12", name: "Navy", value: "#1a1f2e" },
];

type TemplateEl = Omit<TextElement, "id"> | Omit<ShapeElement, "id"> | Omit<ImageElement, "id">;
interface TemplateSlide {
  layout: Layout;
  background: string;
  accentColor: string;
  elements: TemplateEl[];
  notes: string;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  slides: TemplateSlide[];
}

function makeText(
  content: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize: number,
  color: string,
  fontWeight: "normal" | "bold" = "normal",
  textAlign: "left" | "center" | "right" = "center",
  zIndex = 1,
  placeholder?: string
): TemplateEl {
  return {
    type: "text",
    x,
    y,
    width: w,
    height: h,
    zIndex,
    content,
    fontSize,
    fontWeight,
    fontStyle: "normal",
    color,
    textAlign,
    placeholder,
  };
}

export const PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: "tpl-startup",
    name: "Startup Pitch Deck",
    category: "Business",
    thumbnail: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
        accentColor: "#4fc3f7",
        notes: "Welcome the audience. Brief intro about the company.",
        elements: [
          makeText("Your Startup Name", 10, 30, 80, 18, 52, "#ffffff", "bold"),
          makeText(
            "Disrupting [Industry] with [Innovation]",
            15,
            52,
            70,
            10,
            22,
            "#90caf9"
          ),
          makeText(
            "Pitch Deck  •  2025",
            30,
            68,
            40,
            6,
            14,
            "#64b5f6",
            "normal",
            "center"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 100%)",
        accentColor: "#4fc3f7",
        notes: "Describe the core problem your startup solves.",
        elements: [
          makeText("The Problem", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "Key Pain Points",
            5,
            26,
            40,
            8,
            18,
            "#90caf9",
            "bold",
            "left"
          ),
          makeText(
            "• 73% of businesses struggle with [problem]\n• Current solutions are slow and expensive\n• No scalable solution exists today",
            5,
            36,
            55,
            40,
            16,
            "#e0e0e0",
            "normal",
            "left"
          ),
          makeText(
            "💡",
            68,
            28,
            24,
            40,
            60,
            "#4fc3f7",
            "normal",
            "center",
            2
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 100%)",
        accentColor: "#4fc3f7",
        notes: "Present your solution clearly and concisely.",
        elements: [
          makeText("Our Solution", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "What We Built",
            5,
            26,
            40,
            8,
            18,
            "#4fc3f7",
            "bold",
            "left"
          ),
          makeText(
            "We provide a [platform/tool] that enables [target users] to [key benefit] by [mechanism].",
            5,
            36,
            55,
            20,
            16,
            "#e0e0e0",
            "normal",
            "left"
          ),
          makeText(
            "10x Faster\n5x Cheaper\n∞ Scalable",
            62,
            28,
            32,
            50,
            18,
            "#4fc3f7",
            "bold",
            "center",
            2
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 100%)",
        accentColor: "#4fc3f7",
        notes: "Show market size (TAM, SAM, SOM).",
        elements: [
          makeText(
            "Market Opportunity",
            5,
            8,
            90,
            12,
            36,
            "#ffffff",
            "bold",
            "center"
          ),
          makeText(
            "TAM\n$50B+",
            5,
            26,
            28,
            30,
            20,
            "#4fc3f7",
            "bold",
            "center"
          ),
          makeText(
            "SAM\n$12B",
            36,
            26,
            28,
            30,
            20,
            "#90caf9",
            "bold",
            "center"
          ),
          makeText(
            "SOM\n$1.5B",
            67,
            26,
            28,
            30,
            20,
            "#e3f2fd",
            "bold",
            "center"
          ),
          makeText(
            "Growing at 35% YoY",
            20,
            62,
            60,
            8,
            16,
            "#90caf9",
            "normal",
            "center"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 100%)",
        accentColor: "#4fc3f7",
        notes: "Show traction, revenue, key metrics.",
        elements: [
          makeText("Traction", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "$2M ARR  •  10,000 Users  •  150% NRR",
            5,
            24,
            90,
            10,
            20,
            "#4fc3f7",
            "bold",
            "center"
          ),
          makeText(
            "• 3 Fortune 500 pilot customers\n• Featured in TechCrunch & Forbes\n• 40% month-over-month growth",
            5,
            38,
            90,
            35,
            16,
            "#e0e0e0",
            "normal",
            "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
        accentColor: "#4fc3f7",
        notes: "Present your ask and what you'll use the funds for.",
        elements: [
          makeText("The Ask", 5, 8, 60, 12, 36, "#ffffff", "bold", "center"),
          makeText(
            "Raising $5M Seed Round",
            10,
            28,
            80,
            12,
            28,
            "#4fc3f7",
            "bold",
            "center"
          ),
          makeText(
            "40% Product Development\n30% Sales & Marketing\n20% Team Expansion\n10% Operations",
            15,
            44,
            70,
            38,
            16,
            "#e0e0e0",
            "normal",
            "center"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-qbr",
    name: "Quarterly Business Review",
    category: "Business",
    thumbnail: "linear-gradient(135deg, #1a472a 0%, #2d8a4e 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #1a472a 0%, #2d8a4e 100%)",
        accentColor: "#a5d6a7",
        notes: "Open with key highlights from the quarter.",
        elements: [
          makeText("Q4 2025 Business Review", 10, 30, 80, 16, 44, "#ffffff", "bold"),
          makeText("Company Performance & Strategic Outlook", 15, 50, 70, 10, 20, "#a5d6a7"),
          makeText("Presented by [Team Name]  •  January 2026", 20, 66, 60, 8, 14, "#81c784"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #15392e 0%, #1a472a 100%)",
        accentColor: "#a5d6a7",
        notes: "Review Q4 highlights and key wins.",
        elements: [
          makeText("Q4 Highlights", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText("Key Wins", 5, 26, 40, 8, 18, "#a5d6a7", "bold", "left"),
          makeText(
            "✓ Revenue target exceeded by 18%\n✓ Launched 3 new product features\n✓ Expanded to 2 new markets\n✓ NPS score improved from 42 to 61",
            5, 36, 55, 45, 16, "#e8f5e9", "normal", "left"
          ),
          makeText("📈", 65, 30, 28, 35, 56, "#a5d6a7", "normal", "center", 2),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #15392e 0%, #1a472a 100%)",
        accentColor: "#a5d6a7",
        notes: "Present financial performance vs targets.",
        elements: [
          makeText("Financial Performance", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("Revenue\n$8.4M\n+18% vs target", 5, 24, 44, 36, 16, "#a5d6a7", "bold", "center"),
          makeText("Gross Margin\n72%\n+4pts YoY", 51, 24, 44, 36, 16, "#81c784", "bold", "center"),
          makeText("EBITDA: $1.2M  •  Burn Rate: $340K/mo", 5, 66, 90, 8, 14, "#c8e6c9", "normal", "center"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #15392e 0%, #1a472a 100%)",
        accentColor: "#a5d6a7",
        notes: "Review OKR achievement for the quarter.",
        elements: [
          makeText("OKR Achievement", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "KR1: Grow MRR to $700K  ████████░░  82%\nKR2: Launch mobile app  ██████████  100%\nKR3: Hire 15 engineers  ████████░░  80%\nKR4: Reduce churn < 2%  █████████░  90%",
            5, 28, 90, 50, 15, "#e8f5e9", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a472a 0%, #2d8a4e 100%)",
        accentColor: "#a5d6a7",
        notes: "Discuss priorities and goals for Q1.",
        elements: [
          makeText("Q1 2026 Priorities", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "1. Scale revenue to $9.5M (Target)\n2. Expand sales team to 25 reps\n3. Launch enterprise tier product\n4. Enter APAC market",
            5, 28, 90, 50, 18, "#e8f5e9", "normal", "left"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-research",
    name: "Research Conference Talk",
    category: "Academic",
    thumbnail: "linear-gradient(135deg, #4a0080 0%, #7b1fa2 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #1a0030 0%, #4a0080 100%)",
        accentColor: "#ce93d8",
        notes: "Introduce yourself and the research topic.",
        elements: [
          makeText("Research Paper Title Goes Here", 8, 26, 84, 20, 40, "#ffffff", "bold"),
          makeText("Author Name  •  Institution Name", 15, 50, 70, 8, 18, "#ce93d8"),
          makeText("Conference Name  •  2025", 25, 62, 50, 7, 14, "#ba68c8"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #120022 0%, #3a0060 100%)",
        accentColor: "#ce93d8",
        notes: "State the research problem and motivation.",
        elements: [
          makeText("Motivation & Problem", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Research Gap:\nDespite advances in [field], [specific problem] remains unsolved. Existing approaches fail to address [limitation].\n\nThis work addresses the fundamental challenge of [research question].",
            5, 26, 90, 55, 16, "#e1bee7", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #120022 0%, #3a0060 100%)",
        accentColor: "#ce93d8",
        notes: "Describe your methodology and experimental setup.",
        elements: [
          makeText("Methodology", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("Approach\n\n1. Data Collection\n2. Feature Engineering\n3. Model Training\n4. Evaluation", 5, 24, 44, 60, 14, "#ce93d8", "normal", "left"),
          makeText("Architecture\n\n[Input Layer]\n↓\n[Hidden Layers]\n↓\n[Output Layer]", 51, 24, 44, 60, 14, "#e1bee7", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #120022 0%, #3a0060 100%)",
        accentColor: "#ce93d8",
        notes: "Present your key experimental results.",
        elements: [
          makeText("Results", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "Accuracy: 94.2% (+8.3% over baseline)\nF1 Score: 0.931\nLatency: 12ms (3x faster)\n\nStatistically significant with p < 0.001",
            5, 28, 90, 50, 18, "#e1bee7", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a0030 0%, #4a0080 100%)",
        accentColor: "#ce93d8",
        notes: "Summarize contributions and future directions.",
        elements: [
          makeText("Conclusions", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText("Key Contributions", 5, 26, 55, 8, 18, "#ce93d8", "bold", "left"),
          makeText(
            "• Novel approach to [problem]\n• State-of-the-art results on [benchmark]\n• Open-sourced code and dataset\n\nFuture Work: Extend to [direction], explore [idea]",
            5, 36, 90, 48, 15, "#e1bee7", "normal", "left"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-product-launch",
    name: "Product Launch",
    category: "Marketing",
    thumbnail: "linear-gradient(135deg, #e96c19 0%, #f0a500 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #e96c19 0%, #f0a500 100%)",
        accentColor: "#fff9c4",
        notes: "Build excitement for the product launch.",
        elements: [
          makeText("Introducing [Product Name]", 8, 28, 84, 18, 48, "#ffffff", "bold"),
          makeText("The Future of [Category] Is Here", 15, 50, 70, 10, 22, "#fff9c4"),
          makeText("Launch Date: Q1 2025", 30, 66, 40, 7, 14, "#ffe082"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #b35000 0%, #cc7700 100%)",
        accentColor: "#ffe082",
        notes: "What problem does your product solve?",
        elements: [
          makeText("The Problem We're Solving", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Every day, [target users] waste [time/money] on [problem]. The status quo is broken:\n\n• Pain point #1\n• Pain point #2\n• Pain point #3",
            5, 26, 90, 55, 16, "#fff8e1", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #b35000 0%, #cc7700 100%)",
        accentColor: "#ffe082",
        notes: "Highlight key product features.",
        elements: [
          makeText("Product Features", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("Core Features\n\n⚡ Instant Setup\n🔒 Enterprise Security\n🤖 AI-Powered\n📊 Real-time Analytics", 5, 24, 44, 60, 14, "#fff8e1", "normal", "left"),
          makeText("Benefits\n\n✓ Save 10 hrs/week\n✓ 99.9% Uptime SLA\n✓ SOC2 Certified\n✓ API-first", 51, 24, 44, 60, 14, "#ffe082", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #b35000 0%, #cc7700 100%)",
        accentColor: "#ffe082",
        notes: "Show pricing tiers.",
        elements: [
          makeText("Pricing", 5, 8, 60, 12, 36, "#ffffff", "bold", "center"),
          makeText(
            "Starter: Free  •  Pro: $29/mo  •  Enterprise: Custom",
            5, 28, 90, 10, 20, "#ffe082", "bold", "center"
          ),
          makeText(
            "All plans include 14-day free trial\nNo credit card required",
            15, 46, 70, 15, 16, "#fff8e1", "normal", "center"
          ),
        ],
      },
      {
        layout: "title",
        background: "linear-gradient(135deg, #e96c19 0%, #f0a500 100%)",
        accentColor: "#fff9c4",
        notes: "Close with a strong call to action.",
        elements: [
          makeText("Ready to Get Started?", 10, 28, 80, 16, 44, "#ffffff", "bold"),
          makeText("Sign up free at [website.com]", 15, 50, 70, 10, 22, "#fff9c4"),
          makeText("Early access for first 500 users", 25, 65, 50, 8, 16, "#ffe082"),
        ],
      },
    ],
  },
  {
    id: "tpl-training",
    name: "Training Session",
    category: "Education",
    thumbnail: "linear-gradient(135deg, #006994 0%, #00b4d8 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #006994 0%, #00b4d8 100%)",
        accentColor: "#b3e5fc",
        notes: "Welcome participants and set expectations.",
        elements: [
          makeText("Training Session Title", 10, 30, 80, 16, 44, "#ffffff", "bold"),
          makeText("Module 1: [Topic Overview]", 15, 50, 70, 10, 22, "#b3e5fc"),
          makeText("Duration: 2 hours  •  Interactive Workshop", 20, 65, 60, 8, 14, "#81d4fa"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #004d6e 0%, #006994 100%)",
        accentColor: "#b3e5fc",
        notes: "Walk through learning objectives.",
        elements: [
          makeText("Learning Objectives", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "By the end of this session, you will be able to:\n\n✓ Understand [concept 1]\n✓ Apply [skill 2] in real scenarios\n✓ Demonstrate [competency 3]\n✓ Build [deliverable 4]",
            5, 26, 90, 55, 16, "#e1f5fe", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #004d6e 0%, #006994 100%)",
        accentColor: "#b3e5fc",
        notes: "Overview of the training agenda.",
        elements: [
          makeText("Agenda", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("Morning\n\n9:00 - Introduction\n9:30 - Core Concepts\n10:30 - Break\n11:00 - Deep Dive", 5, 24, 44, 60, 14, "#b3e5fc", "normal", "left"),
          makeText("Afternoon\n\n1:00 - Hands-on Lab\n2:30 - Group Exercise\n3:30 - Q&A\n4:00 - Wrap Up", 51, 24, 44, 60, 14, "#e1f5fe", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #004d6e 0%, #006994 100%)",
        accentColor: "#b3e5fc",
        notes: "Core training content and concepts.",
        elements: [
          makeText("Core Concept: [Topic]", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Definition: [Clear, concise definition of the concept]\n\nWhy It Matters:\n• Reason 1 with brief explanation\n• Reason 2 with brief explanation\n\nKey Principles:\n1. First principle\n2. Second principle",
            5, 26, 90, 60, 15, "#e1f5fe", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #006994 0%, #00b4d8 100%)",
        accentColor: "#b3e5fc",
        notes: "Recap key takeaways and next steps.",
        elements: [
          makeText("Key Takeaways", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "1. [Most important thing they learned]\n2. [Second key insight]\n3. [Practical application tip]\n\nNext Steps: Complete the exercises in the workbook and join the follow-up session on [date].",
            5, 28, 90, 55, 16, "#e1f5fe", "normal", "left"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-company-overview",
    name: "Company Overview",
    category: "Corporate",
    thumbnail: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        accentColor: "#7c4dff",
        notes: "Welcome investors and partners.",
        elements: [
          makeText("[Company Name]", 10, 28, 80, 18, 52, "#ffffff", "bold"),
          makeText("Transforming [Industry] Since [Year]", 15, 50, 70, 10, 22, "#b39ddb"),
          makeText("Company Overview  •  2025", 30, 65, 40, 7, 14, "#9575cd"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0d0b25 0%, #1a1545 100%)",
        accentColor: "#7c4dff",
        notes: "Share company mission and vision.",
        elements: [
          makeText("Our Mission", 5, 8, 60, 12, 36, "#ffffff", "bold", "left"),
          makeText(
            "\"To [mission statement that describes purpose and impact]\"",
            5, 26, 90, 18, 22, "#b39ddb", "normal", "center"
          ),
          makeText("Vision", 5, 50, 40, 8, 20, "#7c4dff", "bold", "left"),
          makeText(
            "By 2030, we will be the leading [descriptor] platform enabling [outcome] for [target].",
            5, 61, 90, 22, 15, "#e8eaf6", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #0d0b25 0%, #1a1545 100%)",
        accentColor: "#7c4dff",
        notes: "Present company milestones.",
        elements: [
          makeText("Our Journey", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("2020: Founded\n2021: Seed Round ($2M)\n2022: 100 customers\n2023: Series A ($15M)", 5, 24, 44, 60, 14, "#b39ddb", "normal", "left"),
          makeText("2024: 1,000 customers\n2025: Series B ($40M)\nToday: 5,000+ customers\n2026: IPO Target", 51, 24, 44, 60, 14, "#7c4dff", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0d0b25 0%, #1a1545 100%)",
        accentColor: "#7c4dff",
        notes: "Introduce leadership team.",
        elements: [
          makeText("Leadership Team", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "CEO: [Name] — 15+ years in [industry]\nCTO: [Name] — Former [Company] Engineer\nCMO: [Name] — Built [Brand] from 0-$100M\nCFO: [Name] — Ex-Goldman Sachs VP",
            5, 28, 90, 50, 16, "#e8eaf6", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
        accentColor: "#7c4dff",
        notes: "Share key metrics and achievements.",
        elements: [
          makeText("By the Numbers", 5, 8, 90, 12, 32, "#ffffff", "bold", "center"),
          makeText("5,000+\nCustomers", 5, 28, 28, 30, 22, "#7c4dff", "bold", "center"),
          makeText("98%\nRetention", 36, 28, 28, 30, 22, "#b39ddb", "bold", "center"),
          makeText("$40M\nARR", 67, 28, 28, 30, 22, "#e8eaf6", "bold", "center"),
          makeText("150+\nEmployees  •  12 Countries  •  4.9★ Rating", 5, 64, 90, 10, 14, "#b39ddb", "normal", "center"),
        ],
      },
    ],
  },
  {
    id: "tpl-business-proposal",
    name: "Business Proposal",
    category: "Business",
    thumbnail: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #c94b4b 0%, #7b1fa2 100%)",
        accentColor: "#f48fb1",
        notes: "Introduce your proposal.",
        elements: [
          makeText("Business Proposal", 10, 22, 80, 14, 40, "#ffffff", "bold"),
          makeText("[Project Name]", 10, 40, 80, 14, 32, "#f48fb1", "bold"),
          makeText("Prepared for [Client Name]  •  [Date]", 20, 60, 60, 8, 16, "#f8bbd0"),
          makeText("Submitted by [Your Company]", 25, 72, 50, 7, 13, "#e1bee7"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #8b1a1a 0%, #6a0080 100%)",
        accentColor: "#f48fb1",
        notes: "Summarize the executive overview.",
        elements: [
          makeText("Executive Summary", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "We propose to [deliver/build/provide] a comprehensive solution that will enable [client] to [achieve outcome]. This engagement will span [timeline] and deliver measurable ROI within [period].\n\nEstimated Investment: $[amount]\nExpected ROI: [X]x within [timeframe]",
            5, 26, 90, 60, 15, "#fce4ec", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #8b1a1a 0%, #6a0080 100%)",
        accentColor: "#f48fb1",
        notes: "Outline scope of work.",
        elements: [
          makeText("Scope of Work", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Phase 1 (Month 1-2): Discovery & Planning\nPhase 2 (Month 3-5): Development & Implementation\nPhase 3 (Month 6): Testing & Launch\nPhase 4 (Ongoing): Support & Optimization\n\nDeliverables include: [list key deliverables]",
            5, 26, 90, 58, 15, "#fce4ec", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #8b1a1a 0%, #6a0080 100%)",
        accentColor: "#f48fb1",
        notes: "Present investment and timeline.",
        elements: [
          makeText("Investment & Timeline", 5, 8, 90, 12, 28, "#ffffff", "bold", "center"),
          makeText("Investment\n\nSetup: $XX,000\nMonthly: $X,000\nTotal (12mo): $XX,000\n\nPayment: Net 30", 5, 24, 44, 60, 14, "#f48fb1", "normal", "left"),
          makeText("Timeline\n\n✓ Week 1-2: Kickoff\n✓ Month 1: Discovery\n✓ Month 3: MVP\n✓ Month 6: Launch", 51, 24, 44, 60, 14, "#fce4ec", "normal", "left"),
        ],
      },
      {
        layout: "title",
        background: "linear-gradient(135deg, #c94b4b 0%, #7b1fa2 100%)",
        accentColor: "#f48fb1",
        notes: "Close with next steps.",
        elements: [
          makeText("Next Steps", 10, 28, 80, 16, 44, "#ffffff", "bold"),
          makeText("1. Review and sign proposal\n2. Schedule kickoff call\n3. Begin discovery phase", 15, 50, 70, 24, 18, "#f8bbd0", "normal", "center"),
          makeText("Questions? [email@company.com]", 25, 78, 50, 7, 13, "#e1bee7"),
        ],
      },
    ],
  },
  {
    id: "tpl-teaching",
    name: "Training & Teaching Deck",
    category: "Education",
    thumbnail: "linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)",
        accentColor: "#b2dfdb",
        notes: "Welcome students and introduce the lesson.",
        elements: [
          makeText("Lesson Title", 10, 30, 80, 16, 48, "#ffffff", "bold"),
          makeText("Unit [X]: [Chapter Name]", 15, 50, 70, 10, 22, "#b2dfdb"),
          makeText("[Subject]  •  Grade [X]  •  [Duration]", 20, 65, 60, 8, 14, "#a5d6a7"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0d6e42 0%, #0f9b58 100%)",
        accentColor: "#b2dfdb",
        notes: "Go through lesson objectives with students.",
        elements: [
          makeText("Today's Learning Goals", 5, 8, 60, 12, 28, "#ffffff", "bold", "left"),
          makeText(
            "Students will:\n\n🎯 Understand [key concept 1]\n🎯 Practice [skill 2]\n🎯 Create [project/work product]\n🎯 Reflect on [connection to prior learning]",
            5, 26, 90, 55, 16, "#e8f5e9", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0d6e42 0%, #0f9b58 100%)",
        accentColor: "#b2dfdb",
        notes: "Introduce the main concept with explanation.",
        elements: [
          makeText("Key Concept", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "[Concept Name] refers to [definition].\n\nExample: [Concrete, relatable example]\n\nReal-world connection: We see this in [everyday context] when [explanation].",
            5, 26, 90, 55, 16, "#e8f5e9", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0d6e42 0%, #0f9b58 100%)",
        accentColor: "#b2dfdb",
        notes: "Guide students through the activity.",
        elements: [
          makeText("Practice Activity", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText("Instructions:", 5, 26, 50, 8, 18, "#b2dfdb", "bold", "left"),
          makeText(
            "1. [Step one with clear action]\n2. [Step two]\n3. Compare with a partner\n4. Share your answer with the class",
            5, 36, 90, 40, 16, "#e8f5e9", "normal", "left"
          ),
          makeText("⏱ 10 minutes", 70, 26, 25, 8, 16, "#b2dfdb", "bold", "center"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)",
        accentColor: "#b2dfdb",
        notes: "Review what students learned.",
        elements: [
          makeText("Review & Exit Ticket", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "What we learned today:\n• [Key concept 1]\n• [Key concept 2]\n\n📝 Exit Ticket: In one sentence, explain [main concept] using your own words.",
            5, 26, 90, 55, 16, "#e8f5e9", "normal", "left"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-weekly-meeting",
    name: "Weekly Meeting Update",
    category: "Corporate",
    thumbnail: "#2d3748",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
        accentColor: "#90cdf4",
        notes: "Start the meeting, confirm agenda.",
        elements: [
          makeText("Weekly Team Update", 10, 28, 80, 16, 44, "#ffffff", "bold"),
          makeText("Week of [Month Day, Year]", 20, 50, 60, 10, 22, "#90cdf4"),
          makeText("[Team Name]  •  [Time]", 30, 65, 40, 8, 14, "#a0aec0"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a2035 0%, #2d3748 100%)",
        accentColor: "#90cdf4",
        notes: "Review completed items from last week.",
        elements: [
          makeText("Last Week's Wins", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "✅ [Completed task or milestone]\n✅ [Shipped feature or deliverable]\n✅ [Partnership or deal closed]\n✅ [Problem resolved]\n\n⚠️ Carried over: [Item not yet completed]",
            5, 26, 90, 58, 16, "#e2e8f0", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a2035 0%, #2d3748 100%)",
        accentColor: "#90cdf4",
        notes: "Discuss priorities for this week.",
        elements: [
          makeText("This Week's Focus", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "P0 — [Critical priority that must get done]\nP1 — [High-priority task]\nP1 — [Another high priority]\nP2 — [Medium priority if time permits]\n\nBlocking Issues: [Any blockers to discuss]",
            5, 26, 90, 60, 16, "#e2e8f0", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #1a2035 0%, #2d3748 100%)",
        accentColor: "#90cdf4",
        notes: "Share team metrics.",
        elements: [
          makeText("Metrics at a Glance", 5, 8, 90, 12, 28, "#ffffff", "bold", "center"),
          makeText("This Week\n\n[Metric 1]: X\n[Metric 2]: Y\n[Metric 3]: Z", 5, 24, 44, 50, 16, "#90cdf4", "normal", "left"),
          makeText("vs Last Week\n\n+[X]% ↑\n-[Y]% ↓\n+[Z]% ↑", 51, 24, 44, 50, 16, "#e2e8f0", "normal", "left"),
          makeText("Next update: [Day, Time]", 25, 78, 50, 7, 13, "#a0aec0", "normal", "center"),
        ],
      },
    ],
  },
  {
    id: "tpl-financial",
    name: "Financial Quarterly PPT",
    category: "Finance",
    thumbnail: "linear-gradient(135deg, #f79c1e 0%, #ffd200 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #1a1200 0%, #3d2b00 100%)",
        accentColor: "#ffd200",
        notes: "Open earnings presentation.",
        elements: [
          makeText("Q4 2025 Financial Results", 8, 28, 84, 16, 44, "#ffffff", "bold"),
          makeText("Fiscal Year Earnings Presentation", 15, 48, 70, 10, 20, "#ffd200"),
          makeText("[Company Name]  •  Investor Relations", 20, 63, 60, 8, 14, "#f9a825"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #150f00 0%, #2a1f00 100%)",
        accentColor: "#ffd200",
        notes: "Highlight key financial results.",
        elements: [
          makeText("Q4 Financial Highlights", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Revenue: $124.5M  (+22% YoY)\nGross Profit: $89.6M  (72% margin)\nEBITDA: $31.2M  (+18% YoY)\nNet Income: $18.7M  (+31% YoY)\n\nEPS: $0.47  vs $0.36 PY",
            5, 26, 90, 58, 16, "#fff8e1", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #150f00 0%, #2a1f00 100%)",
        accentColor: "#ffd200",
        notes: "Compare segments and geographies.",
        elements: [
          makeText("Revenue Breakdown", 5, 8, 90, 12, 28, "#ffffff", "bold", "center"),
          makeText("By Segment\n\nEnterprise: $72M (58%)\nSMB: $35M (28%)\nConsumer: $17M (14%)", 5, 24, 44, 55, 15, "#ffd200", "normal", "left"),
          makeText("By Geography\n\nNorth America: $80M\nEMEA: $27M\nAPAC: $12M\nOther: $5M", 51, 24, 44, 55, 15, "#fff8e1", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #150f00 0%, #2a1f00 100%)",
        accentColor: "#ffd200",
        notes: "Present full-year guidance.",
        elements: [
          makeText("FY 2026 Guidance", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Revenue: $520M – $540M\nGross Margin: 71% – 73%\nEBITDA Margin: 24% – 26%\nCapEx: ~$15M\n\nAssumes continued macro stability and [product launches].",
            5, 26, 90, 58, 16, "#fff8e1", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #1a1200 0%, #3d2b00 100%)",
        accentColor: "#ffd200",
        notes: "Summarize key investment thesis.",
        elements: [
          makeText("Investment Highlights", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "• Market leadership in $50B+ TAM\n• Rule of 40 score: 48 (22% growth + 26% EBITDA)\n• Strong FCF conversion: 85%\n• $200M+ cash, no debt\n• Dividend: $0.20/share announced",
            5, 26, 90, 58, 16, "#fff8e1", "normal", "left"
          ),
        ],
      },
    ],
  },
  {
    id: "tpl-workshop",
    name: "Workshop Presentation",
    category: "Education",
    thumbnail: "linear-gradient(135deg, #006994 0%, #0f9b58 100%)",
    slides: [
      {
        layout: "title",
        background: "linear-gradient(135deg, #004d40 0%, #006064 100%)",
        accentColor: "#80deea",
        notes: "Welcome participants to the workshop.",
        elements: [
          makeText("Workshop: [Topic]", 8, 28, 84, 16, 44, "#ffffff", "bold"),
          makeText("Hands-On Learning Experience", 15, 48, 70, 10, 22, "#80deea"),
          makeText("[Date]  •  [Location/Platform]  •  [Duration]", 15, 63, 70, 8, 14, "#4dd0e1"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #00352c 0%, #004d40 100%)",
        accentColor: "#80deea",
        notes: "Set expectations for the workshop.",
        elements: [
          makeText("Workshop Overview", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "What you'll build:\n[Concrete deliverable]\n\nWhat you'll learn:\n• [Skill 1]\n• [Skill 2]\n• [Skill 3]\n\nPrerequisites: [Any required knowledge/setup]",
            5, 26, 90, 60, 15, "#e0f7fa", "normal", "left"
          ),
        ],
      },
      {
        layout: "two-column",
        background: "linear-gradient(135deg, #00352c 0%, #004d40 100%)",
        accentColor: "#80deea",
        notes: "Walk through workshop exercises.",
        elements: [
          makeText("Exercise 1: [Name]", 5, 8, 90, 12, 28, "#ffffff", "bold", "left"),
          makeText("Goal\n\n[What participants will accomplish]\n\nTime: 20 minutes", 5, 24, 44, 55, 14, "#80deea", "normal", "left"),
          makeText("Steps\n\n1. [Action step]\n2. [Action step]\n3. [Action step]\n4. Review output", 51, 24, 44, 55, 14, "#e0f7fa", "normal", "left"),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #00352c 0%, #004d40 100%)",
        accentColor: "#80deea",
        notes: "Facilitate group discussion.",
        elements: [
          makeText("Group Discussion", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Discussion Prompts:\n\n❓ What was most challenging about [exercise]?\n❓ How would you apply this in your context?\n❓ What would you do differently?\n\nShare out: 2 min per group",
            5, 26, 90, 58, 15, "#e0f7fa", "normal", "left"
          ),
        ],
      },
      {
        layout: "content",
        background: "linear-gradient(135deg, #004d40 0%, #006064 100%)",
        accentColor: "#80deea",
        notes: "Wrap up and provide resources.",
        elements: [
          makeText("Wrap Up & Resources", 5, 8, 60, 12, 32, "#ffffff", "bold", "left"),
          makeText(
            "Key Takeaways:\n✓ [Main learning 1]\n✓ [Main learning 2]\n✓ [Main learning 3]\n\nResources: [link to materials]\nCommunity: [Slack/Discord/Forum link]\nNext Workshop: [Date]",
            5, 26, 90, 60, 15, "#e0f7fa", "normal", "left"
          ),
        ],
      },
    ],
  },
];

function createSlideFromTemplate(
  templateSlide: TemplateSlide,
  index: number
): Slide {
  return {
    id: generateId(),
    layout: templateSlide.layout,
    background: templateSlide.background,
    accentColor: templateSlide.accentColor,
    notes: templateSlide.notes,
    elements: templateSlide.elements.map((el) => ({
      ...el,
      id: generateId(),
    })) as SlideElement[],
  };
}

function createDefaultSlide(layout: Layout = "title"): Slide {
  const bgMap: Record<Layout, string> = {
    title: BACKGROUND_PRESETS[0].value,
    content: BACKGROUND_PRESETS[6].value,
    "two-column": BACKGROUND_PRESETS[6].value,
    blank: BACKGROUND_PRESETS[9].value,
    image: BACKGROUND_PRESETS[9].value,
    comparison: BACKGROUND_PRESETS[6].value,
  };

  const elementMap: Record<Layout, TextElement[]> = {
    title: [
      {
        id: generateId(),
        type: "text",
        x: 10,
        y: 30,
        width: 80,
        height: 16,
        zIndex: 1,
        content: "",
        fontSize: 48,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        placeholder: "Click to add title",
      },
      {
        id: generateId(),
        type: "text",
        x: 15,
        y: 52,
        width: 70,
        height: 10,
        zIndex: 1,
        content: "",
        fontSize: 22,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "center",
        placeholder: "Click to add subtitle",
      },
    ],
    content: [
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 8,
        width: 90,
        height: 14,
        zIndex: 1,
        content: "",
        fontSize: 36,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "left",
        placeholder: "Slide Title",
      },
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 28,
        width: 90,
        height: 60,
        zIndex: 1,
        content: "",
        fontSize: 18,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "left",
        placeholder: "Click to add content...",
      },
    ],
    "two-column": [
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 8,
        width: 90,
        height: 14,
        zIndex: 1,
        content: "",
        fontSize: 32,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        placeholder: "Slide Title",
      },
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 26,
        width: 44,
        height: 60,
        zIndex: 1,
        content: "",
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "left",
        placeholder: "Left column content...",
      },
      {
        id: generateId(),
        type: "text",
        x: 51,
        y: 26,
        width: 44,
        height: 60,
        zIndex: 1,
        content: "",
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "left",
        placeholder: "Right column content...",
      },
    ],
    blank: [],
    image: [
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 75,
        width: 90,
        height: 14,
        zIndex: 2,
        content: "",
        fontSize: 24,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        placeholder: "Image caption...",
      },
    ],
    comparison: [
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 8,
        width: 90,
        height: 14,
        zIndex: 1,
        content: "",
        fontSize: 32,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff",
        textAlign: "center",
        placeholder: "Comparison Title",
      },
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 24,
        width: 44,
        height: 12,
        zIndex: 1,
        content: "",
        fontSize: 20,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#90caf9",
        textAlign: "center",
        placeholder: "Option A",
      },
      {
        id: generateId(),
        type: "text",
        x: 51,
        y: 24,
        width: 44,
        height: 12,
        zIndex: 1,
        content: "",
        fontSize: 20,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#f48fb1",
        textAlign: "center",
        placeholder: "Option B",
      },
      {
        id: generateId(),
        type: "text",
        x: 5,
        y: 38,
        width: 44,
        height: 48,
        zIndex: 1,
        content: "",
        fontSize: 15,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "left",
        placeholder: "• Feature 1\n• Feature 2\n• Feature 3",
      },
      {
        id: generateId(),
        type: "text",
        x: 51,
        y: 38,
        width: 44,
        height: 48,
        zIndex: 1,
        content: "",
        fontSize: 15,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#e0e0e0",
        textAlign: "left",
        placeholder: "• Feature 1\n• Feature 2\n• Feature 3",
      },
    ],
  };

  return {
    id: generateId(),
    layout,
    background: bgMap[layout],
    accentColor: "#4fc3f7",
    elements: elementMap[layout],
    notes: "",
  };
}

interface PresentationState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  isPresenterMode: boolean;
  presenterSlideIndex: number;
  showAIPanel: boolean;
  showNotes: boolean;
  showTemplates: boolean;
  activeTool: "select" | "text" | "image" | "rectangle" | "circle" | "arrow" | "star";
  presenterBlackScreen: boolean;

  // Actions
  addSlide: (layout?: Layout) => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setCurrentSlide: (index: number) => void;
  updateSlideBackground: (slideId: string, bg: string) => void;
  updateSlideNotes: (slideId: string, notes: string) => void;
  updateSlideAccent: (slideId: string, color: string) => void;
  addElement: (slideId: string, element: Omit<TextElement, "id"> | Omit<ShapeElement, "id"> | Omit<ImageElement, "id">) => void;
  updateElement: (
    slideId: string,
    elementId: string,
    updates: Partial<SlideElement>
  ) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  setSelectedElement: (id: string | null) => void;
  bringToFront: (slideId: string, elementId: string) => void;
  sendToBack: (slideId: string, elementId: string) => void;
  enterPresenterMode: () => void;
  exitPresenterMode: () => void;
  nextPresenterSlide: () => void;
  prevPresenterSlide: () => void;
  togglePresenterBlackScreen: () => void;
  toggleAIPanel: () => void;
  toggleNotes: () => void;
  toggleTemplates: () => void;
  loadTemplate: (template: PresentationTemplate) => void;
  setActiveTool: (tool: PresentationState["activeTool"]) => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  slides: [createDefaultSlide("title")],
  currentSlideIndex: 0,
  selectedElementId: null,
  isPresenterMode: false,
  presenterSlideIndex: 0,
  showAIPanel: false,
  showNotes: true,
  showTemplates: false,
  activeTool: "select",
  presenterBlackScreen: false,

  addSlide: (layout = "content") => {
    const slide = createDefaultSlide(layout);
    set((s) => ({
      slides: [...s.slides, slide],
      currentSlideIndex: s.slides.length,
      selectedElementId: null,
    }));
  },

  deleteSlide: (id) =>
    set((s) => {
      if (s.slides.length <= 1) return s;
      const idx = s.slides.findIndex((sl) => sl.id === id);
      const newSlides = s.slides.filter((sl) => sl.id !== id);
      return {
        slides: newSlides,
        currentSlideIndex: Math.min(
          idx,
          newSlides.length - 1
        ),
        selectedElementId: null,
      };
    }),

  duplicateSlide: (id) =>
    set((s) => {
      const idx = s.slides.findIndex((sl) => sl.id === id);
      if (idx === -1) return s;
      const original = s.slides[idx];
      const copy: Slide = {
        ...original,
        id: generateId(),
        elements: original.elements.map((el) => ({
          ...el,
          id: generateId(),
        })),
      };
      const newSlides = [...s.slides];
      newSlides.splice(idx + 1, 0, copy);
      return { slides: newSlides, currentSlideIndex: idx + 1 };
    }),

  reorderSlides: (fromIndex, toIndex) =>
    set((s) => {
      const newSlides = [...s.slides];
      const [moved] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, moved);
      let currentSlideIndex = s.currentSlideIndex;
      if (s.currentSlideIndex === fromIndex) {
        currentSlideIndex = toIndex;
      } else if (
        fromIndex < s.currentSlideIndex &&
        toIndex >= s.currentSlideIndex
      ) {
        currentSlideIndex--;
      } else if (
        fromIndex > s.currentSlideIndex &&
        toIndex <= s.currentSlideIndex
      ) {
        currentSlideIndex++;
      }
      return { slides: newSlides, currentSlideIndex };
    }),

  setCurrentSlide: (index) =>
    set({ currentSlideIndex: index, selectedElementId: null }),

  updateSlideBackground: (slideId, bg) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === slideId ? { ...sl, background: bg } : sl
      ),
    })),

  updateSlideNotes: (slideId, notes) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === slideId ? { ...sl, notes } : sl
      ),
    })),

  updateSlideAccent: (slideId, color) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === slideId ? { ...sl, accentColor: color } : sl
      ),
    })),

  addElement: (slideId, element) =>
    set((s) => {
      const newEl = { ...element, id: generateId() } as SlideElement;
      return {
        slides: s.slides.map((sl) =>
          sl.id === slideId
            ? { ...sl, elements: [...sl.elements, newEl] }
            : sl
        ),
        selectedElementId: newEl.id,
      };
    }),

  updateElement: (slideId, elementId, updates) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === slideId
          ? {
              ...sl,
              elements: sl.elements.map((el) =>
                el.id === elementId ? ({ ...el, ...updates } as SlideElement) : el
              ),
            }
          : sl
      ),
    })),

  deleteElement: (slideId, elementId) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === slideId
          ? { ...sl, elements: sl.elements.filter((el) => el.id !== elementId) }
          : sl
      ),
      selectedElementId:
        s.selectedElementId === elementId ? null : s.selectedElementId,
    })),

  setSelectedElement: (id) => set({ selectedElementId: id }),

  bringToFront: (slideId, elementId) =>
    set((s) => {
      const slide = s.slides.find((sl) => sl.id === slideId);
      if (!slide) return s;
      const maxZ = Math.max(...slide.elements.map((el) => el.zIndex), 0);
      return {
        slides: s.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                elements: sl.elements.map((el) =>
                  el.id === elementId ? { ...el, zIndex: maxZ + 1 } : el
                ),
              }
            : sl
        ),
      };
    }),

  sendToBack: (slideId, elementId) =>
    set((s) => {
      const slide = s.slides.find((sl) => sl.id === slideId);
      if (!slide) return s;
      const minZ = Math.min(...slide.elements.map((el) => el.zIndex), 0);
      return {
        slides: s.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                elements: sl.elements.map((el) =>
                  el.id === elementId ? { ...el, zIndex: minZ - 1 } : el
                ),
              }
            : sl
        ),
      };
    }),

  enterPresenterMode: () =>
    set((s) => ({
      isPresenterMode: true,
      presenterSlideIndex: s.currentSlideIndex,
    })),

  exitPresenterMode: () => set({ isPresenterMode: false, presenterBlackScreen: false }),

  nextPresenterSlide: () =>
    set((s) => ({
      presenterSlideIndex: Math.min(
        s.presenterSlideIndex + 1,
        s.slides.length - 1
      ),
    })),

  prevPresenterSlide: () =>
    set((s) => ({
      presenterSlideIndex: Math.max(s.presenterSlideIndex - 1, 0),
    })),

  togglePresenterBlackScreen: () =>
    set((s) => ({ presenterBlackScreen: !s.presenterBlackScreen })),

  toggleAIPanel: () => set((s) => ({ showAIPanel: !s.showAIPanel })),
  toggleNotes: () => set((s) => ({ showNotes: !s.showNotes })),
  toggleTemplates: () => set((s) => ({ showTemplates: !s.showTemplates })),

  loadTemplate: (template) => {
    const slides = template.slides.map(createSlideFromTemplate);
    set({ slides, currentSlideIndex: 0, selectedElementId: null, showTemplates: false });
  },

  setActiveTool: (tool) => set({ activeTool: tool, selectedElementId: null }),
}));
