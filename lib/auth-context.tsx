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

  email?: string | null;

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

  /* ============================================================
     LOAD CURRENT CUSTOMER
  ============================================================ */

  async function loadCustomer() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setCustomer(null);
        return;
      }

      const data = await response.json();

      if (data?.authenticated && data?.customer) {
        setCustomer(data.customer);
        return;
      }

      if (data?.customer) {
        setCustomer(data.customer);
        return;
      }

      if (data?.user) {
        setCustomer(data.user);
        return;
      }

      setCustomer(null);
    } catch (error) {
      console.error("Load customer error:", error);

      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     INITIAL AUTH CHECK
  ============================================================ */

  useEffect(() => {
    loadCustomer();
  }, []);

  /* ============================================================
     LOGIN
  ============================================================ */

  async function login(email?: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email?.trim() || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        return {
          success: false,
          error: data?.error || "Unable to start login.",
        };
      }

      /*
       * Shopify Customer Account OAuth login.
       *
       * Do not save the OAuth access token in localStorage.
       * The server-side auth flow should keep the session secure.
       */

      window.location.assign(data.url);

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

  /* ============================================================
     LOGOUT
  ============================================================ */

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      setCustomer(null);

      /*
       * Shopify Customer Account logout URL.
       */

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      window.location.assign("/login");
    } catch (error) {
      console.error("Logout error:", error);

      setCustomer(null);

      window.location.assign("/login");
    }
  }

  /* ============================================================
     CONTEXT
  ============================================================ */

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
