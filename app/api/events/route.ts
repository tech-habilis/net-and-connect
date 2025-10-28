import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// LUMA API configuration
const LUMA_EVENTS_URL = process.env.LUMA_EVENTS_URL;
const LUMA_API_KEY = process.env.LUMA_API_KEY;

interface LumaEventData {
  id: string;
  name: string;
  description?: string;
  description_md?: string;
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
  descriptionMd?: string;
  start: string; // ISO format
  end: string; // ISO format
  location: string;
  url: string;
  coverImage?: string;
  timezone?: string;
}

interface PaginatedResponse {
  featured?: NormalizedEvent;
  upcoming: NormalizedEvent[];
  finished: NormalizedEvent[];
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

async function fetchEventsFromLuma(
  type: "upcoming" | "finished"
): Promise<NormalizedEvent[]> {
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

  // Add sorting and date filtering parameters to the URL
  const url = new URL(LUMA_EVENTS_URL);
  url.searchParams.append("sort_column", "start_at");

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (type === "upcoming") {
    url.searchParams.append("sort_direction", "asc");
    url.searchParams.append("after", yesterday.toISOString());
  } else {
    url.searchParams.append("sort_direction", "desc");
    url.searchParams.append("before", now.toISOString());
  }

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
      descriptionMd: event.description_md,
      start: event.start_at,
      end: event.end_at,
      location,
      url: event.url,
      coverImage: event.cover_url,
      timezone: event.timezone,
    };
  });

  return normalizedEvents;
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
    const type = searchParams.get("type"); // 'upcoming' or 'finished'

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
      if (type === 'upcoming') {
        // Fetch only upcoming events
        const upcomingEvents = await fetchEventsFromLuma('upcoming');
        const featured = page === 1 ? upcomingEvents[0] || null : null;
        const upcoming = page === 1 ? upcomingEvents.slice(1) : upcomingEvents;
        const paginatedResult = paginateEvents(upcoming, page === 1 ? 1 : page, limit);

        return NextResponse.json({
          featured,
          upcoming: paginatedResult.events,
          pagination: paginatedResult.pagination,
        });
      } else if (type === 'finished') {
        // Fetch only finished events
        const finishedEvents = await fetchEventsFromLuma('finished');
        const paginatedResult = paginateEvents(finishedEvents, page, limit);

        return NextResponse.json({
          finished: paginatedResult.events,
          pagination: paginatedResult.pagination,
        });
      } else {
        // Default behavior - fetch both for initial load
        // Fetch both upcoming and finished events from LUMA
        const [upcomingEvents, finishedEvents] = await Promise.all([
          fetchEventsFromLuma("upcoming"),
          fetchEventsFromLuma("finished"),
        ]);

        // Featured event is the first upcoming event
        const featured = upcomingEvents[0] || null;

        // Remove featured event from upcoming list
        const upcoming = upcomingEvents.slice(1);

        const totalEvents = upcoming.length + finishedEvents.length;

        return NextResponse.json({
          featured,
          upcoming: upcoming,
          finished: finishedEvents,
          pagination: {
            page,
            limit,
            total: totalEvents,
            totalPages: Math.ceil(totalEvents / limit),
            hasNext: upcoming.length > 4 || finishedEvents.length > 4,
            hasPrev: false,
          },
        });
      }
    } catch (lumaError) {
      console.error("LUMA fetch error:", lumaError);

      // Fallback to mock data if LUMA fails
      const mockEvents: NormalizedEvent[] = [
        {
          id: "e1",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-29T18:00:00.000Z",
          end: "2025-10-29T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-29",
          timezone: "Europe/Paris",
        },
        {
          id: "e2",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-11-05T18:00:00.000Z",
          end: "2025-11-05T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-05",
          timezone: "Europe/Paris",
        },
        {
          id: "e3",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-11-12T18:00:00.000Z",
          end: "2025-11-12T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-12",
          timezone: "Europe/Paris",
        },
        {
          id: "e4",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-11-19T18:00:00.000Z",
          end: "2025-11-19T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-19",
          timezone: "Europe/Paris",
        },
        {
          id: "e5",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-11-26T18:00:00.000Z",
          end: "2025-11-26T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-26",
          timezone: "Europe/Paris",
        },
      ];

      const mockFinishedEvents: NormalizedEvent[] = [
        {
          id: "f1",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-21T18:00:00.000Z",
          end: "2025-10-21T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-21",
          timezone: "Europe/Paris",
        },
        {
          id: "f2",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-14T18:00:00.000Z",
          end: "2025-10-14T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-14",
          timezone: "Europe/Paris",
        },
        {
          id: "f3",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-10-07T18:00:00.000Z",
          end: "2025-10-07T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-07",
          timezone: "Europe/Paris",
        },
        {
          id: "f4",
          title: "Afterwork business",
          description: "Soirée networking pour entrepreneurs et dirigeants",
          start: "2025-09-30T18:00:00.000Z",
          end: "2025-09-30T21:00:00.000Z",
          location: "Boulogne, Paris",
          url: "https://lu.ma/afterwork-business-30",
          timezone: "Europe/Paris",
        },
      ];

      const featured = mockEvents[0] || null;
      const upcoming = mockEvents.slice(1);

      return NextResponse.json({
        featured,
        upcoming: upcoming.slice(0, 4),
        finished: mockFinishedEvents.slice(0, 4),
        pagination: {
          page,
          limit,
          total: upcoming.length + mockFinishedEvents.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
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
