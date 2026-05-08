import { useState } from "react";
import {
  useGetGroceryList,
  getGetGroceryListQueryKey,
  useUpdateGroceryItem,
  useAddGroceryItem,
  useDeleteGroceryItem,
  useClearGroceryList,
  useGetGroceryListSuggestions,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ShoppingBag, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Grains & Bread", "Frozen", "Beverages", "Other"];
const SCHEDULE_OPTIONS = [
  { value: "none", label: "No schedule" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "every_other_day", label: "Every other day" },
  { value: "custom", label: "Custom interval" },
];

export function GroceryList() {
  const [addOpen, setAddOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getGetGroceryListQueryKey();

  const { data: list, isLoading } = useGetGroceryList({ query: { queryKey: qKey } });
  const { data: suggestions } = useGetGroceryListSuggestions({ query: { queryKey: ["grocery-suggestions"], enabled: suggestionsOpen } });

  const updateMutation = useUpdateGroceryItem();
  const addMutation = useAddGroceryItem();
  const deleteMutation = useDeleteGroceryItem();
  const clearMutation = useClearGroceryList();

  const progress = list ? Math.round((list.checkedItems / (list.totalItems || 1)) * 100) : 0;

  function handleToggle(id: number, checked: boolean) {
    updateMutation.mutate(
      { id, data: { isChecked: !checked } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }) }
    );
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }) }
    );
  }

  function handleClearChecked() {
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: qKey });
        toast({ title: "Cleared!", description: "Checked items removed from your list." });
      },
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    addMutation.mutate(
      {
        data: {
          name: newItem.name.trim(),
          quantity: newItem.quantity,
          unit: newItem.unit || undefined,
          category: newItem.category,
          scheduleType: newItem.scheduleType === "none" ? undefined : newItem.scheduleType,
          scheduleDaysInterval: newItem.scheduleType === "custom" ? newItem.scheduleDaysInterval : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setAddOpen(false);
          setNewItem({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
          toast({ title: "Item added!", description: newItem.scheduleType !== "none" ? "Item added and scheduled." : undefined });
        },
        onError: () => toast({ title: "Error", description: "Could not add item.", variant: "destructive" }),
      }
    );
  }

  function handleAddSuggestion(suggestion: { name: string; category: string }) {
    addMutation.mutate(
      { data: { name: suggestion.name, quantity: "1", category: suggestion.category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          toast({ title: `${suggestion.name} added!` });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Grocery List</h1>
          <p className="text-muted-foreground">Everything you need to pick up.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {list && list.checkedItems > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearChecked} disabled={clearMutation.isPending}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Checked ({list.checkedItems})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setSuggestionsOpen(true)}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Suggestions
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {!isLoading && list && list.totalItems > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{list.checkedItems} of {list.totalItems} items checked</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Card><CardContent className="p-4 space-y-3">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-4 w-full" />)}
              </CardContent></Card>
            </div>
          ))}
        </div>
      ) : list?.totalItems === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Your grocery list is empty.</p>
          <p className="text-sm">Add items manually or add meals from the Discover tab.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list?.categories.map((category) => (
            <div key={category.category} className="space-y-2">
              <h3 className="font-serif text-base font-semibold text-muted-foreground flex items-center gap-2">
                {category.category}
                <span className="text-xs font-normal bg-muted px-1.5 py-0.5 rounded-full">
                  {category.items.filter((i) => !i.isChecked).length} left
                </span>
              </h3>
              <Card>
                <CardContent className="p-0">
                  {category.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 group ${idx !== category.items.length - 1 ? "border-b" : ""} ${item.isChecked ? "bg-muted/30" : ""}`}
                    >
                      <Checkbox
                        checked={item.isChecked}
                        onCheckedChange={() => handleToggle(item.id, item.isChecked)}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</span>
                          {item.mealName && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">{item.mealName}</span>
                          )}
                          {item.isCustom && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-full">custom</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Item to Grocery List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name *</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Greek Yogurt"
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
                  placeholder="lbs, oz, bunch…"
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
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Auto-add schedule</label>
              <select
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={newItem.scheduleType}
                onChange={(e) => setNewItem((v) => ({ ...v, scheduleType: e.target.value }))}
              >
                {SCHEDULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
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
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newItem.name.trim() || addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Grocery Suggestions
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Based on your pantry and common staples:</p>
          <div className="space-y-2">
            {suggestions?.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => handleAddSuggestion(s)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {suggestions?.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">No suggestions right now. Your pantry looks well-stocked!</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
