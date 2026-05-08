import { useState } from "react";
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
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Flame, Shuffle, ShoppingCart, ChevronRight, Calendar, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const DAY_EMOJIS: Record<string, string> = {
  monday: "🌱", tuesday: "🌿", wednesday: "🥘", thursday: "🍲",
  friday: "🎉", saturday: "👨‍🍳", sunday: "☀️",
};

function capitalizeDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function WeeklyPlan() {
  const [swapDay, setSwapDay] = useState<string | null>(null);
  const [swapSearch, setSwapSearch] = useState("");
  const [swapIgnorePrefs, setSwapIgnorePrefs] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
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

  const generateMutation = useGenerateWeeklyPlan();
  const updateDayMealMutation = useUpdateDayMeal();
  const addWeekToGroceryMutation = useAddWeekToGroceryList();
  const savePreferencesMutation = useSaveWeeklyPlanPreferences();

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
            {/* Active Days */}
            <div>
              <label className="text-sm font-medium mb-2 block">Active Days (leave empty for all 7)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleActiveDay(day)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      prefs.activeDays.includes(day)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {DAY_SHORT[day]}
                  </button>
                ))}
                {prefs.activeDays.length > 0 && (
                  <button
                    onClick={() => setLocalPrefs((p) => p ? { ...p, activeDays: [] } : p)}
                    className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border"
                  >
                    All days
                  </button>
                )}
              </div>
              {prefs.activeDays.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Planning {prefs.activeDays.length} day{prefs.activeDays.length !== 1 ? "s" : ""} — blank days will have no meal assigned.
                </p>
              )}
            </div>

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
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base leading-tight truncate">{day.meal.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{day.meal.cookTimeMinutes}m</span>
                            <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" />{day.meal.calories} kcal</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{day.meal.cuisine}</Badge>
                            {day.meal.isGlutenFree && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500 text-green-600">GF</Badge>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSwapDay(day.day)}>
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

      {/* Swap meal dialog */}
      <Dialog open={!!swapDay} onOpenChange={(open) => { if (!open) { setSwapDay(null); setSwapSearch(""); setSwapIgnorePrefs(false); } }}>
        <DialogContent className="max-w-lg max-h-[75vh] flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="font-serif">Pick a Meal for {swapDay ? capitalizeDay(swapDay) : ""}</DialogTitle>
          </DialogHeader>

          <input
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search by name, cuisine, or protein…"
            value={swapSearch}
            onChange={(e) => setSwapSearch(e.target.value)}
            autoFocus
          />

          {/* Active preference filters notice */}
          {(() => {
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

          {swapIgnorePrefs && (
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
            {filteredMeals?.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
