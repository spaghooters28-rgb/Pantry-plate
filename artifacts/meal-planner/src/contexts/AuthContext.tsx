import { createContext, useContext, useState, useEffect, ReactNode } from "react";

function isTrustedStripeUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && (hostname === "checkout.stripe.com" || hostname === "billing.stripe.com");
  } catch {
    return false;
  }
}

export type Tier = "free" | "pro" | "pro_ai";

export type AuthUser = { id: number; email: string; displayName: string; tier: Tier };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  startCheckout: (tier: "pro" | "pro_ai") => Promise<void>;
  openPortal: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function extractErrorMessage(r: Response, fallback: string): Promise<string> {
  try {
    const body = await r.json() as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      if (!r.ok) return null;
      return await r.json() as AuthUser;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);

  async function refreshUser() {
    const data = await fetchUser();
    setUser(data);
  }

  async function login(email: string, password: string) {
    let r: Response;
    try {
      r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (!r.ok) {
      throw new Error(await extractErrorMessage(r, "Login failed. Please try again."));
    }
    const data = await r.json() as AuthUser;
    setUser(data);
  }

  async function register(email: string, displayName: string, password: string) {
    let r: Response;
    try {
      r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, displayName, password }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (!r.ok) {
      throw new Error(await extractErrorMessage(r, "Registration failed. Please try again."));
    }
    const data = await r.json() as AuthUser;
    setUser(data);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  async function forgotPassword(email: string) {
    let r: Response;
    try {
      r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (!r.ok) {
      throw new Error(await extractErrorMessage(r, "Request failed. Please try again."));
    }
  }

  async function resetPassword(token: string, password: string) {
    let r: Response;
    try {
      r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (!r.ok) {
      throw new Error(await extractErrorMessage(r, "Password reset failed. Please try again."));
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    let r: Response;
    try {
      r = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (!r.ok) {
      throw new Error(await extractErrorMessage(r, "Password change failed. Please try again."));
    }
  }

  async function startCheckout(tier: "pro" | "pro_ai"): Promise<void> {
    let data: { url?: string; error?: string };
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier }),
      });
      data = await r.json() as { url?: string; error?: string };
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (data.url && isTrustedStripeUrl(data.url)) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error ?? "Could not start checkout. Please try again.");
    }
  }

  async function openPortal(): Promise<void> {
    let data: { url?: string; error?: string };
    try {
      const r = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      data = await r.json() as { url?: string; error?: string };
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    if (data.url && isTrustedStripeUrl(data.url)) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error ?? "Could not open billing portal. Please try again.");
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, changePassword, startCheckout, openPortal, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useTier() {
  return {
    tier: "pro_ai" as Tier,
    isPro: true,
    isProAi: true,
    isFree: false,
  };
}
