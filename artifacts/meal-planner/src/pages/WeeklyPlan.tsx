import { useState } from "react";
import { AiChatPanel } from "@/components/AiChatPanel";
import {
  useGetWeeklyPlan,
  getGetWeeklyPlanQueryKey,
  useGenerateWeeklyPlan,
  useUpdateDayMeal,
  useAddWeekToGroceryList,
  useGetWeeklyPlanPreferences,
  useSaveWeeklyPlanPreferences,
  useListMeals,
  useListCuisines,
  useListProteins,
  getListMealsQueryKey,
  getGetGroceryListQueryKey,
  getGetWeeklyPlanPreferencesQueryKey,
  useAnalyzeRecipeUrl,
  useSaveAnalyzedRecipe,
} from "@workspace/api-client-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Flame, Shuffle, ShoppingCart, Calendar, Settings2, ChevronDown, ChevronUp, BookOpen, Star, History, Link, Loader2, Search, CheckCircle2, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const ALL_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const DAY_EMOJIS: Record<string, string> = {
  sunday: "☀️", monday: "🌱", tuesday: "🌿", wednesday: "🥘",
  thursday: "🍲", friday: "🎉", saturday: "👨‍🍳",
};

function capitalizeDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

type PlanMeal = {
  id: number;
  name: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  calories: number;
  description?: string;
  instructions?: string | null;
  servings?: number;
  ingredients?: Array<{ id: number; name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean }>;
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

export function WeeklyPlan() {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [swapDay, setSwapDay] = useState<string | null>(null);
  const [swapSearch, setSwapSearch] = useState("");
  const [swapIgnorePrefs, setSwapIgnorePrefs] = useState(false);
  const [swapTab, setSwapTab] = useState<"all" | "favorites" | "history">("all");
  const [showPrefs, setShowPrefs] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<PlanMeal | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [recipeUrl, setRecipeUrl] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzerDay, setAnalyzerDay] = useState("");
  const [analyzerInstructionsOpen, setAnalyzerInstructionsOpen] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(false);
  const [replacingMealName, setReplacingMealName] = useState<string | null>(null);
  const [localPrefs, setLocalPrefs] = useState<{
    cuisine: string;
    proteins: string[];
    glutenFree: boolean;
    activeDays: string[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useGetWeeklyPlan({
    query: { queryKey: getGetWeeklyPlanQueryKey() },
  });

  const { data: preferences } = useGetWeeklyPlanPreferences({
    query: { queryKey: getGetWeeklyPlanPreferencesQueryKey() },
  });

  // Sync server preferences to local state on first load
  if (preferences && !localPrefs) {
    const p = preferences as { cuisine?: string | null; proteins?: string[]; glutenFree?: boolean | null; activeDays?: string[] };
    setLocalPrefs({
      cuisine: p.cuisine ?? "",
      proteins: p.proteins ?? [],
      glutenFree: p.glutenFree ?? false,
      activeDays: p.activeDays ?? [],
    });
  }

  const { data: allMeals } = useListMeals({}, { query: { queryKey: getListMealsQueryKey({}), enabled: !!swapDay } });
  const { data: cuisines } = useListCuisines();
  const { data: proteins } = useListProteins();

  type HistoryEntry = {
    id: number;
    name: string;
    cuisine: string;
    protein: string;
    isGlutenFree: boolean;
    cookTimeMinutes: number;
    calories: number;
    instructions: string | null;
    mealId: number | null;
  };
  const { data: historyItems } = useQuery<HistoryEntry[]>({
    queryKey: ["history"],
    queryFn: () => fetch("/api/history").then((r) => r.json()),
    enabled: !!swapDay,
  });

  const generateMutation = useGenerateWeeklyPlan();
  const updateDayMealMutation = useUpdateDayMeal();
  const addWeekToGroceryMutation = useAddWeekToGroceryList();
  const savePreferencesMutation = useSaveWeeklyPlanPreferences();
  const analyzeRecipeMutation = useAnalyzeRecipeUrl();
  const saveRecipeMutation = useSaveAnalyzedRecipe();

  const prefs = localPrefs ?? {
    cuisine: (preferences as { cuisine?: string | null } | undefined)?.cuisine ?? "",
    proteins: (preferences as { proteins?: string[] } | undefined)?.proteins ?? [],
    glutenFree: (preferences as { glutenFree?: boolean | null } | undefined)?.glutenFree ?? false,
    activeDays: (preferences as { activeDays?: string[] } | undefined)?.activeDays ?? [],
  };

  function handleSavePreferences() {
    savePreferencesMutation.mutate(
      {
        data: {
          cuisine: prefs.cuisine || null,
          proteins: prefs.proteins,
          glutenFree: prefs.glutenFree || null,
          activeDays: prefs.activeDays,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWeeklyPlanPreferencesQueryKey() });
          setShowPrefs(false);
          toast({ title: "Preferences saved!", description: "They'll be used next time you generate a plan." });
        },
        onError: () => toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" }),
      }
    );
  }

  function toggleProtein(p: string) {
    setLocalPrefs((prev) => {
      if (!prev) return prev;
      const has = prev.proteins.includes(p);
      return { ...prev, proteins: has ? prev.proteins.filter((x) => x !== p) : [...prev.proteins, p] };
    });
  }

  function toggleActiveDay(day: string) {
    setLocalPrefs((prev) => {
      if (!prev) return prev;
      const has = prev.activeDays.includes(day);
      return { ...prev, activeDays: has ? prev.activeDays.filter((d) => d !== day) : [...prev.activeDays, day] };
    });
  }

  function handleGenerate() {
    const activeDays = prefs.activeDays.length > 0 ? prefs.activeDays : ALL_DAYS;
    generateMutation.mutate(
      {
        data: {
          cuisine: prefs.cuisine || null,
          glutenFree: prefs.glutenFree || null,
          proteins: prefs.proteins.length > 0 ? prefs.proteins : undefined,
          // Pass activeDays as extra field (server reads from raw body)
          ...(prefs.activeDays.length > 0 ? { activeDays } : {}),
        } as Parameters<typeof generateMutation.mutate>[0]["data"],
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWeeklyPlanQueryKey() });
          toast({ title: "New week generated!", description: "Your weekly meal plan has been refreshed." });
        },
        onError: () => toast({ title: "Error", description: "Could not generate weekly plan.", variant: "destructive" }),
      }
    );
  }

  function handleSwapMeal(mealId: number) {
    if (!swapDay) return;
    updateDayMealMutation.mutate(
      { day: swapDay, data: { mealId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWeeklyPlanQueryKey() });
          setSwapDay(null);
          setSwapSearch("");
          toast({ title: "Meal swapped!" });
        },
        onError: () => toast({ title: "Error", description: "Could not swap meal.", variant: "destructive" }),
      }
    );
  }

  async function handleRemoveSelected() {
    const days = [...selectedDays];

    // Optimistically clear the meals from the cache immediately
    queryClient.setQueryData(getGetWeeklyPlanQueryKey(), (old: typeof plan) => {
      if (!old) return old;
      return {
        ...old,
        days: old.days.map((d) =>
          days.includes(d.day) ? { ...d, meal: null } : d
        ),
      };
    });
    setSelectedDays(new Set());
    toast({ title: `${days.length} recipe${days.length > 1 ? "s" : ""} removed.` });

    // Fire off server updates in the background, then re-sync
    await Promise.all(
      days.map((day) =>
        new Promise<void>((resolve, reject) =>
          updateDayMealMutation.mutate(
            { day, data: { mealId: null } },
            { onSuccess: () => resolve(), onError: reject }
          )
        )
      )
    );
    queryClient.invalidateQueries({ queryKey: getGetWeeklyPlanQueryKey() });
  }

  function toggleDaySelection(day: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  }

  function handleAnalyzeRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!recipeUrl.trim()) return;
    setAnalyzeResult(null);
    setAnalyzerInstructionsOpen(false);
    setRecipeSaved(false);
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
      toast({ title: "You have everything!", description: "All ingredients are in your pantry." });
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
      queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
      toast({
        title: `${missing.length} item${missing.length !== 1 ? "s" : ""} added!`,
        description: `Missing ingredients from "${analyzeResult.recipeName}" added to Grocery List.`,
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
          assignToDay: analyzerDay || null,
          ingredients: analyzeResult.ingredients,
        },
      },
      {
        onSuccess: () => {
          setRecipeSaved(true);
          queryClient.invalidateQueries({ queryKey: getGetWeeklyPlanQueryKey() });
          toast({
            title: analyzerDay
              ? `Recipe saved & added to ${DAY_SHORT[analyzerDay] ?? analyzerDay}!`
              : "Recipe saved to your library!",
            description: analyzerDay ? "Check your weekly plan below." : "Find it in Discover and Saved.",
          });
        },
        onError: () => toast({ title: "Error", description: "Could not save recipe.", variant: "destructive" }),
      }
    );
  }

  function handleAddAllToGrocery() {
    if (!plan) return;
    const plannedMeals = plan.days.filter((d) => d.meal);
    if (plannedMeals.length === 0) {
      toast({ title: "No meals planned", description: "Add meals to your week first." });
      return;
    }

    addWeekToGroceryMutation.mutate(undefined, {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
        const r = result as { added: number; mealsProcessed: number };
        toast({
          title: "Week added to grocery list!",
          description: `${r.added} ingredients added from ${r.mealsProcessed} meal${r.mealsProcessed !== 1 ? "s" : ""}.`,
        });
      },
      onError: () => toast({ title: "Error", description: "Could not add week to grocery list.", variant: "destructive" }),
    });
  }

  // Saved prefs from server (used for swap filtering — not the unsaved local edits)
  const savedPrefs = preferences as { cuisine?: string | null; proteins?: string[]; glutenFree?: boolean | null } | undefined;

  const filteredMeals = allMeals?.filter((m) => {
    // Text search
    if (swapSearch && !m.name.toLowerCase().includes(swapSearch.toLowerCase()) &&
        !m.cuisine.toLowerCase().includes(swapSearch.toLowerCase()) &&
        !m.protein.toLowerCase().includes(swapSearch.toLowerCase())) return false;
    // Preference filters (unless overridden)
    if (!swapIgnorePrefs) {
      if (savedPrefs?.cuisine && m.cuisine !== savedPrefs.cuisine) return false;
      if (savedPrefs?.glutenFree && !m.isGlutenFree) return false;
      if (savedPrefs?.proteins && savedPrefs.proteins.length > 0 && !savedPrefs.proteins.includes(m.protein)) return false;
    }
    return true;
  });

  const favoriteMeals = allMeals?.filter((m) => {
    if (!m.isFavorited) return false;
    if (swapSearch && !m.name.toLowerCase().includes(swapSearch.toLowerCase()) &&
        !m.cuisine.toLowerCase().includes(swapSearch.toLowerCase()) &&
        !m.protein.toLowerCase().includes(swapSearch.toLowerCase())) return false;
    return true;
  });

  const seenMealIds = new Set<number>();
  const historyMeals = (historyItems ?? [])
    .filter((e) => {
      if (e.mealId == null) return false;
      if (seenMealIds.has(e.mealId)) return false;
      seenMealIds.add(e.mealId);
      return true;
    })
    .filter((e) => {
      if (!swapSearch) return true;
      return e.name.toLowerCase().includes(swapSearch.toLowerCase()) ||
             e.cuisine.toLowerCase().includes(swapSearch.toLowerCase());
    });

  const totalCalories = plan?.days.reduce((sum, d) => sum + (d.meal?.calories ?? 0), 0) ?? 0;
  const plannedDays = plan?.days.filter((d) => d.meal).length ?? 0;

  const prefsActive = prefs.cuisine || prefs.proteins.length > 0 || prefs.glutenFree || prefs.activeDays.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Weekly Plan</h1>
          <p className="text-muted-foreground">Your week at a glance.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedDays.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleRemoveSelected} disabled={updateDayMealMutation.isPending}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Recipe{selectedDays.size > 1 ? "s" : ""} ({selectedDays.size})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleAddAllToGrocery}
            disabled={!plan || plannedDays === 0 || addWeekToGroceryMutation.isPending}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {addWeekToGroceryMutation.isPending ? "Adding…" : "Add Week to Grocery List"}
          </Button>
          <Button
            variant={showPrefs ? "secondary" : "outline"}
            onClick={() => setShowPrefs((v) => !v)}
            className="gap-1.5"
          >
            <Settings2 className="w-4 h-4" />
            Preferences
            {prefsActive && <span className="w-2 h-2 rounded-full bg-primary" />}
            {showPrefs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => { setAnalyzerOpen(true); setAnalyzeResult(null); setRecipeUrl(""); setAnalyzerDay(""); setRecipeSaved(false); }}
          >
            <Link className="w-4 h-4 mr-2" />
            Recipe Analyzer
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            <Shuffle className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? "Generating…" : "Generate New Week"}
          </Button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPrefs && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Generation Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cuisine */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Cuisine</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLocalPrefs((p) => p ? { ...p, cuisine: "" } : p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    !prefs.cuisine ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"
                  }`}
                >
                  Any
                </button>
                {cuisines?.map((c) => (
                  <button
                    key={c}
                    onClick={() => setLocalPrefs((p) => p ? { ...p, cuisine: p.cuisine === c ? "" : c } : p)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      prefs.cuisine === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Proteins */}
            <div>
              <label className="text-sm font-medium mb-2 block">Protein Types (select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {proteins?.map((p) => (
                  <button
                    key={p}
                    onClick={() => toggleProtein(p)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      prefs.proteins.includes(p) ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card border-border text-muted-foreground hover:border-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Gluten Free */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocalPrefs((p) => p ? { ...p, glutenFree: !p.glutenFree } : p)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  prefs.glutenFree ? "bg-green-600 text-white border-green-600" : "bg-card border-border text-muted-foreground hover:border-green-600"
                }`}
              >
                Gluten-Free Only
              </button>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setShowPrefs(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSavePreferences} disabled={savePreferencesMutation.isPending}>
                {savePreferencesMutation.isPending ? "Saving…" : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week summary */}
      {!isLoading && plan && plannedDays > 0 && (
        <div className="flex gap-4 p-4 bg-muted rounded-xl text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">{plannedDays} / 7 days planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>~{Math.round(totalCalories / plannedDays)} kcal/day avg</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {plan?.days.map((day) => (
            <Card key={day.day} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center min-w-0">
                  {/* Day label */}
                  <div className="w-20 shrink-0 p-4 border-r bg-muted/40 flex flex-col items-center">
                    <span className="text-lg">{DAY_EMOJIS[day.day] ?? "📅"}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{DAY_SHORT[day.day] ?? day.day}</span>
                  </div>

                  {/* Meal info */}
                  <div className="flex-1 min-w-0 p-4">
                    {day.meal ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <Checkbox
                            className="mt-1 shrink-0 w-3.5 h-3.5"
                            checked={selectedDays.has(day.day)}
                            onCheckedChange={() => toggleDaySelection(day.day)}
                          />
                          <button
                            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                            onClick={() => { setSelectedMeal(day.meal as PlanMeal); setShowInstructions(false); }}
                          >
                            <p className="font-semibold text-base leading-snug">{day.meal.name}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{day.meal.cookTimeMinutes}m</span>
                              <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" />{day.meal.calories} kcal</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{day.meal.cuisine}</Badge>
                              {day.meal.isGlutenFree && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500 text-green-600">GF</Badge>}
                            </div>
                          </button>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 mt-0.5" onClick={() => setSwapDay(day.day)}>
                          <Shuffle className="w-3.5 h-3.5 mr-1" />
                          Swap
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm italic">No meal planned</span>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSwapDay(day.day)}>
                          <Shuffle className="w-3.5 h-3.5 mr-1" />
                          Swap
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Chat Panel */}
      <AiChatPanel />

      {/* Meal detail dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) { setSelectedMeal(null); setShowInstructions(false); } }}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-4">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <Badge variant="secondary">{selectedMeal.cuisine}</Badge>
                  {selectedMeal.isGlutenFree && <Badge variant="outline" className="border-green-500 text-green-600">GF</Badge>}
                  <Badge variant="outline">{selectedMeal.protein}</Badge>
                </div>
                <DialogTitle className="font-serif text-xl leading-tight">{selectedMeal.name}</DialogTitle>
              </DialogHeader>

              <div className="flex gap-4 text-sm text-muted-foreground border-y py-2">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedMeal.cookTimeMinutes} min</span>
                <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{selectedMeal.calories} kcal</span>
              </div>

              {selectedMeal.description && (
                <p className="text-sm text-muted-foreground">{selectedMeal.description}</p>
              )}

              {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingredients</p>
                  <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {selectedMeal.ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-baseline gap-2 text-sm px-2.5 py-1 rounded-md bg-muted/40 border border-border">
                        <span className="font-medium tabular-nums shrink-0 text-foreground">
                          {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                        <span className="text-muted-foreground">{ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMeal.instructions ? (
                <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                    onClick={() => setShowInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      How to Cook This
                    </span>
                    {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showInstructions && (
                    <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedMeal.instructions}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No cooking instructions available.</p>
              )}

              <Button variant="outline" className="mt-auto" onClick={() => { setSelectedMeal(null); setShowInstructions(false); }}>
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Recipe Analyzer Dialog */}
      <Dialog
        open={analyzerOpen}
        onOpenChange={(open) => {
          if (!open) { setAnalyzerOpen(false); setAnalyzeResult(null); setRecipeUrl(""); setAnalyzerDay(""); setAnalyzerInstructionsOpen(false); setRecipeSaved(false); setReplacingMealName(null); }
        }}
      >
        <DialogContent className="top-4 translate-y-0 max-w-sm max-h-[80vh] flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2 text-base">
              <Link className="w-4 h-4" />
              Recipe Analyzer
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">
            Paste a URL — AI extracts ingredients, checks your pantry, and saves it as a recipe.
          </p>

          <form onSubmit={handleAnalyzeRecipe} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-w-0"
              placeholder="https://allrecipes.com/recipe/…"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              type="url"
              required
            />
            <Button type="submit" size="sm" disabled={analyzeRecipeMutation.isPending || !recipeUrl.trim()} className="shrink-0 gap-1">
              {analyzeRecipeMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />}
            </Button>
          </form>

          {analyzeResult && (
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {/* Success banner */}
              {recipeSaved && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    {analyzerDay ? `Saved & added to ${DAY_SHORT[analyzerDay] ?? analyzerDay}!` : "Saved to Discover & Saved!"}
                  </p>
                </div>
              )}

              {/* Recipe header */}
              <div>
                <h3 className="font-semibold text-sm font-serif leading-snug">{analyzeResult.recipeName}</h3>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs mt-1">
                  <span className="flex items-center gap-0.5 text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />{analyzeResult.haveCount} have
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-700">
                    <ShoppingCart className="w-3.5 h-3.5" />{analyzeResult.needCount} to buy
                  </span>
                  {analyzeResult.cuisine && <span className="text-muted-foreground">{analyzeResult.cuisine}</span>}
                  {analyzeResult.cookTimeMinutes && <span className="text-muted-foreground">{analyzeResult.cookTimeMinutes}m</span>}
                  {analyzeResult.calories && <span className="text-muted-foreground">{analyzeResult.calories} kcal</span>}
                </div>
              </div>

              {/* Instructions collapsible */}
              {analyzeResult.instructions && (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-xs font-medium"
                    onClick={() => setAnalyzerInstructionsOpen((v) => !v)}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      Cooking Instructions
                    </span>
                    {analyzerInstructionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {analyzerInstructionsOpen && (
                    <div className="px-3 py-2.5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {analyzeResult.instructions}
                    </div>
                  )}
                </div>
              )}

              {/* Ingredient list */}
              <div className="space-y-1">
                {analyzeResult.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs border ${
                      ing.inPantry ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <span className={ing.inPantry ? "text-green-800" : "text-amber-800"}>
                      {ing.quantity} {ing.unit ? `${ing.unit} ` : ""}{ing.name}
                    </span>
                    <span className={`font-medium shrink-0 ml-2 ${ing.inPantry ? "text-green-600" : "text-amber-600"}`}>
                      {ing.inPantry ? "✓" : "Need"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day picker */}
              <div className="border rounded-lg p-2.5 space-y-1.5 bg-muted/30">
                <p className="text-[11px] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  Add to Weekly Plan (optional)
                </p>
                <div className="flex flex-wrap gap-1">
                  {ALL_DAYS.map((day) => {
                    const existingMeal = plan?.days.find((d) => d.day === day)?.meal;
                    const isSelected = analyzerDay === day;
                    const hasMeal = !!existingMeal;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setAnalyzerDay("");
                            setReplacingMealName(null);
                          } else {
                            setAnalyzerDay(day);
                            setReplacingMealName(hasMeal ? existingMeal!.name : null);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors border relative ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : hasMeal
                            ? "bg-amber-50 border-amber-300 text-amber-800 hover:border-primary hover:bg-primary/10 hover:text-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary"
                        }`}
                      >
                        {DAY_SHORT[day]}
                        {hasMeal && !isSelected && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Replace warning */}
                {replacingMealName && analyzerDay && (
                  <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200">
                    <span className="text-amber-500 text-xs mt-0.5">⚠</span>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      <span className="font-semibold">"{replacingMealName}"</span> is already on {DAY_SHORT[analyzerDay]}. Saving will replace it.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pb-1">
                {analyzeResult.needCount > 0 && (
                  <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleAddMissingToGrocery}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add {analyzeResult.needCount} Missing to Grocery List
                  </Button>
                )}
                {!recipeSaved ? (
                  <Button
                    size="sm"
                    className={`w-full gap-1.5 ${replacingMealName ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                    onClick={handleSaveAsRecipe}
                    disabled={saveRecipeMutation.isPending}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {saveRecipeMutation.isPending
                      ? "Saving…"
                      : replacingMealName && analyzerDay
                      ? `Replace & Save to ${DAY_SHORT[analyzerDay]}`
                      : analyzerDay
                      ? `Save & Add to ${DAY_SHORT[analyzerDay] ?? analyzerDay}`
                      : "Save as Recipe in My App"}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setAnalyzerOpen(false)}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Swap meal dialog */}
      <Dialog open={!!swapDay} onOpenChange={(open) => { if (!open) { setSwapDay(null); setSwapSearch(""); setSwapIgnorePrefs(false); setSwapTab("all"); } }}>
        <DialogContent className="max-w-lg max-h-[75vh] flex flex-col gap-0 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-3">
            <DialogHeader>
              <DialogTitle className="font-serif">Pick a Meal for {swapDay ? capitalizeDay(swapDay) : ""}</DialogTitle>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6">
            {(["all", "favorites", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSwapTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                  swapTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "favorites" && <Star className="w-3.5 h-3.5" />}
                {tab === "history" && <History className="w-3.5 h-3.5" />}
                {tab === "all" ? "All Meals" : tab === "history" ? "Saved" : "Favorites"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 flex-1 min-h-0 px-6 py-4">
            <input
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search by name, cuisine, or protein…"
              value={swapSearch}
              onChange={(e) => setSwapSearch(e.target.value)}
              autoFocus
            />

            {/* Active preference filters notice — All tab only */}
            {swapTab === "all" && (() => {
              const activeFilters: string[] = [];
              if (!swapIgnorePrefs) {
                if (savedPrefs?.cuisine) activeFilters.push(savedPrefs.cuisine);
                if (savedPrefs?.proteins && savedPrefs.proteins.length > 0) activeFilters.push(savedPrefs.proteins.join(", "));
                if (savedPrefs?.glutenFree) activeFilters.push("Gluten-Free");
              }
              if (activeFilters.length === 0) return null;
              return (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 text-xs">
                  <span className="text-primary font-medium">
                    Filtered by preferences: {activeFilters.join(" · ")}
                  </span>
                  <button
                    onClick={() => setSwapIgnorePrefs(true)}
                    className="text-muted-foreground hover:text-foreground underline ml-2 shrink-0"
                  >
                    Show all
                  </button>
                </div>
              );
            })()}

            {swapTab === "all" && swapIgnorePrefs && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted border text-xs">
                <span className="text-muted-foreground">Showing all meals</span>
                <button
                  onClick={() => setSwapIgnorePrefs(false)}
                  className="text-primary hover:underline ml-2 shrink-0"
                >
                  Apply preferences
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {swapTab === "favorites" ? (
                !favoriteMeals?.length ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-medium mb-1">No favorites yet</p>
                    <p>Tap the heart on any meal in Discover to save it here.</p>
                  </div>
                ) : (
                  favoriteMeals.map((m) => (
                    <button
                      key={m.id}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-muted transition-colors"
                      onClick={() => handleSwapMeal(m.id)}
                      disabled={updateDayMealMutation.isPending}
                    >
                      <p className="font-medium leading-snug">{m.name}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{m.cuisine}</Badge>
                        {m.isGlutenFree && <Badge variant="outline" className="text-xs border-green-500 text-green-600">GF</Badge>}
                        <span className="text-xs text-muted-foreground">{m.cookTimeMinutes}m · {m.calories} kcal · {m.protein}</span>
                      </div>
                    </button>
                  ))
                )
              ) : swapTab === "history" ? (
                !historyMeals.length ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="font-medium mb-1">No saved recipes yet</p>
                    <p>Recipes you add to your grocery list will appear here.</p>
                  </div>
                ) : (
                  historyMeals.map((e) => (
                    <button
                      key={e.id}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-muted transition-colors"
                      onClick={() => e.mealId != null && handleSwapMeal(e.mealId)}
                      disabled={updateDayMealMutation.isPending || e.mealId == null}
                    >
                      <p className="font-medium leading-snug">{e.name}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{e.cuisine}</Badge>
                        {e.isGlutenFree && <Badge variant="outline" className="text-xs border-green-500 text-green-600">GF</Badge>}
                        <span className="text-xs text-muted-foreground">{e.cookTimeMinutes}m · {e.calories} kcal · {e.protein}</span>
                      </div>
                    </button>
                  ))
                )
              ) : (
                filteredMeals?.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    <p className="font-medium mb-1">No meals match</p>
                    <p>
                      {swapIgnorePrefs
                        ? "Try a different search term."
                        : "Your preferences are filtering results."}
                    </p>
                    {!swapIgnorePrefs && (
                      <button
                        onClick={() => setSwapIgnorePrefs(true)}
                        className="mt-2 text-primary hover:underline"
                      >
                        Show all meals
                      </button>
                    )}
                  </div>
                ) : (
                  filteredMeals?.map((m) => (
                    <button
                      key={m.id}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-muted transition-colors"
                      onClick={() => handleSwapMeal(m.id)}
                      disabled={updateDayMealMutation.isPending}
                    >
                      <p className="font-medium leading-snug">{m.name}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{m.cuisine}</Badge>
                        {m.isGlutenFree && <Badge variant="outline" className="text-xs border-green-500 text-green-600">GF</Badge>}
                        <span className="text-xs text-muted-foreground">{m.cookTimeMinutes}m · {m.calories} kcal · {m.protein}</span>
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
