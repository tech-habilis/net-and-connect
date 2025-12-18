import { NextRequest, NextResponse } from "next/server";
import { verifyAuthCookie } from "@/lib/magic-link";
import { UserService } from "@/services/user.service";

export const runtime = "nodejs";

// LUMA API configuration
const LUMA_EVENTS_URL = process.env.LUMA_EVENTS_URL;
const LUMA_JOIN_EVENT_URL = process.env.LUMA_JOIN_EVENT_URL;
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
  tags: Array<{
    id: string;
    api_id: string;
    name: string;
  }>;
}

interface LumaResponse {
  entries: LumaEventEntry[];
  next_cursor?: string;
  has_more?: boolean;
}

interface NormalizedEvent {
  id: string;
  api_id?: string; // Luma API ID for joining events
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
  const normalizedEvents: NormalizedEvent[] = data.entries
    .filter((entry) => {
      // Exclude events that have 'ENTERPRISE' in their tags
      return (
        !entry.tags || !entry.tags.some((tag) => tag.name === "ENTERPRISE")
      );
    })
    .map((entry) => {
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
        api_id: entry.api_id, // Include Luma API ID
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
      if (type === "upcoming") {
        // Fetch only upcoming events
        const upcomingEvents = await fetchEventsFromLuma("upcoming");
        const featured = page === 1 ? upcomingEvents[0] || null : null;
        const upcoming = page === 1 ? upcomingEvents.slice(1) : upcomingEvents;
        const paginatedResult = paginateEvents(
          upcoming,
          page === 1 ? 1 : page,
          limit
        );

        return NextResponse.json({
          featured,
          upcoming: paginatedResult.events,
          pagination: paginatedResult.pagination,
        });
      } else if (type === "finished") {
        // Fetch only finished events
        const finishedEvents = await fetchEventsFromLuma("finished");
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

      // Return empty data when LUMA fails
      return NextResponse.json({
        featured: null,
        upcoming: [],
        finished: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        error: "Service temporarily unavailable",
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { req, eventId, userEmail } = body;

    if (req !== "join") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get user data to check token balance
    const userData = await UserService.findUserByEmail(userEmail);
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough tokens
    if (userData.tokens < 1) {
      return NextResponse.json(
        {
          error:
            "Insufficient tokens. You need at least 1 JTEON to join an event.",
        },
        { status: 400 }
      );
    }

    // Find the event to get api_id
    // let eventApiId = null;
    // try {
    //   const upcomingEvents = await fetchEventsFromLuma("upcoming");
    //   const event = upcomingEvents.find((e) => e.id === eventId);

    //   if (!event || !event.api_id) {
    //     return NextResponse.json(
    //       { error: "Event not found or invalid" },
    //       { status: 404 }
    //     );
    //   }

    //   eventApiId = event.api_id;
    // } catch (error) {
    //   console.error("Error finding event:", error);
    //   return NextResponse.json(
    //     { error: "Failed to find event" },
    //     { status: 500 }
    //   );
    // }

    // Join event
    try {
      // if (!LUMA_JOIN_EVENT_URL || !LUMA_API_KEY) {
      //   throw new Error("Luma API configuration missing");
      // }

      // const joinResponse = await fetch(LUMA_JOIN_EVENT_URL, {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${LUMA_API_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     event_api_id: eventApiId,
      //     guests: [
      //       {
      //         email: userEmail,
      //       },
      //     ],
      //   }),
      // });

      // if (!joinResponse.ok) {
      //   const errorText = await joinResponse.text();
      //   console.error("Luma API error:", errorText);
      //   throw new Error(
      //     `Failed to join event: ${joinResponse.status} ${joinResponse.statusText}`
      //   );
      // }

      // Successfully joined event, now reduce user tokens
      const newTokenCount = userData.tokens - 1;
      await UserService.updateUserTokens(userData.id, newTokenCount);

      return NextResponse.json({
        success: true,
        message: "Successfully joined event",
        tokensRemaining: newTokenCount,
      });
    } catch (error) {
      console.error("Error joining event:", error);
      return NextResponse.json(
        { error: "Failed to join event. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
