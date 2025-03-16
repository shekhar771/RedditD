"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  name?: string | null;
  image?: string | null;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.user
          ? {
              ...data.user,
              name: data.user.name || data.user.username,
            }
          : null;

        setUser(newUser);
        setSession(newUser ? { user: newUser } : null);
        return newUser;
      } else {
        setUser(null);
        setSession(null);
        return null;
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      setUser(null);
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      const newUser = {
        ...data.user,
        name: data.user.name || data.user.username,
      };

      setUser(newUser);
      setSession({ user: newUser });
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const newUser = {
        ...data.user,
        name: data.user.name || data.user.username,
      };

      setUser(newUser);
      setSession({ user: newUser });
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setSession(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      window.location.href = "/api/auth/github";
    } catch (error) {
      console.error("GitHub login failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signup,
        login,
        logout,
        refreshSession,
        loginWithGithub,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Convenience hook to match NextAuth pattern
export const useSession = () => {
  const { session, isLoading } = useAuth();
  return {
    data: session,
    status: isLoading
      ? "loading"
      : session
      ? "authenticated"
      : "unauthenticated",
  };
};
