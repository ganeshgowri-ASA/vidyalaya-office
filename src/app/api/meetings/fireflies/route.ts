import { NextRequest, NextResponse } from 'next/server';

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, query, variables } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'Fireflies API key is required' }, { status: 400 });
    }

    if (!query) {
      return NextResponse.json({ error: 'GraphQL query is required' }, { status: 400 });
    }

    const response = await fetch(FIREFLIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Fireflies API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch from Fireflies';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Fireflies.ai Integration',
    endpoint: FIREFLIES_API_URL,
    methods: ['POST'],
    description: 'Proxy endpoint for Fireflies.ai GraphQL API. Send POST with { apiKey, query, variables }.',
  });
}
