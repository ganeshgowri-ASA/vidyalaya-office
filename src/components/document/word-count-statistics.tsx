"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, BarChart3, Clock, BookOpen, Type, AlignLeft, FileText } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

function calculateReadabilityScore(text: string): { score: number; grade: string; level: string } {
  if (!text.trim()) return { score: 0, grade: "N/A", level: "No content" };

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return { score: 0, grade: "N/A", level: "No content" };

  // Flesch Reading Ease
  const avgSentenceLen = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const score = Math.round(206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord);
  const clampedScore = Math.max(0, Math.min(100, score));

  let grade: string;
  let level: string;
  if (clampedScore >= 90) { grade = "5th grade"; level = "Very Easy"; }
  else if (clampedScore >= 80) { grade = "6th grade"; level = "Easy"; }
  else if (clampedScore >= 70) { grade = "7th grade"; level = "Fairly Easy"; }
  else if (clampedScore >= 60) { grade = "8th-9th grade"; level = "Standard"; }
  else if (clampedScore >= 50) { grade = "10th-12th grade"; level = "Fairly Difficult"; }
  else if (clampedScore >= 30) { grade = "College"; level = "Difficult"; }
  else { grade = "College Graduate"; level = "Very Difficult"; }

  return { score: clampedScore, grade, level };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  if (word.endsWith("e") && count > 1) count--;
  if (word.endsWith("le") && word.length > 3 && !/[aeiouy]/.test(word[word.length - 3])) count++;
  return Math.max(1, count);
}

export function WordCountStatisticsPanel() {
  const {
    showStatisticsPanel, setShowStatisticsPanel,
    wordCount, charCount, lineCount, paragraphCount,
    setReadingTime, setReadabilityScore,
  } = useDocumentStore();

  const [stats, setStats] = useState({
    words: 0, characters: 0, charactersNoSpaces: 0,
    paragraphs: 0, sentences: 0, pages: 0,
    readingTime: 0, speakingTime: 0,
    avgWordLength: 0, avgSentenceLength: 0,
    longestWord: "", shortestSentence: 0, longestSentence: 0,
    readability: { score: 0, grade: "N/A", level: "No content" },
  });

  const computeStats = useCallback(() => {
    const editor = document.getElementById("doc-editor");
    if (!editor) return;

    const text = editor.innerText || "";
    const trimmed = text.trim();
    if (!trimmed) {
      setStats({
        words: 0, characters: 0, charactersNoSpaces: 0,
        paragraphs: 0, sentences: 0, pages: 0,
        readingTime: 0, speakingTime: 0,
        avgWordLength: 0, avgSentenceLength: 0,
        longestWord: "", shortestSentence: 0, longestSentence: 0,
        readability: { score: 0, grade: "N/A", level: "No content" },
      });
      return;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const paragraphs = editor.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li").length || 1;
    const charactersNoSpaces = trimmed.replace(/\s/g, "").length;
    const wordLengths = words.map((w) => w.replace(/[^a-zA-Z]/g, "").length);
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).filter(Boolean).length);

    const readability = calculateReadabilityScore(trimmed);

    const newStats = {
      words: words.length,
      characters: trimmed.length,
      charactersNoSpaces,
      paragraphs,
      sentences: sentences.length,
      pages: Math.max(1, Math.ceil(words.length / 300)),
      readingTime: Math.max(1, Math.ceil(words.length / 238)),
      speakingTime: Math.max(1, Math.ceil(words.length / 150)),
      avgWordLength: wordLengths.length > 0 ? Math.round((wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length) * 10) / 10 : 0,
      avgSentenceLength: sentenceLengths.length > 0 ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length) : 0,
      longestWord: words.reduce((a, b) => a.replace(/[^a-zA-Z]/g, "").length >= b.replace(/[^a-zA-Z]/g, "").length ? a : b, ""),
      shortestSentence: sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0,
      longestSentence: sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0,
      readability,
    };

    setStats(newStats);
    setReadingTime(newStats.readingTime);
    setReadabilityScore(newStats.readability.score);
  }, [setReadingTime, setReadabilityScore]);

  useEffect(() => {
    if (!showStatisticsPanel) return;
    computeStats();
    const interval = setInterval(computeStats, 3000);
    return () => clearInterval(interval);
  }, [showStatisticsPanel, computeStats]);

  if (!showStatisticsPanel) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#22C55E";
    if (score >= 50) return "#EAB308";
    return "#EF4444";
  };

  return (
    <div
      className="w-72 border-l overflow-y-auto flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--foreground)" }}>
          <BarChart3 size={13} /> Statistics
        </span>
        <button onClick={() => setShowStatisticsPanel(false)} className="p-1 rounded hover:bg-[var(--muted)]">
          <X size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Basic counts */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] uppercase font-medium" style={{ color: "var(--muted-foreground)" }}>Document Counts</h4>
          {[
            { icon: <Type size={11} />, label: "Words", value: stats.words.toLocaleString() },
            { icon: <AlignLeft size={11} />, label: "Characters", value: stats.characters.toLocaleString() },
            { icon: <AlignLeft size={11} />, label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
            { icon: <FileText size={11} />, label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
            { icon: <FileText size={11} />, label: "Sentences", value: stats.sentences.toLocaleString() },
            { icon: <FileText size={11} />, label: "Lines", value: lineCount.toLocaleString() },
            { icon: <FileText size={11} />, label: "Pages (est.)", value: stats.pages.toLocaleString() },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                {item.icon} {item.label}
              </span>
              <span className="font-medium" style={{ color: "var(--foreground)" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Time estimates */}
        <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-[10px] uppercase font-medium" style={{ color: "var(--muted-foreground)" }}>Time Estimates</h4>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              <Clock size={11} /> Reading time
            </span>
            <span className="font-medium" style={{ color: "var(--foreground)" }}>{stats.readingTime} min</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
              <Clock size={11} /> Speaking time
            </span>
            <span className="font-medium" style={{ color: "var(--foreground)" }}>{stats.speakingTime} min</span>
          </div>
        </div>

        {/* Readability */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-[10px] uppercase font-medium" style={{ color: "var(--muted-foreground)" }}>Readability</h4>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Flesch Reading Ease</span>
              <span className="text-sm font-bold" style={{ color: getScoreColor(stats.readability.score) }}>
                {stats.readability.score}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 mb-2">
              <div className="h-2 rounded-full transition-all" style={{
                width: `${stats.readability.score}%`,
                backgroundColor: getScoreColor(stats.readability.score),
              }} />
            </div>
            <div className="flex justify-between text-[9px]" style={{ color: "var(--muted-foreground)" }}>
              <span>{stats.readability.level}</span>
              <span>{stats.readability.grade}</span>
            </div>
          </div>
        </div>

        {/* Advanced stats */}
        <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-[10px] uppercase font-medium" style={{ color: "var(--muted-foreground)" }}>Advanced</h4>
          {[
            { label: "Avg. word length", value: `${stats.avgWordLength} chars` },
            { label: "Avg. sentence length", value: `${stats.avgSentenceLength} words` },
            { label: "Longest word", value: stats.longestWord.substring(0, 15) || "-" },
            { label: "Shortest sentence", value: `${stats.shortestSentence} words` },
            { label: "Longest sentence", value: `${stats.longestSentence} words` },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span style={{ color: "var(--muted-foreground)" }}>{item.label}</span>
              <span className="font-medium" style={{ color: "var(--foreground)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-3 py-1.5 border-t text-[9px]" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        Live updates every 3 seconds
      </div>
    </div>
  );
}
