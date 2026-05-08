import { useState } from "react";
import {
  useGetWeeklyPlan,
  getGetWeeklyPlanQueryKey,
  useGenerateWeeklyPlan,
  useUpdateDayMeal,
  useAddMealToGroceryList,
  useListMeals,
  getListMealsQueryKey,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Flame, Shuffle, ShoppingCart, ChevronRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DayMeal = {
  id: number;
  name: string;
  cuisine: string;
  cookTimeMinutes: number;
  calories: number;
  protein: string;
  isGlutenFree: boolean;
};

type Day = {
  day: string;
  dayIndex: number;
  meal: DayMeal | null;
};

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plan, isLoading } = useGetWeeklyPlan({
    query: { queryKey: getGetWeeklyPlanQueryKey() },
  });

  const { data: allMeals } = useListMeals({}, { query: { queryKey: getListMealsQueryKey({}), enabled: !!swapDay } });

  const generateMutation = useGenerateWeeklyPlan();
  const updateDayMealMutation = useUpdateDayMeal();
  const addMealMutation = useAddMealToGroceryList();

  function handleGenerate() {
    generateMutation.mutate(
      { data: {} },
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
    const mealIds = plan.days.filter((d) => d.meal).map((d) => d.meal!.id);
    const unique = [...new Set(mealIds)];
    let done = 0;
    let added = 0;

    if (unique.length === 0) {
      toast({ title: "No meals planned", description: "Add meals to your week first." });
      return;
    }

    toast({ title: "Adding all meals…", description: `Adding ${unique.length} meals to your grocery list.` });

    for (const id of unique) {
      addMealMutation.mutate(
        { mealId: id },
        {
          onSuccess: () => {
            added++;
            done++;
            if (done === unique.length) {
              queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
              toast({ title: "All meals added!", description: `${added} meals added to your grocery list.` });
            }
          },
          onError: () => {
            done++;
            if (done === unique.length) {
              queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
            }
          },
        }
      );
    }
  }

  const filteredMeals = allMeals?.filter((m) =>
    !swapSearch || m.name.toLowerCase().includes(swapSearch.toLowerCase()) ||
    m.cuisine.toLowerCase().includes(swapSearch.toLowerCase())
  );

  const totalCalories = plan?.days.reduce((sum, d) => sum + (d.meal?.calories ?? 0), 0) ?? 0;
  const plannedDays = plan?.days.filter((d) => d.meal).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Weekly Plan</h1>
          <p className="text-muted-foreground">Your week at a glance.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleAddAllToGrocery} disabled={!plan || plannedDays === 0}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add Week to Grocery List
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            <Shuffle className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? "Generating…" : "Generate New Week"}
          </Button>
        </div>
      </div>

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
                <div className="flex items-center">
                  {/* Day label */}
                  <div className="w-20 shrink-0 p-4 border-r bg-muted/40 flex flex-col items-center">
                    <span className="text-lg">{DAY_EMOJIS[day.day] ?? "📅"}</span>
                    <span className="text-sm font-semibold text-muted-foreground">{DAY_SHORT[day.day] ?? day.day}</span>
                  </div>

                  {/* Meal info */}
                  <div className="flex-1 p-4">
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
                        <span className="text-muted-foreground text-sm">No meal planned</span>
                        <Button variant="outline" size="sm" onClick={() => setSwapDay(day.day)}>
                          <ChevronRight className="w-3.5 h-3.5 mr-1" />
                          Pick Meal
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
      <Dialog open={!!swapDay} onOpenChange={(open) => { if (!open) { setSwapDay(null); setSwapSearch(""); } }}>
        <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-serif">Pick a Meal for {swapDay ? capitalizeDay(swapDay) : ""}</DialogTitle>
          </DialogHeader>
          <input
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search meals or cuisine…"
            value={swapSearch}
            onChange={(e) => setSwapSearch(e.target.value)}
            autoFocus
          />
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredMeals?.map((m) => (
              <button
                key={m.id}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-muted transition-colors"
                onClick={() => handleSwapMeal(m.id)}
                disabled={updateDayMealMutation.isPending}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.name}</span>
                  <Badge variant="secondary" className="text-xs">{m.cuisine}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {m.cookTimeMinutes}m • {m.calories} kcal • {m.protein}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
