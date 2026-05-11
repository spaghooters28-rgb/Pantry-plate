import { useState, useEffect, useRef } from "react";
import {
  useListPantryItems,
  getListPantryItemsQueryKey,
  useUpdatePantryItem,
  useAddPantryItem,
  useDeletePantryItem,
  useMovePantryItemToGrocery,
  getGetGroceryListQueryKey,
  useGetAvailableRecipes,
  getGetAvailableRecipesQueryKey,
  useToggleMealFavorite,
  getListMealsQueryKey,
  type AvailableRecipe,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PackageSearch, Plus, Trash2, ChefHat, ShoppingCart, Sparkles,
  Clock, Flame, CheckCircle2, AlertCircle, Star, ShoppingBag, Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTier } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";

const CATEGORIES = [
  "Produce", "Meat & Seafood", "Dairy & Eggs", "Grains & Bread", "Bakery",
  "Canned Goods", "Condiments & Sauces", "Snacks", "Desserts", "Beverages",
  "Frozen", "Pantry", "Cleaning", "Personal Care", "Other",
];

const COMMON_QUANTITIES = ["½", "1", "2", "3", "4", "5", "6", "8", "10", "12"];

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

function MatchBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  if (pct === 100) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Ready to cook
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" /> {pct}% covered
    </span>
  );
}

function RecipeCard({ recipe: initialRecipe }: { recipe: AvailableRecipe }) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [expanded, setExpanded] = useState(false);
  const [addingToGrocery, setAddingToGrocery] = useState(false);
  const [addedToGrocery, setAddedToGrocery] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const toggleFavMutation = useToggleMealFavorite();

  const missingNames = new Set(recipe.missingIngredients.map((n) => n.toLowerCase()));

  function handleToggleFavorite() {
    toggleFavMutation.mutate(
      { id: recipe.id },
      {
        onSuccess: (updated) => {
          setRecipe((prev) => ({ ...prev, isFavorited: (updated as { isFavorited: boolean }).isFavorited }));
          queryClient.invalidateQueries({ queryKey: getListMealsQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "Could not update favorite.", variant: "destructive" }),
      }
    );
  }

  async function handleAddToGrocery() {
    setAddingToGrocery(true);
    try {
      const res = await fetch(`/api/grocery-list/from-meal/${recipe.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
      setAddedToGrocery(true);
      toast({ title: "Added to grocery list", description: recipe.name });
    } catch {
      toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" });
    } finally {
      setAddingToGrocery(false);
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="h-1 w-full"
        style={{ background: recipe.matchScore === 1 ? "#10b981" : "#f59e0b" }}
      />
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1.5">{recipe.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              <MatchBadge score={recipe.matchScore} />
              <Badge variant="outline" className="text-xs">{recipe.cuisine}</Badge>
              <Badge variant="outline" className="text-xs">{recipe.protein}</Badge>
            </div>
          </div>
          {/* Favorite button */}
          <button
            className={`p-1.5 rounded-full shrink-0 transition-colors ${recipe.isFavorited ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground hover:text-amber-400"}`}
            onClick={handleToggleFavorite}
            disabled={toggleFavMutation.isPending}
            title={recipe.isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-4 h-4 ${recipe.isFavorited ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.cookTimeMinutes}m</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{recipe.calories} kcal</span>
          <span className="flex items-center gap-1">Serves {recipe.servings}</span>
        </div>

        {/* Ingredients list */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Ingredients
          </p>
          <ul className="space-y-0.5">
            {recipe.ingredients.map((ing) => {
              const isMissing = missingNames.has(ing.name.toLowerCase());
              return (
                <li
                  key={ing.id}
                  className={`text-xs flex items-baseline gap-1 ${isMissing ? "text-red-600" : "text-foreground"}`}
                >
                  <span className="shrink-0 font-medium tabular-nums">
                    {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                  </span>
                  <span className={isMissing ? "" : "text-muted-foreground"}>{ing.name}</span>
                  {isMissing && <span className="ml-auto text-[9px] font-semibold text-red-500 uppercase">needed</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant={addedToGrocery ? "outline" : "default"}
            className="flex-1 text-xs h-8"
            onClick={handleAddToGrocery}
            disabled={addingToGrocery}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            {addingToGrocery ? "Adding…" : addedToGrocery ? "Added!" : "Add to Grocery List"}
          </Button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide" : "Instructions"}
          </button>
        </div>

        {expanded && recipe.instructions && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Instructions</p>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{recipe.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Pantry() {
  const [addOpen, setAddOpen] = useState(false);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Pantry", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isPro } = useTier();
  const qKey = getListPantryItemsQueryKey();
  const recipeQKey = getGetAvailableRecipesQueryKey();

  const { data: items, isLoading } = useListPantryItems({ query: { queryKey: qKey } });
  const { data: availableRecipes, isLoading: recipesLoading, refetch: fetchRecipes } = useGetAvailableRecipes({
    query: { queryKey: recipeQKey, enabled: false },
  });

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

  async function handleGenerateRecipes() {
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    setRecipesOpen(true);
    await fetchRecipes();
  }

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
    const ia = CATEGORIES.indexOf(a);
    const ib = CATEGORIES.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
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

  const readyRecipes = availableRecipes?.filter((r) => r.matchScore === 1) ?? [];
  const almostRecipes = availableRecipes?.filter((r) => r.matchScore < 1) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Pantry</h1>
          <p className="text-muted-foreground">Track what you have at home.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleGenerateRecipes}>
            {isPro ? (
              <Sparkles className="w-4 h-4 mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Find Available Recipes
            {!isPro && (
              <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>
            )}
          </Button>
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

      {/* Available Recipes Dialog */}
      <Dialog open={recipesOpen} onOpenChange={setRecipesOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recipes You Can Make
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Based on what's in your pantry right now. Red ingredients are what you still need.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            {recipesLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            ) : !availableRecipes || availableRecipes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <PackageSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No recipes found.</p>
                <p className="text-sm">Add more items to your pantry to unlock recipes.</p>
              </div>
            ) : (
              <div className="py-4 space-y-6">
                {readyRecipes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to Cook ({readyRecipes.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {readyRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                  </div>
                )}

                {almostRecipes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      Almost There — Missing a Few Items ({almostRecipes.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {almostRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredTier="pro"
        featureName="Find Available Recipes"
      />
    </div>
  );
}
