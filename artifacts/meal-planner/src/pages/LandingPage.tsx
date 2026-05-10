import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  PackageSearch,
  Sparkles,
  Zap,
  Check,
  Clock,
  Star,
  BookOpen,
  LogIn,
  UserPlus,
} from "lucide-react";
import { LoginPage } from "@/pages/LoginPage";
import {
  LANDING_FREE_FEATURES,
  LANDING_PRO_FEATURES,
  LANDING_PRO_AI_FEATURES,
} from "@/lib/tierFeatures";

// Key used in localStorage to pass the desired tier through the auth flow
const PENDING_CHECKOUT_TIER_KEY = "pendingCheckoutTier";

type LandingMode = "landing" | "login" | "register";

const FEATURES = [
  {
    icon: ChefHat,
    title: "Discover Meals",
    desc: "Browse 15+ recipes filterable by cuisine, protein, and dietary needs. See exactly what's in your pantry vs. what to buy.",
  },
  {
    icon: Calendar,
    title: "Weekly Meal Plans",
    desc: "Auto-generate a full 7-day plan in one tap. Swap individual days and add the whole week's groceries at once.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Grocery List",
    desc: "Items grouped by category with a progress bar. Add custom items, check things off, and clear completed in bulk.",
  },
  {
    icon: PackageSearch,
    title: "Pantry Tracking",
    desc: "Track 17+ pantry staples with in-stock / depleted toggle. Get smart suggestions when something runs low.",
  },
  {
    icon: Clock,
    title: "Grocery Scheduling",
    desc: "Set up recurring auto-add reminders — weekly, biweekly, or custom. Never forget milk again. (Pro)",
  },
  {
    icon: Sparkles,
    title: "AI Meal Assistant",
    desc: "Chat with an AI that knows your pantry, plans your week, and generates personalized recipe ideas. (Pro+AI)",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    badge: null,
    description: "Everything you need to get started.",
    cta: "Get Started Free",
    tier: null as null,
    features: LANDING_FREE_FEATURES,
  },
  {
    name: "Pro",
    price: "$2",
    period: "/ month",
    badge: "Popular",
    description: "Unlock premium planning tools.",
    cta: "Upgrade to Pro",
    tier: "pro" as const,
    features: LANDING_PRO_FEATURES,
  },
  {
    name: "Pro+AI",
    price: "$4.99",
    period: "/ month",
    badge: "Most Powerful",
    description: "Full AI-powered meal planning.",
    cta: "Upgrade to Pro+AI",
    tier: "pro_ai" as const,
    features: LANDING_PRO_AI_FEATURES,
  },
];

export function LandingPage() {
  const [mode, setMode] = useState<LandingMode>("landing");

  /**
   * Navigate to the register form, optionally tagging a desired tier so
   * AuthenticatedApp can start Stripe Checkout immediately after signup.
   */
  function goRegister(tier?: "pro" | "pro_ai") {
    if (tier) {
      localStorage.setItem(PENDING_CHECKOUT_TIER_KEY, tier);
    } else {
      localStorage.removeItem(PENDING_CHECKOUT_TIER_KEY);
    }
    setMode("register");
  }

  function goLogin() {
    setMode("login");
  }

  if (mode === "login" || mode === "register") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => setMode("landing")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ChefHat className="w-6 h-6 text-primary" />
              <span className="text-lg font-serif font-bold text-primary">Pantry & Plate</span>
            </button>
          </div>
        </header>
        <LoginPage initialMode={mode === "register" ? "register" : "login"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="text-lg font-serif font-bold text-primary">Pantry & Plate</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goLogin} className="gap-1.5">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Log in</span>
            </Button>
            <Button size="sm" onClick={() => goRegister()} className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              Sign up free
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(35 90% 70% / 0.4) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <ChefHat className="w-4 h-4" />
            Meal planning made simple
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-5 leading-tight">
            Your household's<br />
            <span className="text-primary">all-in-one</span> meal planner
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover recipes, build your weekly plan, keep your grocery list, and track your pantry — all in one place, shared across your whole household.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => goRegister()} className="gap-2 px-8 text-base h-12 w-full sm:w-auto">
              <UserPlus className="w-5 h-5" />
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" onClick={goLogin} className="gap-2 px-8 text-base h-12 w-full sm:w-auto">
              <LogIn className="w-5 h-5" />
              Sign in
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Free forever — no credit card required.</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">Everything your kitchen needs</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From recipe discovery to AI-powered planning — Pantry & Plate has you covered.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            {[
              { stat: "15+", label: "Curated meals" },
              { stat: "5", label: "Meal categories" },
              { stat: "1-click", label: "Weekly plan generation" },
              { stat: "100%", label: "Shared across your household" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="text-2xl font-serif font-bold text-primary">{stat}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">Simple, honest pricing</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free — upgrade when you're ready for more.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const isHighlighted = plan.tier === "pro_ai";
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                  isHighlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className={isHighlighted ? "bg-primary text-primary-foreground shadow-sm" : ""}
                      variant={isHighlighted ? "default" : "secondary"}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {plan.tier === "pro_ai" ? (
                      <Zap className="w-4 h-4 text-amber-500" />
                    ) : plan.tier === "pro" ? (
                      <Sparkles className="w-4 h-4 text-primary" />
                    ) : (
                      <Star className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-base">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2 mb-1">
                    <span className="text-3xl font-serif font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isHighlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    if (plan.tier) {
                      // Store desired tier so AuthenticatedApp can start
                      // Stripe Checkout automatically after registration.
                      goRegister(plan.tier);
                    } else {
                      goRegister();
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          All paid plans billed monthly via Stripe. Cancel anytime.
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                step: "1",
                icon: BookOpen,
                title: "Discover your meals",
                desc: "Browse curated recipes filtered by cuisine, protein type, and dietary needs. Check what's already in your pantry.",
              },
              {
                step: "2",
                icon: Calendar,
                title: "Build your week",
                desc: "Auto-generate a 7-day meal plan or pick meals manually. Swap any day with a single tap.",
              },
              {
                step: "3",
                icon: ShoppingCart,
                title: "Shop with ease",
                desc: "Add your week's ingredients to a smart, categorized grocery list. Check items off as you shop.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-serif font-bold shadow-sm">
                  {step}
                </div>
                <Icon className="w-6 h-6 text-muted-foreground" />
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
          Ready to simplify dinner?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
          Join households already using Pantry & Plate. Free to get started, no credit card needed.
        </p>
        <Button size="lg" onClick={() => goRegister()} className="gap-2 px-10 text-base h-12">
          <UserPlus className="w-5 h-5" />
          Create your free account
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-foreground">Pantry & Plate</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={goLogin} className="hover:text-foreground transition-colors">
              Log in
            </button>
            <button onClick={() => goRegister()} className="hover:text-foreground transition-colors font-medium text-foreground">
              Sign up free
            </button>
          </div>
          <p>© {new Date().getFullYear()} Pantry & Plate</p>
        </div>
      </footer>
    </div>
  );
}
