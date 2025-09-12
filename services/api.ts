import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV, getApiUrl } from "@/config/env";

// Create axios instance for v1 API routes
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api/${ENV.API_VERSION}`,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Create axios instance for token-based auth routes (no version)
const tokenAuthInstance: AxiosInstance = axios.create({
  baseURL: `${ENV.API_BASE_URL}/api`,
  timeout: ENV.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
};

// Add auth interceptor to both instances
addAuthInterceptor(axiosInstance);
addAuthInterceptor(tokenAuthInstance);

// Response interceptor to handle 401 errors
const addResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      // If 401, token is expired, clear it and redirect to login
      if (error.response?.status === 401) {
        try {
          // Clear all authentication data
          await AsyncStorage.multiRemove([
            "accessToken",
            "userRole",
            "userEmail",
            "userId",
            "tokenTimestamp",
            "hasCompletedOnboarding",
          ]);

          // Navigate to login screen
          const { router } = await import("expo-router");
          router.replace("/(auth)/role-selection");
        } catch (clearError) {
          console.error("Error clearing authentication data:", clearError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Add response interceptor to both instances
addResponseInterceptor(axiosInstance);
addResponseInterceptor(tokenAuthInstance);

// API helper functions
export const api = {
  // GET request
  get: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.get(url, config);
  },

  // POST request
  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.post(url, data, config);
  },

  // PUT request
  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.put(url, data, config);
  },

  // DELETE request
  delete: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete(url, config);
  },

  // PATCH request
  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch(url, data, config);
  },
};

// Token auth API helper (for /api/login and /api/register)
export const tokenAuthApi = {
  // POST request
  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return tokenAuthInstance.post(url, data, config);
  },
};

export default axiosInstance;
