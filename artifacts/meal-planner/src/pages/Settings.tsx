import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGroceryListQueryKey, getListPantryItemsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2, Settings as SettingsIcon, Bell, BellOff, FlaskConical, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  loadReminderSettings,
  saveReminderSettings,
  sendTestNotification,
  type ReminderSettings,
} from "@/hooks/useProteinReminder";
import { useAuth } from "@/contexts/AuthContext";

export function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const [confirmGrocery, setConfirmGrocery] = useState(false);
  const [confirmPantry, setConfirmPantry] = useState(false);
  const [clearingGrocery, setClearingGrocery] = useState(false);
  const [clearingPantry, setClearingPantry] = useState(false);

  // Reminder settings
  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, time: "18:00" });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setReminder(loadReminderSettings());
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  function updateReminder(patch: Partial<ReminderSettings>) {
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
      toast({ title: "Test notification sent!", description: "Check your notifications — if you don't see it, open the app in a real browser tab." });
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

  const permissionDenied = notifPermission === "denied";
  const permissionGranted = notifPermission === "granted";

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your app data and preferences.</p>
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

            {/* Reminder time */}
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

            {/* Permission & test */}
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

      {/* ── Account ── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>
        <Card>
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold mb-0.5">Signed in as <span className="text-primary">@{user?.username}</span></p>
              <p className="text-sm text-muted-foreground">
                All your household's grocery list, pantry, and meal plans are tied to this account. Anyone with these credentials can sign in from any device.
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

      {/* Clear Grocery Confirmation */}
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

      {/* Clear Pantry Confirmation */}
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
  const [hh, mm] = time.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 || 12;
  return `${h}:${mm.toString().padStart(2, "0")} ${period}`;
}
