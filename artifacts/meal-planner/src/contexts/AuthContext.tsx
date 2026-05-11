import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  startCheckout: (tier: "pro" | "pro_ai") => void;
  openPortal: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      let msg = "Login failed. Please try again.";
      try {
        const body = await r.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* empty or non-JSON body — keep default */ }
      throw new Error(msg);
    }
    const data = await r.json() as AuthUser;
    setUser(data);
  }

  async function register(email: string, displayName: string, password: string) {
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, displayName, password }),
    });
    if (!r.ok) {
      let msg = "Registration failed. Please try again.";
      try {
        const body = await r.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* empty or non-JSON body — keep default */ }
      throw new Error(msg);
    }
    const data = await r.json() as AuthUser;
    setUser(data);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  async function forgotPassword(email: string) {
    const r = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!r.ok) {
      let msg = "Request failed. Please try again.";
      try {
        const body = await r.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* empty or non-JSON body — keep default */ }
      throw new Error(msg);
    }
  }

  async function resetPassword(token: string, password: string) {
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!r.ok) {
      let msg = "Password reset failed. Please try again.";
      try {
        const body = await r.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* empty or non-JSON body — keep default */ }
      throw new Error(msg);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const r = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!r.ok) {
      let msg = "Password change failed. Please try again.";
      try {
        const body = await r.json() as { error?: string };
        if (body.error) msg = body.error;
      } catch { /* empty or non-JSON body — keep default */ }
      throw new Error(msg);
    }
  }

  function startCheckout(tier: "pro" | "pro_ai") {
    fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tier }),
    })
      .then((r) => r.json())
      .then((data: { url?: string; error?: string }) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error ?? "Could not start checkout. Please try again.");
        }
      })
      .catch(() => {
        alert("Could not start checkout. Please try again.");
      });
  }

  function openPortal() {
    fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: { url?: string; error?: string }) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error ?? "Could not open billing portal. Please try again.");
        }
      })
      .catch(() => {
        alert("Could not open billing portal. Please try again.");
      });
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
  const { user } = useAuth();
  const tier = user?.tier ?? "free";
  return {
    tier,
    isPro: tier === "pro" || tier === "pro_ai",
    isProAi: tier === "pro_ai",
    isFree: tier === "free",
  };
}
