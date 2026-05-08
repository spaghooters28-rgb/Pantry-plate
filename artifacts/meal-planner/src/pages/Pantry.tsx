import { useState, useEffect, useRef } from "react";
import {
  useListPantryItems,
  getListPantryItemsQueryKey,
  useUpdatePantryItem,
  useAddPantryItem,
  useDeletePantryItem,
  useMovePantryItemToGrocery,
  useAnalyzeRecipeUrl,
  useSaveAnalyzedRecipe,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PackageSearch, Plus, Trash2, CheckCircle2, AlertTriangle, ChefHat, ShoppingCart, Link, Loader2, Search, ChevronDown, ChevronUp, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Pantry", "Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Bread", "Frozen", "Beverages", "Other"];

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

type RemoveAction = { item: PantryItem } | null;

type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
  inPantry: boolean;
};

type AnalyzeResult = {
  recipeName: string;
  instructions: string | null;
  ingredients: RecipeIngredient[];
  haveCount: number;
  needCount: number;
};

export function Pantry() {
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "in-stock" | "depleted">("all");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Pantry", notes: "" });
  const [removeAction, setRemoveAction] = useState<RemoveAction>(null);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [recipeUrl, setRecipeUrl] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(false);
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

  function handleQuantityChange(id: number, qty: string) {
    updateMutation.mutate(
      { id, data: { quantity: qty } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }) }
    );
  }

  const updateMutation = useUpdatePantryItem();
  const addMutation = useAddPantryItem();
  const deleteMutation = useDeletePantryItem();
  const movePantryMutation = useMovePantryItemToGrocery();
  const analyzeRecipeMutation = useAnalyzeRecipeUrl();
  const saveRecipeMutation = useSaveAnalyzedRecipe();

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

  function handleAddToGroceryAndRemove(item: PantryItem, removeFromPantry: boolean) {
    movePantryMutation.mutate(
      { id: item.id, data: { removeFromPantry } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          setRemoveAction(null);
          toast({
            title: removeFromPantry ? `${item.name} moved to grocery list` : `${item.name} added to grocery list`,
            description: removeFromPantry ? "Removed from pantry and added to your grocery list." : "Added to your grocery list.",
          });
        },
        onError: () => toast({ title: "Error", description: "Could not update item.", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number, name: string) {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          setRemoveAction(null);
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

  const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const DAY_SHORT: Record<string, string> = {
    monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
    friday: "Fri", saturday: "Sat", sunday: "Sun",
  };

  function handleAnalyzeRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!recipeUrl.trim()) return;
    setAnalyzeResult(null);
    setShowInstructions(false);
    analyzeRecipeMutation.mutate(
      { data: { url: recipeUrl.trim() } },
      {
        onSuccess: (result) => {
          setAnalyzeResult(result as AnalyzeResult);
        },
        onError: () => toast({ title: "Error", description: "Could not analyze recipe. Make sure the URL is accessible.", variant: "destructive" }),
      }
    );
  }

  function handleAddMissingToGrocery() {
    if (!analyzeResult) return;
    const missing = analyzeResult.ingredients.filter((i) => !i.inPantry);
    if (missing.length === 0) {
      toast({ title: "You have everything!", description: "All ingredients are already in your pantry." });
      return;
    }
    Promise.all([
      // Add missing ingredients to grocery list
      ...missing.map((ing) =>
        fetch("/api/grocery-list/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: ing.name, quantity: ing.quantity || "1", unit: ing.unit ?? undefined, category: ing.category }),
        })
      ),
      // Record in history
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: analyzeResult.recipeName,
          instructions: analyzeResult.instructions ?? null,
          sourceUrl: recipeUrl.trim(),
        }),
      }),
    ]).then(() => {
      queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
      toast({
        title: `${missing.length} item${missing.length !== 1 ? "s" : ""} added to grocery list!`,
        description: `Missing ingredients from "${analyzeResult.recipeName}" added.`,
      });
      setAnalyzerOpen(false);
      setRecipeUrl("");
      setAnalyzeResult(null);
      setSelectedDay("");
    }).catch(() => {
      toast({ title: "Error", description: "Some items could not be added.", variant: "destructive" });
    });
  }

  function handleSaveAndAssignToDay() {
    if (!analyzeResult) return;
    saveRecipeMutation.mutate(
      {
        data: {
          recipeName: analyzeResult.recipeName,
          instructions: analyzeResult.instructions ?? null,
          sourceUrl: recipeUrl.trim() || null,
          assignToDay: selectedDay || null,
          ingredients: analyzeResult.ingredients,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: selectedDay ? `Recipe saved & added to ${DAY_SHORT[selectedDay] ?? selectedDay}!` : "Recipe saved to Discover!",
            description: selectedDay ? "Check the Weekly Plan to see it." : "You can now find it in Discover.",
          });
          setAnalyzerOpen(false);
          setRecipeUrl("");
          setAnalyzeResult(null);
          setSelectedDay("");
          setShowInstructions(false);
        },
        onError: () => toast({ title: "Error", description: "Could not save recipe.", variant: "destructive" }),
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
          <Button variant="outline" onClick={() => { setAnalyzerOpen(true); setAnalyzeResult(null); setRecipeUrl(""); }}>
            <Link className="w-4 h-4 mr-2" />
            Recipe Analyzer
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
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
                      onClick={() => setRemoveAction({ item: item as PantryItem })}
                      title="Remove options"
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

      {/* Remove Action Dialog */}
      <Dialog open={!!removeAction} onOpenChange={(open) => { if (!open) setRemoveAction(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Remove "{removeAction?.item.name}"</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">What would you like to do with this item?</p>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => removeAction && handleAddToGroceryAndRemove(removeAction.item, false)}
              disabled={movePantryMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4 text-primary" />
              Add to Grocery List (keep in pantry)
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => removeAction && handleAddToGroceryAndRemove(removeAction.item, true)}
              disabled={movePantryMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              Add to Grocery List &amp; Remove from Pantry
            </Button>
            <Button
              variant="destructive"
              className="justify-start gap-2"
              onClick={() => removeAction && handleDelete(removeAction.item.id, removeAction.item.name)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
              Remove from Pantry Only
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Link Analyzer Dialog */}
      <Dialog open={analyzerOpen} onOpenChange={(open) => { if (!open) { setAnalyzerOpen(false); setAnalyzeResult(null); setRecipeUrl(""); setSelectedDay(""); setShowInstructions(false); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Link className="w-5 h-5" />
              Recipe Link Analyzer
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Paste a recipe URL — AI will extract the ingredients and cross-check your pantry.</p>

          <form onSubmit={handleAnalyzeRecipe} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://www.allrecipes.com/recipe/..."
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              type="url"
              required
            />
            <Button type="submit" disabled={analyzeRecipeMutation.isPending || !recipeUrl.trim()} className="shrink-0 gap-1.5">
              {analyzeRecipeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</>
              ) : (
                <><Search className="w-4 h-4" />Analyze</>
              )}
            </Button>
          </form>

          {analyzeResult && (
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              {/* Recipe title + pantry summary */}
              <div>
                <h3 className="font-semibold text-base font-serif">{analyzeResult.recipeName}</h3>
                <div className="flex gap-3 text-sm mt-1">
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />{analyzeResult.haveCount} in pantry
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <ShoppingCart className="w-4 h-4" />{analyzeResult.needCount} to buy
                  </span>
                </div>
              </div>

              {/* Instructions collapsible */}
              {analyzeResult.instructions && (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                    onClick={() => setShowInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      Recipe Instructions
                    </span>
                    {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showInstructions && (
                    <div className="px-3 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {analyzeResult.instructions}
                    </div>
                  )}
                </div>
              )}

              {/* Ingredient list */}
              <div className="space-y-1.5">
                {analyzeResult.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${
                      ing.inPantry ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <span className={ing.inPantry ? "text-green-800" : "text-amber-800"}>
                      {ing.quantity} {ing.unit ? `${ing.unit} ` : ""}{ing.name}
                    </span>
                    <span className={`text-xs font-medium ${ing.inPantry ? "text-green-600" : "text-amber-600"}`}>
                      {ing.inPantry ? "✓ Have it" : "Need it"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day picker for weekly plan assignment */}
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Add to Weekly Plan (optional)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay((d) => d === day ? "" : day)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedDay === day
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {DAY_SHORT[day]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pb-1">
                {analyzeResult.needCount > 0 && (
                  <Button variant="outline" className="w-full gap-2" onClick={handleAddMissingToGrocery}>
                    <ShoppingCart className="w-4 h-4" />
                    Add {analyzeResult.needCount} Missing Item{analyzeResult.needCount !== 1 ? "s" : ""} to Grocery List
                  </Button>
                )}
                {analyzeResult.needCount === 0 && (
                  <div className="text-center py-2 text-green-700 font-medium text-sm">
                    🎉 You have everything for this recipe!
                  </div>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={handleSaveAndAssignToDay}
                  disabled={saveRecipeMutation.isPending}
                >
                  {saveRecipeMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" />{selectedDay ? `Save Recipe & Add to ${DAY_SHORT[selectedDay]}` : "Save Recipe to Discover"}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
