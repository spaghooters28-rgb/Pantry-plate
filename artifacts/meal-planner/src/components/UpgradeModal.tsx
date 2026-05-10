import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type RequiredTier = "pro" | "pro_ai";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  requiredTier: RequiredTier;
  featureName?: string;
}

// Features that are actually gated at Pro tier on the backend
const PRO_FEATURES = [
  "Custom recipe creation",
  "Grocery scheduling & reminders",
  "Everything in Free",
];

// Features that are actually gated at Pro+AI tier on the backend
const PRO_AI_FEATURES = [
  "AI meal planning assistant (chat)",
  "AI-generated meal ideas",
  "Recipe Analyzer (import from URL)",
  "Everything in Pro",
];

export function UpgradeModal({ open, onClose, requiredTier, featureName }: UpgradeModalProps) {
  const { startCheckout } = useAuth();

  function handleUpgrade(tier: RequiredTier) {
    startCheckout(tier);
    onClose();
  }

  const showBoth = requiredTier === "pro";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <DialogTitle>Upgrade to unlock this feature</DialogTitle>
          </div>
          <DialogDescription>
            {featureName
              ? `${featureName} is available on paid plans.`
              : "This feature is available on paid plans."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {showBoth && (
            <div className="rounded-xl border-2 border-primary/30 p-4 space-y-3 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Pro
                  </p>
                  <p className="text-sm text-muted-foreground">Premium scheduling & recipes</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">$2</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => handleUpgrade("pro")}>
                Upgrade to Pro — $2/mo
              </Button>
            </div>
          )}

          <div className={`rounded-xl border-2 p-4 space-y-3 ${requiredTier === "pro_ai" ? "border-primary/30 bg-primary/5" : "border-muted"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Pro+AI
                  <Badge variant="secondary" className="text-xs">Best value</Badge>
                </p>
                <p className="text-sm text-muted-foreground">All Pro features + AI assistant</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">$4.99</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {PRO_AI_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={requiredTier === "pro_ai" ? "default" : "outline"}
              onClick={() => handleUpgrade("pro_ai")}
            >
              Upgrade to Pro+AI — $4.99/mo
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-1">
          Cancel anytime. Billed via Stripe. No card info stored in this app.
        </p>
      </DialogContent>
    </Dialog>
  );
}
