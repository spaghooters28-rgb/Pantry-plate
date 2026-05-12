import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGroceryListQueryKey, getListPantryItemsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Trash2, Settings as SettingsIcon, Bell, BellOff, FlaskConical, LogOut, Eye, EyeOff, KeyRound, Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  loadReminderSettings,
  saveReminderSettings,
  sendTestNotification,
  type ReminderSettings,
} from "@/hooks/useProteinReminder";
import { useAuth } from "@/contexts/AuthContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, logout, changePassword } = useAuth();

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

  const [showIosSheet, setShowIosSheet] = useState(false);
  const { canInstall, isIos, isStandalone, triggerInstall } = useInstallPrompt();

  function handleInstall() {
    if (isIos) {
      setShowIosSheet(true);
    } else {
      triggerInstall();
    }
  }

  useEffect(() => {
    setReminder(loadReminderSettings());
    if ("Notification" in window) setNotifPermission(Notification.permission);
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
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

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

      {/* ── Install App ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Install App</h2>
        <Card>
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {isStandalone ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <Smartphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold mb-0.5">
                  {isStandalone ? "App installed" : "Add to Home Screen"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isStandalone
                    ? "You're already using the installed version of Pantry & Plate."
                    : canInstall
                      ? "Install Pantry & Plate on your device for quick access without opening a browser."
                      : "Open your browser menu and tap \"Install app\" or \"Add to Home Screen\" to install."}
                </p>
              </div>
            </div>
            {!isStandalone && canInstall && (
              <Button
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={handleInstall}
              >
                <Download className="w-4 h-4" />
                {isIos ? "How to Install" : "Install"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Protein Reminders ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Protein Thaw Reminders</h2>

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

      {/* ── iOS Install Sheet ── */}
      <Sheet open={showIosSheet} onOpenChange={setShowIosSheet}>
        <SheetContent side="bottom" className="pb-10">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Install on iPhone / iPad
            </SheetTitle>
          </SheetHeader>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Open this page in <strong>Safari</strong> (not Chrome or another browser).</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Tap the <strong>Share</strong> button at the bottom of the screen (the square with an arrow pointing up).</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.</span>
            </li>
          </ol>
        </SheetContent>
      </Sheet>

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
