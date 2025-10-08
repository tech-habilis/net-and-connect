import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// LUMA API configuration
const LUMA_EVENTS_URL = process.env.LUMA_EVENTS_URL;
const LUMA_API_KEY = process.env.LUMA_API_KEY;

interface LumaEventData {
  id: string;
  name: string;
  description?: string;
  start_at: string;
  end_at: string;
  cover_url?: string;
  geo_address_json?: {
    address?: string;
    city?: string;
    region?: string;
    full_address?: string;
  };
  url: string;
  timezone?: string;
}

interface LumaEventEntry {
  api_id: string;
  event: LumaEventData;
  tags: string[];
}

interface LumaResponse {
  entries: LumaEventEntry[];
  next_cursor?: string;
  has_more?: boolean;
}

interface NormalizedEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO format
  end: string; // ISO format
  location: string;
  url: string;
  coverImage?: string;
  timezone?: string;
}

interface PaginatedResponse {
  events: NormalizedEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  fallback?: boolean;
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

  // Add sorting parameters to the URL
  const url = new URL(LUMA_EVENTS_URL);
  url.searchParams.append("sort_column", "start_at");
  url.searchParams.append("sort_direction", "asc");
  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `LUMA API error: ${response.status} ${response.statusText}`
    );
  }

  const data: LumaResponse = await response.json();

  // Normalize the events from the new structure
  const normalizedEvents: NormalizedEvent[] = data.entries.map((entry) => {
    const event = entry.event;

    // Format location from geo_address_json
    let location = "TBD";
    if (event.geo_address_json) {
      const geo = event.geo_address_json;
      if (geo.full_address) {
        location = geo.full_address;
      } else if (geo.address && geo.city) {
        location = `${geo.address}, ${geo.city}`;
      } else if (geo.city && geo.region) {
        location = `${geo.city}, ${geo.region}`;
      } else if (geo.city) {
        location = geo.city;
      } else if (geo.address) {
        location = geo.address;
      }
    }

    return {
      id: event.id,
      title: event.name,
      description: event.description,
      start: event.start_at,
      end: event.end_at,
      location,
      url: event.url,
      coverImage: event.cover_url,
      timezone: event.timezone,
    };
  });

  // Filter out past events and sort by start date ascending
  const now = new Date();
  const upcomingEvents = normalizedEvents
    .filter((event) => new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return upcomingEvents;
}

function paginateEvents(
  events: NormalizedEvent[],
  page: number,
  limit: number
) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEvents = events.slice(startIndex, endIndex);

  return {
    events: paginatedEvents,
    pagination: {
      page,
      limit,
      total: events.length,
      totalPages: Math.ceil(events.length / limit),
      hasNext: endIndex < events.length,
      hasPrev: page > 1,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = searchParams.get("req");

    if (req !== "events") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(50, parseInt(searchParams.get("limit") || "10"))
    );

    try {
      // Fetch all events from LUMA
      const events = await fetchEventsFromLuma();
      const paginatedResult = paginateEvents(events, page, limit);

      return NextResponse.json({
        ...paginatedResult,
      });
    } catch (lumaError) {
      console.error("LUMA fetch error:", lumaError);

      // Fallback to mock data if LUMA fails
      const mockEvents: NormalizedEvent[] = [
        {
          id: "e1",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-09T18:00:00.000Z",
          end: "2025-10-09T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-09",
          timezone: "Europe/Paris",
        },
        {
          id: "e2",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-16T18:00:00.000Z",
          end: "2025-10-16T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-16",
          timezone: "Europe/Paris",
        },
        {
          id: "e3",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-21T18:00:00.000Z",
          end: "2025-10-21T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-21",
          timezone: "Europe/Paris",
        },
        {
          id: "e4",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-23T18:00:00.000Z",
          end: "2025-10-23T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-23",
          timezone: "Europe/Paris",
        },
        {
          id: "e5",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-26T18:00:00.000Z",
          end: "2025-10-26T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-26",
          timezone: "Europe/Paris",
        },
        {
          id: "e6",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-30T18:00:00.000Z",
          end: "2025-10-30T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-30",
          timezone: "Europe/Paris",
        },
        {
          id: "e7",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-31T18:00:00.000Z",
          end: "2025-10-31T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-31",
          timezone: "Europe/Paris",
        },
      ];

      // Filter out past events and sort
      const now = new Date();
      const upcomingEvents = mockEvents
        .filter((event) => new Date(event.start) >= now)
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

      const paginatedResult = paginateEvents(upcomingEvents, page, limit);

      return NextResponse.json({
        ...paginatedResult,
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
