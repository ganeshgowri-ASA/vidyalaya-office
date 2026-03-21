"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RAGDocument,
  DocumentChunk,
  RAGConversation,
  RAGMessage,
  Citation,
  DocumentCollection,
  CrossReference,
  ExtractionTemplate,
  TemplateField,
  IndexingConfig,
} from "@/types/rag";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// --- Mock data ---

const MOCK_DOCUMENTS: RAGDocument[] = [
  {
    id: "doc-1",
    name: "Q4 Financial Report 2025.pdf",
    type: "pdf",
    size: 2_450_000,
    pages: 48,
    uploadedAt: "2025-12-15T10:30:00Z",
    indexedAt: "2025-12-15T10:32:00Z",
    status: "indexed",
    tags: ["finance", "quarterly", "2025"],
    summary: "Comprehensive Q4 2025 financial report covering revenue, expenses, profit margins, and forecasts for the upcoming fiscal year.",
    chunkCount: 124,
    collectionId: "col-1",
  },
  {
    id: "doc-2",
    name: "Employee Handbook v3.2.pdf",
    type: "pdf",
    size: 1_800_000,
    pages: 72,
    uploadedAt: "2025-11-20T09:00:00Z",
    indexedAt: "2025-11-20T09:03:00Z",
    status: "indexed",
    tags: ["hr", "policy", "handbook"],
    summary: "Complete employee handbook covering company policies, benefits, code of conduct, leave policies, and workplace guidelines.",
    chunkCount: 198,
    collectionId: "col-2",
  },
  {
    id: "doc-3",
    name: "Product Roadmap 2026.docx",
    type: "docx",
    size: 540_000,
    pages: 18,
    uploadedAt: "2026-01-10T14:00:00Z",
    indexedAt: "2026-01-10T14:01:00Z",
    status: "indexed",
    tags: ["product", "roadmap", "strategy"],
    summary: "Product roadmap outlining key features, milestones, and deliverables planned for 2026 across all product lines.",
    chunkCount: 52,
    collectionId: "col-1",
  },
  {
    id: "doc-4",
    name: "Technical Architecture Overview.md",
    type: "md",
    size: 120_000,
    pages: 8,
    uploadedAt: "2026-02-05T11:00:00Z",
    indexedAt: "2026-02-05T11:00:30Z",
    status: "indexed",
    tags: ["engineering", "architecture", "technical"],
    summary: "System architecture documentation describing microservices, data flows, API design, and infrastructure components.",
    chunkCount: 28,
    collectionId: "col-3",
  },
  {
    id: "doc-5",
    name: "Client Proposal - Acme Corp.pdf",
    type: "pdf",
    size: 3_200_000,
    pages: 32,
    uploadedAt: "2026-03-01T16:00:00Z",
    indexedAt: "2026-03-01T16:02:00Z",
    status: "indexed",
    tags: ["sales", "proposal", "acme"],
    summary: "Business proposal for Acme Corp covering project scope, timeline, pricing, and deliverables for the enterprise platform migration.",
    chunkCount: 86,
    collectionId: null,
  },
  {
    id: "doc-6",
    name: "Meeting Minutes - Board Q1.txt",
    type: "txt",
    size: 45_000,
    pages: 4,
    uploadedAt: "2026-03-15T08:30:00Z",
    indexedAt: "2026-03-15T08:30:15Z",
    status: "indexed",
    tags: ["meeting", "board", "minutes"],
    summary: "Minutes from Q1 2026 board meeting covering strategic decisions, budget approvals, and organizational changes.",
    chunkCount: 14,
    collectionId: "col-1",
  },
  {
    id: "doc-7",
    name: "Data Privacy Policy.pdf",
    type: "pdf",
    size: 890_000,
    pages: 22,
    uploadedAt: "2026-03-18T10:00:00Z",
    indexedAt: null,
    status: "processing",
    tags: ["legal", "privacy", "compliance"],
    summary: "",
    chunkCount: 0,
    collectionId: "col-2",
  },
];

const MOCK_COLLECTIONS: DocumentCollection[] = [
  {
    id: "col-1",
    name: "Business & Finance",
    description: "Financial reports, roadmaps, and board materials",
    documentIds: ["doc-1", "doc-3", "doc-6"],
    createdAt: "2025-12-01T00:00:00Z",
    color: "#7c73e6",
  },
  {
    id: "col-2",
    name: "HR & Compliance",
    description: "Employee policies, handbooks, and legal documents",
    documentIds: ["doc-2", "doc-7"],
    createdAt: "2025-11-01T00:00:00Z",
    color: "#00bcd4",
  },
  {
    id: "col-3",
    name: "Engineering",
    description: "Technical documentation and architecture guides",
    documentIds: ["doc-4"],
    createdAt: "2026-01-15T00:00:00Z",
    color: "#4caf50",
  },
];

const MOCK_CHUNKS: DocumentChunk[] = [
  {
    id: "chunk-1-1",
    documentId: "doc-1",
    content: "Total revenue for Q4 2025 reached $42.3 million, representing a 23% year-over-year growth. The SaaS segment contributed $28.1 million while professional services accounted for $14.2 million.",
    pageNumber: 5,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Revenue Summary", section: "Financial Highlights", startChar: 0, endChar: 198 },
  },
  {
    id: "chunk-1-2",
    documentId: "doc-1",
    content: "Operating expenses totaled $31.5 million, with R&D spending at $12.8 million (30.3% of revenue), Sales & Marketing at $10.2 million (24.1%), and G&A at $8.5 million (20.1%).",
    pageNumber: 8,
    chunkIndex: 1,
    embedding: null,
    metadata: { heading: "Operating Expenses", section: "Financial Highlights", startChar: 199, endChar: 380 },
  },
  {
    id: "chunk-2-1",
    documentId: "doc-2",
    content: "All full-time employees are entitled to 20 days of paid time off (PTO) per calendar year, accrued monthly. Unused PTO may be carried over up to a maximum of 5 days into the following year.",
    pageNumber: 15,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Paid Time Off", section: "Benefits", startChar: 0, endChar: 195 },
  },
  {
    id: "chunk-2-2",
    documentId: "doc-2",
    content: "The company provides comprehensive health insurance coverage including medical, dental, and vision plans. Employees may choose from three tier options: Basic, Standard, and Premium.",
    pageNumber: 18,
    chunkIndex: 1,
    embedding: null,
    metadata: { heading: "Health Insurance", section: "Benefits", startChar: 196, endChar: 380 },
  },
  {
    id: "chunk-3-1",
    documentId: "doc-3",
    content: "Phase 1 (Q1-Q2 2026): Launch of the AI-powered analytics dashboard with natural language querying, automated report generation, and predictive forecasting capabilities.",
    pageNumber: 3,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Phase 1", section: "Roadmap Timeline", startChar: 0, endChar: 172 },
  },
  {
    id: "chunk-4-1",
    documentId: "doc-4",
    content: "The system follows a microservices architecture with 12 core services communicating via gRPC and event-driven messaging through Apache Kafka. Each service maintains its own PostgreSQL database.",
    pageNumber: 2,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Architecture Overview", section: "System Design", startChar: 0, endChar: 198 },
  },
  {
    id: "chunk-5-1",
    documentId: "doc-5",
    content: "Project timeline spans 18 months with three major milestones: Discovery & Planning (3 months), Core Platform Build (9 months), and Migration & Go-Live (6 months). Total estimated investment: $2.4 million.",
    pageNumber: 12,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Project Timeline", section: "Proposal Details", startChar: 0, endChar: 208 },
  },
  {
    id: "chunk-6-1",
    documentId: "doc-6",
    content: "The board approved a $15 million budget allocation for the AI initiative, with $8 million earmarked for R&D and $7 million for talent acquisition and infrastructure.",
    pageNumber: 2,
    chunkIndex: 0,
    embedding: null,
    metadata: { heading: "Budget Approvals", section: "Decisions", startChar: 0, endChar: 168 },
  },
];

const MOCK_CROSS_REFS: CrossReference[] = [
  {
    id: "xref-1",
    sourceDocId: "doc-1",
    targetDocId: "doc-6",
    sourceChunkId: "chunk-1-1",
    targetChunkId: "chunk-6-1",
    similarity: 0.87,
    topic: "Budget & Revenue Figures",
  },
  {
    id: "xref-2",
    sourceDocId: "doc-3",
    targetDocId: "doc-4",
    sourceChunkId: "chunk-3-1",
    targetChunkId: "chunk-4-1",
    similarity: 0.82,
    topic: "Technical Architecture & Product Roadmap",
  },
  {
    id: "xref-3",
    sourceDocId: "doc-1",
    targetDocId: "doc-5",
    sourceChunkId: "chunk-1-2",
    targetChunkId: "chunk-5-1",
    similarity: 0.74,
    topic: "Financial Planning & Investment",
  },
];

const MOCK_CONVERSATIONS: RAGConversation[] = [
  {
    id: "conv-1",
    title: "Q4 Financial Analysis",
    documentIds: ["doc-1", "doc-6"],
    createdAt: "2026-03-19T10:00:00Z",
    updatedAt: "2026-03-19T10:05:00Z",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What was the total revenue in Q4 2025 and how does it compare to the board's approved budget?",
        timestamp: "2026-03-19T10:00:00Z",
        citations: [],
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Based on the Q4 Financial Report, **total revenue for Q4 2025 reached $42.3 million**, representing a 23% year-over-year growth. The SaaS segment was the primary driver at $28.1 million, with professional services contributing $14.2 million.\n\nRegarding the board's budget decisions, the Q1 2026 Board Minutes show that **the board approved a $15 million budget allocation** specifically for the AI initiative, with $8 million for R&D and $7 million for talent acquisition and infrastructure. This AI investment represents approximately 35% of the quarterly revenue, indicating a significant strategic commitment to AI capabilities.",
        timestamp: "2026-03-19T10:00:30Z",
        citations: [
          {
            id: "cit-1",
            documentId: "doc-1",
            documentName: "Q4 Financial Report 2025.pdf",
            chunkId: "chunk-1-1",
            pageNumber: 5,
            excerpt: "Total revenue for Q4 2025 reached $42.3 million, representing a 23% year-over-year growth.",
            relevanceScore: 0.95,
            heading: "Revenue Summary",
          },
          {
            id: "cit-2",
            documentId: "doc-6",
            documentName: "Meeting Minutes - Board Q1.txt",
            chunkId: "chunk-6-1",
            pageNumber: 2,
            excerpt: "The board approved a $15 million budget allocation for the AI initiative.",
            relevanceScore: 0.88,
            heading: "Budget Approvals",
          },
        ],
      },
    ],
  },
];

const MOCK_TEMPLATES: ExtractionTemplate[] = [
  {
    id: "tmpl-1",
    name: "Invoice Data Extraction",
    category: "Finance",
    createdAt: "2026-03-01T00:00:00Z",
    fields: [
      { id: "f1", label: "Invoice Number", key: "invoice_number", value: "", source: "", confidence: 0, documentId: null },
      { id: "f2", label: "Vendor Name", key: "vendor_name", value: "", source: "", confidence: 0, documentId: null },
      { id: "f3", label: "Total Amount", key: "total_amount", value: "", source: "", confidence: 0, documentId: null },
      { id: "f4", label: "Due Date", key: "due_date", value: "", source: "", confidence: 0, documentId: null },
      { id: "f5", label: "Line Items", key: "line_items", value: "", source: "", confidence: 0, documentId: null },
    ],
  },
  {
    id: "tmpl-2",
    name: "Contract Key Terms",
    category: "Legal",
    createdAt: "2026-03-05T00:00:00Z",
    fields: [
      { id: "f6", label: "Parties", key: "parties", value: "", source: "", confidence: 0, documentId: null },
      { id: "f7", label: "Effective Date", key: "effective_date", value: "", source: "", confidence: 0, documentId: null },
      { id: "f8", label: "Term Length", key: "term_length", value: "", source: "", confidence: 0, documentId: null },
      { id: "f9", label: "Payment Terms", key: "payment_terms", value: "", source: "", confidence: 0, documentId: null },
      { id: "f10", label: "Termination Clause", key: "termination_clause", value: "", source: "", confidence: 0, documentId: null },
    ],
  },
  {
    id: "tmpl-3",
    name: "Meeting Summary",
    category: "General",
    createdAt: "2026-03-10T00:00:00Z",
    fields: [
      { id: "f11", label: "Date", key: "meeting_date", value: "", source: "", confidence: 0, documentId: null },
      { id: "f12", label: "Attendees", key: "attendees", value: "", source: "", confidence: 0, documentId: null },
      { id: "f13", label: "Key Decisions", key: "key_decisions", value: "", source: "", confidence: 0, documentId: null },
      { id: "f14", label: "Action Items", key: "action_items", value: "", source: "", confidence: 0, documentId: null },
      { id: "f15", label: "Next Meeting", key: "next_meeting", value: "", source: "", confidence: 0, documentId: null },
    ],
  },
];

// --- Store interface ---

type ActivePanel = "documents" | "chat" | "viewer" | "crossref" | "templates";
type ActiveTab = "upload" | "library" | "collections";

interface RAGState {
  // Documents
  documents: RAGDocument[];
  chunks: DocumentChunk[];
  collections: DocumentCollection[];
  crossReferences: CrossReference[];
  selectedDocumentIds: string[];
  activeDocumentId: string | null;
  documentSearchQuery: string;

  // Conversations
  conversations: RAGConversation[];
  activeConversationId: string | null;
  chatInput: string;
  isAiLoading: boolean;

  // Templates
  templates: ExtractionTemplate[];
  activeTemplateId: string | null;

  // UI
  activePanel: ActivePanel;
  activeTab: ActiveTab;
  highlightedCitationId: string | null;
  indexingConfig: IndexingConfig;
  showTemplateModal: boolean;

  // Document actions
  addDocument: (doc: RAGDocument) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: RAGDocument["status"]) => void;
  setSelectedDocumentIds: (ids: string[]) => void;
  toggleDocumentSelection: (id: string) => void;
  setActiveDocumentId: (id: string | null) => void;
  setDocumentSearchQuery: (q: string) => void;

  // Collection actions
  addCollection: (col: DocumentCollection) => void;
  removeCollection: (id: string) => void;

  // Conversation actions
  createConversation: (documentIds: string[]) => string;
  setActiveConversationId: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<RAGMessage, "id" | "timestamp">) => void;
  setChatInput: (input: string) => void;
  setIsAiLoading: (loading: boolean) => void;
  deleteConversation: (id: string) => void;

  // Template actions
  setActiveTemplateId: (id: string | null) => void;
  updateTemplateField: (templateId: string, fieldId: string, value: string, source: string, confidence: number, documentId: string | null) => void;
  setShowTemplateModal: (show: boolean) => void;

  // UI actions
  setActivePanel: (panel: ActivePanel) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setHighlightedCitationId: (id: string | null) => void;
  setIndexingConfig: (config: Partial<IndexingConfig>) => void;

  // Helpers
  getActiveConversation: () => RAGConversation | null;
  getDocumentById: (id: string) => RAGDocument | undefined;
  getChunksForDocument: (docId: string) => DocumentChunk[];
  getCrossRefsForDocument: (docId: string) => CrossReference[];
}

export const useRAGStore = create<RAGState>()(
  persist(
    (set, get) => ({
      // State
      documents: MOCK_DOCUMENTS,
      chunks: MOCK_CHUNKS,
      collections: MOCK_COLLECTIONS,
      crossReferences: MOCK_CROSS_REFS,
      selectedDocumentIds: [],
      activeDocumentId: null,
      documentSearchQuery: "",

      conversations: MOCK_CONVERSATIONS,
      activeConversationId: "conv-1",
      chatInput: "",
      isAiLoading: false,

      templates: MOCK_TEMPLATES,
      activeTemplateId: null,

      activePanel: "documents",
      activeTab: "library",
      highlightedCitationId: null,
      showTemplateModal: false,
      indexingConfig: {
        chunkStrategy: "paragraph",
        chunkSize: 512,
        chunkOverlap: 64,
        embeddingModel: "text-embedding-3-small",
      },

      // Document actions
      addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
      removeDocument: (id) => set((s) => ({
        documents: s.documents.filter((d) => d.id !== id),
        selectedDocumentIds: s.selectedDocumentIds.filter((sid) => sid !== id),
      })),
      updateDocumentStatus: (id, status) => set((s) => ({
        documents: s.documents.map((d) => d.id === id ? { ...d, status, indexedAt: status === "indexed" ? new Date().toISOString() : d.indexedAt } : d),
      })),
      setSelectedDocumentIds: (ids) => set({ selectedDocumentIds: ids }),
      toggleDocumentSelection: (id) => set((s) => ({
        selectedDocumentIds: s.selectedDocumentIds.includes(id)
          ? s.selectedDocumentIds.filter((sid) => sid !== id)
          : [...s.selectedDocumentIds, id],
      })),
      setActiveDocumentId: (id) => set({ activeDocumentId: id }),
      setDocumentSearchQuery: (q) => set({ documentSearchQuery: q }),

      // Collection actions
      addCollection: (col) => set((s) => ({ collections: [...s.collections, col] })),
      removeCollection: (id) => set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      // Conversation actions
      createConversation: (documentIds) => {
        const id = genId();
        const conv: RAGConversation = {
          id,
          title: "New Query",
          messages: [],
          documentIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      addMessage: (conversationId, message) => set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, { ...message, id: genId(), timestamp: new Date().toISOString() }],
                updatedAt: new Date().toISOString(),
                title: c.messages.length === 0 && message.role === "user" ? message.content.slice(0, 50) : c.title,
              }
            : c
        ),
      })),
      setChatInput: (input) => set({ chatInput: input }),
      setIsAiLoading: (loading) => set({ isAiLoading: loading }),
      deleteConversation: (id) => set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
      })),

      // Template actions
      setActiveTemplateId: (id) => set({ activeTemplateId: id }),
      updateTemplateField: (templateId, fieldId, value, source, confidence, documentId) => set((s) => ({
        templates: s.templates.map((t) =>
          t.id === templateId
            ? { ...t, fields: t.fields.map((f) => f.id === fieldId ? { ...f, value, source, confidence, documentId } : f) }
            : t
        ),
      })),
      setShowTemplateModal: (show) => set({ showTemplateModal: show }),

      // UI actions
      setActivePanel: (panel) => set({ activePanel: panel }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setHighlightedCitationId: (id) => set({ highlightedCitationId: id }),
      setIndexingConfig: (config) => set((s) => ({
        indexingConfig: { ...s.indexingConfig, ...config },
      })),

      // Helpers
      getActiveConversation: () => {
        const s = get();
        return s.conversations.find((c) => c.id === s.activeConversationId) ?? null;
      },
      getDocumentById: (id) => get().documents.find((d) => d.id === id),
      getChunksForDocument: (docId) => get().chunks.filter((c) => c.documentId === docId),
      getCrossRefsForDocument: (docId) => get().crossReferences.filter((r) => r.sourceDocId === docId || r.targetDocId === docId),
    }),
    {
      name: "vidyalaya_rag_store",
      partialize: (state) => ({
        documents: state.documents,
        collections: state.collections,
        conversations: state.conversations,
        templates: state.templates,
        indexingConfig: state.indexingConfig,
      }),
    }
  )
);
