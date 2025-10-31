import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Airtable configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "users"; // Table for user data
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

export interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  token: number; // Transaction tokens
}

interface AirtableUserRecord {
  id: string;
  fields: {
    email?: string;
    first_name?: string;
    last_name?: string;
    token?: number;
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

      // Filter by email
      url.searchParams.append("filterByFormula", `{email} = "${email}"`);
      url.searchParams.append("maxRecords", "1");

      const data: AirtableResponse = await this.makeAirtableRequest(
        url.toString()
      );

      if (data.records.length === 0) {
        return null;
      }

      const record = data.records[0];
      return {
        id: record.id,
        email: record.fields.email || "",
        first_name: record.fields.first_name || "",
        last_name: record.fields.last_name || "",
        token: record.fields.token || 0,
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

      const requestBody = {
        fields: {
          email: email,
          first_name: firstName || "",
          last_name: lastName || "",
          token: 10, // Default token amount for new users
        },
      };

      const data = await this.makeAirtableRequest(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      return {
        id: data.id,
        email: data.fields.email || email,
        first_name: data.fields.first_name || "",
        last_name: data.fields.last_name || "",
        token: data.fields.token || 10,
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
            token: newTokenAmount,
          },
        }),
      });

      return {
        id: data.id,
        email: data.fields.email || "",
        first_name: data.fields.first_name || "",
        last_name: data.fields.last_name || "",
        token: data.fields.token || 0,
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
