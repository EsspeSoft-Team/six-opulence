"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Customer = {
  id: string;

  displayName?: string;

  firstName?: string | null;

  lastName?: string | null;

  emailAddress?: {
    emailAddress: string;
  } | null;
};

type AuthContextType = {
  customer: Customer | null;

  loading: boolean;

  login: (email?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => Promise<void>;

  refreshCustomer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);

  async function loadCustomer() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setCustomer(null);
        return;
      }

      const data = await response.json();

      if (data.authenticated && data.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error("Load customer error:", error);

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, []);

  async function login(email?: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        return {
          success: false,

          error: data.error || "Unable to start login.",
        };
      }

      window.location.href = data.url;

      return {
        success: true,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,

        error: "Unable to start login.",
      };
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      setCustomer(null);

      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);

      setCustomer(null);

      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        login,
        logout,
        refreshCustomer: loadCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
