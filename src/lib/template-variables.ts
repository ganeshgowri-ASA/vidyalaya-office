/**
 * Template Variable System - SaanchaPoorak
 * Detects, parses, and replaces {{variable}} placeholders in template content.
 */

export interface TemplateVariable {
  name: string;
  label: string;
  defaultValue: string;
  description: string;
  type: "text" | "date" | "email" | "number" | "textarea";
}

export interface VariablePreset {
  id: string;
  name: string;
  values: Record<string, string>;
  createdAt: string;
}

/** Well-known variables with metadata */
const KNOWN_VARIABLES: Record<string, Omit<TemplateVariable, "name">> = {
  company_name: {
    label: "Company Name",
    defaultValue: "",
    description: "Name of the company or organization",
    type: "text",
  },
  date: {
    label: "Date",
    defaultValue: new Date().toISOString().split("T")[0],
    description: "Document date",
    type: "date",
  },
  author: {
    label: "Author",
    defaultValue: "",
    description: "Document author name",
    type: "text",
  },
  author_name: {
    label: "Author Name",
    defaultValue: "",
    description: "Full name of the document author",
    type: "text",
  },
  author_email: {
    label: "Author Email",
    defaultValue: "",
    description: "Email address of the author",
    type: "email",
  },
  author_title: {
    label: "Author Title",
    defaultValue: "",
    description: "Job title or role of the author",
    type: "text",
  },
  department: {
    label: "Department",
    defaultValue: "",
    description: "Department or team name",
    type: "text",
  },
  project_name: {
    label: "Project Name",
    defaultValue: "",
    description: "Name of the project",
    type: "text",
  },
  version: {
    label: "Version",
    defaultValue: "1.0",
    description: "Document version number",
    type: "text",
  },
  recipient_name: {
    label: "Recipient Name",
    defaultValue: "",
    description: "Name of the recipient",
    type: "text",
  },
  recipient_email: {
    label: "Recipient Email",
    defaultValue: "",
    description: "Email of the recipient",
    type: "email",
  },
  recipient_company: {
    label: "Recipient Company",
    defaultValue: "",
    description: "Company of the recipient",
    type: "text",
  },
  phone: {
    label: "Phone Number",
    defaultValue: "",
    description: "Contact phone number",
    type: "text",
  },
  address: {
    label: "Address",
    defaultValue: "",
    description: "Mailing or office address",
    type: "textarea",
  },
  title: {
    label: "Document Title",
    defaultValue: "",
    description: "Title of the document",
    type: "text",
  },
  subject: {
    label: "Subject",
    defaultValue: "",
    description: "Subject or topic",
    type: "text",
  },
  deadline: {
    label: "Deadline",
    defaultValue: "",
    description: "Due date or deadline",
    type: "date",
  },
  effective_date: {
    label: "Effective Date",
    defaultValue: "",
    description: "Date when document takes effect",
    type: "date",
  },
  review_date: {
    label: "Review Date",
    defaultValue: "",
    description: "Date for next review",
    type: "date",
  },
  approved_by: {
    label: "Approved By",
    defaultValue: "",
    description: "Name of approver",
    type: "text",
  },
  sop_number: {
    label: "SOP Number",
    defaultValue: "",
    description: "Standard Operating Procedure number",
    type: "text",
  },
};

/** Regex to detect {{variable_name}} patterns in content */
const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

/**
 * Extract all unique variable names from template content
 */
export function detectVariables(content: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(VARIABLE_REGEX.source, "g");
  while ((match = regex.exec(content)) !== null) {
    matches.add(match[1]);
  }
  return Array.from(matches);
}

/**
 * Build TemplateVariable metadata for detected variable names
 */
export function getVariableDefinitions(
  variableNames: string[]
): TemplateVariable[] {
  return variableNames.map((name) => {
    const known = KNOWN_VARIABLES[name];
    if (known) {
      return { name, ...known };
    }
    // Unknown variable: generate sensible defaults
    const label = name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      name,
      label,
      defaultValue: "",
      description: `Value for ${label}`,
      type: "text" as const,
    };
  });
}

/**
 * Replace all {{variable}} placeholders in content with provided values
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(
    new RegExp(VARIABLE_REGEX.source, "g"),
    (fullMatch, varName: string) => {
      if (varName in values && values[varName].trim() !== "") {
        return values[varName];
      }
      return fullMatch; // Keep placeholder if no value provided
    }
  );
}

/**
 * Check if content contains any template variables
 */
export function hasVariables(content: string): boolean {
  return new RegExp(VARIABLE_REGEX.source).test(content);
}

/**
 * Generate AI auto-fill suggestions based on template context.
 * This is a client-side heuristic that fills common variables with
 * sensible defaults based on the template content and current date.
 */
export function generateAutoFillValues(
  variables: TemplateVariable[],
  templateName: string
): Record<string, string> {
  const values: Record<string, string> = {};
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  for (const v of variables) {
    switch (v.name) {
      case "date":
        values[v.name] = formattedDate;
        break;
      case "effective_date":
        values[v.name] = formattedDate;
        break;
      case "review_date": {
        const reviewDate = new Date(today);
        reviewDate.setMonth(reviewDate.getMonth() + 6);
        values[v.name] = reviewDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        break;
      }
      case "deadline": {
        const deadline = new Date(today);
        deadline.setMonth(deadline.getMonth() + 1);
        values[v.name] = deadline.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        break;
      }
      case "version":
        values[v.name] = "1.0";
        break;
      case "author":
      case "author_name":
        values[v.name] = "Your Name";
        break;
      case "author_email":
        values[v.name] = "name@company.com";
        break;
      case "author_title":
        values[v.name] = "Team Lead";
        break;
      case "company_name":
        values[v.name] = "Acme Corporation";
        break;
      case "department":
        values[v.name] = "Engineering";
        break;
      case "project_name":
        values[v.name] = templateName || "Project Alpha";
        break;
      case "title":
      case "subject":
        values[v.name] = templateName || "Untitled Document";
        break;
      case "sop_number":
        values[v.name] = `SOP-${String(Math.floor(Math.random() * 900 + 100))}`;
        break;
      case "approved_by":
        values[v.name] = "Manager Name";
        break;
      case "recipient_name":
        values[v.name] = "Recipient Name";
        break;
      case "recipient_company":
        values[v.name] = "Partner Corp";
        break;
      case "recipient_email":
        values[v.name] = "contact@partner.com";
        break;
      case "phone":
        values[v.name] = "+1 (555) 000-0000";
        break;
      case "address":
        values[v.name] = "123 Main Street, Suite 100\nCity, State 12345";
        break;
      default:
        // For unknown variables, generate a placeholder
        values[v.name] = v.defaultValue || `[${v.label}]`;
        break;
    }
  }
  return values;
}
