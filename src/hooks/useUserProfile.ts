import { useState, useEffect, useCallback } from "react";
import {
  ClientUserService,
  ProfileResponse,
} from "@/services/client-user.service";
import { UserData } from "@/services/user.service";

interface UseUserProfileReturn {
  user: {
    email: string;
    userData: UserData;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [user, setUser] = useState<{
    email: string;
    userData: UserData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileData = await ClientUserService.getProfile();

      if (profileData) {
        setUser(profileData.user);
      } else {
        setError("Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    if (!user) return;

    try {
      const newTokenCount = await ClientUserService.refreshTokens();
      if (newTokenCount !== null && user) {
        setUser({
          ...user,
          userData: {
            ...user.userData,
            token: newTokenCount,
          },
        });
      }
    } catch (err) {
      console.error("Failed to refresh tokens:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    error,
    refetch: fetchProfile,
    refreshTokens,
  };
}
