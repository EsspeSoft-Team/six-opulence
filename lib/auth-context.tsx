"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  customerLogin,
  customerRegister,
  customerLogout,
  getCustomer,
} from "./shopify";

type AuthContextType = {
  customer: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "shopify_customer_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadCustomer() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const customerData = await getCustomer(token);
      if (customerData) {
        setCustomer(customerData);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, []);

  async function login(email: string, password: string) {
    const result = await customerLogin(email, password);

    if (result.customerUserErrors?.length > 0) {
      return { success: false, error: result.customerUserErrors[0].message };
    }

    const token = result.customerAccessToken?.accessToken;
    if (!token) {
      return { success: false, error: "Login failed. Try again." };
    }

    localStorage.setItem(TOKEN_KEY, token);
    await loadCustomer();
    return { success: true };
  }

  async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const result = await customerRegister(email, password, firstName, lastName);

    if (result.customerUserErrors?.length > 0) {
      return { success: false, error: result.customerUserErrors[0].message };
    }

    // Registration success howar por sathe sathe login kore dei
    return login(email, password);
  }

  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await customerLogout(token);
    }
    localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
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
