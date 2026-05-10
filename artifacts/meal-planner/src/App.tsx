import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { AiChatProvider } from "@/contexts/AiChatContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useProteinReminder } from "@/hooks/useProteinReminder";
import { LoginPage } from "@/pages/LoginPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { LandingPage } from "@/pages/LandingPage";

import { Discover } from "@/pages/Discover";
import { WeeklyPlan } from "@/pages/WeeklyPlan";
import { GroceryList } from "@/pages/GroceryList";
import { Pantry } from "@/pages/Pantry";
import { ScheduledItems } from "@/pages/ScheduledItems";
import { HistoryPage } from "@/pages/History";
import { Favorites } from "@/pages/Favorites";
import { Settings } from "@/pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProteinReminderManager() {
  useProteinReminder();
  return null;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Discover} />
        <Route path="/weekly-plan" component={WeeklyPlan} />
        <Route path="/grocery-list" component={GroceryList} />
        <Route path="/pantry" component={Pantry} />
        <Route path="/schedule" component={ScheduledItems} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function getResetToken(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

function isResetPasswordPath(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/reset-password" || path.endsWith("/reset-password");
}

const PENDING_CHECKOUT_TIER_KEY = "pendingCheckoutTier";

function AuthenticatedApp() {
  const { user, loading, startCheckout } = useAuth();

  // After signup from a pricing CTA, automatically redirect to Stripe Checkout
  useEffect(() => {
    if (!user) return;
    const tier = localStorage.getItem(PENDING_CHECKOUT_TIER_KEY) as "pro" | "pro_ai" | null;
    if (tier === "pro" || tier === "pro_ai") {
      localStorage.removeItem(PENDING_CHECKOUT_TIER_KEY);
      startCheckout(tier);
    }
  }, [user, startCheckout]);

  // Allow reset-password page without authentication
  if (isResetPasswordPath()) {
    const token = getResetToken() ?? "";
    return <ResetPasswordPage token={token} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <AiChatProvider>
      <ProteinReminderManager />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </AiChatProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
