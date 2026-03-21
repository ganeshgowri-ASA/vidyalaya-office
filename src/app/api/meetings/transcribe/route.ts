import { NextRequest, NextResponse } from 'next/server';

// POST /api/meetings/transcribe
// Accepts audio blob or stream for real-time transcription
// Production: forwards to Deepgram or AssemblyAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, language, provider, sessionId } = body as {
      audioData?: string;
      language?: string;
      provider?: 'deepgram' | 'assemblyai';
      sessionId?: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Provider-specific stubs
    if (provider === 'deepgram') {
      // Deepgram API integration stub
      // In production: POST to https://api.deepgram.com/v1/listen
      // with Authorization: Token ${DEEPGRAM_API_KEY}
      const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
      if (!deepgramApiKey) {
        return NextResponse.json({
          sessionId,
          provider: 'deepgram',
          status: 'stub',
          message: 'Deepgram API key not configured. Set DEEPGRAM_API_KEY environment variable.',
          transcript: {
            segments: [],
            speakers: [],
          },
        });
      }

      // Production Deepgram call would go here
      return NextResponse.json({
        sessionId,
        provider: 'deepgram',
        status: 'stub',
        message: 'Deepgram integration ready. Configure API key for production use.',
        transcript: { segments: [], speakers: [] },
      });
    }

    if (provider === 'assemblyai') {
      // AssemblyAI API integration stub
      // In production: POST to https://api.assemblyai.com/v2/transcript
      // with authorization: ${ASSEMBLYAI_API_KEY}
      const assemblyaiApiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!assemblyaiApiKey) {
        return NextResponse.json({
          sessionId,
          provider: 'assemblyai',
          status: 'stub',
          message: 'AssemblyAI API key not configured. Set ASSEMBLYAI_API_KEY environment variable.',
          transcript: {
            segments: [],
            speakers: [],
          },
        });
      }

      return NextResponse.json({
        sessionId,
        provider: 'assemblyai',
        status: 'stub',
        message: 'AssemblyAI integration ready. Configure API key for production use.',
        transcript: { segments: [], speakers: [] },
      });
    }

    // Default: browser-based transcription acknowledgment
    return NextResponse.json({
      sessionId,
      provider: 'browser',
      status: 'active',
      language: language || 'en-US',
      message: 'Using browser Web Speech API for transcription.',
      audioReceived: !!audioData,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process transcription request' },
      { status: 500 }
    );
  }
}

// GET /api/meetings/transcribe?sessionId=xxx
// Returns current transcription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId query parameter is required' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    sessionId,
    status: 'active',
    providers: {
      browser: { available: true, status: 'ready' },
      deepgram: {
        available: !!process.env.DEEPGRAM_API_KEY,
        status: process.env.DEEPGRAM_API_KEY ? 'ready' : 'not_configured',
      },
      assemblyai: {
        available: !!process.env.ASSEMBLYAI_API_KEY,
        status: process.env.ASSEMBLYAI_API_KEY ? 'ready' : 'not_configured',
      },
    },
  });
}
