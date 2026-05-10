import { useState } from "react";
import {
  useListScheduledItems,
  getListScheduledItemsQueryKey,
  useCreateScheduledItem,
  useUpdateScheduledItem,
  useDeleteScheduledItem,
  useGetDueScheduledItems,
  getGetDueScheduledItemsQueryKey,
  useAddGroceryItem,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Plus, Pause, Play, Trash2, ShoppingCart, Bell, CalendarClock, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTier } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";

const CATEGORIES = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Bread", "Pantry", "Frozen", "Beverages", "Other"];
const SCHEDULE_TYPES = [
  { value: "weekly", label: "Weekly", description: "Every 7 days" },
  { value: "biweekly", label: "Biweekly", description: "Every 14 days" },
  { value: "every_other_day", label: "Every other day", description: "Every 2 days" },
  { value: "custom", label: "Custom", description: "You choose the interval", proOnly: true },
];

const SCHEDULE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  every_other_day: "Every other day",
  custom: "Custom",
};

const PROTEIN_CATEGORY = "Meat & Seafood";

function isProFeature(category: string, scheduleType: string): boolean {
  return category === PROTEIN_CATEGORY || scheduleType === "custom";
}

type ScheduledItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
  scheduleType: string;
  scheduleDaysInterval: number | null;
  nextDueDate: string;
  isActive: boolean;
};

export function ScheduledItems() {
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "", quantity: "1", unit: "", category: "Dairy & Eggs",
    scheduleType: "weekly", scheduleDaysInterval: 7,
  });
  const { toast } = useToast();
  const { isPro } = useTier();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const qKey = getListScheduledItemsQueryKey();
  const dueQKey = getGetDueScheduledItemsQueryKey();

  const { data: items, isLoading } = useListScheduledItems({ query: { queryKey: qKey } });
  const { data: dueItems } = useGetDueScheduledItems({ query: { queryKey: dueQKey } });

  const createMutation = useCreateScheduledItem();
  const updateMutation = useUpdateScheduledItem();
  const deleteMutation = useDeleteScheduledItem();
  const addGroceryMutation = useAddGroceryItem();

  const activeItems = items?.filter((i) => i.isActive) ?? [];
  const pausedItems = items?.filter((i) => !i.isActive) ?? [];

  function handleTogglePause(item: ScheduledItem) {
    updateMutation.mutate(
      { id: item.id, data: { isActive: !item.isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          toast({ title: item.isActive ? `${item.name} paused` : `${item.name} resumed` });
        },
      }
    );
  }

  function handleDelete(id: number, name: string) {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          queryClient.invalidateQueries({ queryKey: dueQKey });
          toast({ title: `${name} removed from schedule.` });
        },
      }
    );
  }

  function handleAddDueToGrocery(item: ScheduledItem) {
    addGroceryMutation.mutate(
      {
        data: {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit ?? undefined,
          category: item.category,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          // Advance the next due date
          const intervalDays = item.scheduleType === "weekly" ? 7
            : item.scheduleType === "biweekly" ? 14
            : item.scheduleType === "every_other_day" ? 2
            : (item.scheduleDaysInterval ?? 7);
          const next = new Date(item.nextDueDate);
          next.setDate(next.getDate() + intervalDays);
          updateMutation.mutate(
            { id: item.id, data: { nextDueDate: next.toISOString().split("T")[0] } },
            { onSuccess: () => queryClient.invalidateQueries({ queryKey: dueQKey }) }
          );
          toast({ title: `${item.name} added to grocery list!` });
        },
      }
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    // Free users cannot create protein-based or custom interval reminders
    if (!isPro && isProFeature(newItem.category, newItem.scheduleType)) {
      setAddOpen(false);
      setUpgradeModalOpen(true);
      return;
    }

    createMutation.mutate(
      {
        data: {
          name: newItem.name.trim(),
          quantity: newItem.quantity,
          unit: newItem.unit || undefined,
          category: newItem.category,
          scheduleType: newItem.scheduleType,
          scheduleDaysInterval: newItem.scheduleType === "custom" ? newItem.scheduleDaysInterval : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setAddOpen(false);
          setNewItem({ name: "", quantity: "1", unit: "", category: "Dairy & Eggs", scheduleType: "weekly", scheduleDaysInterval: 7 });
          toast({ title: `${newItem.name.trim()} scheduled!` });
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 403) {
            setUpgradeModalOpen(true);
          } else {
            toast({ title: "Error", description: "Could not schedule item.", variant: "destructive" });
          }
        },
      }
    );
  }

  function formatDueDate(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    return `Due in ${diff}d`;
  }

  function isDue(dateStr: string) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }

  const scheduleTypeRequiresPro = !isPro && (newItem.scheduleType === "custom" || newItem.category === PROTEIN_CATEGORY);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Scheduled Items</h1>
          <p className="text-muted-foreground">Recurring groceries added automatically.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Item
        </Button>
      </div>

      {/* Due now banner */}
      {!isLoading && dueItems && dueItems.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">
              {dueItems.length} item{dueItems.length > 1 ? "s" : ""} due for restocking
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dueItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
                onClick={() => handleAddDueToGrocery(item as ScheduledItem)}
              >
                <ShoppingCart className="w-3 h-3" />
                Add {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No scheduled items yet.</p>
          <p className="text-sm">Schedule recurring groceries and they'll be added automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active</h3>
              {activeItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-base">{item.name}</h3>
                          <Badge variant="secondary" className="text-xs">{SCHEDULE_LABELS[item.scheduleType] ?? item.scheduleType}</Badge>
                          {item.scheduleType === "custom" && item.scheduleDaysInterval && (
                            <span className="text-xs text-muted-foreground">every {item.scheduleDaysInterval}d</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{item.quantity}{item.unit && item.unit !== item.quantity ? ` ${item.unit}` : ""}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className={isDue(item.nextDueDate) ? "text-primary font-medium" : ""}>
                              {formatDueDate(item.nextDueDate)}
                            </span>
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isDue(item.nextDueDate) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleAddDueToGrocery(item as ScheduledItem)}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add Now
                          </Button>
                        )}
                        <button
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                          onClick={() => handleTogglePause(item as ScheduledItem)}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pausedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Paused</h3>
              {pausedItems.map((item) => (
                <Card key={item.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">Paused</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit && item.unit !== item.quantity ? item.unit : ""} • {SCHEDULE_LABELS[item.scheduleType] ?? item.scheduleType}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors rounded-md hover:bg-muted"
                          onClick={() => handleTogglePause(item as ScheduledItem)}
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
                          onClick={() => handleDelete(item.id, item.name)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Schedule a Recurring Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name *</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Whole Milk"
                value={newItem.name}
                onChange={(e) => setNewItem((v) => ({ ...v, name: e.target.value }))}
                autoFocus
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((v) => ({ ...v, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="gallon, dozen…"
                  value={newItem.unit}
                  onChange={(e) => setNewItem((v) => ({ ...v, unit: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={newItem.category}
                onChange={(e) => setNewItem((v) => ({ ...v, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}{!isPro && c === PROTEIN_CATEGORY ? " (Pro)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                {SCHEDULE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`p-2.5 rounded-lg border text-left transition-colors relative ${newItem.scheduleType === s.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    onClick={() => setNewItem((v) => ({ ...v, scheduleType: s.value }))}
                  >
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      {s.label}
                      {!isPro && s.proOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
            {newItem.scheduleType === "custom" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Every how many days?</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={newItem.scheduleDaysInterval}
                  onChange={(e) => setNewItem((v) => ({ ...v, scheduleDaysInterval: parseInt(e.target.value) || 7 }))}
                />
              </div>
            )}

            {scheduleTypeRequiresPro && (
              <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 shrink-0" />
                {newItem.category === PROTEIN_CATEGORY
                  ? "Meat & Seafood reminders"
                  : "Custom interval schedules"}{" "}
                require a Pro subscription.
              </p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newItem.name.trim() || createMutation.isPending}>
                {scheduleTypeRequiresPro
                  ? <><Lock className="w-3.5 h-3.5 mr-1.5" />Upgrade to Schedule</>
                  : createMutation.isPending ? "Scheduling…" : "Schedule Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requiredTier="pro"
        featureName="Protein & Custom Reminders"
      />
    </div>
  );
}
