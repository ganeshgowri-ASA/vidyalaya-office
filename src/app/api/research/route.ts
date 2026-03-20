import { NextRequest, NextResponse } from "next/server";

interface ResearchItem {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  source: string;
  url: string;
  publishedAt: string;
  tags: string[];
  status: "saved" | "reading" | "reviewed" | "archived";
  notes: string;
  citationCount: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory store
const research: ResearchItem[] = [
  {
    id: "res-1",
    title: "Attention Is All You Need",
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N.", "Uszkoreit, J."],
    source: "arXiv",
    url: "https://arxiv.org/abs/1706.03762",
    publishedAt: "2017-06-12T00:00:00Z",
    tags: ["transformers", "nlp", "attention"],
    status: "reviewed",
    notes: "Foundational paper for modern LLMs. Key insight: self-attention replaces recurrence.",
    citationCount: 87432,
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "res-2",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    abstract: "Large pre-trained language models have been shown to store factual knowledge in their parameters. We explore a general-purpose fine-tuning recipe for RAG models which combine pre-trained parametric and non-parametric memory.",
    authors: ["Lewis, P.", "Perez, E.", "Piktus, A."],
    source: "NeurIPS 2020",
    url: "https://arxiv.org/abs/2005.11401",
    publishedAt: "2020-05-22T00:00:00Z",
    tags: ["rag", "retrieval", "llm"],
    status: "reviewed",
    notes: "Core technique for our AI assistant. Implement with vector embeddings.",
    citationCount: 12847,
    createdAt: "2026-03-02T11:00:00Z",
    updatedAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "res-3",
    title: "Constitutional AI: Harmlessness from AI Feedback",
    abstract: "As AI systems become more capable, we would like to enlist their help to supervise other AIs. We experiment with methods for training a harmless AI assistant through self-improvement.",
    authors: ["Bai, Y.", "Jones, A.", "Ndousse, K."],
    source: "Anthropic",
    url: "https://arxiv.org/abs/2212.08073",
    publishedAt: "2022-12-15T00:00:00Z",
    tags: ["alignment", "rlhf", "safety"],
    status: "reading",
    notes: "Relevant for our AI moderation features. Review harmlessness criteria.",
    citationCount: 3241,
    createdAt: "2026-03-05T14:00:00Z",
    updatedAt: "2026-03-15T16:00:00Z",
  },
  {
    id: "res-4",
    title: "GPT-4 Technical Report",
    abstract: "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. GPT-4 exhibits human-level performance on various professional and academic benchmarks.",
    authors: ["OpenAI"],
    source: "OpenAI",
    url: "https://arxiv.org/abs/2303.08774",
    publishedAt: "2023-03-15T00:00:00Z",
    tags: ["gpt-4", "multimodal", "benchmark"],
    status: "saved",
    notes: "",
    citationCount: 8932,
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-03-08T09:00:00Z",
  },
  {
    id: "res-5",
    title: "Efficient Transformers: A Survey",
    abstract: "Transformer model architectures have garnered immense interest lately due to their effectiveness across a range of domains. In this survey, we provide a comprehensive overview of various efficiency dimensions.",
    authors: ["Tay, Y.", "Dehghani, M.", "Bahri, D."],
    source: "ACM Computing Surveys",
    url: "https://arxiv.org/abs/2009.06732",
    publishedAt: "2020-09-14T00:00:00Z",
    tags: ["transformers", "efficiency", "survey"],
    status: "saved",
    notes: "Good reference for optimizing inference speed.",
    citationCount: 2156,
    createdAt: "2026-03-10T15:00:00Z",
    updatedAt: "2026-03-10T15:00:00Z",
  },
];

let nextId = 6;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  let result = [...research];
  if (status) result = result.filter((r) => r.status === status);
  if (tag) result = result.filter((r) => r.tags.includes(tag));
  return NextResponse.json({ research: result });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item: ResearchItem = {
      id: `res-${nextId++}`,
      title: body.title || "Untitled Research",
      abstract: body.abstract || "",
      authors: body.authors || [],
      source: body.source || "",
      url: body.url || "",
      publishedAt: body.publishedAt || new Date().toISOString(),
      tags: body.tags || [],
      status: body.status || "saved",
      notes: body.notes || "",
      citationCount: body.citationCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    research.unshift(item);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const idx = research.findIndex((r) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: "Research item not found" }, { status: 404 });
    research[idx] = { ...research[idx], ...updates, updatedAt: new Date().toISOString() };
    return NextResponse.json({ item: research[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const idx = research.findIndex((r) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: "Research item not found" }, { status: 404 });
    research.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete research item" }, { status: 500 });
  }
}
