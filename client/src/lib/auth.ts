import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  phone: string;
  login: (user: User) => void;
  logout: () => void;
  setPhone: (phone: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      phone: "",
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, phone: "" }),
      setPhone: (phone) => set({ phone }),
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: "farm-connect-auth",
    }
  )
);
