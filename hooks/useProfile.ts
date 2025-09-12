import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

// Base profile data interface
export interface BaseProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// User profile data interface (with primary address)
export interface UserProfileData extends BaseProfileData {
  primaryAddress: string;
  primaryCity: string;
  primaryState: string;
  primaryZipCode: string;
  primaryCountry: string;
  bio: string;
}

// Business address interface for vendors
export interface BusinessAddress {
  id: string;
  name: string;
  address: string;
  description: string;
}

// Vendor profile data interface (with business address)
export interface VendorProfileData extends BaseProfileData {
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  businessDescription: string;
  businessAddresses: BusinessAddress[];
}

// Salesman profile data interface (with primary address)
export interface SalesmanProfileData extends BaseProfileData {
  primaryAddress: string;
  primaryCity: string;
  primaryState: string;
  primaryZipCode: string;
  primaryCountry: string;
  employeeId: string;
  bio: string;
}

// Union type for all profile data
export type ProfileData =
  | UserProfileData
  | VendorProfileData
  | SalesmanProfileData;

// Hook for fetching profile data
export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileData> => {
      console.log("=== useProfile: Fetching profile data ===");
      try {
        const response = await api.get("/users/profile");
        console.log("=== useProfile: API Response ===", response.data);

        if (
          response.data &&
          (response.data as any).success &&
          (response.data as any).data
        ) {
          const profileData = (response.data as any).data;
          console.log("=== useProfile: Profile Data ===", profileData);
          return profileData;
        }

        console.error(
          "=== useProfile: Failed to fetch profile data ===",
          response.data
        );
        throw new Error("Failed to fetch profile data");
      } catch (error) {
        console.error("=== useProfile: API Error ===", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - data stays in cache
    retry: 2, // Retry failed requests 2 times
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

// Hook for updating profile data
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      profileData: Partial<ProfileData>
    ): Promise<ProfileData> => {
      const response = await api.put("/users/profile", profileData);

      if (
        response.data &&
        (response.data as any).success &&
        (response.data as any).data
      ) {
        return (response.data as any).data;
      }

      throw new Error("Failed to update profile data");
    },
    onSuccess: (updatedData) => {
      // Update the profile cache with the new data
      queryClient.setQueryData(["profile"], updatedData);

      // Also invalidate and refetch the user data to keep it in sync
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
};

// Helper function to check if profile data is for a specific role
export const isUserProfile = (data: ProfileData): data is UserProfileData => {
  return data.role === "USER" && "primaryAddress" in data;
};

export const isVendorProfile = (
  data: ProfileData
): data is VendorProfileData => {
  return data.role === "VENDOR" && "businessName" in data;
};

export const isSalesmanProfile = (
  data: ProfileData
): data is SalesmanProfileData => {
  return (
    data.role === "SALESMAN" && "employeeId" in data && "primaryAddress" in data
  );
};

export default useProfile;
