import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingUrl, botConfigId, behavior } = body;

    if (!meetingUrl) {
      return NextResponse.json(
        { error: "Meeting URL is required" },
        { status: 400 }
      );
    }

    // Simulate bot joining the meeting
    const joinResult = {
      success: true,
      botId: `bot-${Date.now().toString(36)}`,
      meetingUrl,
      botConfigId: botConfigId || "bot-default",
      behavior: behavior || "full_participation",
      joinedAt: new Date().toISOString(),
      status: "joining",
      message: "Bot is joining the meeting",
    };

    return NextResponse.json(joinResult);
  } catch {
    return NextResponse.json(
      { error: "Failed to process bot join request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");

    if (!botId) {
      return NextResponse.json(
        { error: "Bot ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      botId,
      leftAt: new Date().toISOString(),
      message: "Bot has left the meeting",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove bot from meeting" },
      { status: 500 }
    );
  }
}
