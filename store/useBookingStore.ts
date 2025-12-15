import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Booking } from '../types';

interface BookingStore {
  bookings: Booking[];
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Booking) => void;
  // TODO: updateBooking, deleteBooking
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      bookings: [],
      
      fetchBookings: async () => {
        // With persist, data is loaded automatically
      },

      addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
      })),
    }),
    {
      name: 'travelops-bookings', // unique name for local storage
    }
  )
);