import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "Nos experts";
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
    website?: string;
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

function mapAirtableRecordToExpert(record: AirtableRecord) {
  return {
    id: record.id,
    name: record.fields.name || "",
    phone: record.fields.phone || "",
    email: record.fields.email || "",
    description: record.fields.description || "",
    image: record.fields.image || "",
    title: record.fields.title || "",
    website: record.fields.website || "",
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

      // Return empty data when Airtable fails
      return NextResponse.json({
        experts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit,
        },
        error: "Service temporarily unavailable",
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
