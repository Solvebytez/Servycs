import { api, tokenAuthApi } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth service interface
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "user" | "vendor" | "salesman";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Auth service functions
export const authService = {
  // Login user (password-based)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Register user (token-based)
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await tokenAuthApi.post<AuthResponse>("/register", data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userData",
      ]);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Send OTP for email verification
  sendOTP: async (email: string) => {
    const response = await api.post("/auth/send-otp", { email });
    return response.data;
  },

  // Verify OTP code
  verifyOTP: async (email: string, otpCode: string) => {
    const response = await api.post("/auth/verify-otp", { email, otpCode });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email: string) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },
};
