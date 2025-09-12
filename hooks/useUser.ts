import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  status?: string;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserData> => {
      const response = await api.get("/auth/me", {
        params: { _t: Date.now() }, // Cache busting for initial load
      });

      if (
        response.data &&
        (response.data as any).success &&
        (response.data as any).data
      ) {
        return (response.data as any).data;
      }

      throw new Error("Failed to fetch user data");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache
    retry: 2, // Retry failed requests 2 times
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

export default useUser;
