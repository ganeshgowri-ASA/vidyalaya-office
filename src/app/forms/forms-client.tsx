"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  BarChart3,
  Eye,
  ClipboardList,
  Users,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Heart,
  GraduationCap,
  ShoppingCart,
  CalendarDays,
  ThumbsUp,
  UserPlus,
  FileQuestion,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "my-forms" | "templates" | "analytics";

const templates = [
  { id: 1, title: "Contact Form", description: "Collect name, email, phone, and message from visitors", icon: Users, responses: 1240, category: "General" },
  { id: 2, title: "Customer Feedback", description: "Gather feedback on products or services with ratings", icon: MessageSquare, responses: 890, category: "Feedback" },
  { id: 3, title: "Job Application", description: "Collect resumes, cover letters, and candidate info", icon: Briefcase, responses: 2100, category: "HR" },
  { id: 4, title: "Event Registration", description: "Register attendees for events with session preferences", icon: CalendarDays, responses: 3400, category: "Events" },
  { id: 5, title: "Customer Satisfaction", description: "Measure CSAT with NPS scoring and open comments", icon: ThumbsUp, responses: 1560, category: "Feedback" },
  { id: 6, title: "Employee Onboarding", description: "New hire information and document collection", icon: UserPlus, responses: 670, category: "HR" },
  { id: 7, title: "Product Survey", description: "Understand user needs and product feature preferences", icon: Star, responses: 920, category: "Feedback" },
  { id: 8, title: "Course Evaluation", description: "Student feedback on courses and instructors", icon: GraduationCap, responses: 4200, category: "Education" },
  { id: 9, title: "Order Form", description: "Collect product orders with quantity and shipping info", icon: ShoppingCart, responses: 1870, category: "Sales" },
  { id: 10, title: "Bug Report", description: "Structured bug reporting with severity and reproduction steps", icon: FileQuestion, responses: 540, category: "IT" },
  { id: 11, title: "Meeting Feedback", description: "Post-meeting survey to improve future meetings", icon: ClipboardList, responses: 780, category: "General" },
  { id: 12, title: "Volunteer Sign-up", description: "Collect volunteer availability and skill preferences", icon: Heart, responses: 1100, category: "General" },
  { id: 13, title: "Quiz Template", description: "Create scored quizzes with multiple choice questions", icon: ListChecks, responses: 3100, category: "Education" },
  { id: 14, title: "Lead Generation", description: "Capture leads with company info and interest areas", icon: TrendingUp, responses: 2600, category: "Sales" },
  { id: 15, title: "Health Assessment", description: "Pre-visit health questionnaire and symptom checklist", icon: Heart, responses: 430, category: "Healthcare" },
];

const analyticsStats = [
  { label: "Total Forms", value: "0", change: "+0%", icon: FileText },
  { label: "Total Responses", value: "0", change: "+0%", icon: ClipboardList },
  { label: "Avg. Completion Rate", value: "0%", change: "+0%", icon: CheckCircle2 },
  { label: "Active Forms", value: "0", change: "+0%", icon: TrendingUp },
];

const recentActivity = [
  { label: "No recent activity", time: "" },
];

export function FormsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "my-forms", label: "My Forms", icon: FileText },
    { key: "templates", label: "Templates", icon: Star },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <h1 className="text-xl font-bold">Forms</h1>
          <p className="text-sm opacity-60">Create, manage, and analyze forms</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus size={16} />
          New Form
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 border-b px-6"
        style={{ borderColor: "var(--border)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.key
                ? "border-current opacity-100"
                : "border-transparent opacity-60 hover:opacity-80"
            )}
            style={
              activeTab === tab.key
                ? { color: "var(--primary)" }
                : undefined
            }
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "my-forms" && <MyFormsTab />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

function MyFormsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: "var(--sidebar-accent)", opacity: 0.2 }}
      >
        <FileText size={40} style={{ color: "var(--primary)" }} />
      </div>
      <h2 className="mt-6 text-lg font-semibold">No forms yet</h2>
      <p className="mt-2 max-w-sm text-center text-sm opacity-60">
        Create your first form from scratch or start with a template to collect responses.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Plus size={16} />
          Create Form
        </button>
        <button
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ borderColor: "var(--border)" }}
        >
          Browse Templates
        </button>
      </div>
    </div>
  );
}

function TemplatesTab() {
  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div>
      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCategory === cat ? "opacity-100" : "opacity-60 hover:opacity-80"
            )}
            style={
              selectedCategory === cat
                ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                : { backgroundColor: "var(--sidebar)", color: "var(--foreground)" }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="group cursor-pointer rounded-xl border p-5 transition-all hover:shadow-lg"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--sidebar)",
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--sidebar-accent)" }}
              >
                <template.icon size={20} style={{ color: "var(--primary)" }} />
              </div>
              <button
                className="rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
              >
                <Eye size={16} />
              </button>
            </div>
            <h3 className="mt-3 text-sm font-semibold">{template.title}</h3>
            <p className="mt-1 text-xs opacity-60 line-clamp-2">{template.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--sidebar-accent)", color: "var(--foreground)", opacity: 0.7 }}
              >
                {template.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] opacity-50">
                <Users size={10} />
                {template.responses.toLocaleString()} uses
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-5"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium opacity-60">{stat.label}</span>
              <stat.icon size={16} style={{ color: "var(--primary)" }} />
            </div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs opacity-50">{stat.change} from last month</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div
        className="mt-6 rounded-xl border p-5"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
      >
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Clock size={14} className="opacity-40" />
                <span className="text-sm opacity-70">{item.label}</span>
              </div>
              <span className="text-xs opacity-40">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty chart placeholder */}
      <div
        className="mt-6 flex flex-col items-center justify-center rounded-xl border py-16"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar)" }}
      >
        <BarChart3 size={40} className="opacity-20" />
        <p className="mt-3 text-sm opacity-50">
          Response analytics will appear here once you start collecting data
        </p>
      </div>
    </div>
  );
}
