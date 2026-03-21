import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CONFIG = {
  id: "bot-default",
  name: "Vidyalaya Bot",
  avatar: "VB",
  avatarColor: "#6366f1",
  behavior: "full_participation",
  autoJoin: true,
  joinBeforeMinutes: 2,
  leaveAfterMinutes: 5,
  recordAudio: true,
  recordVideo: true,
  autoTranscribe: true,
  notifyHost: true,
  language: "en",
};

export async function GET() {
  return NextResponse.json({ config: DEFAULT_CONFIG });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedConfig = {
      ...DEFAULT_CONFIG,
      ...body,
      id: DEFAULT_CONFIG.id,
    };

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: "Bot configuration updated",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update bot configuration" },
      { status: 500 }
    );
  }
}
