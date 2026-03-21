"use client";

import { useRef, useEffect, useState } from "react";
import {
  Send,
  Sparkles,
  FileText,
  ChevronDown,
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  BookOpen,
  ExternalLink,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRAGStore } from "@/store/rag-store";
import type { Citation, RAGMessage } from "@/types/rag";

function CitationBadge({ citation, index, onHover, onLeave }: {
  citation: Citation;
  index: number;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  const { setActiveDocumentId, setActivePanel } = useRAGStore();
  return (
    <button
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
      style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}
      onMouseEnter={() => onHover(citation.id)}
      onMouseLeave={onLeave}
      onClick={() => {
        setActiveDocumentId(citation.documentId);
        setActivePanel("viewer");
      }}
      title={`${citation.documentName} — Page ${citation.pageNumber}`}
    >
      <BookOpen size={10} />
      [{index + 1}]
    </button>
  );
}

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  const { setActiveDocumentId, setActivePanel, setHighlightedCitationId, highlightedCitationId } = useRAGStore();
  const isHighlighted = highlightedCitationId === citation.id;

  return (
    <div
      className={cn("rounded-lg border p-2.5 transition-all cursor-pointer", isHighlighted ? "ring-1" : "")}
      style={{
        borderColor: isHighlighted ? "var(--primary)" : "var(--border)",
        backgroundColor: isHighlighted ? "var(--primary)" + "08" : "var(--accent)",
        outlineColor: "var(--primary)",
      }}
      onMouseEnter={() => setHighlightedCitationId(citation.id)}
      onMouseLeave={() => setHighlightedCitationId(null)}
      onClick={() => {
        setActiveDocumentId(citation.documentId);
        setActivePanel("viewer");
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-bold" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
          {index + 1}
        </span>
        <span className="truncate text-xs font-medium" style={{ color: "var(--foreground)" }}>{citation.documentName}</span>
        <ExternalLink size={10} style={{ color: "var(--muted-foreground)" }} />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        &ldquo;{citation.excerpt}&rdquo;
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {citation.heading && <span>§ {citation.heading}</span>}
        <span>· Page {citation.pageNumber}</span>
        <span>· {Math.round(citation.relevanceScore * 100)}% match</span>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: RAGMessage }) {
  const { setHighlightedCitationId } = useRAGStore();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          backgroundColor: isUser ? "var(--primary)" : "var(--accent)",
          color: isUser ? "var(--primary-foreground)" : "var(--primary)",
        }}
      >
        {isUser ? "U" : <Sparkles size={16} />}
      </div>

      <div className={cn("max-w-[85%] space-y-2", isUser ? "items-end" : "items-start")}>
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{
            backgroundColor: isUser ? "var(--primary)" : "var(--accent)",
            color: isUser ? "var(--primary-foreground)" : "var(--foreground)",
          }}
        >
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          ))}
        </div>

        {/* Citations */}
        {message.citations.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              <BookOpen size={12} />
              Sources ({message.citations.length})
            </div>
            {message.citations.map((cit, i) => (
              <CitationCard key={cit.id} citation={cit} index={i} />
            ))}
          </div>
        )}

        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1">
            <button className="rounded p-1 transition-colors hover:bg-white/10" title="Copy">
              <Copy size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button className="rounded p-1 transition-colors hover:bg-white/10" title="Helpful">
              <ThumbsUp size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button className="rounded p-1 transition-colors hover:bg-white/10" title="Not helpful">
              <ThumbsDown size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button className="rounded p-1 transition-colors hover:bg-white/10" title="Regenerate">
              <RotateCcw size={12} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationList() {
  const { conversations, activeConversationId, setActiveConversationId, createConversation, deleteConversation, selectedDocumentIds } = useRAGStore();

  return (
    <div className="border-b p-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
          <History size={12} />
          Conversations
        </div>
        <button
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          onClick={() => createConversation(selectedDocumentIds)}
        >
          <Plus size={12} />
          New
        </button>
      </div>
      <div className="max-h-32 space-y-0.5 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn("group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors")}
            style={{
              backgroundColor: activeConversationId === conv.id ? "var(--sidebar-accent)" : "transparent",
            }}
            onClick={() => setActiveConversationId(conv.id)}
          >
            <MessageSquare size={12} style={{ color: "var(--muted-foreground)" }} />
            <span className="flex-1 truncate text-xs" style={{ color: "var(--foreground)" }}>{conv.title}</span>
            <span className="text-xs opacity-50">{conv.messages.length}</span>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
            >
              <Trash2 size={10} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RAGChatPanel() {
  const {
    chatInput, setChatInput, isAiLoading, setIsAiLoading,
    getActiveConversation, addMessage, createConversation,
    selectedDocumentIds, documents, activeConversationId,
    setHighlightedCitationId,
  } = useRAGStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conv = getActiveConversation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conv?.messages.length]);

  const handleSend = () => {
    if (!chatInput.trim() || isAiLoading) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(selectedDocumentIds);
    }

    addMessage(convId, { role: "user", content: chatInput.trim(), citations: [] });
    const query = chatInput.trim();
    setChatInput("");
    setIsAiLoading(true);

    // Simulate AI response with citations
    setTimeout(() => {
      const mockCitations: Citation[] = [];
      const selectedDocs = documents.filter((d) => selectedDocumentIds.includes(d.id) && d.status === "indexed");

      if (selectedDocs.length > 0) {
        const doc = selectedDocs[0];
        mockCitations.push({
          id: Date.now().toString(36),
          documentId: doc.id,
          documentName: doc.name,
          chunkId: "chunk-sim",
          pageNumber: Math.floor(Math.random() * doc.pages) + 1,
          excerpt: `Relevant excerpt from ${doc.name} related to: "${query.slice(0, 40)}..."`,
          relevanceScore: 0.85 + Math.random() * 0.15,
          heading: "Section Reference",
        });
      }
      if (selectedDocs.length > 1) {
        const doc2 = selectedDocs[1];
        mockCitations.push({
          id: (Date.now() + 1).toString(36),
          documentId: doc2.id,
          documentName: doc2.name,
          chunkId: "chunk-sim-2",
          pageNumber: Math.floor(Math.random() * doc2.pages) + 1,
          excerpt: `Supporting information from ${doc2.name} addressing the query context.`,
          relevanceScore: 0.7 + Math.random() * 0.15,
          heading: "Supporting Reference",
        });
      }

      addMessage(convId!, {
        role: "assistant",
        content: `Based on my analysis of ${selectedDocs.length > 0 ? selectedDocs.length + " selected document(s)" : "the indexed documents"}, here is what I found regarding your query:\n\n**${query}**\n\nThe documents contain relevant information that addresses your question. ${mockCitations.length > 0 ? `I found ${mockCitations.length} relevant source(s) that support this answer.` : "Please select specific documents for more targeted results with citations."}\n\nWould you like me to dive deeper into any specific aspect of this topic?`,
        citations: mockCitations,
      });
      setIsAiLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedDocs = documents.filter((d) => selectedDocumentIds.includes(d.id));

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Conversation history */}
      <ConversationList />

      {/* Context bar */}
      {selectedDocs.length > 0 && (
        <div className="border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <FileText size={12} />
            <span>Querying:</span>
            {selectedDocs.slice(0, 3).map((d) => (
              <span key={d.id} className="rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--accent)" }}>
                {d.name.length > 20 ? d.name.slice(0, 20) + "…" : d.name}
              </span>
            ))}
            {selectedDocs.length > 3 && (
              <span className="opacity-60">+{selectedDocs.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {!conv || conv.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4" style={{ backgroundColor: "var(--accent)" }}>
              <Sparkles size={32} style={{ color: "var(--primary)" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              JnanaYantra AI
            </h3>
            <p className="text-sm max-w-sm" style={{ color: "var(--muted-foreground)" }}>
              Ask questions about your documents. Select documents from the library to provide context for more accurate answers with citations.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                "Summarize the key findings",
                "What are the financial highlights?",
                "Compare across documents",
                "Extract action items",
              ].map((q) => (
                <button
                  key={q}
                  className="rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:border-opacity-100"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  onClick={() => setChatInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          conv.messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        {isAiLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--accent)" }}>
              <Sparkles size={16} style={{ color: "var(--primary)" }} />
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--accent)" }}>
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <Loader2 size={14} className="animate-spin" />
                Searching documents and generating answer...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-end gap-2 rounded-xl border p-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--accent)" }}>
          <textarea
            ref={inputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            style={{ color: "var(--foreground)" }}
          />
          <button
            onClick={handleSend}
            disabled={!chatInput.trim() || isAiLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>
          AI answers are generated from your indexed documents with source citations
        </p>
      </div>
    </div>
  );
}
