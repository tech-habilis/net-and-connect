import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "partners";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

interface AirtableRecord {
  id: string;
  fields: {
    title?: string;
    image?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function fetchPartnersFromAirtable(
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

function mapAirtableRecordToPartner(record: AirtableRecord) {
  return {
    id: record.id,
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

    if (req !== "partners") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      // Fetch ALL data from Airtable (not just first 100)
      let allAirtableRecords: AirtableRecord[] = [];
      let airtableOffset: string | undefined = offset ?? undefined;

      // Fetch all pages from Airtable
      do {
        const airtableData = await fetchPartnersFromAirtable(
          100, // Airtable page size
          airtableOffset
        );

        allAirtableRecords = allAirtableRecords.concat(airtableData.records);
        airtableOffset = airtableData.offset;
      } while (airtableOffset);

      // Map ALL Airtable records to our Partner interface
      const allPartners = allAirtableRecords.map(mapAirtableRecordToPartner);

      // Implement pagination on the complete dataset
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPartners = allPartners.slice(startIndex, endIndex);

      const totalCount = allPartners.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        partners: paginatedPartners,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        debug: {
          totalRecordsFromAirtable: allPartners.length,
          requestedPage: page,
          requestedLimit: limit,
        },
      });
    } catch (airtableError) {
      console.error("Airtable fetch error:", airtableError);

      // Fallback to mock data if Airtable fails
      const mockPartners = [
        {
          id: "rec001",
          title: "NIKE",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec002",
          title: "FEED",
          image:
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec003",
          title: "ADIDAS",
          image:
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec004",
          title: "DECATHLON",
          image:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec005",
          title: "ADIDAS",
          image:
            "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec006",
          title: "DECATHLON",
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec007",
          title: "FEED",
          image:
            "https://images.unsplash.com/photo-1556742059-2414c0e0b740?w=400&h=300&fit=crop&crop=center",
        },
        {
          id: "rec008",
          title: "NIKE",
          image:
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&crop=center",
        },
      ];

      // Sort mock data A→Z by title
      const sortedPartners = [...mockPartners].sort((a, b) =>
        a.title.localeCompare(b.title, "fr", { sensitivity: "base" })
      );

      // Paginate mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPartners = sortedPartners.slice(startIndex, endIndex);

      const totalCount = sortedPartners.length;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        partners: paginatedPartners,
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
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
