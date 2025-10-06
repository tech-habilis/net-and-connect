import { Member, Event } from "@/types/dashboard.types";

export interface MembersPaginationResponse {
  members: Member[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  airtableOffset?: string;
  fallback?: boolean;
}

export interface IDashboardService {
  getMembers(page?: number, limit?: number): Promise<MembersPaginationResponse>;
  getUpcomingEvents(): Promise<Event[]>;
}

export class DashboardService implements IDashboardService {
  async getMembers(
    page: number = 1,
    limit: number = 10
  ): Promise<MembersPaginationResponse> {
    try {
      const url = new URL("/api/members", window.location.origin);
      url.searchParams.append("req", "members");
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MembersPaginationResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const url = new URL("/api/events", window.location.origin);
      url.searchParams.append("req", "events");

      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }
}
