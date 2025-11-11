import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "Le cercle";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

interface AirtableRecord {
  id: string;
  fields: {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
    enterprise?: string[]; // This is a linked record array
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

async function fetchCompanyName(companyId: string): Promise<string> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Entreprises/${companyId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch company ${companyId}:`, response.status);
      return "";
    }

    const data = await response.json();
    return data.fields["Company Name"] || "";
  } catch (error) {
    console.error(`Error fetching company ${companyId}:`, error);
    return "";
  }
}

async function mapAirtableRecordToCommunity(record: AirtableRecord): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  image: string;
}> {
  // Get company name from linked record
  let companyName = "";
  if (record.fields.enterprise && record.fields.enterprise.length > 0) {
    const entrepriseId = record.fields.enterprise[0];
    companyName = await fetchCompanyName(entrepriseId);
  }

  return {
    id: record.id,
    name: record.fields.name || "",
    email: record.fields.email || "",
    phone: record.fields.phone || "",
    title: record.fields.title || "",
    company: companyName,
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
      // Fetch ALL data from Airtable (not just first 100)
      let allAirtableRecords: AirtableRecord[] = [];
      let airtableOffset: string | undefined = offset ?? undefined;

      // Fetch all pages from Airtable
      do {
        const airtableData = await fetchCommunityFromAirtable(
          100, // Airtable page size
          airtableOffset
        );

        allAirtableRecords = allAirtableRecords.concat(airtableData.records);
        airtableOffset = airtableData.offset;
      } while (airtableOffset);

      // Map ALL Airtable records to our Community interface
      const allCommunityMembers = await Promise.all(
        allAirtableRecords.map(mapAirtableRecordToCommunity)
      );

      // Implement pagination on the complete dataset
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
        debug: {
          totalRecordsFromAirtable: allCommunityMembers.length,
          requestedPage: page,
          requestedLimit: limit,
        },
      });
    } catch (airtableError) {
      console.error("Airtable fetch error:", airtableError);

      // Return empty data when Airtable fails
      return NextResponse.json({
        community: [],
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
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
