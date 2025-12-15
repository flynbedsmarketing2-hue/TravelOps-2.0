import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

const DEFAULT_USERS: User[] = [
    { id: '1', username: 'admin', password: 'password', fullName: 'Amine K. (Admin)', role: 'administrator', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200' },
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

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'travelops-users', // unique name for local storage
    }
  )
);