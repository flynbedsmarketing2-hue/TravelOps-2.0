import { create } from 'zustand';
import { User } from '../types';

const DEFAULT_USERS: User[] = [
    { id: '1', username: 'admin', password: 'password', fullName: 'Amine K. (Admin)', role: 'administrator', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200' },
    { id: '2', username: 'sarah', password: 'password', fullName: 'Sarah M. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
    { id: '3', username: 'omar', password: 'password', fullName: 'Omar D. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200' },
    { id: '4', username: 'yasmine', password: 'password', fullName: 'Yasmine B. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200' },
    { id: '5', username: 'sofia', password: 'password', fullName: 'Sofia L. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
    { id: '6', username: 'mehdi', password: 'password', fullName: 'Mehdi R. (Commercial)', role: 'sales_agent', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
    { id: '7', username: 'karim', password: 'password', fullName: 'Karim T. (Designer)', role: 'travel_designer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
    { id: '8', username: 'viewer', password: 'password', fullName: 'Consultant (Viewer)', role: 'viewer', avatarUrl: '' }
];

interface UserStore {
  currentUser: User | null;
  users: User[];
  
  // Actions
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  users: DEFAULT_USERS,

  login: async (u, p) => {
    // Mock Login
    const foundUser = get().users.find(user => user.username === u && user.password === p);
    if (foundUser) {
      set({ currentUser: foundUser });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  addUser: (newUser) => set((state) => ({
    users: [...state.users, { ...newUser, id: Date.now().toString() }]
  })),

  updateUser: (updatedUser) => set((state) => ({
    users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
  })),

  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  }))
}));
