import { NextRequest, NextResponse } from 'next/server';

interface AskRequest {
  question: string;
  transcripts: {
    id: string;
    title: string;
    date: string;
    summary: { overview: string; action_items: string[]; decisions: string[]; keywords: string[] };
    sentences: { speaker_name: string; text: string }[];
  }[];
}

function searchTranscripts(question: string, transcripts: AskRequest['transcripts']) {
  const lowerQ = question.toLowerCase();
  const results: { meetingTitle: string; date: string; snippet: string; relevance: number }[] = [];

  for (const t of transcripts) {
    let relevance = 0;
    const snippets: string[] = [];

    // Check summary
    if (t.summary.overview.toLowerCase().includes(lowerQ)) {
      relevance += 10;
      snippets.push(t.summary.overview);
    }

    // Check keywords
    for (const kw of t.summary.keywords) {
      if (lowerQ.includes(kw.toLowerCase())) {
        relevance += 5;
      }
    }

    // Check action items
    for (const ai of t.summary.action_items) {
      if (ai.toLowerCase().includes(lowerQ)) {
        relevance += 3;
        snippets.push(ai);
      }
    }

    // Check decisions
    for (const d of t.summary.decisions) {
      if (d.toLowerCase().includes(lowerQ)) {
        relevance += 3;
        snippets.push(d);
      }
    }

    // Check sentences
    for (const s of t.sentences) {
      if (s.text.toLowerCase().includes(lowerQ)) {
        relevance += 2;
        snippets.push(`${s.speaker_name}: "${s.text}"`);
      }
    }

    // General word matching
    const words = lowerQ.split(/\s+/).filter((w) => w.length > 2);
    for (const word of words) {
      if (t.title.toLowerCase().includes(word)) relevance += 2;
      if (t.summary.overview.toLowerCase().includes(word)) relevance += 1;
      for (const s of t.sentences) {
        if (s.text.toLowerCase().includes(word)) relevance += 0.5;
      }
    }

    if (relevance > 0) {
      results.push({
        meetingTitle: t.title,
        date: t.date,
        snippet: snippets.length > 0 ? snippets[0] : t.summary.overview,
        relevance,
      });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

function generateResponse(question: string, sources: ReturnType<typeof searchTranscripts>): string {
  if (sources.length === 0) {
    return "I couldn't find any relevant information in your meetings for that question. Try rephrasing or asking about a specific topic, person, or action item.";
  }

  const topSource = sources[0];
  let response = `Based on your meetings, here's what I found:\n\n`;
  response += `**From "${topSource.meetingTitle}"** (${new Date(topSource.date).toLocaleDateString()}):\n`;
  response += `${topSource.snippet}\n`;

  if (sources.length > 1) {
    response += `\n**Related meetings:**\n`;
    sources.slice(1).forEach((s) => {
      response += `- ${s.meetingTitle} (${new Date(s.date).toLocaleDateString()})\n`;
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const data: AskRequest = await request.json();

    if (!data.question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!data.transcripts || data.transcripts.length === 0) {
      return NextResponse.json({
        answer: "No meeting transcripts available to search. Connect your Fireflies.ai account to import meeting data.",
        sources: [],
      });
    }

    const sources = searchTranscripts(data.question, data.transcripts);
    const answer = generateResponse(data.question, sources);

    return NextResponse.json({
      answer,
      sources: sources.map((s) => ({
        meetingTitle: s.meetingTitle,
        date: s.date,
        snippet: s.snippet,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ask failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
