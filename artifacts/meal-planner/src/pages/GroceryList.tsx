import { useState, useEffect, useRef } from "react";
import {
  useGetGroceryList,
  getGetGroceryListQueryKey,
  useUpdateGroceryItem,
  useAddGroceryItem,
  useDeleteGroceryItem,
  useClearGroceryList,
  useGetGroceryListSuggestions,
  useAnalyzeRecipeUrl,
  useSaveAnalyzedRecipe,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Trash2, ShoppingBag, Sparkles, X,
  Link, Loader2, Search, ChevronDown, ChevronUp,
  Calendar, CheckCircle2, ShoppingCart, BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Grains & Bread", "Frozen", "Beverages", "Other"];
const SCHEDULE_OPTIONS = [
  { value: "none", label: "No schedule" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "every_other_day", label: "Every other day" },
  { value: "custom", label: "Custom interval" },
];
const COMMON_QUANTITIES = ["½", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

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
  cuisine: string | null;
  protein: string | null;
  isGlutenFree: boolean | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  servings: number | null;
};

export function GroceryList() {
  const [addOpen, setAddOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [recipeUrl, setRecipeUrl] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
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
  const analyzeRecipeMutation = useAnalyzeRecipeUrl();
  const saveRecipeMutation = useSaveAnalyzedRecipe();

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

  function handleAnalyzeRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!recipeUrl.trim()) return;
    setAnalyzeResult(null);
    setShowInstructions(false);
    analyzeRecipeMutation.mutate(
      { data: { url: recipeUrl.trim() } },
      {
        onSuccess: (result) => setAnalyzeResult(result as AnalyzeResult),
        onError: () => toast({ title: "Error", description: "Could not analyze recipe. Make sure the URL is publicly accessible.", variant: "destructive" }),
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
    Promise.all(
      missing.map((ing) =>
        fetch("/api/grocery-list/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: ing.name, quantity: ing.quantity || "1", unit: ing.unit ?? undefined, category: ing.category }),
        })
      )
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: qKey });
      toast({
        title: `${missing.length} item${missing.length !== 1 ? "s" : ""} added!`,
        description: `Missing ingredients from "${analyzeResult.recipeName}" added.`,
      });
    }).catch(() => {
      toast({ title: "Error", description: "Some items could not be added.", variant: "destructive" });
    });
  }

  function handleSaveAsRecipe() {
    if (!analyzeResult) return;
    saveRecipeMutation.mutate(
      {
        data: {
          recipeName: analyzeResult.recipeName,
          cuisine: analyzeResult.cuisine ?? undefined,
          protein: analyzeResult.protein ?? undefined,
          isGlutenFree: analyzeResult.isGlutenFree ?? undefined,
          cookTimeMinutes: analyzeResult.cookTimeMinutes ?? undefined,
          calories: analyzeResult.calories ?? undefined,
          instructions: analyzeResult.instructions ?? null,
          sourceUrl: recipeUrl.trim() || null,
          assignToDay: selectedDay || null,
          ingredients: analyzeResult.ingredients,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: selectedDay
              ? `Recipe saved & added to ${DAY_SHORT[selectedDay] ?? selectedDay}!`
              : "Recipe saved to your library!",
            description: selectedDay ? "Check Weekly Plan to see it." : "Find it in Discover and Saved.",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setAnalyzerOpen(true); setAnalyzeResult(null); setRecipeUrl(""); }}
          >
            <Link className="w-3.5 h-3.5 mr-1.5" />
            Recipe Analyzer
          </Button>
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
                            {item.quantity}{item.unit ? ` ${item.unit}` : ""}
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

      {/* Recipe Analyzer Dialog */}
      <Dialog
        open={analyzerOpen}
        onOpenChange={(open) => {
          if (!open) { setAnalyzerOpen(false); setAnalyzeResult(null); setRecipeUrl(""); setSelectedDay(""); setShowInstructions(false); }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Link className="w-5 h-5" />
              Recipe Analyzer
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Paste a recipe URL — AI extracts ingredients, cross-checks your pantry, and lets you save it as a recipe in the app.
          </p>

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
              {/* Recipe header */}
              <div>
                <h3 className="font-semibold text-base font-serif">{analyzeResult.recipeName}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm mt-1">
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />{analyzeResult.haveCount} in pantry
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <ShoppingCart className="w-4 h-4" />{analyzeResult.needCount} to buy
                  </span>
                  {analyzeResult.cuisine && <span className="text-muted-foreground">{analyzeResult.cuisine}</span>}
                  {analyzeResult.cookTimeMinutes && <span className="text-muted-foreground">{analyzeResult.cookTimeMinutes} min</span>}
                  {analyzeResult.calories && <span className="text-muted-foreground">{analyzeResult.calories} kcal/serving</span>}
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
                      <BookOpen className="w-4 h-4 text-primary" />
                      Cooking Instructions
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

              {/* Day picker */}
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
                <Button
                  className="w-full gap-2"
                  onClick={handleSaveAsRecipe}
                  disabled={saveRecipeMutation.isPending}
                >
                  <BookOpen className="w-4 h-4" />
                  {saveRecipeMutation.isPending
                    ? "Saving…"
                    : selectedDay
                    ? `Save Recipe & Add to ${DAY_SHORT[selectedDay] ?? selectedDay}`
                    : "Save as Recipe in My App"}
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
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAddSuggestion(s)}>
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
