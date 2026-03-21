import { NextRequest, NextResponse } from 'next/server';

// POST /api/meetings/upload-audio
// Handles audio file upload for offline transcription
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File | null;
    const language = formData.get('language') as string | null;
    const meetingId = formData.get('meetingId') as string | null;
    const provider = formData.get('provider') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided. Use form field "audio".' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
      'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
      'audio/x-m4a', 'audio/aac', 'audio/flac',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported: MP3, WAV, OGG, WebM, M4A, AAC, FLAC` },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    const fileId = `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    // In production, this would:
    // 1. Store the file (S3, GCS, or local storage)
    // 2. Queue a transcription job
    // 3. Return a job ID for polling

    // Stub: simulate processing
    return NextResponse.json({
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      language: language || 'en-US',
      meetingId: meetingId || null,
      provider: provider || 'browser',
      status: 'queued',
      message: 'Audio file received and queued for transcription.',
      estimatedDuration: Math.round(file.size / 16000), // rough estimate in seconds
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process audio upload' },
      { status: 500 }
    );
  }
}

// GET /api/meetings/upload-audio?fileId=xxx
// Check upload/processing status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json(
      { error: 'fileId query parameter is required' },
      { status: 400 }
    );
  }

  // Stub: return mock status
  return NextResponse.json({
    fileId,
    status: 'processing',
    progress: 45,
    message: 'Transcribing audio...',
  });
}
