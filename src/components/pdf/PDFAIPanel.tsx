"use client";

import { useState } from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  List,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getDocument } from "pdfjs-dist";
import { pdfjs } from "react-pdf";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PDFAIPanelProps {
  file: File | null;
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => (item.str as string) || "")
      .join(" ");
    textParts.push(`[Page ${i}]\n${pageText}`);
  }

  return textParts.join("\n\n");
}

async function callAI(
  messages: { role: string; content: string }[],
  system: string
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "No response received.";
}

export function PDFAIPanel({ file }: PDFAIPanelProps) {
  const [extractedText, setExtractedText] = useState<string>("");
  const [extracting, setExtracting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"chat" | "tools">("tools");
  const [summaryResult, setSummaryResult] = useState("");
  const [keyPointsResult, setKeyPointsResult] = useState("");

  async function ensureTextExtracted(): Promise<string> {
    if (extractedText) return extractedText;
    if (!file) return "";

    setExtracting(true);
    try {
      const text = await extractPdfText(file);
      setExtractedText(text);
      return text;
    } catch (err) {
      console.error("Text extraction failed:", err);
      return "";
    } finally {
      setExtracting(false);
    }
  }

  async function handleSummarize() {
    if (!file) return;
    setSummaryResult("");
    setLoading(true);
    try {
      const text = await ensureTextExtracted();
      if (!text.trim()) {
        setSummaryResult("Could not extract text from this PDF. It may be scanned or image-based.");
        return;
      }
      const system =
        "You are a helpful assistant that summarizes PDF documents clearly and concisely.";
      const result = await callAI(
        [
          {
            role: "user",
            content: `Please summarize the following PDF content in 3-5 clear paragraphs:\n\n${text.slice(0, 8000)}`,
          },
        ],
        system
      );
      setSummaryResult(result);
    } catch (err) {
      setSummaryResult("Failed to generate summary. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExtractKeyPoints() {
    if (!file) return;
    setKeyPointsResult("");
    setLoading(true);
    try {
      const text = await ensureTextExtracted();
      if (!text.trim()) {
        setKeyPointsResult("Could not extract text from this PDF.");
        return;
      }
      const system =
        "You are a helpful assistant that extracts key points and important clauses from documents.";
      const result = await callAI(
        [
          {
            role: "user",
            content: `Extract the key points, main arguments, and important clauses from this document. Format as a numbered list:\n\n${text.slice(0, 8000)}`,
          },
        ],
        system
      );
      setKeyPointsResult(result);
    } catch (err) {
      setKeyPointsResult("Failed to extract key points. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAskQuestion() {
    if (!question.trim() || !file) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const text = await ensureTextExtracted();
      const system = `You are a helpful assistant answering questions about a PDF document.
Use the following document content to answer questions accurately:

${text.slice(0, 6000)}

If the answer is not in the document, say so clearly.`;

      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await callAI(history, system);
      setMessages((prev) => [...prev, { role: "assistant", content: result }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response. Please check your API key." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <Sparkles size={36} style={{ color: "var(--primary)", opacity: 0.4 }} />
        <p className="text-center text-sm" style={{ color: "var(--foreground)", opacity: 0.5 }}>
          Upload a PDF in the viewer to use AI features
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <Sparkles size={16} style={{ color: "var(--primary)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          AI Assistant
        </span>
        {extracting && (
          <span className="ml-auto text-xs" style={{ color: "var(--foreground)", opacity: 0.5 }}>
            <Loader2 size={12} className="inline animate-spin" /> Extracting text…
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div
        className="flex flex-shrink-0 gap-1 border-b px-3 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setActiveSection("tools")}
          className={`rounded px-3 py-1 text-xs font-medium transition-all ${
            activeSection === "tools" ? "opacity-100" : "opacity-50 hover:opacity-70"
          }`}
          style={{
            backgroundColor: activeSection === "tools" ? "var(--accent)" : "transparent",
            color: "var(--foreground)",
          }}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveSection("chat")}
          className={`rounded px-3 py-1 text-xs font-medium transition-all ${
            activeSection === "chat" ? "opacity-100" : "opacity-50 hover:opacity-70"
          }`}
          style={{
            backgroundColor: activeSection === "chat" ? "var(--accent)" : "transparent",
            color: "var(--foreground)",
          }}
        >
          Q&A Chat
        </button>
      </div>

      {/* Tools Section */}
      {activeSection === "tools" && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Summarize */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
              }}
            >
              {loading && !summaryResult ? (
                <Loader2 size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
              ) : (
                <FileText size={16} style={{ color: "var(--primary)" }} />
              )}
              Summarize PDF
            </button>
            {summaryResult && (
              <div
                className="border-t px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  opacity: 0.85,
                  backgroundColor: "var(--background)",
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {summaryResult}
              </div>
            )}
          </div>

          {/* Key points */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleExtractKeyPoints}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
              }}
            >
              {loading && !keyPointsResult ? (
                <Loader2 size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
              ) : (
                <List size={16} style={{ color: "var(--primary)" }} />
              )}
              Extract Key Points / Clauses
            </button>
            {keyPointsResult && (
              <div
                className="border-t px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  opacity: 0.85,
                  backgroundColor: "var(--background)",
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {keyPointsResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Section */}
      {activeSection === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div
                className="rounded-lg border p-4 text-center text-xs"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", opacity: 0.5 }}
              >
                Ask any question about the PDF content
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground, #fff)",
                        }
                      : {
                          backgroundColor: "var(--card)",
                          color: "var(--card-foreground)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && activeSection === "chat" && (
              <div className="flex justify-start">
                <div
                  className="rounded-lg border px-3 py-2 text-xs"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <Loader2 size={12} className="animate-spin inline" style={{ color: "var(--primary)" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 border-t p-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskQuestion()}
                placeholder="Ask about this PDF…"
                disabled={loading}
                className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={handleAskQuestion}
                disabled={!question.trim() || loading}
                className="rounded-lg p-2 transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
