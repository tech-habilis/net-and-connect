import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// LUMA API configuration
const LUMA_EVENTS_URL = process.env.LUMA_EVENTS_URL;
const LUMA_API_KEY = process.env.LUMA_API_KEY;

interface LumaEvent {
  id: string;
  title: string;
  start_at: string;
  location?: {
    name?: string;
    address?: string;
  };
  url: string;
}

interface LumaResponse {
  entries: LumaEvent[];
}

interface NormalizedEvent {
  id: string;
  title: string;
  start: string; // ISO format
  location: string;
  url: string;
}

async function fetchEventsFromLuma(): Promise<NormalizedEvent[]> {
  if (!LUMA_EVENTS_URL) {
    throw new Error("LUMA_EVENTS_URL not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if API key is provided
  if (LUMA_API_KEY) {
    headers["Authorization"] = `Bearer ${LUMA_API_KEY}`;
  }

  const response = await fetch(LUMA_EVENTS_URL, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `LUMA API error: ${response.status} ${response.statusText}`
    );
  }

  const data: LumaResponse = await response.json();

  // Normalize the events
  const normalizedEvents: NormalizedEvent[] = data.entries.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_at, // Already in ISO format
    location: event.location?.name || event.location?.address || "TBD",
    url: event.url,
  }));

  // Filter out past events and sort by start date ascending
  const now = new Date();
  const upcomingEvents = normalizedEvents
    .filter((event) => new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return upcomingEvents;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = searchParams.get("req");

    if (req !== "events") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      // Fetch events from LUMA
      const events = await fetchEventsFromLuma();

      return NextResponse.json({
        events,
      });
    } catch (lumaError) {
      console.error("LUMA fetch error:", lumaError);

      // Fallback to mock data if LUMA fails
      const mockEvents: NormalizedEvent[] = [
        {
          id: "e1",
          title: "Afterwork business",
          start: "2025-10-09T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-09",
        },
        {
          id: "e2",
          title: "Afterwork business",
          start: "2025-10-16T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-16",
        },
        {
          id: "e3",
          title: "Afterwork business",
          start: "2025-10-21T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-21",
        },
        {
          id: "e4",
          title: "Afterwork business",
          start: "2025-10-23T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-23",
        },
        {
          id: "e5",
          title: "Afterwork business",
          start: "2025-10-26T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-26",
        },
        {
          id: "e6",
          title: "Afterwork business",
          start: "2025-10-30T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-30",
        },
        {
          id: "e7",
          title: "Afterwork business",
          start: "2025-10-31T18:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-31",
        },
      ];

      // Filter out past events and sort
      const now = new Date();
      const upcomingEvents = mockEvents
        .filter((event) => new Date(event.start) >= now)
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

      return NextResponse.json({
        events: upcomingEvents,
        fallback: true, // Indicates this is fallback data
      });
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
