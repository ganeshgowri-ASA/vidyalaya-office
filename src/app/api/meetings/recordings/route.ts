import { NextRequest, NextResponse } from "next/server";

const MOCK_RECORDINGS = [
  {
    id: "rec-1",
    meetingTitle: "Sprint Planning - Q2",
    platform: "gmeet",
    date: "2024-03-18",
    duration: 3420,
    fileSize: 45000000,
    type: "video",
    status: "ready",
  },
  {
    id: "rec-2",
    meetingTitle: "Client Demo - Phase 2",
    platform: "zoom",
    date: "2024-03-17",
    duration: 5400,
    fileSize: 72000000,
    type: "video",
    status: "ready",
  },
  {
    id: "rec-3",
    meetingTitle: "Design Review - UI/UX",
    platform: "teams",
    date: "2024-03-15",
    duration: 2700,
    fileSize: 35000000,
    type: "audio",
    status: "ready",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  let results = [...MOCK_RECORDINGS];

  if (platform && platform !== "all") {
    results = results.filter((r) => r.platform === platform);
  }

  if (type && type !== "all") {
    results = results.filter((r) => r.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter((r) =>
      r.meetingTitle.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    recordings: results,
    total: results.length,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Recording ID is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    id,
    message: "Recording deleted",
  });
}
