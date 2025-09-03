import { api } from './api';

// Booking service interface
export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  userId: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  totalPrice: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  notes?: string;
}

export interface UpdateBookingData {
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
}

// Booking service functions
export const bookingService = {
  // Get user bookings
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/user');
    return response.data;
  },

  // Get vendor bookings
  getVendorBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings/vendor');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  // Update booking
  updateBooking: async (id: string, data: UpdateBookingData): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Confirm booking (vendor only)
  confirmBooking: async (id: string) => {
    const response = await api.post(`/bookings/${id}/confirm`);
    return response.data;
  },

  // Complete booking (vendor only)
  completeBooking: async (id: string) => {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  },
};
