import { api } from './api';

// User service interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
}

// User service functions
export const userService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    const response = await api.delete('/users/account', {
      data: { password },
    });
    return response.data;
  },
};
