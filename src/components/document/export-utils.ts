import { getEditorContent, getEditorText } from "./editor-area";

export function exportAsHTML(fileName: string) {
  const content = getEditorContent();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fileName}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
  h1 { font-size: 28px; } h2 { font-size: 22px; } h3 { font-size: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  blockquote { border-left: 4px solid #1565C0; margin: 12px 0; padding: 8px 16px; color: #555; background: #f9f9f9; }
  pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 12px; overflow-x: auto; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${content}
</body>
</html>`;

  downloadFile(html, `${fileName}.html`, "text/html");
}

export function exportAsText(fileName: string) {
  const text = getEditorText();
  downloadFile(text, `${fileName}.txt`, "text/plain");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
