import { UserData } from "./user.service";

export interface ProfileResponse {
  success: boolean;
  user: {
    email: string;
    userData: UserData;
  };
  error?: string;
}

export class ClientUserService {
  /**
   * Fetch current user profile from API
   */
  static async getProfile(): Promise<ProfileResponse | null> {
    try {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication failed, redirect to sign-in
          window.location.href = "/sign-in";
          return null;
        }

        const errorData = await response.json();
        console.error("Failed to fetch profile:", errorData);
        return null;
      }

      const profileData: ProfileResponse = await response.json();
      return profileData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  /**
   * Refresh user token data
   */
  static async refreshTokens(): Promise<number | null> {
    try {
      const profile = await this.getProfile();
      return profile?.user.userData.tokens ?? null;
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      return null;
    }
  }
}
