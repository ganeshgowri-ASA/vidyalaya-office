import { ClipboardCheck, Send, MessageSquare, CheckCircle, XCircle, History } from "lucide-react";

const workflowSteps = [
  {
    icon: Send,
    title: "Submit",
    description: "Submit documents for review with optional notes and reviewer assignments.",
  },
  {
    icon: MessageSquare,
    title: "Comment",
    description: "Reviewers provide inline comments and feedback on submitted documents.",
  },
  {
    icon: CheckCircle,
    title: "Approve / Reject",
    description: "Final decision with approval signatures or rejection reasons.",
  },
  {
    icon: History,
    title: "Audit Trail",
    description: "Complete history of all actions, comments, and status changes.",
  },
];

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="text-center">
        <ClipboardCheck size={48} className="mx-auto mb-4" style={{ color: "var(--primary)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Review & Approval
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Structured document review workflow with audit trail. Coming soon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {workflowSteps.map((step) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-xl border p-5"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <step.icon size={24} className="shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
            <div>
              <h3 className="font-semibold" style={{ color: "var(--card-foreground)" }}>
                {step.title}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
