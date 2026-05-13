import { useState, useEffect, useRef } from "react";
import { detectCategory } from "@/lib/detectCategory";
import { searchFoodItems, type FoodSuggestion } from "@/lib/foodSuggestions";
import {
  useGetGroceryList,
  getGetGroceryListQueryKey,
  useUpdateGroceryItem,
  useAddGroceryItem,
  useDeleteGroceryItem,
  useClearGroceryList,
  useGetGroceryListSuggestions,
  getListPantryItemsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineQueueState, enqueueOp, dequeueOp } from "@/hooks/useOfflineQueue";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ShoppingBag, Sparkles, X, PackagePlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CachedDataBanner } from "@/components/CachedDataBanner";

const CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Grains & Bread",
  "Bakery",
  "Canned Goods",
  "Condiments & Sauces",
  "Snacks",
  "Desserts",
  "Beverages",
  "Frozen",
  "Pantry",
  "Cleaning",
  "Personal Care",
  "Other",
];

const SCHEDULE_OPTIONS = [
  { value: "none", label: "No schedule" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "every_other_day", label: "Every other day" },
  { value: "custom", label: "Custom interval" },
];
const COMMON_QUANTITIES = ["½", "1", "2", "3", "4", "5", "6", "8", "10", "12"];


function parseQty(q: string): number {
  const n = parseFloat(q);
  return isNaN(n) ? 1 : n;
}

function addQty(a: string, b: string): string {
  const sum = parseQty(a) + parseQty(b);
  return Number.isInteger(sum) ? String(sum) : sum.toFixed(1).replace(/\.0$/, "");
}

type GroceryItemType = {
  id: number;
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
  isChecked: boolean;
  isCustom: boolean;
  mealId: number | null;
  mealName: string | null;
};

export function GroceryList() {
  const [addOpen, setAddOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [addedSuggestionNames, setAddedSuggestionNames] = useState<Set<string>>(new Set());
  const [movingToPantry, setMovingToPantry] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
  const [categoryAutoDetected, setCategoryAutoDetected] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion[]>([]);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState<GroceryItemType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getGetGroceryListQueryKey();
  const { pendingCount, isSyncing } = useOfflineQueueState();

  const { data: list, isLoading } = useGetGroceryList({ query: { queryKey: qKey } });
  const { data: suggestions } = useGetGroceryListSuggestions({ query: { queryKey: ["grocery-suggestions"], enabled: suggestionsOpen } });

  const updateMutation = useUpdateGroceryItem();
  const addMutation = useAddGroceryItem();
  const deleteMutation = useDeleteGroceryItem();
  const clearMutation = useClearGroceryList();

  type QtyOpen = { id: number; top: number; left: number } | null;
  const [qtyOpen, setQtyOpen] = useState<QtyOpen>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!qtyOpen) return;
    function handle(e: PointerEvent) {
      if (!(e.target as Element).closest("[data-qty-picker]")) setQtyOpen(null);
    }
    document.addEventListener("pointerdown", handle, { capture: true });
    return () => document.removeEventListener("pointerdown", handle, { capture: true });
  }, [qtyOpen]);

  function handleQuantityChange(id: number, qty: string) {
    updateMutation.mutate(
      { id, data: { quantity: qty } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }) }
    );
  }

  const progress = list ? Math.round((list.checkedItems / (list.totalItems || 1)) * 100) : 0;

  async function handleToggle(id: number, checked: boolean) {
    await queryClient.cancelQueries({ queryKey: qKey });
    const snapshot = queryClient.getQueryData(qKey);
    queryClient.setQueryData(qKey, (old: typeof list) => {
      if (!old) return old;
      return {
        ...old,
        checkedItems: old.checkedItems + (checked ? -1 : 1),
        categories: old.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === id ? { ...item, isChecked: !checked } : item
          ),
        })),
      };
    });
    if (!navigator.onLine) {
      enqueueOp({
        key: `grocery-toggle-${id}`,
        type: "grocery-toggle",
        itemId: id,
        payload: { isChecked: !checked },
      });
    }
    updateMutation.mutate(
      { id, data: { isChecked: !checked } },
      {
        onSuccess: () => {
          dequeueOp(`grocery-toggle-${id}`);
          queryClient.invalidateQueries({ queryKey: qKey });
        },
        onError: () => {
          queryClient.setQueryData(qKey, snapshot);
          toast({ title: "Error", description: "Could not update item.", variant: "destructive" });
        },
      }
    );
  }

  async function handleDelete(id: number) {
    await queryClient.cancelQueries({ queryKey: qKey });
    const snapshot = queryClient.getQueryData(qKey);
    queryClient.setQueryData(qKey, (old: typeof list) => {
      if (!old) return old;
      const item = old.categories.flatMap((c) => c.items).find((i) => i.id === id);
      return {
        ...old,
        totalItems: Math.max(0, old.totalItems - 1),
        checkedItems: item?.isChecked ? Math.max(0, old.checkedItems - 1) : old.checkedItems,
        categories: old.categories
          .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.id !== id) }))
          .filter((cat) => cat.items.length > 0),
      };
    });
    if (!navigator.onLine) {
      enqueueOp({
        key: `grocery-delete-${id}`,
        type: "grocery-delete",
        itemId: id,
        payload: {},
      });
      return;
    }
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
        },
        onError: () => {
          queryClient.setQueryData(qKey, snapshot);
          toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
        },
      }
    );
  }

  async function handleClearChecked() {
    await queryClient.cancelQueries({ queryKey: qKey });
    const snapshot = queryClient.getQueryData(qKey);
    queryClient.setQueryData(qKey, (old: typeof list) => {
      if (!old) return old;
      const checkedCount = old.checkedItems;
      return {
        ...old,
        totalItems: Math.max(0, old.totalItems - checkedCount),
        checkedItems: 0,
        categories: old.categories
          .map((cat) => ({ ...cat, items: cat.items.filter((i) => !i.isChecked) }))
          .filter((cat) => cat.items.length > 0),
      };
    });
    if (!navigator.onLine) {
      enqueueOp({
        key: `grocery-clear-${Date.now()}`,
        type: "grocery-clear",
        itemId: 0,
        payload: {},
      });
      toast({ title: "Saved offline", description: "Checked items will be cleared when you reconnect." });
      return;
    }
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: qKey });
        toast({ title: "Cleared!", description: "Checked items removed from your list." });
      },
      onError: () => {
        queryClient.setQueryData(qKey, snapshot);
        toast({ title: "Error", description: "Could not clear checked items.", variant: "destructive" });
      },
    });
  }

  async function handleMoveToPantry() {
    const checkedItems = list?.categories.flatMap((c) => c.items).filter((i) => i.isChecked) ?? [];
    if (checkedItems.length === 0) return;
    setMovingToPantry(true);
    try {
      await Promise.all(
        checkedItems.map((item) =>
          fetch("/api/pantry/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: item.name, quantity: item.quantity ?? "1", category: item.category }),
          })
        )
      );
      await new Promise<void>((resolve, reject) =>
        clearMutation.mutate(undefined, { onSuccess: () => resolve(), onError: reject })
      );
      queryClient.invalidateQueries({ queryKey: qKey });
      queryClient.invalidateQueries({ queryKey: getListPantryItemsQueryKey() });
      toast({ title: `${checkedItems.length} item${checkedItems.length > 1 ? "s" : ""} moved to pantry!` });
    } catch {
      toast({ title: "Error", description: "Could not move items to pantry.", variant: "destructive" });
    } finally {
      setMovingToPantry(false);
    }
  }

  function findExistingItem(name: string): GroceryItemType | null {
    if (!list) return null;
    const lower = name.trim().toLowerCase();
    for (const cat of list.categories) {
      const found = cat.items.find((i) => i.name.toLowerCase() === lower);
      if (found) return found as GroceryItemType;
    }
    return null;
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const existing = findExistingItem(newItem.name);
    if (existing) {
      setDuplicateItem(existing);
      return;
    }

    doAdd();
  }

  function doAdd() {
    const itemData = {
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      unit: newItem.unit || undefined,
      category: newItem.category,
      scheduleType: newItem.scheduleType === "none" ? undefined : newItem.scheduleType,
      scheduleDaysInterval: newItem.scheduleType === "custom" ? newItem.scheduleDaysInterval : undefined,
    };

    if (!navigator.onLine) {
      const tempId = -Date.now();
      const opKey = `grocery-add-${-tempId}`;
      queryClient.setQueryData(qKey, (old: typeof list) => {
        if (!old) return old;
        const fakeItem = {
          id: tempId,
          name: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit ?? null,
          category: itemData.category,
          isChecked: false,
          isCustom: true,
          mealId: null,
          mealName: null,
        };
        const existingCat = old.categories.find((c) => c.category === itemData.category);
        const updatedCategories = existingCat
          ? old.categories.map((c) =>
              c.category === itemData.category ? { ...c, items: [...c.items, fakeItem] } : c
            )
          : [...old.categories, { category: itemData.category, items: [fakeItem] }];
        return { ...old, totalItems: old.totalItems + 1, categories: updatedCategories };
      });
      enqueueOp({
        key: opKey,
        type: "grocery-add",
        itemId: 0,
        payload: itemData,
      });
      setAddOpen(false);
      setNewItem({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
      setCategoryAutoDetected(false);
      toast({ title: "Item saved offline", description: "It will be added when you reconnect." });
      return;
    }

    addMutation.mutate(
      { data: itemData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setAddOpen(false);
          setNewItem({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
          setCategoryAutoDetected(false);
          toast({ title: "Item added!", description: newItem.scheduleType !== "none" ? "Item added and scheduled." : undefined });
        },
        onError: () => toast({ title: "Error", description: "Could not add item.", variant: "destructive" }),
      }
    );
  }

  function handleIncreaseQuantity() {
    if (!duplicateItem) return;
    const newQty = addQty(duplicateItem.quantity, newItem.quantity);
    updateMutation.mutate(
      { id: duplicateItem.id, data: { quantity: newQty } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setDuplicateItem(null);
          setAddOpen(false);
          setNewItem({ name: "", quantity: "1", unit: "", category: "Other", scheduleType: "none", scheduleDaysInterval: 7 });
          setCategoryAutoDetected(false);
          toast({ title: "Quantity updated!", description: `${duplicateItem.name} is now ${newQty}.` });
        },
        onError: () => toast({ title: "Error", description: "Could not update quantity.", variant: "destructive" }),
      }
    );
  }

  function handleAddSuggestion(suggestion: { name: string; category: string }) {
    const existing = findExistingItem(suggestion.name);
    if (existing) {
      setAddedSuggestionNames((prev) => new Set([...prev, suggestion.name]));
      toast({ title: `${suggestion.name} is already in your list!` });
      return;
    }
    addMutation.mutate(
      { data: { name: suggestion.name, quantity: "1", category: suggestion.category } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setAddedSuggestionNames((prev) => new Set([...prev, suggestion.name]));
          toast({ title: `${suggestion.name} added!` });
        },
      }
    );
  }

  const hasPendingWrites = updateMutation.isPaused || addMutation.isPaused || deleteMutation.isPaused || clearMutation.isPaused;
  const showQueuedBanner = hasPendingWrites || pendingCount > 0;

  return (
    <div className="space-y-6">
      <CachedDataBanner hasData={!!list} />
      {showQueuedBanner && (
        <div className="flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-md px-3 py-1.5">
          <RefreshCw className={`w-3 h-3 shrink-0 ${isSyncing ? "animate-spin" : "animate-none opacity-60"}`} />
          <span>
            {isSyncing
              ? "Syncing changes…"
              : pendingCount > 0
              ? `${pendingCount} change${pendingCount > 1 ? "s" : ""} saved locally — will sync when you reconnect`
              : "Changes queued — will sync automatically when you reconnect"}
          </span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Grocery List</h1>
          <p className="text-muted-foreground">Everything you need to pick up.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {list && list.checkedItems > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleMoveToPantry} disabled={movingToPantry || clearMutation.isPending}>
                <PackagePlus className="w-3.5 h-3.5 mr-1.5" />
                {movingToPantry ? "Moving…" : `Move to Pantry (${list.checkedItems})`}
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearChecked} disabled={clearMutation.isPending || movingToPantry}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear Checked ({list.checkedItems})
              </Button>
            </>
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
          {[...(list?.categories ?? [])].sort((a, b) => a.category.localeCompare(b.category)).map((category) => (
            <div key={category.category} className="space-y-2">
              <h3 className="font-serif text-base font-semibold text-muted-foreground flex items-center gap-2">
                {category.category}
                <span className="text-xs font-normal bg-muted px-1.5 py-0.5 rounded-full">
                  {category.items.filter((i) => !i.isChecked).length} left
                </span>
              </h3>
              <Card>
                <CardContent className="p-0">
                  {[...category.items].sort((a, b) => {
                    const mA = a.mealName ?? "";
                    const mB = b.mealName ?? "";
                    if (mA && !mB) return -1;
                    if (!mA && mB) return 1;
                    if (mA !== mB) return mA.localeCompare(mB);
                    return a.name.localeCompare(b.name);
                  }).map((item, idx) => (
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
                          <button
                            data-qty-picker
                            className="text-xs text-muted-foreground hover:text-primary underline decoration-dotted transition-colors"
                            onPointerDown={(e) => { e.stopPropagation(); pointerStartRef.current = { x: e.clientX, y: e.clientY }; }}
                            onPointerUp={(e) => {
                              e.stopPropagation();
                              const start = pointerStartRef.current;
                              pointerStartRef.current = null;
                              if (!start || Math.abs(e.clientX - start.x) > 6 || Math.abs(e.clientY - start.y) > 6) return;
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setQtyOpen((prev) => prev?.id === item.id ? null : {
                                id: item.id,
                                top: rect.bottom + 6,
                                left: Math.min(rect.left, window.innerWidth - 220),
                              });
                            }}
                          >
                            {item.unit && !item.quantity.toLowerCase().includes(item.unit.toLowerCase())
                              ? `${item.quantity} ${item.unit}`
                              : item.quantity}
                          </button>
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

      {/* Quantity picker overlay */}
      {qtyOpen && (
        <div
          data-qty-picker
          className="fixed z-50 bg-card border border-border rounded-xl shadow-2xl p-3 w-52"
          style={{ top: qtyOpen.top, left: qtyOpen.left }}
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Set quantity</p>
          <div className="grid grid-cols-5 gap-1.5">
            {COMMON_QUANTITIES.map((q) => {
              const currentQty = list?.categories.flatMap((c) => c.items).find((i) => i.id === qtyOpen.id)?.quantity;
              return (
                <button
                  key={q}
                  data-qty-picker
                  className={`h-9 rounded-lg text-sm font-medium transition-colors ${currentQty === q ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/15 text-foreground"}`}
                  onClick={() => { handleQuantityChange(qtyOpen.id, q); setQtyOpen(null); }}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Duplicate Item Dialog */}
      <Dialog open={!!duplicateItem} onOpenChange={(open) => { if (!open) setDuplicateItem(null); }}>
        <DialogContent className="max-w-sm top-4 translate-y-0">
          <DialogHeader>
            <DialogTitle className="font-serif">Already in Your List</DialogTitle>
          </DialogHeader>
          {duplicateItem && (
            <div className="space-y-4">
              <div className="px-3 py-2.5 rounded-lg bg-muted border text-sm">
                <p className="font-medium">{duplicateItem.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">Current quantity: {duplicateItem.quantity}{duplicateItem.unit ? ` ${duplicateItem.unit}` : ""}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Would you like to increase the quantity by <strong>{newItem.quantity}</strong> (to <strong>{addQty(duplicateItem.quantity, newItem.quantity)}</strong>), or cancel?
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={handleIncreaseQuantity}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating…" : `Add ${newItem.quantity} More (total: ${addQty(duplicateItem.quantity, newItem.quantity)})`}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setDuplicateItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) { setCategoryAutoDetected(false); setShowFoodSuggestions(false); setFoodSuggestions([]); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Item to Grocery List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name *</label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Greek Yogurt"
                  value={newItem.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const detected = detectCategory(name);
                    if (detected) {
                      setNewItem((v) => ({ ...v, name, category: detected }));
                      setCategoryAutoDetected(true);
                    } else {
                      setNewItem((v) => ({ ...v, name }));
                      setCategoryAutoDetected(false);
                    }
                    const matches = searchFoodItems(name);
                    setFoodSuggestions(matches);
                    setShowFoodSuggestions(matches.length > 0);
                  }}
                  onBlur={() => setTimeout(() => setShowFoodSuggestions(false), 100)}
                  onKeyDown={(e) => { if (e.key === "Escape") setShowFoodSuggestions(false); }}
                  autoFocus
                  required
                />
                {showFoodSuggestions && foodSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 bottom-full mb-1 bg-background border border-border rounded-md shadow-lg overflow-hidden">
                    {foodSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const detected = detectCategory(s.name);
                          setNewItem((v) => ({ ...v, name: s.name, category: detected ?? s.category }));
                          setCategoryAutoDetected(true);
                          setShowFoodSuggestions(false);
                        }}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Category</label>
                {categoryAutoDetected && (
                  <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" /> Auto-detected — tap to change
                  </span>
                )}
              </div>
              <select
                className={`w-full px-3 py-2 text-sm rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  categoryAutoDetected
                    ? "border-2 border-amber-400 ring-2 ring-amber-200"
                    : "border border-border"
                }`}
                value={newItem.category}
                onChange={(e) => { setNewItem((v) => ({ ...v, category: e.target.value })); setCategoryAutoDetected(false); }}
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
      <Dialog open={suggestionsOpen} onOpenChange={(open) => { setSuggestionsOpen(open); if (!open) setAddedSuggestionNames(new Set()); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Grocery Suggestions
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Based on your pantry and common staples:</p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {suggestions
              ?.filter((s) => !addedSuggestionNames.has(s.name))
              .map((s) => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAddSuggestion(s)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            {(suggestions?.filter((s) => !addedSuggestionNames.has(s.name)).length ?? 0) === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                {addedSuggestionNames.size > 0
                  ? "All suggestions added! Close and reopen to refresh."
                  : "No suggestions right now. Your pantry looks well-stocked!"}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
