import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGroceryListQueryKey, getListPantryItemsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [confirmGrocery, setConfirmGrocery] = useState(false);
  const [confirmPantry, setConfirmPantry] = useState(false);
  const [clearingGrocery, setClearingGrocery] = useState(false);
  const [clearingPantry, setClearingPantry] = useState(false);

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

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your app data and preferences.</p>
      </div>

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
