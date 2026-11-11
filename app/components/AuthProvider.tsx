"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "ADMIN" | "CUSTOMER";
  plan: "FREE" | "PRO" | "ELITE";
  bookingsCount?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  wishlist: string[];
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  wishlist: [],
  setUser: () => {},
  refreshUser: async () => {},
  logout: async () => {},
  toggleWishlist: () => {},
  isWishlisted: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const router = useRouter();

  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("user");
      }
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return;
        }
      }
      // Check localStorage fallback if cookie wasn't set yet
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) {
              setUserState(parsed);
              return;
            }
          } catch {
            localStorage.removeItem("user");
          }
        }
      }
      setUserState(null);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("travelease_wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("travelease_wishlist", JSON.stringify(next));
      }
      return next;
    });
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        wishlist,
        setUser,
        refreshUser,
        logout,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

