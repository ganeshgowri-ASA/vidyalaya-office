import { NextRequest, NextResponse } from "next/server";

interface ExportRequest {
  format: "pdf" | "docx" | "xlsx" | "pptx" | "csv" | "txt" | "html" | "md";
  content: string;
  title?: string;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
  options?: {
    pageSize?: "A4" | "Letter" | "A3";
    orientation?: "portrait" | "landscape";
    includePageNumbers?: boolean;
    includeHeader?: boolean;
    includeFooter?: boolean;
    watermark?: string;
  };
}

const SUPPORTED_FORMATS = ["pdf", "docx", "xlsx", "pptx", "csv", "txt", "html", "md"];

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
  html: "text/html",
  md: "text/markdown",
};

export async function POST(req: NextRequest) {
  try {
    const body: ExportRequest = await req.json();
    const { format, content, title = "Exported Document", metadata, options } = body;

    if (!format || !SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // For text-based formats, return the content directly
    let exportContent = "";
    const contentType = MIME_TYPES[format];

    if (format === "txt") {
      exportContent = content;
    } else if (format === "md") {
      exportContent = content;
    } else if (format === "html") {
      exportContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${metadata?.author ? `<meta name="author" content="${metadata.author}">` : ""}
  ${metadata?.keywords ? `<meta name="keywords" content="${metadata.keywords.join(", ")}">` : ""}
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #333; }
    h1 { color: #1a1a2e; }
    ${options?.watermark ? `body::after { content: "${options.watermark}"; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); pointer-events: none; z-index: 9999; }` : ""}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${content.replace(/\n/g, "<br>")}</div>
  ${options?.includePageNumbers ? '<footer style="text-align:center;margin-top:40px;color:#999;">Page 1</footer>' : ""}
</body>
</html>`;
    } else if (format === "csv") {
      // Convert content to CSV
      const lines = content.split("\n").filter(Boolean);
      exportContent = lines.map((line) => `"${line.replace(/"/g, '""')}"`).join("\n");
    } else {
      // For binary formats (pdf, docx, xlsx, pptx), return job info
      // In a real implementation, this would call a document generation service
      return NextResponse.json({
        success: true,
        jobId: `export-${Date.now()}`,
        format,
        title,
        message: `Export job created. In production, this would generate a ${format.toUpperCase()} file.`,
        estimatedSize: Math.round(content.length * 1.5),
        contentType,
        fallback: true,
      });
    }

    // Return text-based file
    return new NextResponse(exportContent, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-z0-9]/gi, "_")}.${format}"`,
        "Content-Length": String(Buffer.byteLength(exportContent, "utf-8")),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to process export request" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    supportedFormats: SUPPORTED_FORMATS,
    mimeTypes: MIME_TYPES,
  });
}
