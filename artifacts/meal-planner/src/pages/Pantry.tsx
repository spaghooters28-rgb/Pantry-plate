import { useState } from "react";
import {
  useListPantryItems,
  getListPantryItemsQueryKey,
  useUpdatePantryItem,
  useAddPantryItem,
  useDeletePantryItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PackageSearch, Plus, Trash2, CheckCircle2, AlertTriangle, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Pantry", "Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Bread", "Frozen", "Beverages", "Other"];

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
  const [filter, setFilter] = useState<"all" | "in-stock" | "depleted">("all");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Pantry", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getListPantryItemsQueryKey();

  const { data: items, isLoading } = useListPantryItems({ query: { queryKey: qKey } });

  const updateMutation = useUpdatePantryItem();
  const addMutation = useAddPantryItem();
  const deleteMutation = useDeletePantryItem();

  const filteredItems = items?.filter((item) => {
    if (filter === "in-stock") return item.inStock;
    if (filter === "depleted") return !item.inStock;
    return true;
  });

  const inStockCount = items?.filter((i) => i.inStock).length ?? 0;
  const depletedCount = items?.filter((i) => !i.inStock).length ?? 0;

  function handleToggleStock(item: PantryItem) {
    updateMutation.mutate(
      {
        id: item.id,
        data: {
          inStock: !item.inStock,
          lastVerifiedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          toast({
            title: item.inStock ? `${item.name} marked depleted` : `${item.name} restocked`,
            description: item.inStock ? "We'll suggest adding it to your grocery list." : "Updated in your pantry.",
          });
        },
        onError: () => toast({ title: "Error", description: "Could not update pantry item.", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number, name: string) {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          toast({ title: `${name} removed from pantry.` });
        },
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
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Summary stats */}
      {!isLoading && items && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`p-3 rounded-xl border text-center transition-colors ${filter === "all" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
          >
            <p className="text-2xl font-bold font-serif">{items.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Items</p>
          </button>
          <button
            onClick={() => setFilter("in-stock")}
            className={`p-3 rounded-xl border text-center transition-colors ${filter === "in-stock" ? "border-green-500 bg-green-50" : "border-border bg-card hover:border-green-300"}`}
          >
            <p className="text-2xl font-bold font-serif text-green-700">{inStockCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">In Stock</p>
          </button>
          <button
            onClick={() => setFilter("depleted")}
            className={`p-3 rounded-xl border text-center transition-colors ${filter === "depleted" ? "border-destructive bg-destructive/5" : "border-border bg-card hover:border-destructive/40"}`}
          >
            <p className="text-2xl font-bold font-serif text-destructive">{depletedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Depleted</p>
          </button>
        </div>
      )}

      {/* Smart prompt for depleted items */}
      {!isLoading && depletedCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {depletedCount} item{depletedCount > 1 ? "s are" : " is"} depleted
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Check the Grocery Suggestions in your Grocery List to restock them automatically.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filteredItems?.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">{filter === "depleted" ? "Nothing is depleted!" : "Your pantry is empty."}</p>
          <p className="text-sm">{filter === "all" ? "Add pantry items to track what you have at home." : `Try switching the filter.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems?.map((item) => (
            <Card key={item.id} className={`overflow-hidden transition-opacity ${!item.inStock ? "opacity-70" : ""}`}>
              <div className={`h-1 w-full ${item.inStock ? "bg-green-500" : "bg-destructive"}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base leading-tight flex-1">{item.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      className={`p-1 rounded-full transition-colors ${item.inStock ? "text-green-600 hover:bg-green-100" : "text-muted-foreground hover:bg-muted"}`}
                      onClick={() => handleToggleStock(item as PantryItem)}
                      title={item.inStock ? "Mark depleted" : "Mark in stock"}
                    >
                      {item.inStock
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <AlertTriangle className="w-5 h-5" />
                      }
                    </button>
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <Badge variant={item.inStock ? "default" : "destructive"} className="text-xs">
                    {item.inStock ? "In Stock" : "Depleted"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                </div>

                {item.quantity && (
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-muted-foreground italic mt-0.5">{item.notes}</p>
                )}

                {(item as PantryItem).usedInMeals && (item as PantryItem).usedInMeals!.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                      <ChefHat className="w-3 h-3" /> Used in:
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {(item as PantryItem).usedInMeals!.slice(0, 2).join(", ")}
                      {(item as PantryItem).usedInMeals!.length > 2 && ` +${(item as PantryItem).usedInMeals!.length - 2} more`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity (optional)</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 1 bottle, half full…"
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
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <input
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Running low, expires soon…"
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
