import { NextRequest, NextResponse } from 'next/server';

interface ExportRequest {
  meetingId: string;
  format: 'notion' | 'google-docs' | 'markdown' | 'pdf';
  title: string;
  date: string;
  summary: string;
  actionItems: string[];
  decisions: string[];
  participants: string[];
  transcript?: { speaker: string; text: string; timestamp: number }[];
}

function generateMarkdown(data: ExportRequest): string {
  const lines: string[] = [
    `# ${data.title}`,
    '',
    `**Date:** ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    `**Participants:** ${data.participants.join(', ')}`,
    '',
    '## Summary',
    data.summary,
    '',
    '## Action Items',
    ...data.actionItems.map((item) => `- [ ] ${item}`),
    '',
    '## Decisions',
    ...data.decisions.map((d) => `- ${d}`),
  ];

  if (data.transcript && data.transcript.length > 0) {
    lines.push('', '## Transcript', '');
    data.transcript.forEach((entry) => {
      const mins = Math.floor(entry.timestamp / 60);
      const secs = entry.timestamp % 60;
      lines.push(`**${entry.speaker}** (${mins}:${String(secs).padStart(2, '0')}): ${entry.text}`);
    });
  }

  lines.push('', '---', `*Exported from Vidyalaya Office on ${new Date().toLocaleDateString()}*`);
  return lines.join('\n');
}

function generateNotionBlocks(data: ExportRequest) {
  // Notion API-compatible block format
  return {
    parent: { type: 'page_id', page_id: 'placeholder' },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
    },
    children: [
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Summary' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: data.summary } }] } },
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Action Items' } }] } },
      ...data.actionItems.map((item) => ({
        object: 'block' as const,
        type: 'to_do' as const,
        to_do: { rich_text: [{ text: { content: item } }], checked: false },
      })),
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Decisions' } }] } },
      ...data.decisions.map((d) => ({
        object: 'block' as const,
        type: 'bulleted_list_item' as const,
        bulleted_list_item: { rich_text: [{ text: { content: d } }] },
      })),
      { object: 'block', type: 'divider', divider: {} },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: `Participants: ${data.participants.join(', ')}` } }] } },
    ],
  };
}

function generateGoogleDocsPayload(data: ExportRequest) {
  // Google Docs API-compatible format
  return {
    title: data.title,
    body: {
      content: [
        { paragraph: { elements: [{ textRun: { content: `${data.title}\n`, textStyle: { bold: true, fontSize: { magnitude: 24, unit: 'PT' } } } }] } },
        { paragraph: { elements: [{ textRun: { content: `Date: ${new Date(data.date).toLocaleDateString()}\n` } }] } },
        { paragraph: { elements: [{ textRun: { content: `Participants: ${data.participants.join(', ')}\n\n` } }] } },
        { paragraph: { elements: [{ textRun: { content: 'Summary\n', textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } } } }] } },
        { paragraph: { elements: [{ textRun: { content: `${data.summary}\n\n` } }] } },
        { paragraph: { elements: [{ textRun: { content: 'Action Items\n', textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } } } }] } },
        ...data.actionItems.map((item) => ({
          paragraph: { elements: [{ textRun: { content: `☐ ${item}\n` } }] },
        })),
        { paragraph: { elements: [{ textRun: { content: '\nDecisions\n', textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } } } }] } },
        ...data.decisions.map((d) => ({
          paragraph: { elements: [{ textRun: { content: `• ${d}\n` } }] },
        })),
      ],
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: ExportRequest = await request.json();

    if (!data.format || !data.title) {
      return NextResponse.json({ error: 'Format and title are required' }, { status: 400 });
    }

    let content: string;
    let contentType: string;
    let fileName: string;

    switch (data.format) {
      case 'markdown':
        content = generateMarkdown(data);
        contentType = 'text/markdown';
        fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        break;
      case 'notion':
        content = JSON.stringify(generateNotionBlocks(data), null, 2);
        contentType = 'application/json';
        fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_notion.json`;
        break;
      case 'google-docs':
        content = JSON.stringify(generateGoogleDocsPayload(data), null, 2);
        contentType = 'application/json';
        fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_gdocs.json`;
        break;
      case 'pdf':
        // For PDF, return markdown content with metadata for client-side PDF generation
        content = JSON.stringify({
          markdown: generateMarkdown(data),
          metadata: { title: data.title, date: data.date, participants: data.participants },
        });
        contentType = 'application/json';
        fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        break;
      default:
        return NextResponse.json({ error: `Unsupported format: ${data.format}` }, { status: 400 });
    }

    return NextResponse.json({ content, contentType, fileName, format: data.format });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
