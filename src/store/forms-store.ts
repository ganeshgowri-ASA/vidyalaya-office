import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FormType = "form" | "quiz" | "poll" | "survey";
export type Audience = "internal" | "external";
export type QuestionType =
  | "text"
  | "textarea"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "rating"
  | "date"
  | "file-upload"
  | "scale"
  | "ranking";

export interface QuestionOption {
  id: string;
  label: string;
  isCorrect?: boolean; // for quiz
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  minScale?: number;
  maxScale?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  points?: number; // for quiz scoring
}

export interface FormResponse {
  id: string;
  formId: string;
  respondent: string;
  submittedAt: string;
  answers: Record<string, string | string[] | number>;
  score?: number; // for quiz
  totalPoints?: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  formType: FormType;
  audience: Audience;
  questions: FormQuestion[];
  responses: FormResponse[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "active" | "closed";
  color: string;
}

// ─── View types ──────────────────────────────────────────────────────────────

export type ViewMode =
  | "list"
  | "builder"
  | "fill"
  | "responses"
  | "share"
  | "create";

interface FormsState {
  forms: Form[];
  activeFormId: string | null;
  viewMode: ViewMode;
  searchQuery: string;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setActiveFormId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  addQuestion: (formId: string, question: FormQuestion) => void;
  updateQuestion: (
    formId: string,
    questionId: string,
    updates: Partial<FormQuestion>
  ) => void;
  removeQuestion: (formId: string, questionId: string) => void;
  reorderQuestions: (formId: string, fromIndex: number, toIndex: number) => void;
  addResponse: (formId: string, response: FormResponse) => void;
  getActiveForm: () => Form | undefined;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const sampleForms: Form[] = [
  // 1 ─ Employee Satisfaction Survey (internal)
  {
    id: "form-emp-satisfaction",
    title: "Employee Satisfaction Survey",
    description:
      "Help us understand how satisfied you are with your workplace environment, management, and growth opportunities.",
    formType: "survey",
    audience: "internal",
    color: "#6366f1",
    status: "active",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
    questions: [
      {
        id: "es-q1",
        type: "rating",
        title: "How satisfied are you with your overall job?",
        required: true,
      },
      {
        id: "es-q2",
        type: "rating",
        title: "How would you rate your work-life balance?",
        required: true,
      },
      {
        id: "es-q3",
        type: "multiple-choice",
        title: "How long have you been with the company?",
        required: true,
        options: [
          { id: "o1", label: "Less than 1 year" },
          { id: "o2", label: "1-3 years" },
          { id: "o3", label: "3-5 years" },
          { id: "o4", label: "5+ years" },
        ],
      },
      {
        id: "es-q4",
        type: "scale",
        title:
          "On a scale of 1-10, how likely are you to recommend this company?",
        required: true,
        minScale: 1,
        maxScale: 10,
        scaleMinLabel: "Not likely",
        scaleMaxLabel: "Very likely",
      },
      {
        id: "es-q5",
        type: "checkbox",
        title: "Which benefits do you value most? (Select all that apply)",
        required: false,
        options: [
          { id: "b1", label: "Health Insurance" },
          { id: "b2", label: "Remote Work" },
          { id: "b3", label: "Paid Time Off" },
          { id: "b4", label: "Professional Development" },
          { id: "b5", label: "Gym Membership" },
        ],
      },
      {
        id: "es-q6",
        type: "textarea",
        title: "What could we improve to make your work experience better?",
        required: false,
      },
    ],
    responses: [
      {
        id: "r1",
        formId: "form-emp-satisfaction",
        respondent: "Alice Johnson",
        submittedAt: "2026-03-12T10:15:00Z",
        answers: {
          "es-q1": 4,
          "es-q2": 3,
          "es-q3": "1-3 years",
          "es-q4": 8,
          "es-q5": ["Health Insurance", "Remote Work", "Paid Time Off"],
          "es-q6": "More flexible hours would be great.",
        },
      },
      {
        id: "r2",
        formId: "form-emp-satisfaction",
        respondent: "Bob Smith",
        submittedAt: "2026-03-13T14:20:00Z",
        answers: {
          "es-q1": 5,
          "es-q2": 5,
          "es-q3": "3-5 years",
          "es-q4": 9,
          "es-q5": ["Remote Work", "Professional Development"],
          "es-q6": "Everything is great!",
        },
      },
      {
        id: "r3",
        formId: "form-emp-satisfaction",
        respondent: "Carol Davis",
        submittedAt: "2026-03-14T09:45:00Z",
        answers: {
          "es-q1": 3,
          "es-q2": 2,
          "es-q3": "5+ years",
          "es-q4": 6,
          "es-q5": ["Health Insurance", "Paid Time Off", "Gym Membership"],
          "es-q6": "Better management communication needed.",
        },
      },
      {
        id: "r4",
        formId: "form-emp-satisfaction",
        respondent: "Daniel Lee",
        submittedAt: "2026-03-15T11:00:00Z",
        answers: {
          "es-q1": 4,
          "es-q2": 4,
          "es-q3": "Less than 1 year",
          "es-q4": 7,
          "es-q5": ["Professional Development", "Remote Work"],
          "es-q6": "",
        },
      },
      {
        id: "r5",
        formId: "form-emp-satisfaction",
        respondent: "Eva Martinez",
        submittedAt: "2026-03-16T16:30:00Z",
        answers: {
          "es-q1": 2,
          "es-q2": 3,
          "es-q3": "1-3 years",
          "es-q4": 5,
          "es-q5": ["Health Insurance"],
          "es-q6": "Need more team bonding activities.",
        },
      },
    ],
  },

  // 2 ─ Customer Feedback Form (external)
  {
    id: "form-customer-feedback",
    title: "Customer Feedback Form",
    description:
      "We value your feedback! Let us know about your experience with our products and services.",
    formType: "form",
    audience: "external",
    color: "#10b981",
    status: "active",
    createdAt: "2026-03-05T08:00:00Z",
    updatedAt: "2026-03-18T10:00:00Z",
    questions: [
      {
        id: "cf-q1",
        type: "text",
        title: "Your Name",
        required: true,
      },
      {
        id: "cf-q2",
        type: "text",
        title: "Email Address",
        required: true,
      },
      {
        id: "cf-q3",
        type: "dropdown",
        title: "Which product did you use?",
        required: true,
        options: [
          { id: "p1", label: "Vidyalaya Document" },
          { id: "p2", label: "Vidyalaya Spreadsheet" },
          { id: "p3", label: "Vidyalaya Presentation" },
          { id: "p4", label: "Vidyalaya Forms" },
          { id: "p5", label: "Vidyalaya Chat" },
        ],
      },
      {
        id: "cf-q4",
        type: "rating",
        title: "How would you rate your overall experience?",
        required: true,
      },
      {
        id: "cf-q5",
        type: "multiple-choice",
        title: "How did you hear about us?",
        required: false,
        options: [
          { id: "h1", label: "Search Engine" },
          { id: "h2", label: "Social Media" },
          { id: "h3", label: "Friend/Colleague" },
          { id: "h4", label: "Advertisement" },
          { id: "h5", label: "Other" },
        ],
      },
      {
        id: "cf-q6",
        type: "textarea",
        title: "Any additional comments or suggestions?",
        required: false,
      },
    ],
    responses: [
      {
        id: "cfr1",
        formId: "form-customer-feedback",
        respondent: "Sarah Connor",
        submittedAt: "2026-03-06T12:00:00Z",
        answers: {
          "cf-q1": "Sarah Connor",
          "cf-q2": "sarah@example.com",
          "cf-q3": "Vidyalaya Document",
          "cf-q4": 5,
          "cf-q5": "Search Engine",
          "cf-q6": "Love the dark mode!",
        },
      },
      {
        id: "cfr2",
        formId: "form-customer-feedback",
        respondent: "James Wilson",
        submittedAt: "2026-03-08T09:30:00Z",
        answers: {
          "cf-q1": "James Wilson",
          "cf-q2": "james@corp.com",
          "cf-q3": "Vidyalaya Spreadsheet",
          "cf-q4": 4,
          "cf-q5": "Friend/Colleague",
          "cf-q6": "Would like more formula support.",
        },
      },
      {
        id: "cfr3",
        formId: "form-customer-feedback",
        respondent: "Priya Sharma",
        submittedAt: "2026-03-10T15:00:00Z",
        answers: {
          "cf-q1": "Priya Sharma",
          "cf-q2": "priya@startup.io",
          "cf-q3": "Vidyalaya Presentation",
          "cf-q4": 4,
          "cf-q5": "Social Media",
          "cf-q6": "",
        },
      },
      {
        id: "cfr4",
        formId: "form-customer-feedback",
        respondent: "Mike Chen",
        submittedAt: "2026-03-12T11:15:00Z",
        answers: {
          "cf-q1": "Mike Chen",
          "cf-q2": "mike@company.org",
          "cf-q3": "Vidyalaya Forms",
          "cf-q4": 3,
          "cf-q5": "Advertisement",
          "cf-q6": "Needs more question types.",
        },
      },
    ],
  },

  // 3 ─ Product Knowledge Quiz (internal)
  {
    id: "form-product-quiz",
    title: "Product Knowledge Quiz",
    description:
      "Test your knowledge of our product features. Score 80% or above to earn your certification badge!",
    formType: "quiz",
    audience: "internal",
    color: "#f59e0b",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-22T08:00:00Z",
    questions: [
      {
        id: "pq-q1",
        type: "multiple-choice",
        title: "What framework does Vidyalaya Office use?",
        required: true,
        points: 10,
        options: [
          { id: "a1", label: "React with CRA", isCorrect: false },
          { id: "a2", label: "Next.js 14 App Router", isCorrect: true },
          { id: "a3", label: "Vue.js 3", isCorrect: false },
          { id: "a4", label: "Angular 17", isCorrect: false },
        ],
      },
      {
        id: "pq-q2",
        type: "multiple-choice",
        title: "Which state management library is used?",
        required: true,
        points: 10,
        options: [
          { id: "b1", label: "Redux", isCorrect: false },
          { id: "b2", label: "MobX", isCorrect: false },
          { id: "b3", label: "Zustand", isCorrect: true },
          { id: "b4", label: "Jotai", isCorrect: false },
        ],
      },
      {
        id: "pq-q3",
        type: "multiple-choice",
        title: "What icon library does the project use?",
        required: true,
        points: 10,
        options: [
          { id: "c1", label: "Font Awesome", isCorrect: false },
          { id: "c2", label: "Material Icons", isCorrect: false },
          { id: "c3", label: "Heroicons", isCorrect: false },
          { id: "c4", label: "lucide-react", isCorrect: true },
        ],
      },
      {
        id: "pq-q4",
        type: "multiple-choice",
        title: "Which CSS approach is used for styling?",
        required: true,
        points: 10,
        options: [
          { id: "d1", label: "CSS Modules", isCorrect: false },
          { id: "d2", label: "Styled Components", isCorrect: false },
          { id: "d3", label: "Tailwind CSS + CSS Variables", isCorrect: true },
          { id: "d4", label: "Sass/SCSS", isCorrect: false },
        ],
      },
      {
        id: "pq-q5",
        type: "multiple-choice",
        title: "Where is Vidyalaya Office deployed?",
        required: true,
        points: 10,
        options: [
          { id: "e1", label: "AWS", isCorrect: false },
          { id: "e2", label: "Vercel", isCorrect: true },
          { id: "e3", label: "Netlify", isCorrect: false },
          { id: "e4", label: "Heroku", isCorrect: false },
        ],
      },
    ],
    responses: [
      {
        id: "pqr1",
        formId: "form-product-quiz",
        respondent: "Tom Anderson",
        submittedAt: "2026-03-02T11:00:00Z",
        answers: {
          "pq-q1": "Next.js 14 App Router",
          "pq-q2": "Zustand",
          "pq-q3": "lucide-react",
          "pq-q4": "Tailwind CSS + CSS Variables",
          "pq-q5": "Vercel",
        },
        score: 50,
        totalPoints: 50,
      },
      {
        id: "pqr2",
        formId: "form-product-quiz",
        respondent: "Lisa Park",
        submittedAt: "2026-03-04T14:30:00Z",
        answers: {
          "pq-q1": "Next.js 14 App Router",
          "pq-q2": "Redux",
          "pq-q3": "lucide-react",
          "pq-q4": "CSS Modules",
          "pq-q5": "Vercel",
        },
        score: 30,
        totalPoints: 50,
      },
      {
        id: "pqr3",
        formId: "form-product-quiz",
        respondent: "Kevin Brown",
        submittedAt: "2026-03-06T09:15:00Z",
        answers: {
          "pq-q1": "React with CRA",
          "pq-q2": "Zustand",
          "pq-q3": "Font Awesome",
          "pq-q4": "Tailwind CSS + CSS Variables",
          "pq-q5": "AWS",
        },
        score: 20,
        totalPoints: 50,
      },
    ],
  },

  // 4 ─ Quick Poll (internal)
  {
    id: "form-quick-poll",
    title: "Lunch Preference Poll",
    description: "Vote for this Friday's team lunch! Most popular choice wins.",
    formType: "poll",
    audience: "internal",
    color: "#ec4899",
    status: "active",
    createdAt: "2026-03-20T07:00:00Z",
    updatedAt: "2026-03-23T12:00:00Z",
    questions: [
      {
        id: "lp-q1",
        type: "multiple-choice",
        title: "What cuisine should we order for Friday lunch?",
        required: true,
        options: [
          { id: "f1", label: "Italian (Pizza & Pasta)" },
          { id: "f2", label: "Japanese (Sushi & Ramen)" },
          { id: "f3", label: "Mexican (Tacos & Burritos)" },
          { id: "f4", label: "Indian (Curry & Biryani)" },
          { id: "f5", label: "Chinese (Dim Sum & Noodles)" },
        ],
      },
      {
        id: "lp-q2",
        type: "multiple-choice",
        title: "Preferred lunch time?",
        required: true,
        options: [
          { id: "t1", label: "12:00 PM" },
          { id: "t2", label: "12:30 PM" },
          { id: "t3", label: "1:00 PM" },
        ],
      },
    ],
    responses: [
      {
        id: "lpr1",
        formId: "form-quick-poll",
        respondent: "Alice Johnson",
        submittedAt: "2026-03-20T09:00:00Z",
        answers: {
          "lp-q1": "Japanese (Sushi & Ramen)",
          "lp-q2": "12:30 PM",
        },
      },
      {
        id: "lpr2",
        formId: "form-quick-poll",
        respondent: "Bob Smith",
        submittedAt: "2026-03-20T09:15:00Z",
        answers: {
          "lp-q1": "Italian (Pizza & Pasta)",
          "lp-q2": "12:00 PM",
        },
      },
      {
        id: "lpr3",
        formId: "form-quick-poll",
        respondent: "Carol Davis",
        submittedAt: "2026-03-20T09:30:00Z",
        answers: {
          "lp-q1": "Japanese (Sushi & Ramen)",
          "lp-q2": "12:30 PM",
        },
      },
      {
        id: "lpr4",
        formId: "form-quick-poll",
        respondent: "Daniel Lee",
        submittedAt: "2026-03-20T10:00:00Z",
        answers: {
          "lp-q1": "Indian (Curry & Biryani)",
          "lp-q2": "1:00 PM",
        },
      },
      {
        id: "lpr5",
        formId: "form-quick-poll",
        respondent: "Eva Martinez",
        submittedAt: "2026-03-20T10:15:00Z",
        answers: {
          "lp-q1": "Japanese (Sushi & Ramen)",
          "lp-q2": "12:30 PM",
        },
      },
      {
        id: "lpr6",
        formId: "form-quick-poll",
        respondent: "Frank White",
        submittedAt: "2026-03-20T10:30:00Z",
        answers: {
          "lp-q1": "Mexican (Tacos & Burritos)",
          "lp-q2": "12:00 PM",
        },
      },
      {
        id: "lpr7",
        formId: "form-quick-poll",
        respondent: "Grace Kim",
        submittedAt: "2026-03-20T11:00:00Z",
        answers: {
          "lp-q1": "Italian (Pizza & Pasta)",
          "lp-q2": "12:30 PM",
        },
      },
    ],
  },

  // 5 ─ Event Registration Form (external)
  {
    id: "form-event-registration",
    title: "Event Registration Form",
    description:
      "Register for our upcoming Tech Innovation Summit 2026. Seats are limited — reserve yours today!",
    formType: "form",
    audience: "external",
    color: "#8b5cf6",
    status: "active",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-21T17:00:00Z",
    questions: [
      {
        id: "er-q1",
        type: "text",
        title: "Full Name",
        required: true,
      },
      {
        id: "er-q2",
        type: "text",
        title: "Email Address",
        required: true,
      },
      {
        id: "er-q3",
        type: "text",
        title: "Company / Organization",
        required: true,
      },
      {
        id: "er-q4",
        type: "dropdown",
        title: "Job Title",
        required: true,
        options: [
          { id: "j1", label: "Software Engineer" },
          { id: "j2", label: "Product Manager" },
          { id: "j3", label: "Designer" },
          { id: "j4", label: "Data Scientist" },
          { id: "j5", label: "Executive / C-Level" },
          { id: "j6", label: "Student" },
          { id: "j7", label: "Other" },
        ],
      },
      {
        id: "er-q5",
        type: "checkbox",
        title: "Which sessions interest you? (Select all that apply)",
        required: true,
        options: [
          { id: "s1", label: "AI & Machine Learning" },
          { id: "s2", label: "Cloud Computing" },
          { id: "s3", label: "Cybersecurity" },
          { id: "s4", label: "DevOps & SRE" },
          { id: "s5", label: "Web3 & Blockchain" },
          { id: "s6", label: "UI/UX Design" },
        ],
      },
      {
        id: "er-q6",
        type: "multiple-choice",
        title: "Do you have any dietary restrictions?",
        required: false,
        options: [
          { id: "d1", label: "None" },
          { id: "d2", label: "Vegetarian" },
          { id: "d3", label: "Vegan" },
          { id: "d4", label: "Gluten-free" },
          { id: "d5", label: "Other" },
        ],
      },
      {
        id: "er-q7",
        type: "date",
        title: "Preferred attendance date",
        required: true,
      },
      {
        id: "er-q8",
        type: "textarea",
        title: "Any questions for the organizers?",
        required: false,
      },
    ],
    responses: [
      {
        id: "err1",
        formId: "form-event-registration",
        respondent: "Raj Patel",
        submittedAt: "2026-03-09T08:00:00Z",
        answers: {
          "er-q1": "Raj Patel",
          "er-q2": "raj@techcorp.com",
          "er-q3": "TechCorp India",
          "er-q4": "Software Engineer",
          "er-q5": ["AI & Machine Learning", "Cloud Computing"],
          "er-q6": "Vegetarian",
          "er-q7": "2026-04-15",
          "er-q8": "Will there be networking sessions?",
        },
      },
      {
        id: "err2",
        formId: "form-event-registration",
        respondent: "Emily Zhang",
        submittedAt: "2026-03-11T13:00:00Z",
        answers: {
          "er-q1": "Emily Zhang",
          "er-q2": "emily@designhub.co",
          "er-q3": "DesignHub",
          "er-q4": "Designer",
          "er-q5": ["UI/UX Design", "AI & Machine Learning"],
          "er-q6": "None",
          "er-q7": "2026-04-15",
          "er-q8": "",
        },
      },
      {
        id: "err3",
        formId: "form-event-registration",
        respondent: "Marcus Johnson",
        submittedAt: "2026-03-14T16:45:00Z",
        answers: {
          "er-q1": "Marcus Johnson",
          "er-q2": "marcus@startup.io",
          "er-q3": "NovaTech",
          "er-q4": "Executive / C-Level",
          "er-q5": ["Cybersecurity", "Cloud Computing", "DevOps & SRE"],
          "er-q6": "Gluten-free",
          "er-q7": "2026-04-16",
          "er-q8": "Interested in sponsorship opportunities.",
        },
      },
    ],
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFormsStore = create<FormsState>((set, get) => ({
  forms: sampleForms,
  activeFormId: null,
  viewMode: "list",
  searchQuery: "",

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFormId: (id) => set({ activeFormId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addForm: (form) => set((s) => ({ forms: [...s.forms, form] })),

  updateForm: (id, updates) =>
    set((s) => ({
      forms: s.forms.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  deleteForm: (id) =>
    set((s) => ({
      forms: s.forms.filter((f) => f.id !== id),
      activeFormId: s.activeFormId === id ? null : s.activeFormId,
    })),

  addQuestion: (formId, question) =>
    set((s) => ({
      forms: s.forms.map((f) =>
        f.id === formId
          ? { ...f, questions: [...f.questions, question] }
          : f
      ),
    })),

  updateQuestion: (formId, questionId, updates) =>
    set((s) => ({
      forms: s.forms.map((f) =>
        f.id === formId
          ? {
              ...f,
              questions: f.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q
              ),
            }
          : f
      ),
    })),

  removeQuestion: (formId, questionId) =>
    set((s) => ({
      forms: s.forms.map((f) =>
        f.id === formId
          ? { ...f, questions: f.questions.filter((q) => q.id !== questionId) }
          : f
      ),
    })),

  reorderQuestions: (formId, fromIndex, toIndex) =>
    set((s) => ({
      forms: s.forms.map((f) => {
        if (f.id !== formId) return f;
        const qs = [...f.questions];
        const [moved] = qs.splice(fromIndex, 1);
        qs.splice(toIndex, 0, moved);
        return { ...f, questions: qs };
      }),
    })),

  addResponse: (formId, response) =>
    set((s) => ({
      forms: s.forms.map((f) =>
        f.id === formId
          ? { ...f, responses: [...f.responses, response] }
          : f
      ),
    })),

  getActiveForm: () => {
    const { forms, activeFormId } = get();
    return forms.find((f) => f.id === activeFormId);
  },
}));
