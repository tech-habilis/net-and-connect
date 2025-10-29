import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "expert_users";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

interface AirtableRecord {
  id: string;
  fields: {
    name?: string;
    phone?: string;
    email?: string;
    description?: string;
    image?: string;
    title?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function fetchExpertsFromAirtable(
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
  url.searchParams.append("sort[0][field]", "name");
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

function mapAirtableRecordToExpert(record: AirtableRecord) {
  return {
    id: record.id,
    name: record.fields.name || "",
    phone: record.fields.phone || "",
    email: record.fields.email || "",
    description: record.fields.description || "",
    image: record.fields.image || "",
    title: record.fields.title || "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = searchParams.get("req");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const offset = searchParams.get("offset");

    if (req !== "experts") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      // Fetch ALL data from Airtable (not just first 100)
      let allAirtableRecords: AirtableRecord[] = [];
      let airtableOffset: string | undefined = offset ?? undefined;

      // Fetch all pages from Airtable
      do {
        const airtableData = await fetchExpertsFromAirtable(
          100, // Airtable page size
          airtableOffset
        );

        allAirtableRecords = allAirtableRecords.concat(airtableData.records);
        airtableOffset = airtableData.offset;
      } while (airtableOffset);

      // Map ALL Airtable records to our Expert interface
      const allExperts = allAirtableRecords.map(mapAirtableRecordToExpert);

      // Implement pagination on the complete dataset
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExperts = allExperts.slice(startIndex, endIndex);

      const totalCount = allExperts.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        experts: paginatedExperts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        debug: {
          totalRecordsFromAirtable: allExperts.length,
          requestedPage: page,
          requestedLimit: limit,
        },
      });
    } catch (airtableError) {
      console.error("Airtable fetch error:", airtableError);

      // Fallback to mock data if Airtable fails
      const mockExperts = [
        {
          id: "rec001",
          name: "MELANE LOÏC",
          phone: "+33613269554",
          email: "loic.melane@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
        {
          id: "rec002",
          name: "SOPHIE MARTIN",
          phone: "+33613269555",
          email: "sophie.martin@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
        {
          id: "rec003",
          name: "JULIEN DUPONT",
          phone: "+33613269556",
          email: "julien.dupont@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
        {
          id: "rec004",
          name: "MARIE BERNARD",
          phone: "+33613269557",
          email: "marie.bernard@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
        {
          id: "rec005",
          name: "THOMAS RICHARD",
          phone: "+33613269558",
          email: "thomas.richard@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
        {
          id: "rec006",
          name: "CLAIRE DUBOIS",
          phone: "+33613269559",
          email: "claire.dubois@gmail.com",
          description:
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised.",
          image:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
          title: "FOUNDER AT CATWALKS",
        },
      ];

      // Sort mock data A→Z by name
      const sortedExperts = [...mockExperts].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      );

      // Paginate mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedExperts = sortedExperts.slice(startIndex, endIndex);

      const totalCount = sortedExperts.length;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        experts: paginatedExperts,
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
    console.error("Error fetching experts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
