import { useState, useEffect, useRef } from "react";
import {
  useListPantryItems,
  getListPantryItemsQueryKey,
  useUpdatePantryItem,
  useAddPantryItem,
  useDeletePantryItem,
  useMovePantryItemToGrocery,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PackageSearch, Plus, Trash2, ChefHat, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const COMMON_QUANTITIES = ["½", "1", "2", "3", "4", "5", "6", "8", "10", "12"];

const CATEGORY_ORDER = [
  "Produce", "Meat & Seafood", "Dairy & Eggs", "Grains & Bread", "Bakery",
  "Canned Goods", "Condiments & Sauces", "Snacks", "Desserts", "Beverages",
  "Frozen", "Pantry", "Cleaning", "Personal Care", "Other",
];

type PantryItem = {
  id: number;
  name: string;
  quantity: string | null;
  category: string;
  inStock: boolean;
  notes: string | null;
  lastVerifiedAt: string | null;
  usedInMeals?: string[];
};

export function Pantry() {
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Pantry", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getListPantryItemsQueryKey();

  const { data: items, isLoading } = useListPantryItems({ query: { queryKey: qKey } });

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

  const updateMutation = useUpdatePantryItem();
  const addMutation = useAddPantryItem();
  const deleteMutation = useDeletePantryItem();
  const movePantryMutation = useMovePantryItemToGrocery();

  function handleQuantityChange(id: number, qty: string) {
    updateMutation.mutate(
      { id, data: { quantity: qty } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }) }
    );
  }

  // Group items by category, sorted alphabetically within each group
  const grouped: Record<string, PantryItem[]> = {};
  for (const item of (items ?? [])) {
    const cat = item.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item as PantryItem);
  }
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
  }
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  function handleAddToGrocery(item: PantryItem) {
    movePantryMutation.mutate(
      { id: item.id, data: { removeFromPantry: true } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          toast({ title: `${item.name} moved to grocery list` });
        },
        onError: () => toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" }),
      }
    );
  }

  function handleDelete(item: PantryItem) {
    deleteMutation.mutate(
      { id: item.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          toast({ title: `${item.name} removed from pantry.` });
        },
        onError: () => toast({ title: "Error", description: "Could not remove item.", variant: "destructive" }),
      }
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    addMutation.mutate(
      {
        data: {
          name: newItem.name.trim(),
          quantity: newItem.quantity || undefined,
          category: newItem.category,
          notes: newItem.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setAddOpen(false);
          setNewItem({ name: "", quantity: "", category: "Pantry", notes: "" });
          toast({ title: "Item added to pantry!" });
        },
        onError: () => toast({ title: "Error", description: "Could not add item.", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Pantry</h1>
          <p className="text-muted-foreground">Track what you have at home.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>


      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-28 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (items ?? []).length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Your pantry is empty.</p>
          <p className="text-sm">Add pantry items to track what you have at home.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="font-serif text-base font-semibold text-muted-foreground flex items-center gap-2">
                {category}
                <span className="text-xs font-normal bg-muted px-1.5 py-0.5 rounded-full">
                  {grouped[category].length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[category].map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="h-1 w-full bg-green-500" />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base leading-tight flex-1">{item.name}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => handleAddToGrocery(item)}
                            disabled={movePantryMutation.isPending}
                            title="Add to grocery list"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleDelete(item)}
                            disabled={deleteMutation.isPending}
                            title="Remove from pantry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-muted-foreground">Qty:</span>
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
                          {item.quantity ?? "—"}
                        </button>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">{item.notes}</p>
                      )}

                      {item.usedInMeals && item.usedInMeals.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                            <ChefHat className="w-3 h-3" /> Used in:
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.usedInMeals.slice(0, 2).join(", ")}
                            {item.usedInMeals.length > 2 && ` +${item.usedInMeals.length - 2} more`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              const currentQty = (items as PantryItem[] | undefined)?.find((i) => i.id === qtyOpen.id)?.quantity;
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

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Pantry Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name *</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Olive Oil"
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
                  placeholder="e.g. 2 cups"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((v) => ({ ...v, quantity: e.target.value }))}
                />
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
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Brand, storage notes…"
                value={newItem.notes}
                onChange={(e) => setNewItem((v) => ({ ...v, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newItem.name.trim() || addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add to Pantry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
