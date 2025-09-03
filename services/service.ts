import { api } from './api';

// Service service interface
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  images: string[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images?: string[];
}

// Service service functions
export const serviceService = {
  // Get all services
  getServices: async (filters?: any): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services', { params: filters });
    return response.data;
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  // Create new service
  createService: async (data: CreateServiceData): Promise<Service> => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  // Update service
  updateService: async (id: string, data: Partial<CreateServiceData>): Promise<Service> => {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  // Delete service
  deleteService: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (category: string): Promise<Service[]> => {
    const response = await api.get<Service[]>(`/services/category/${category}`);
    return response.data;
  },

  // Search services
  searchServices: async (query: string): Promise<Service[]> => {
    const response = await api.get<Service[]>(`/services/search?q=${query}`);
    return response.data;
  },
};
