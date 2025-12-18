import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME =
  process.env.AIRTABLE_TABLE_NAME || "Membres du club"; // Table for user data from env
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
  tokens: number; // Transaction tokens (Tokens restants)
  image?: string; // User profile image
}

interface AirtableUserRecord {
  id: string;
  fields: {
    Email?: string;
    "Nom complet"?: string;
    "Tokens restants"?: number;
    Image?: string;
  };
}

interface AirtableResponse {
  records: AirtableUserRecord[];
  offset?: string;
}

export class UserService {
  private static async makeAirtableRequest(
    url: string,
    options: RequestInit = {}
  ) {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
      console.error("❌ Missing Airtable configuration:", {
        baseId: !!AIRTABLE_BASE_ID,
        apiKey: !!AIRTABLE_API_KEY,
      });
      throw new Error("Airtable configuration missing");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Airtable API error:", errorText);
      throw new Error(
        `Airtable API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const jsonData = await response.json();
    return jsonData;
  }

  /**
   * Find user by email in Airtable
   */
  static async findUserByEmail(email: string): Promise<UserData | null> {
    try {
      const url = new URL(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
          AIRTABLE_TABLE_NAME
        )}`
      );

      // Filter by email (using the Email field from Airtable)
      url.searchParams.append("filterByFormula", `{Email} = "${email}"`);
      url.searchParams.append("maxRecords", "1");

      const data: AirtableResponse = await this.makeAirtableRequest(
        url.toString()
      );

      if (data.records.length === 0) {
        return null;
      }

      const record = data.records[0];

      // Use the Airtable fields you have: "Nom complet", "Tokens restants", and "Image"
      const fullName = record.fields["Nom complet"] || "";
      const tokens = record.fields["Tokens restants"] ?? 0;
      const image = record.fields.Image || "";

      return {
        id: record.id,
        email: record.fields.Email || "",
        full_name: fullName,
        tokens: typeof tokens === "number" ? tokens : Number(tokens) || 0,
        image: image,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  /**
   * Create new user in Airtable with default token amount
   */
  static async createUser(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserData | null> {
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
        AIRTABLE_TABLE_NAME
      )}`;

      const computedFullName =
        `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];

      const requestBody = {
        fields: {
          Email: email,
          "Nom complet": computedFullName,
          "Tokens restants": 10, // Default token amount for new users
        },
      };

      const data = await this.makeAirtableRequest(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      return {
        id: data.id,
        email: data.fields.Email || email,
        full_name: data.fields["Nom complet"] || computedFullName,
        tokens: data.fields["Tokens restants"] || 10,
        image: data.fields.Image || "",
      };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      return null;
    }
  }

  /**
   * Update user token amount
   */
  static async updateUserTokens(
    userId: string,
    newTokenAmount: number
  ): Promise<UserData | null> {
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
        AIRTABLE_TABLE_NAME
      )}/${userId}`;

      const data = await this.makeAirtableRequest(url, {
        method: "PATCH",
        body: JSON.stringify({
          fields: {
            "Tokens restants": newTokenAmount,
          },
        }),
      });

      return {
        id: data.id,
        email: data.fields.Email || "",
        full_name: data.fields["Nom complet"] || "",
        tokens: data.fields["Tokens restants"] || 0,
        image: data.fields.Image || "",
      };
    } catch (error) {
      console.error("Error updating user tokens:", error);
      return null;
    }
  }

  /**
   * Get or create user - main function for auth flow
   */
  static async getOrCreateUser(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserData | null> {
    try {
      // First, try to find existing user
      let user = await this.findUserByEmail(email);

      if (!user) {
        // If user doesn't exist, create new one
        user = await this.createUser(email, firstName, lastName);
      }

      return user;
    } catch (error) {
      console.error("❌ Error in getOrCreateUser:", error);
      return null;
    }
  }
}
