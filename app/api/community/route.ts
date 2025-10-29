import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "communities";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

interface AirtableRecord {
  id: string;
  fields: {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    image?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function fetchCommunityFromAirtable(
  pageSize: number = 100,
  offset?: string
) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error("Airtable configuration missing");
  }

  const url = new URL(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      AIRTABLE_TABLE_NAME
    )}`
  );

  // Add query parameters
  url.searchParams.append("pageSize", pageSize.toString());
  url.searchParams.append("sort[0][field]", "id");
  url.searchParams.append("sort[0][direction]", "asc");

  if (offset) {
    url.searchParams.append("offset", offset);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Airtable API error: ${response.status} ${response.statusText}`
    );
  }

  const data: AirtableResponse = await response.json();
  return data;
}

function mapAirtableRecordToCommunity(record: AirtableRecord) {
  return {
    id: record.id,
    name: record.fields.name || "",
    email: record.fields.email || "",
    phone: record.fields.phone || "",
    title: record.fields.title || "",
    image: record.fields.image || "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = searchParams.get("req");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const offset = searchParams.get("offset");

    if (req !== "community") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      // Fetch data from Airtable
      const airtableData = await fetchCommunityFromAirtable(
        100,
        offset ?? undefined
      );

      // Map Airtable records to our Community interface
      const allCommunityMembers = airtableData.records.map(
        mapAirtableRecordToCommunity
      );

      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCommunityMembers = allCommunityMembers.slice(
        startIndex,
        endIndex
      );

      const totalCount = allCommunityMembers.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        community: paginatedCommunityMembers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        airtableOffset: airtableData.offset, // For Airtable pagination if needed
      });
    } catch (airtableError) {
      console.error("Airtable fetch error:", airtableError);

      // Fallback to mock data if Airtable fails
      const mockCommunityMembers = [
        {
          id: "rec001",
          name: "Melane Loïc",
          email: "melane.loic@catwalks.com",
          phone: "+33 1 23 45 67 89",
          title: "Founder at Catwalks",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec002",
          name: "Sophie Martin",
          email: "sophie.martin@catwalks.com",
          phone: "+33 1 23 45 67 90",
          title: "Creative Director",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec003",
          name: "Alexandre Dubois",
          email: "alexandre.dubois@catwalks.com",
          phone: "+33 1 23 45 67 91",
          title: "Lead Developer",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec004",
          name: "Marie Petit",
          email: "marie.petit@catwalks.com",
          phone: "+33 1 23 45 67 92",
          title: "UX Designer",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec005",
          name: "Thomas Bernard",
          email: "thomas.bernard@catwalks.com",
          phone: "+33 1 23 45 67 93",
          title: "Product Manager",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec006",
          name: "Camille Rousseau",
          email: "camille.rousseau@catwalks.com",
          phone: "+33 1 23 45 67 94",
          title: "Marketing Director",
          image:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec007",
          name: "Lucas Moreau",
          email: "lucas.moreau@catwalks.com",
          phone: "+33 1 23 45 67 95",
          title: "Sales Manager",
          image:
            "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face",
        },
        {
          id: "rec008",
          name: "Emma Leroy",
          email: "emma.leroy@catwalks.com",
          phone: "+33 1 23 45 67 96",
          title: "Community Manager",
          image:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
        },
      ];

      // Sort mock data A→Z by name
      const sortedCommunityMembers = [...mockCommunityMembers].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      );

      // Paginate mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCommunityMembers = sortedCommunityMembers.slice(
        startIndex,
        endIndex
      );

      const totalCount = sortedCommunityMembers.length;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        community: paginatedCommunityMembers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
        fallback: true, // Indicates this is fallback data
      });
    }
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
