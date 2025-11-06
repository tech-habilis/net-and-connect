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
    "Téléphone"?: string;
    Entreprise?: string[]; // This is a linked record array
    Fonction?: string;
    "Tokens restants"?: number;
    LinkedIn?: string;
    Image?: string;
  };
}

interface EntrepriseRecord {
  id: string;
  fields: {
    "Company Name"?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
  linkedRecords?: {
    Entreprise?: {
      [key: string]: EntrepriseRecord;
    };
  };
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

async function fetchCompanyName(companyId: string): Promise<string> {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    return "";
  }

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

async function mapAirtableRecordToMember(record: AirtableRecord): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  tokens: number;
  linkedin: string | undefined;
  image: string | undefined;
}> {
  // Get company name from linked record
  let companyName = "";
  if (record.fields.Entreprise && record.fields.Entreprise.length > 0) {
    const entrepriseId = record.fields.Entreprise[0];
    companyName = await fetchCompanyName(entrepriseId);
  }

  return {
    id: record.id,
    name: record.fields["Nom complet"] || "",
    email: record.fields["Email"] || "",
    phone: record.fields["Téléphone"] || "",
    company: companyName,
    role: record.fields["Fonction"] || "",
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

      // Map Airtable records to our Member interface (async)
      const allMembers = await Promise.all(
        airtableData.records.map((record) => mapAirtableRecordToMember(record))
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

      // Fallback to mock data if Airtable fails
      const mockMembers = [
        {
          id: "rec001",
          name: "Dupont Alice",
          email: "dupontalice@example.com",
          phone: "+33 1234 5678",
          company: "Tech Entreprise",
          role: "Developpeur",
          tokens: 7,
          linkedin: "https://www.linkedin.com/in/dupontalice",
          image: undefined,
        },
        {
          id: "rec002",
          name: "Martin Bruno",
          email: "martinbruno@example.com",
          phone: "+33 1234 5678",
          company: "Innovation Corp",
          role: "Chef de projet",
          tokens: 12,
          linkedin: "https://www.linkedin.com/in/martinbruno",
          image: undefined,
        },
        {
          id: "rec003",
          name: "Taibi Jalil",
          email: "taibijalil@example.com",
          phone: "+33 1234 5678",
          company: "Digital Solutions",
          role: "Consultant",
          tokens: 5,
          linkedin: "https://www.linkedin.com/in/taibijalil",
          image: undefined,
        },
      ];

      // Sort mock data A→Z by name
      const sortedMembers = [...mockMembers].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
      );

      // Paginate mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMembers = sortedMembers.slice(startIndex, endIndex);

      const totalCount = sortedMembers.length;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        members: paginatedMembers,
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
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
