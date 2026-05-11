import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGroceryListQueryKey, getListPantryItemsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Settings as SettingsIcon, Bell, BellOff, FlaskConical, LogOut, Eye, EyeOff, KeyRound, CreditCard, Check, Sparkles, Zap, ExternalLink, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  loadReminderSettings,
  saveReminderSettings,
  sendTestNotification,
  type ReminderSettings,
} from "@/hooks/useProteinReminder";
import { useAuth, useTier } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useGetAiUsage, getGetAiUsageQueryKey } from "@workspace/api-client-react";
import { PRO_GATED_FEATURES, PRO_AI_GATED_FEATURES } from "@/lib/tierFeatures";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  pro_ai: "Pro+AI",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  free: "Basic meal planning features",
  pro: "All premium features — $2/month",
  pro_ai: "Everything + AI assistant — $4.99/month",
};

export function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, logout, changePassword, startCheckout, openPortal } = useAuth();
  const { tier, isPro, isProAi, isFree } = useTier();

  const [confirmGrocery, setConfirmGrocery] = useState(false);
  const [confirmPantry, setConfirmPantry] = useState(false);
  const [clearingGrocery, setClearingGrocery] = useState(false);
  const [clearingPantry, setClearingPantry] = useState(false);

  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, time: "18:00" });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<"pro" | "pro_ai">("pro");

  const { data: billingUsage } = useGetAiUsage({ query: { enabled: !isFree, queryKey: getGetAiUsageQueryKey() } });

  // Resync reminder state whenever Pro status changes (e.g. downgrade while page is open)
  useEffect(() => {
    setReminder(loadReminderSettings());
  }, [isPro]);

  useEffect(() => {
    setReminder(loadReminderSettings());
    if ("Notification" in window) setNotifPermission(Notification.permission);

    // Handle Stripe redirect back with subscription status
    const params = new URLSearchParams(window.location.search);
    const subStatus = params.get("subscription");
    if (subStatus === "success") {
      toast({ title: "Subscription activated!", description: "Your plan has been upgraded. It may take a moment to reflect." });
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", url.toString());
    } else if (subStatus === "cancelled") {
      toast({ title: "Checkout cancelled", description: "No charges were made." });
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const VALID_TIME_RE = /^\d{2}:\d{2}$/;

  function updateReminder(patch: Partial<ReminderSettings>) {
    if ("time" in patch && !VALID_TIME_RE.test(patch.time ?? "")) return;
    const next = { ...reminder, ...patch };
    setReminder(next);
    saveReminderSettings(next);
  }

  async function handleRequestPermission() {
    if (!("Notification" in window)) {
      toast({ title: "Not supported", description: "Your browser doesn't support notifications.", variant: "destructive" });
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      toast({ title: "Notifications enabled!", description: "You'll receive protein reminders at your chosen time." });
    } else {
      toast({ title: "Permission denied", description: "Enable notifications in your browser settings.", variant: "destructive" });
    }
  }

  async function handleTestNotification() {
    if (notifPermission !== "granted") {
      toast({ title: "Permission required", description: "Allow notifications first.", variant: "destructive" });
      return;
    }
    const result = await sendTestNotification();
    if (result === "sent") {
      toast({ title: "Test notification sent!", description: "Check your notifications." });
    } else if (result === "not-supported") {
      toast({ title: "Not supported", description: "Your browser doesn't support notifications.", variant: "destructive" });
    } else {
      toast({ title: "Could not send notification", description: "Try opening the app in a standalone browser tab.", variant: "destructive" });
    }
  }

  async function handleClearGrocery() {
    setClearingGrocery(true);
    try {
      const res = await fetch("/api/grocery-list/all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { deleted: number };
      queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
      toast({ title: "Grocery list cleared", description: `Removed ${data.deleted} item${data.deleted !== 1 ? "s" : ""}.` });
    } catch {
      toast({ title: "Error", description: "Could not clear the grocery list.", variant: "destructive" });
    } finally {
      setClearingGrocery(false);
      setConfirmGrocery(false);
    }
  }

  async function handleClearPantry() {
    setClearingPantry(true);
    try {
      const res = await fetch("/api/pantry/all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { deleted: number };
      queryClient.invalidateQueries({ queryKey: getListPantryItemsQueryKey() });
      toast({ title: "Pantry cleared", description: `Removed ${data.deleted} item${data.deleted !== 1 ? "s" : ""}.` });
    } catch {
      toast({ title: "Error", description: "Could not clear the pantry.", variant: "destructive" });
    } finally {
      setClearingPantry(false);
      setConfirmPantry(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setShowChangePassword(false);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Could not update password.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  }

  const permissionDenied = notifPermission === "denied";
  const permissionGranted = notifPermission === "granted";
  const isPlaceholderEmail = user?.email?.endsWith("@placeholder.pantryplate.local");

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account, subscription, and preferences.</p>
      </div>

      {/* ── Pro upgrade banner (free users only) ── */}
      {isFree && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <p className="font-semibold text-base">Unlock Pro features</p>
              </div>
              <Button
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => { setUpgradeTarget("pro"); setUpgradeModalOpen(true); }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {PRO_GATED_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>{f}</span>
                </div>
              ))}
              {PRO_AI_GATED_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Pro from $2/mo · Pro+AI from $4.99/mo · Cancel anytime</p>
          </CardContent>
        </Card>
      )}

      {/* ── Account ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-base">{user?.displayName}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {isPlaceholderEmail ? "No email set" : user?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All your household's grocery list, pantry, and meal plans are tied to this account.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Change Password</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChangePassword((v) => !v);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
              >
                {showChangePassword ? "Cancel" : "Change"}
              </Button>
            </div>
          </CardHeader>
          {showChangePassword && (
            <CardContent className="px-5 pb-5">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPw">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPw"
                      type={showCurrent ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={changingPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPw">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPw"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={changingPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={changingPassword || !currentPassword || !newPassword}
                >
                  {changingPassword ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ── Subscription ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscription</h2>

        {/* Current plan */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {tier === "pro_ai" ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : tier === "pro" ? (
                    <Sparkles className="w-4 h-4 text-primary" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  )}
                  <p className="font-semibold text-base">
                    {TIER_LABELS[tier] ?? "Free"} Plan
                  </p>
                  {!isFree && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</p>
              </div>
              {!isFree && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={openPortal}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Manage
                </Button>
              )}
            </div>

            {isFree && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 w-full"
                    onClick={() => { setUpgradeTarget("pro"); setUpgradeModalOpen(true); }}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    Upgrade to Pro — $2/mo
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 w-full"
                    onClick={() => { setUpgradeTarget("pro_ai"); setUpgradeModalOpen(true); }}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    Upgrade to Pro+AI — $4.99/mo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">Cancel anytime. Billed via Stripe.</p>
              </div>
            )}

            {tier === "pro" && (
              <Button
                size="sm"
                className="gap-1.5 w-full"
                onClick={openPortal}
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro+AI — $4.99/mo
              </Button>
            )}

            {!isFree && billingUsage?.nextBillingDate && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Next billing date: <span className="font-medium">{billingUsage.nextBillingDate}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Features comparison */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-medium">What's included</p>
            <div className="space-y-2 text-sm">
              {[
                { label: "Basic meal planning & discovery", tiers: ["free", "pro", "pro_ai"] },
                { label: "Grocery list & pantry tracking", tiers: ["free", "pro", "pro_ai"] },
                { label: "Weekly meal plan generation", tiers: ["free", "pro", "pro_ai"] },
                { label: "Custom recipe creation", tiers: ["pro", "pro_ai"] },
                { label: "Recipe analyzer (import from URL)", tiers: ["pro_ai"] },
                { label: "Grocery scheduling & reminders", tiers: ["pro", "pro_ai"] },
                { label: "AI meal planning assistant", tiers: ["pro_ai"] },
                { label: "AI-generated meal ideas", tiers: ["pro_ai"] },
              ].map(({ label, tiers }) => {
                const included = tiers.includes(tier);
                return (
                  <div key={label} className={`flex items-center gap-2 ${included ? "" : "opacity-40"}`}>
                    <Check className={`w-3.5 h-3.5 shrink-0 ${included ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{label}</span>
                    {!included && (
                      <Badge variant="outline" className="text-xs ml-auto">
                        {tiers.includes("pro_ai") && !tiers.includes("pro") ? "Pro+AI" : "Pro"}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Protein Reminders ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Protein Thaw Reminders</h2>

        {!isPro ? (
          <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Protein Thaw Reminders</p>
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Get a browser notification the evening before a meal so you remember to set out the protein to thaw. Upgrade to Pro to enable this feature.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={() => { setUpgradeTarget("pro"); setUpgradeModalOpen(true); }}
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold mb-0.5">Enable Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get a browser notification the evening before a meal so you remember to set out the protein to thaw.
                  </p>
                </div>
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={(v) => updateReminder({ enabled: v })}
                  disabled={!permissionGranted}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm mb-0.5">Reminder Time</p>
                  <p className="text-xs text-muted-foreground">When to send the notification each day.</p>
                </div>
                <input
                  type="time"
                  value={reminder.time}
                  onChange={(e) => updateReminder({ time: e.target.value })}
                  className="border rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t">
                {!permissionGranted ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleRequestPermission}
                    disabled={permissionDenied}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {permissionDenied ? "Blocked by browser" : "Allow Notifications"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <Bell className="w-4 h-4" />
                    Notifications allowed
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 ml-auto"
                  onClick={handleTestNotification}
                  disabled={!permissionGranted}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Send Test
                </Button>
              </div>

              {permissionDenied && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <BellOff className="w-3.5 h-3.5 shrink-0" />
                  Notifications are blocked. Go to your browser's site settings to allow them, then refresh.
                </p>
              )}

              {permissionGranted && reminder.enabled && (
                <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
                  You'll receive a reminder at <strong>{formatTime(reminder.time)}</strong> on days when tomorrow's meal has a protein that needs thawing.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Data Management ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Management</h2>

        <Card>
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold mb-0.5">Clear Grocery List</p>
              <p className="text-sm text-muted-foreground">
                Permanently removes all items from your grocery list, including checked-off and custom items.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              onClick={() => setConfirmGrocery(true)}
              disabled={clearingGrocery}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {clearingGrocery ? "Clearing…" : "Clear"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold mb-0.5">Clear Pantry</p>
              <p className="text-sm text-muted-foreground">
                Permanently removes all items from your pantry. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              onClick={() => setConfirmPantry(true)}
              disabled={clearingPantry}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {clearingPantry ? "Clearing…" : "Clear"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmGrocery} onOpenChange={setConfirmGrocery}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your grocery list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove every item from your grocery list — checked, unchecked, and custom items alike. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClearGrocery}
              disabled={clearingGrocery}
            >
              Yes, clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPantry} onOpenChange={setConfirmPantry}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your pantry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all items from your pantry. You'll need to re-add them manually. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleClearPantry}
              disabled={clearingPantry}
            >
              Yes, clear everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requiredTier={upgradeTarget}
      />
    </div>
  );
}

function formatTime(time: string): string {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return "6:00 PM";
  const [hh, mm] = time.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 || 12;
  return `${h}:${mm.toString().padStart(2, "0")} ${period}`;
}
