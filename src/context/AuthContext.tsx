"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { IUser, LoginInput, RegisterInput } from "@/types/index";
import toast from "react-hot-toast";

// ─── Context shape ────────────────────────────────────────────────────────
interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,      setUser]      = useState<IUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ── Redirect based on user role ─────────────────────────────────────────
  const redirectByRole = (role: string) => {
    if (role === "admin")   router.push("/dashboard/admin");
    if (role === "doctor")  router.push("/dashboard/doctor");
    if (role === "patient") router.push("/dashboard/patient");
  };

  // ── Hydrate: check stored token is still valid ──────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser  = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      // Optimistically set from localStorage first (fast UI)
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoading(false);
        return;
      }

      // Then verify token is still valid with the server
      try {
        const res = await api.get("/auth/me");
        const freshUser = res.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch {
        // Token expired or invalid — clear everything silently
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user",  JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      toast.success(`Welcome back, ${newUser.name}! 👋`);
      redirectByRole(newUser.role);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user",  JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      toast.success(res.data.message || "Registered successfully!");
      redirectByRole(newUser.role);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if API fails, clear local state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      toast.success("Logged out successfully.");
      router.push("/login");
    }
  }, [router]);

  // ── Refresh user from API ────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
