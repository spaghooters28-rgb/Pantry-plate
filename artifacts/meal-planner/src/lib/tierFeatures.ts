// Single source of truth for per-tier feature lists.
// Used by LandingPage pricing table and UpgradeModal — keep in sync with
// the actual backend tier gates in artifacts/api-server/src/middleware/requireTier.ts

/** Features gated at the Pro tier on the backend */
export const PRO_GATED_FEATURES = [
  "Custom recipe creation",
  "Grocery scheduling & reminders",
  "Recurring auto-add groceries",
] as const;

/** Features gated at the Pro+AI tier on the backend */
export const PRO_AI_GATED_FEATURES = [
  "AI meal planning assistant (chat)",
  "AI-generated meal ideas",
  "Recipe Analyzer (import from URL)",
] as const;

// ── UpgradeModal lists (mirrors existing copy) ───────────────────────────────

export const UPGRADE_PRO_FEATURES: string[] = [
  ...PRO_GATED_FEATURES,
  "Full access to all 726+ recipes",
  "Everything in Free",
];

export const UPGRADE_PRO_AI_FEATURES: string[] = [
  ...PRO_AI_GATED_FEATURES,
  "Everything in Pro",
];

// ── Landing page pricing table lists ────────────────────────────────────────

export const LANDING_FREE_FEATURES: string[] = [
  "Access to 100 curated recipes",
  "Weekly meal plan generation",
  "Grocery list with categories",
  "Pantry tracking",
  "Favorites & meal history",
];

export const LANDING_PRO_FEATURES: string[] = [
  "Full access to all 726+ recipes",
  "Everything in Free",
  "Custom recipe creation",
  "Grocery scheduling & reminders",
  "Recurring auto-add groceries",
  "Protein thaw reminders",
];

export const LANDING_PRO_AI_FEATURES: string[] = [
  "Everything in Pro",
  "AI meal planning assistant",
  "AI-generated meal ideas",
  "Recipe Analyzer (import from URL)",
];
