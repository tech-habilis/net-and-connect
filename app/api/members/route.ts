import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME =
  process.env.AIRTABLE_TABLE_NAME || "Membres du club";
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

interface AirtableRecord {
  id: string;
  fields: {
    "Nom complet"?: string;
    Email?: string;
    Téléphone?: string;
    Entreprise?: string; // This is now a string field
    Fonction?: string;
    "Tokens restants"?: number;
    LinkedIn?: string;
    Image?: string;
    "Rôle dans l’organisation"?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function fetchMembersFromAirtable(
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
  url.searchParams.append("sort[0][field]", "Nom complet");
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

function mapAirtableRecordToMember(record: AirtableRecord): {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  organizationRole: string;
  tokens: number;
  linkedin: string | undefined;
  image: string | undefined;
} {
  return {
    id: record.id,
    name: record.fields["Nom complet"] || "",
    email: record.fields["Email"] || "",
    phone: record.fields["Téléphone"] || "",
    company: record.fields.Entreprise || "",
    role: record.fields["Fonction"] || "",
    organizationRole: record.fields["Rôle dans l’organisation"] || "",
    tokens: record.fields["Tokens restants"] || 0,
    linkedin: record.fields["LinkedIn"] || undefined,
    image: record.fields["Image"] || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const req = searchParams.get("req");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = searchParams.get("offset");

    if (req !== "members") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
      // Fetch data from Airtable
      const airtableData = await fetchMembersFromAirtable(
        100,
        offset ?? undefined
      );

      // Map Airtable records to our Member interface
      const allMembers = airtableData.records.map((record) =>
        mapAirtableRecordToMember(record)
      );

      // Implement pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMembers = allMembers.slice(startIndex, endIndex);

      const totalCount = allMembers.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        members: paginatedMembers,
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

      // Return empty data when Airtable fails
      return NextResponse.json({
        members: [],
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
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
