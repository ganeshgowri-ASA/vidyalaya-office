"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Sparkles, MessageSquare, History, Plus, Trash2,
  Loader2, Bot, User, Copy, Check, Mic, Paperclip,
  FileText, Table2, Presentation, FileImage, ChevronDown,
  Zap, BookOpen, PenLine, BarChart3, ScanText, Type,
  ListOrdered, Languages, Wand2, ArrowLeft,
  Image, Palette, Paintbrush, Layers, Mail, Reply, Forward, Inbox, AtSign, PenTool,
  StickyNote, Video, Calendar,
} from "lucide-react";
import { useAIChatStore, type EditorContext } from "@/store/ai-chat-store";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Context-aware quick actions per editor type                        */
/* ------------------------------------------------------------------ */

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const QUICK_ACTIONS: Record<EditorContext, QuickAction[]> = {
  document: [
    { label: "Summarize document", icon: <FileText size={13} />, prompt: "Summarize the key points of this document concisely." },
    { label: "Improve writing", icon: <Wand2 size={13} />, prompt: "Review and improve the writing quality, clarity, and tone." },
    { label: "Fix grammar", icon: <Type size={13} />, prompt: "Perform a thorough grammar, spelling, punctuation, and style check. List all errors found with suggested corrections." },
    { label: "Style check", icon: <Sparkles size={13} />, prompt: "Analyze the writing style for: readability score, sentence variety, passive voice overuse, wordiness, tone consistency, and clarity. Provide specific improvements." },
    { label: "Professional tone", icon: <PenLine size={13} />, prompt: "Rewrite in a professional, formal business tone." },
    { label: "Create outline", icon: <ListOrdered size={13} />, prompt: "Create a structured outline from this document content." },
    { label: "Translate", icon: <Languages size={13} />, prompt: "Translate this text. Available languages: French, Spanish, German, Japanese, Chinese (Simplified), Arabic, Hindi, Portuguese (Brazilian), Italian, Russian, Korean, Dutch, Turkish, Swedish, Polish. Please specify your target language, or I'll translate to French by default." },
    { label: "Cross-doc search", icon: <BookOpen size={13} />, prompt: "Help me find related information, similar topics, or cross-references in my other documents about: " },
  ],
  spreadsheet: [
    { label: "Create chart", icon: <BarChart3 size={13} />, prompt: "Suggest the best chart type for this data and describe how to create it." },
    { label: "Write formula", icon: <Table2 size={13} />, prompt: "Help me write a spreadsheet formula for: " },
    { label: "Analyze data", icon: <Sparkles size={13} />, prompt: "Analyze this spreadsheet data and provide key insights and trends." },
    { label: "Pivot table", icon: <Table2 size={13} />, prompt: "Suggest a pivot table structure for this data." },
    { label: "Clean data", icon: <Zap size={13} />, prompt: "Identify data quality issues and suggest cleanup steps." },
    { label: "Statistical summary", icon: <BookOpen size={13} />, prompt: "Provide a statistical summary (mean, median, mode, std dev) of the numeric data." },
  ],
  presentation: [
    { label: "Generate slide content", icon: <Presentation size={13} />, prompt: "Generate engaging content for a presentation slide about: " },
    { label: "Speaker notes", icon: <Mic size={13} />, prompt: "Write detailed speaker notes for the current slide." },
    { label: "Create outline", icon: <ListOrdered size={13} />, prompt: "Create a 7-slide presentation outline for: " },
    { label: "Improve design", icon: <Wand2 size={13} />, prompt: "Suggest design improvements for better visual impact." },
    { label: "Add transitions", icon: <Zap size={13} />, prompt: "Suggest appropriate slide transitions and animations." },
    { label: "Summarize deck", icon: <FileText size={13} />, prompt: "Summarize this presentation deck into key takeaways." },
  ],
  pdf: [
    { label: "Extract text", icon: <ScanText size={13} />, prompt: "Extract and organize the key text content from this PDF." },
    { label: "Summarize PDF", icon: <FileText size={13} />, prompt: "Provide a concise summary of this PDF document." },
    { label: "Find key info", icon: <BookOpen size={13} />, prompt: "Identify and list the most important information in this PDF." },
    { label: "Compare sections", icon: <FileImage size={13} />, prompt: "Compare and contrast the main sections of this document." },
    { label: "Create form fields", icon: <Type size={13} />, prompt: "Suggest form fields that should be added to this PDF." },
    { label: "Accessibility check", icon: <Zap size={13} />, prompt: "Check this PDF for accessibility issues and suggest improvements." },
  ],
    graphics: [
    { label: "Generate from prompt", icon: <Image size={13} />, prompt: "Generate a graphic design based on this description: " },
    { label: "Color palette", icon: <Palette size={13} />, prompt: "Suggest a professional color palette for this design project." },
    { label: "Design layout", icon: <Layers size={13} />, prompt: "Suggest an optimal layout arrangement for this graphic design." },
    { label: "Logo ideas", icon: <PenTool size={13} />, prompt: "Generate creative logo design concepts for: " },
    { label: "Image effects", icon: <Paintbrush size={13} />, prompt: "Suggest image effects and filters to enhance this design." },
    { label: "Design critique", icon: <Wand2 size={13} />, prompt: "Provide a professional critique and improvement suggestions for this design." },
  ],
  email: [
    { label: "Draft reply", icon: <Reply size={13} />, prompt: "Draft a professional reply to this email: " },
    { label: "Compose email", icon: <Mail size={13} />, prompt: "Compose a professional email about: " },
    { label: "Improve tone", icon: <PenLine size={13} />, prompt: "Improve the tone and clarity of this email draft." },
    { label: "Subject line", icon: <AtSign size={13} />, prompt: "Generate compelling email subject lines for: " },
    { label: "Follow-up", icon: <Forward size={13} />, prompt: "Draft a follow-up email for this conversation." },
    { label: "Summarize thread", icon: <Inbox size={13} />, prompt: "Summarize this email thread into key points and action items." },
  ],
  general: [
    { label: "Help me write", icon: <PenLine size={13} />, prompt: "Help me write about: " },
    { label: "Brainstorm ideas", icon: <Sparkles size={13} />, prompt: "Brainstorm creative ideas for: " },
    { label: "Explain concept", icon: <BookOpen size={13} />, prompt: "Explain this concept in simple terms: " },
    { label: "Create checklist", icon: <ListOrdered size={13} />, prompt: "Create a detailed checklist for: " },
    { label: "Cross-doc search", icon: <FileText size={13} />, prompt: "Search and find information across all my documents about: " },
    { label: "Translate text", icon: <Languages size={13} />, prompt: "Translate the following text. First tell me what language options are available (French, Spanish, German, Japanese, Chinese, Arabic, Hindi, Portuguese, Italian, Russian), then translate to the specified language: " },
  ],
  chat: [
    { label: "Summarize chat", icon: <MessageSquare size={13} />, prompt: "Summarize the key points and action items from this conversation." },
    { label: "Draft response", icon: <Reply size={13} />, prompt: "Draft a professional response to this message: " },
    { label: "Meeting agenda", icon: <ListOrdered size={13} />, prompt: "Create a meeting agenda based on this conversation thread." },
    { label: "Action items", icon: <Zap size={13} />, prompt: "Extract all action items and deadlines from this conversation." },
  ],
  notes: [
    { label: "Summarize notes", icon: <StickyNote size={13} />, prompt: "Summarize these meeting notes into key decisions, action items, and follow-ups." },
    { label: "Extract decisions", icon: <Zap size={13} />, prompt: "Extract all decisions made from these meeting notes and list them clearly." },
    { label: "Create follow-up", icon: <ListOrdered size={13} />, prompt: "Create a follow-up email draft from these meeting notes with action items and deadlines." },
    { label: "Action items", icon: <BookOpen size={13} />, prompt: "Extract all action items, owners, and deadlines from these meeting notes." },
    { label: "Meeting minutes", icon: <FileText size={13} />, prompt: "Format these notes into professional meeting minutes with agenda items, discussions, and outcomes." },
  ],
  meetings: [
    { label: "Prepare agenda", icon: <ListOrdered size={13} />, prompt: "Help me prepare a meeting agenda for: " },
    { label: "Summarize meeting", icon: <Video size={13} />, prompt: "Summarize this meeting recording/transcript into key takeaways and action items." },
    { label: "Schedule follow-up", icon: <Calendar size={13} />, prompt: "Draft a follow-up meeting invitation based on the outcomes of this meeting." },
    { label: "Meeting prep", icon: <BookOpen size={13} />, prompt: "Help me prepare for an upcoming meeting about: " },
    { label: "Talking points", icon: <PenLine size={13} />, prompt: "Generate talking points and discussion topics for a meeting about: " },
  ],
};

const EDITOR_LABELS: Record<EditorContext, { label: string; icon: React.ReactNode }> = {
  document: { label: "Document", icon: <FileText size={14} /> },
  spreadsheet: { label: "Spreadsheet", icon: <Table2 size={14} /> },
  presentation: { label: "Presentation", icon: <Presentation size={14} /> },
  pdf: { label: "PDF", icon: <FileImage size={14} /> },
  graphics: { label: "Graphics", icon: <Image size={14} /> },
  email: { label: "Email", icon: <Mail size={14} /> },
  chat: { label: "Chat", icon: <MessageSquare size={14} /> },
  notes: { label: "Notes", icon: <StickyNote size={14} /> },
  meetings: { label: "Meetings", icon: <Video size={14} /> },
  general: { label: "General", icon: <Sparkles size={14} /> },
};

const PROVIDERS = [
  { key: "claude", label: "Claude (Anthropic)" },
  { key: "openai", label: "GPT (OpenAI)" },
  { key: "google", label: "Gemini (Google)" },
  { key: "openrouter", label: "OpenRouter" },
];

/* ------------------------------------------------------------------ */
/*  Utility: detect editor context from pathname                       */
/* ------------------------------------------------------------------ */

function getEditorContext(pathname: string): EditorContext {
  if (pathname.startsWith("/document")) return "document";
  if (pathname.startsWith("/spreadsheet")) return "spreadsheet";
  if (pathname.startsWith("/presentation")) return "presentation";
  if (pathname.startsWith("/pdf")) return "pdf";
  if (pathname.startsWith("/graphics")) return "graphics";
  if (pathname.startsWith("/email")) return "email";
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/notes")) return "notes";
  if (pathname.startsWith("/meetings")) return "meetings";
  return "general";
}

/* ------------------------------------------------------------------ */
/*  System prompts per editor context                                  */
/* ------------------------------------------------------------------ */

function getSystemPrompt(ctx: EditorContext): string {
  const base = "You are a helpful AI assistant for Vidyalaya Office, an AI-powered office suite. Be concise, clear, and actionable. Format responses with markdown when helpful.";
  switch (ctx) {
    case "document":
      return `${base} You are currently assisting with the Document Editor. Help with writing, editing, formatting, grammar, style, and content generation. When suggesting edits, be specific about what to change.`;
    case "spreadsheet":
      return `${base} You are currently assisting with the Spreadsheet Editor. Help with formulas, data analysis, charting, pivot tables, and data cleaning. When suggesting formulas, use standard Excel-compatible syntax.`;
    case "presentation":
      return `${base} You are currently assisting with the Presentation Editor. Help with slide content, speaker notes, design suggestions, and presentation structure. Keep suggestions visual and impactful.`;
    case "pdf":
      return `${base} You are currently assisting with the PDF Editor. Help with text extraction, form fields, annotations, accessibility, and document analysis.`;
          case "graphics":
      return `${base} You are currently assisting with the Graphics Editor. Help with design layouts, color palettes, image generation from prompts, logo design, visual effects, typography, and design critique. When suggesting designs, be specific about colors, dimensions, and composition.`;
    case "email":
      return `${base} You are currently assisting with the Email Client. Help with composing emails, improving tone, drafting replies, writing subject lines, summarizing threads, and email etiquette. Be concise and professional.`;
    case "chat":
      return `${base} You are currently assisting with the Chat Engine. Help with summarizing conversations, drafting professional responses, extracting action items, creating meeting agendas, and improving communication clarity.`;
    default:
      return `${base} You can help with cross-document search, translation (French, Spanish, German, Japanese, Chinese, Arabic, Hindi, Portuguese, Italian, Russian), grammar checking, style analysis, and general writing assistance.`;
  }
}

/* ------------------------------------------------------------------ */
/*  Message bubble component                                           */
/* ------------------------------------------------------------------ */

function MessageBubble({ message }: { message: { role: string; content: string; timestamp: string } }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isUser ? "var(--primary)" : "var(--secondary)",
          color: isUser ? "var(--primary-foreground)" : "var(--secondary-foreground)",
        }}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className={`group max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
          style={{
            backgroundColor: isUser ? "var(--primary)" : "var(--secondary)",
            color: isUser ? "var(--primary-foreground)" : "var(--secondary-foreground)",
            borderBottomRightRadius: isUser ? "4px" : undefined,
            borderBottomLeftRadius: !isUser ? "4px" : undefined,
          }}
        >
          {message.content}
        </div>
        <div className="mt-1 flex items-center gap-2 px-1" style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}>
          <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{timeStr}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              title="Copy response"
            >
              {copied ? <Check size={11} style={{ color: "#16a34a" }} /> : <Copy size={11} style={{ color: "var(--muted-foreground)" }} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
      >
        <Bot size={14} />
      </div>
      <div
        className="flex items-center gap-1 rounded-2xl px-4 py-3"
        style={{ backgroundColor: "var(--secondary)", borderBottomLeftRadius: "4px" }}
      >
        <span className="typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Conversation History sidebar                                       */
/* ------------------------------------------------------------------ */

function ConversationHistory({
  onBack,
}: {
  onBack: () => void;
}) {
  const conversations = useAIChatStore((s) => s.conversations);
  const activeConversationId = useAIChatStore((s) => s.activeConversationId);
  const setActiveConversation = useAIChatStore((s) => s.setActiveConversation);
  const deleteConversation = useAIChatStore((s) => s.deleteConversation);
  const clearAllConversations = useAIChatStore((s) => s.clearAllConversations);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="rounded p-1 hover:bg-[var(--muted)]">
          <ArrowLeft size={16} style={{ color: "var(--foreground)" }} />
        </button>
        <History size={16} style={{ color: "var(--primary)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Chat History</span>
        {conversations.length > 0 && (
          <button
            onClick={clearAllConversations}
            className="ml-auto text-[10px] rounded px-2 py-0.5 hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
            title="Clear all"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={32} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
            <p className="mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>No conversations yet</p>
          </div>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              className="group flex items-start gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors mb-1"
              style={{
                backgroundColor: c.id === activeConversationId ? "var(--accent)" : "transparent",
              }}
              onClick={() => setActiveConversation(c.id)}
            >
              <MessageSquare size={14} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" style={{ color: "var(--foreground)" }}>{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {EDITOR_LABELS[c.editorContext]?.label}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {c.messages.length} msgs
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--muted)]"
                title="Delete"
              >
                <Trash2 size={12} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AI Chat Panel                                                 */
/* ------------------------------------------------------------------ */

export function AIChatPanel() {
  const pathname = usePathname();
  const editorContext = getEditorContext(pathname);

  const isOpen = useAIChatStore((s) => s.isOpen);
  const isLoading = useAIChatStore((s) => s.isLoading);
  const showHistory = useAIChatStore((s) => s.showHistory);
  const selectedProvider = useAIChatStore((s) => s.selectedProvider);
  const activeConversationId = useAIChatStore((s) => s.activeConversationId);
  const conversations = useAIChatStore((s) => s.conversations);
  const setOpen = useAIChatStore((s) => s.setOpen);
  const setLoading = useAIChatStore((s) => s.setLoading);
  const setShowHistory = useAIChatStore((s) => s.setShowHistory);
  const setSelectedProvider = useAIChatStore((s) => s.setSelectedProvider);
  const createConversation = useAIChatStore((s) => s.createConversation);
  const setActiveConversation = useAIChatStore((s) => s.setActiveConversation);
  const addMessage = useAIChatStore((s) => s.addMessage);

  const [input, setInput] = useState("");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversation?.messages || [];
  const quickActions = QUICK_ACTIONS[editorContext];
  const editorInfo = EDITOR_LABELS[editorContext];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Close provider menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setShowProviderMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getProviderConfig = useCallback(() => {
    try {
      const saved = localStorage.getItem("vidyalaya_providers");
      if (!saved) return null;
      const providers = JSON.parse(saved);
      const providerMap: Record<string, string> = {
        claude: "claude",
        openai: "openai",
        google: "google",
        openrouter: "openrouter",
      };
      const key = providerMap[selectedProvider];
      const provider = providers.find((p: { key: string }) => p.key === key);
      if (provider && provider.apiKey) {
        return { apiKey: provider.apiKey, model: provider.model };
      }
    } catch {}
    return null;
  }, [selectedProvider]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation(editorContext);
      }

      addMessage(convId, { role: "user", content: text.trim(), editorContext });
      setInput("");
      setLoading(true);

      // Resize textarea back
      if (inputRef.current) inputRef.current.style.height = "auto";

      try {
        const providerConfig = getProviderConfig();
        const system = getSystemPrompt(editorContext);

        // Build message history for the API
        const conv = useAIChatStore.getState().conversations.find((c) => c.id === convId);
        const apiMessages = (conv?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: selectedProvider,
            providerConfig,
            messages: apiMessages,
            system,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          addMessage(convId, {
            role: "assistant",
            content: `Error: ${err.error || "Failed to get response. Check your API key in Settings."}`,
          });
        } else {
          const data = await res.json();
          addMessage(convId, {
            role: "assistant",
            content: data.reply || "Sorry, I could not generate a response.",
          });
        }
      } catch {
        addMessage(convId, {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [activeConversationId, editorContext, isLoading, selectedProvider, createConversation, addMessage, setLoading, getProviderConfig]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  };

  const handleNewChat = () => {
    const id = createConversation(editorContext);
    setActiveConversation(id);
  };

  const currentProviderLabel = PROVIDERS.find((p) => p.key === selectedProvider)?.label || "Claude";

  if (!isOpen) return null;

  return (
    <div
      className="ai-chat-panel fixed right-0 top-0 z-50 flex h-full flex-col border-l shadow-2xl"
      style={{
        width: "400px",
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      {showHistory ? (
        <ConversationHistory onBack={() => setShowHistory(false)} />
      ) : (
        <>
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Assistant</h2>
                <div className="flex items-center gap-1.5">
                  {editorInfo.icon}
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {editorInfo.label} context
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="rounded-md p-1.5 transition-colors hover:bg-[var(--muted)]"
                title="New chat"
              >
                <Plus size={16} style={{ color: "var(--foreground)" }} />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="rounded-md p-1.5 transition-colors hover:bg-[var(--muted)]"
                title="Chat history"
              >
                <History size={16} style={{ color: "var(--foreground)" }} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 transition-colors hover:bg-[var(--muted)]"
                title="Close"
              >
                <X size={16} style={{ color: "var(--foreground)" }} />
              </button>
            </div>
          </div>

          {/* Provider selector */}
          <div className="border-b px-4 py-2" style={{ borderColor: "var(--border)" }}>
            <div ref={providerRef} className="relative">
              <button
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                className="flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                <span>{currentProviderLabel}</span>
                <ChevronDown size={12} />
              </button>
              {showProviderMenu && (
                <div
                  className="absolute left-0 top-full mt-1 w-full rounded-lg border shadow-lg py-1 z-10"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => { setSelectedProvider(p.key); setShowProviderMenu(false); }}
                      className="flex w-full items-center px-3 py-2 text-xs transition-colors hover:bg-[var(--muted)]"
                      style={{
                        color: "var(--foreground)",
                        backgroundColor: p.key === selectedProvider ? "var(--accent)" : undefined,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isLoading ? (
              /* Welcome + quick actions */
              <div className="flex flex-col items-center pt-8">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", opacity: 0.9 }}
                >
                  <Sparkles size={28} />
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  How can I help?
                </h3>
                <p className="text-xs text-center mb-6 max-w-[260px]" style={{ color: "var(--muted-foreground)" }}>
                  I&apos;m your AI assistant for the {editorInfo.label} editor. Try a quick action or ask me anything.
                </p>

                {/* Quick action chips */}
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider px-1" style={{ color: "var(--muted-foreground)" }}>
                    Quick Actions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action.prompt)}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition-all hover:bg-[var(--accent)] hover:border-[var(--primary)]"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message list */
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action chips when in conversation */}
          {messages.length > 0 && !isLoading && (
            <div className="border-t px-4 py-2 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-1.5 whitespace-nowrap">
                {quickActions.slice(0, 4).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] transition-colors hover:bg-[var(--accent)]"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-end gap-2 rounded-xl border px-3 py-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <button
                className="shrink-0 rounded-md p-1 transition-colors hover:bg-[var(--muted)] mb-0.5"
                title="Attach file"
              >
                <Paperclip size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTextareaInput(); }}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{
                  color: "var(--foreground)",
                  maxHeight: "120px",
                }}
              />

              <button
                className="shrink-0 rounded-md p-1 transition-colors hover:bg-[var(--muted)] mb-0.5"
                title="Voice input"
              >
                <Mic size={16} style={{ color: "var(--muted-foreground)" }} />
              </button>

              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-lg p-1.5 transition-colors mb-0.5"
                style={{
                  backgroundColor: input.trim() ? "var(--primary)" : "var(--muted)",
                  color: input.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  cursor: input.trim() && !isLoading ? "pointer" : "default",
                }}
                title="Send message"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              AI responses may not always be accurate. Verify important information.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
