"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, X, Wand2, CheckCheck, FileText, Briefcase, Loader2,
  Languages, ListChecks, Sparkles, BookOpen, PenLine, Type,
  ArrowDownUp, Table2, LayoutList, Minimize2, AlignLeft,
  Zap, Globe, MessageSquare, ChevronDown, ChevronRight,
  Settings, Plus, Trash2, RotateCcw, ClipboardCopy, Download,
} from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { getEditorText, getEditorContent, setEditorContent } from "./editor-area";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

const AI_MODELS = [
  { value: "claude", label: "Claude (Anthropic)" },
  { value: "gpt", label: "GPT (OpenAI)" },
  { value: "gemini", label: "Gemini (Google)" },
];

const QUICK_ACTIONS = [
  { label: "Improve Writing", icon: <Wand2 size={13} />, prompt: "Improve the following text. Make it clearer, more concise, and better structured. Return only the improved text in HTML format with appropriate headings, paragraphs, and formatting:" },
  { label: "Fix Grammar", icon: <CheckCheck size={13} />, prompt: "Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text in HTML format preserving the original structure:" },
  { label: "Summarize", icon: <FileText size={13} />, prompt: "Provide a concise summary of the following text. Return the summary in HTML format with a heading and key bullet points:" },
  { label: "Professional Tone", icon: <Briefcase size={13} />, prompt: "Rewrite the following text in a professional, formal tone suitable for business communication. Return only the rewritten text in HTML format:" },
];

const EXTENDED_ACTIONS: { category: string; actions: { label: string; icon: React.ReactNode; prompt: string }[] }[] = [
  {
    category: "Rewrite Styles",
    actions: [
      { label: "Casual Tone", icon: <MessageSquare size={13} />, prompt: "Rewrite the following text in a casual, friendly tone. Return only the rewritten text in HTML format:" },
      { label: "Concise", icon: <Minimize2 size={13} />, prompt: "Rewrite the following text to be as concise as possible while retaining all key information. Return only the rewritten text in HTML format:" },
      { label: "Elaborate", icon: <ArrowDownUp size={13} />, prompt: "Elaborate and expand the following text with more detail and explanation. Return the expanded text in HTML format:" },
      { label: "Simplify", icon: <Type size={13} />, prompt: "Explain the following text in simple terms that anyone can understand. Avoid jargon. Return in HTML format:" },
    ],
  },
  {
    category: "Generate Content",
    actions: [
      { label: "Generate Paragraphs", icon: <AlignLeft size={13} />, prompt: "Based on the context below, generate 2-3 well-written paragraphs that continue or expand on the topic. Return in HTML format:" },
      { label: "Create Outline", icon: <LayoutList size={13} />, prompt: "Create a detailed outline from the following topic or text. Use nested bullet points. Return in HTML format with h2, h3, ul, li tags:" },
      { label: "Expand Bullets", icon: <ListChecks size={13} />, prompt: "Expand each bullet point below into a full paragraph. Return in HTML format:" },
      { label: "Generate Table", icon: <Table2 size={13} />, prompt: "Generate a well-formatted HTML table from the data or topic described below. Include headers and at least 5 rows:" },
    ],
  },
  {
    category: "Academic",
    actions: [
      { label: "Literature Review", icon: <BookOpen size={13} />, prompt: "Write a literature review paragraph based on the following topic. Include typical academic language and suggest relevant research areas. Return in HTML format:" },
      { label: "Executive Summary", icon: <FileText size={13} />, prompt: "Write an executive summary of the following document content. Include key findings, recommendations, and conclusions. Return in HTML format:" },
      { label: "Table Analysis", icon: <Table2 size={13} />, prompt: "Analyze any data or tables in the following text. Describe trends, patterns, and generate insights. Return in HTML format:" },
      { label: "Auto-Format", icon: <PenLine size={13} />, prompt: "Auto-format the following document content: apply proper heading styles (h1, h2, h3), fix spacing, ensure consistent formatting, and improve structure. Return the fully formatted HTML:" },
    ],
  },
  {
    category: "Translate",
    actions: [
      { label: "Spanish", icon: <Globe size={13} />, prompt: "Translate the following text to Spanish. Return only the translated text in HTML format preserving structure:" },
      { label: "French", icon: <Globe size={13} />, prompt: "Translate the following text to French. Return only the translated text in HTML format preserving structure:" },
      { label: "German", icon: <Globe size={13} />, prompt: "Translate the following text to German. Return only the translated text in HTML format preserving structure:" },
      { label: "Hindi", icon: <Globe size={13} />, prompt: "Translate the following text to Hindi. Return only the translated text in HTML format preserving structure:" },
      { label: "Japanese", icon: <Globe size={13} />, prompt: "Translate the following text to Japanese. Return only the translated text in HTML format preserving structure:" },
      { label: "Chinese", icon: <Globe size={13} />, prompt: "Translate the following text to Chinese (Simplified). Return only the translated text in HTML format preserving structure:" },
      { label: "Arabic", icon: <Globe size={13} />, prompt: "Translate the following text to Arabic. Return only the translated text in HTML format preserving structure:" },
      { label: "Portuguese", icon: <Globe size={13} />, prompt: "Translate the following text to Portuguese. Return only the translated text in HTML format preserving structure:" },
      { label: "Korean", icon: <Globe size={13} />, prompt: "Translate the following text to Korean. Return only the translated text in HTML format preserving structure:" },
      { label: "Italian", icon: <Globe size={13} />, prompt: "Translate the following text to Italian. Return only the translated text in HTML format preserving structure:" },
    ],
  },
];

const SLASH_COMMANDS: { command: string; label: string; description: string; prompt: string }[] = [
  { command: "/improve", label: "Improve Writing", description: "Enhance clarity, flow, and structure", prompt: "Improve the following text. Make it clearer, more concise, and better structured. Return only the improved text in HTML format:" },
  { command: "/grammar", label: "Fix Grammar", description: "Fix all grammar and spelling errors", prompt: "Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text in HTML:" },
  { command: "/summarize", label: "Summarize", description: "Create a concise summary", prompt: "Provide a concise summary of the following text with key bullet points in HTML:" },
  { command: "/translate", label: "Translate", description: "Translate to specified language", prompt: "Translate the following text to the specified language. Preserve formatting. Return in HTML:" },
  { command: "/outline", label: "Create Outline", description: "Generate a structured outline", prompt: "Create a detailed outline from the following text. Use nested headings and bullet points. Return in HTML:" },
  { command: "/expand", label: "Expand Text", description: "Elaborate and add detail", prompt: "Elaborate and expand the following text with more detail and explanation. Return in HTML:" },
  { command: "/formal", label: "Make Formal", description: "Rewrite in professional tone", prompt: "Rewrite the following text in a professional, formal tone suitable for business communication. Return in HTML:" },
  { command: "/simplify", label: "Simplify", description: "Explain in simpler terms", prompt: "Explain the following text in simple terms that anyone can understand. Return in HTML:" },
  { command: "/table", label: "Generate Table", description: "Create a formatted table", prompt: "Generate a well-formatted HTML table from the data or topic described below. Include headers and at least 5 rows:" },
  { command: "/cite", label: "Add Citations", description: "Suggest academic references", prompt: "Based on the topics discussed in the following text, suggest 5-10 academic references that could be cited. Format as a bibliography in APA style in HTML:" },
];

const PROMPT_TEMPLATES = [
  { label: "Proofread this document", prompt: "Proofread the following text. List all errors found and provide the corrected version in HTML:" },
  { label: "Write an introduction for...", prompt: "Write a compelling introduction paragraph for the following topic:" },
  { label: "Write a conclusion for...", prompt: "Write a strong conclusion paragraph summarizing the key points of the following text:" },
  { label: "Create an abstract", prompt: "Write an academic abstract (150-250 words) for the following research content:" },
  { label: "Generate key takeaways", prompt: "Extract and list the key takeaways from the following text as bullet points in HTML:" },
  { label: "Write a cover letter for...", prompt: "Write a professional cover letter based on the following details:" },
  { label: "Create meeting notes", prompt: "Format the following text as organized meeting notes with action items in HTML:" },
  { label: "Write a press release", prompt: "Write a press release based on the following information in HTML format:" },
  { label: "Create a FAQ section", prompt: "Generate a FAQ section with 5-7 questions and answers based on the following content in HTML:" },
  { label: "Write product description", prompt: "Write an engaging product description based on the following details in HTML:" },
  { label: "Suggest improvements", prompt: "Review the following text and suggest specific improvements for clarity, structure, and impact. Format as a numbered list in HTML:" },
  { label: "Check for plagiarism concerns", prompt: "Review the following text for potential plagiarism concerns. Flag any passages that seem generic or commonly used. Suggest original alternatives in HTML:" },
  { label: "Generate citations/references", prompt: "Based on the topics discussed in the following text, suggest 5-10 academic references that could be cited. Format as a bibliography in APA style in HTML:" },
  { label: "Create study guide", prompt: "Create a study guide from the following text. Include key terms, concepts, and review questions in HTML:" },
  { label: "Convert to presentation outline", prompt: "Convert the following text into a presentation outline with slides, titles, and bullet points in HTML:" },
  { label: "Write email from notes", prompt: "Write a professional email based on the following notes:" },
  { label: "Create a report template", prompt: "Create a structured report template for the following topic with section headings in HTML:" },
  { label: "Generate discussion questions", prompt: "Generate 5-7 thought-provoking discussion questions based on the following text in HTML:" },
  { label: "Write a peer review", prompt: "Write a constructive peer review of the following text, noting strengths and areas for improvement in HTML:" },
  { label: "Rephrase for different audience", prompt: "Rephrase the following text for a non-technical audience while preserving accuracy. Return in HTML:" },
];

export function AIPanel() {
  const { showAI, toggleAI } = useDocumentStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude");
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);
  const [showExtendedActions, setShowExtendedActions] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [contextMode, setContextMode] = useState<"full" | "selection">("full");
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getContextText = useCallback(() => {
    if (contextMode === "selection") {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        return sel.toString();
      }
    }
    return getEditorText();
  }, [contextMode]);

  const sendMessage = useCallback(async (userMsg: string) => {
    if (!userMsg.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg, timestamp }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          system: "You are an AI writing assistant integrated into a document editor (Vidyalaya Office). Help the user improve their writing, fix grammar, format content, generate text, translate, and analyze documents. When returning formatted content, use HTML tags (h1, h2, h3, p, ul, ol, li, strong, em, table, etc.). Be concise and helpful. When the user asks for translations, provide only the translated text. For code, use <pre><code> tags.",
          model: selectedModel === "claude" ? undefined : selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();
      const aiContent = data.content?.[0]?.text || data.error || "No response received.";
      setLastAIResponse(aiContent);
      setMessages((prev) => [...prev, { role: "assistant", content: aiContent, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to get AI response. Please check your API configuration in Settings.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, selectedModel]);

  const handleQuickAction = useCallback((actionPrompt: string) => {
    const text = getContextText();
    if (!text.trim()) {
      setMessages((prev) => [...prev, { role: "assistant", content: "The document is empty. Please add some content first." }]);
      return;
    }
    sendMessage(actionPrompt + "\n\n" + text);
  }, [sendMessage, getContextText]);

  const insertAtCursor = useCallback(() => {
    if (!lastAIResponse) return;
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      document.execCommand("insertHTML", false, lastAIResponse);
    }
  }, [lastAIResponse]);

  const insertIntoDocument = useCallback(() => {
    if (!lastAIResponse) return;
    const currentContent = getEditorContent();
    setEditorContent(currentContent + "<hr/>" + lastAIResponse);
  }, [lastAIResponse]);

  const replaceDocument = useCallback(() => {
    if (!lastAIResponse) return;
    setEditorContent(lastAIResponse);
  }, [lastAIResponse]);

  const replaceSelection = useCallback(() => {
    if (!lastAIResponse) return;
    const editor = document.getElementById("doc-editor");
    if (editor) {
      editor.focus();
      document.execCommand("insertHTML", false, lastAIResponse);
    }
  }, [lastAIResponse]);

  const copyResponse = useCallback(() => {
    if (lastAIResponse) {
      navigator.clipboard.writeText(lastAIResponse);
    }
  }, [lastAIResponse]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setLastAIResponse("");
  }, []);

  if (!showAI) return null;

  return (
    <div
      className="no-print flex w-[360px] flex-shrink-0 flex-col border-l"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-[10px] rounded border px-1.5 py-0.5 outline-none"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            title="AI Model"
          >
            {AI_MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button onClick={clearChat} className="rounded p-1 hover:bg-[var(--muted)]" title="Clear chat">
            <RotateCcw size={13} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <button onClick={toggleAI} className="rounded p-1 hover:bg-[var(--muted)]">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>

      {/* Context mode */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b text-[10px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        <span>Context:</span>
        <button
          onClick={() => setContextMode("full")}
          className={`px-2 py-0.5 rounded ${contextMode === "full" ? "font-medium" : ""}`}
          style={{ color: contextMode === "full" ? "var(--primary)" : "var(--muted-foreground)", backgroundColor: contextMode === "full" ? "var(--muted)" : "transparent" }}
        >
          Full Document
        </button>
        <button
          onClick={() => setContextMode("selection")}
          className={`px-2 py-0.5 rounded ${contextMode === "selection" ? "font-medium" : ""}`}
          style={{ color: contextMode === "selection" ? "var(--primary)" : "var(--muted-foreground)", backgroundColor: contextMode === "selection" ? "var(--muted)" : "transparent" }}
        >
          Selection Only
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-b p-2.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>Quick Actions</p>
          <button
            onClick={() => setShowExtendedActions(!showExtendedActions)}
            className="text-[10px] flex items-center gap-0.5 hover:underline"
            style={{ color: "var(--primary)" }}
          >
            More {showExtendedActions ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Extended actions */}
        {showExtendedActions && (
          <div className="mt-2 space-y-1">
            {EXTENDED_ACTIONS.map((cat) => (
              <div key={cat.category}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                  className="flex items-center gap-1 w-full text-left text-[10px] font-medium px-1 py-0.5 rounded hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                >
                  {expandedCategory === cat.category ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  {cat.category}
                </button>
                {expandedCategory === cat.category && (
                  <div className="grid grid-cols-2 gap-1 mt-1 ml-2">
                    {cat.actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => { handleQuickAction(action.prompt); setShowExtendedActions(false); }}
                        disabled={loading}
                        className="flex items-center gap-1 rounded border px-1.5 py-1 text-[9px] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt Templates */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setShowPromptTemplates(!showPromptTemplates)}
          className="flex items-center gap-1 w-full text-left text-[10px] font-medium px-3 py-1.5 hover:bg-[var(--muted)]"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Zap size={10} />
          Prompt Templates ({PROMPT_TEMPLATES.length})
          {showPromptTemplates ? <ChevronDown size={10} className="ml-auto" /> : <ChevronRight size={10} className="ml-auto" />}
        </button>
        {showPromptTemplates && (
          <div className="px-2 pb-2 max-h-40 overflow-y-auto">
            {PROMPT_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  const text = getContextText();
                  sendMessage(t.prompt + (text.trim() ? "\n\n" + text : ""));
                  setShowPromptTemplates(false);
                }}
                disabled={loading}
                className="w-full text-left text-[10px] px-2 py-1 rounded hover:bg-[var(--muted)] disabled:opacity-50"
                style={{ color: "var(--foreground)" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Sparkles size={24} className="mx-auto mb-2" style={{ color: "var(--muted-foreground)" }} />
            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Ask AI to help with your document, use quick actions, or select a prompt template.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`rounded-lg px-3 py-2 text-xs ${msg.role === "user" ? "ml-8" : "mr-2"}`}
              style={{
                backgroundColor: msg.role === "user" ? "var(--primary)" : "var(--muted)",
                color: msg.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
              }}
            >
              <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: msg.content }} />
            </div>
            {msg.timestamp && (
              <div className={`text-[9px] mt-0.5 ${msg.role === "user" ? "text-right mr-1" : "ml-1"}`} style={{ color: "var(--muted-foreground)" }}>
                {msg.timestamp}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Insert buttons */}
      {lastAIResponse && !loading && (
        <div className="border-t p-2 space-y-1" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-1">
            <button
              onClick={insertAtCursor}
              className="flex-1 rounded border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Insert at Cursor
            </button>
            <button
              onClick={insertIntoDocument}
              className="flex-1 rounded border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Append
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={replaceDocument}
              className="flex-1 rounded border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Replace All
            </button>
            <button
              onClick={copyResponse}
              className="rounded border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--muted)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              title="Copy response"
            >
              <ClipboardCopy size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Slash Commands Picker */}
      {showSlashCommands && (
        <div className="border-t px-2 py-1 max-h-48 overflow-y-auto" style={{ borderColor: "var(--border)" }}>
          <div className="text-[9px] font-medium px-1 py-0.5 mb-1" style={{ color: "var(--muted-foreground)" }}>
            Slash Commands — type / to filter
          </div>
          {SLASH_COMMANDS.filter((c) => !slashFilter || c.command.includes(slashFilter) || c.label.toLowerCase().includes(slashFilter)).map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => {
                const text = getContextText();
                sendMessage(cmd.prompt + (text.trim() ? "\n\n" + text : ""));
                setShowSlashCommands(false);
                setInput("");
                setSlashFilter("");
              }}
              disabled={loading}
              className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded hover:bg-[var(--muted)] disabled:opacity-50"
            >
              <span className="text-[10px] font-mono font-semibold min-w-[70px]" style={{ color: "var(--primary)" }}>
                {cmd.command}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium block" style={{ color: "var(--foreground)" }}>{cmd.label}</span>
                <span className="text-[8px] block truncate" style={{ color: "var(--muted-foreground)" }}>{cmd.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-2.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (val.startsWith("/")) {
                setShowSlashCommands(true);
                setSlashFilter(val.slice(1).toLowerCase());
              } else {
                setShowSlashCommands(false);
                setSlashFilter("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Check if input matches a slash command
                const matched = SLASH_COMMANDS.find((c) => input.trim() === c.command);
                if (matched) {
                  const text = getContextText();
                  sendMessage(matched.prompt + (text.trim() ? "\n\n" + text : ""));
                  setShowSlashCommands(false);
                  setInput("");
                  setSlashFilter("");
                } else {
                  sendMessage(input);
                }
              }
              if (e.key === "Escape") {
                setShowSlashCommands(false);
              }
            }}
            placeholder="Ask AI anything or type / for commands..."
            className="flex-1 rounded-md border px-3 py-2 text-xs outline-none resize-none"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              minHeight: 36,
              maxHeight: 80,
            }}
            rows={1}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="rounded-md px-3 py-2 transition-colors disabled:opacity-50 self-end"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
