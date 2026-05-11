import { useState } from "react";
import {
  useListRecipeHistory,
  useDeleteRecipeHistory,
  getListRecipeHistoryQueryKey,
  useListMeals,
  getListMealsQueryKey,
  useAddMealToGroceryList,
  getGetGroceryListQueryKey,
  useGetPins,
  getGetPinsQueryKey,
  useRemovePin,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Trash2,
  Clock,
  Flame,
  ChefHat,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Ingredient = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  category: string;
};

type HistoryEntry = {
  id: number;
  name: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  calories: number;
  instructions: string | null;
  sourceUrl: string | null;
  mealId: number | null;
  addedAt: string;
};

type FavMeal = {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  calories: number;
  isFavorited: boolean;
  instructions?: string | null;
  ingredients?: Ingredient[];
};

export function CookingBoard() {
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedFavMeal, setSelectedFavMeal] = useState<FavMeal | null>(null);
  const [showFavInstructions, setShowFavInstructions] = useState(false);
  const [unpinTarget, setUnpinTarget] = useState<HistoryEntry | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getListRecipeHistoryQueryKey();
  const allMealsKey = getListMealsQueryKey({});
  const pinsQueryKey = getGetPinsQueryKey();

  const { data: entries, isLoading: historyLoading } = useListRecipeHistory({ query: { queryKey: qKey } });
  const deleteMutation = useDeleteRecipeHistory();

  const { data: listMealsData, isLoading: mealsLoading } = useListMeals(
    {},
    { query: { queryKey: allMealsKey } }
  );
  const allMeals = listMealsData?.meals;
  const addToGroceryMutation = useAddMealToGroceryList();

  const { data: pinsData, isLoading: pinsLoading } = useGetPins({
    query: { queryKey: pinsQueryKey },
  });
  const removePinMutation = useRemovePin();

  const isLoading = historyLoading || mealsLoading || pinsLoading;

  const pinnedIds = new Set<number>(pinsData?.recipeIds ?? []);
  const pinnedMealIds = new Set<number>(pinsData?.mealIds ?? []);

  const allEntries = (entries ?? []) as HistoryEntry[];
  const pinnedEntries = allEntries.filter((e) => pinnedIds.has(e.id));

  const mealMap = new Map<number, FavMeal>(
    ((allMeals ?? []) as FavMeal[]).map((m) => [m.id, m])
  );

  const pinnedMeals = [...pinnedMealIds]
    .map((id) => mealMap.get(id))
    .filter((m): m is FavMeal => m != null);

  const hasItems = pinnedEntries.length > 0 || pinnedMeals.length > 0;

  function handleUnpinEntry(entry: HistoryEntry, action: "back" | "delete") {
    removePinMutation.mutate(
      { itemType: "recipe", itemId: entry.id },
      {
        onSuccess: () => {
          queryClient.setQueryData(pinsQueryKey, (old: typeof pinsData) =>
            old ? { ...old, recipeIds: old.recipeIds.filter((id) => id !== entry.id) } : old
          );
          setUnpinTarget(null);

          if (action === "delete") {
            deleteMutation.mutate(
              { id: entry.id },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: qKey });
                  toast({ title: `"${entry.name}" removed from Saved.` });
                },
                onError: () => toast({ title: "Error", description: "Could not remove.", variant: "destructive" }),
              }
            );
          } else {
            toast({ title: `"${entry.name}" unpinned from Cooking Board.` });
          }
        },
        onError: () => toast({ title: "Error", description: "Could not unpin item.", variant: "destructive" }),
      }
    );
  }

  function handleUnpinMeal(mealId: number, mealName: string) {
    removePinMutation.mutate(
      { itemType: "meal", itemId: mealId },
      {
        onSuccess: () => {
          queryClient.setQueryData(pinsQueryKey, (old: typeof pinsData) =>
            old ? { ...old, mealIds: old.mealIds.filter((id) => id !== mealId) } : old
          );
          toast({ title: `"${mealName}" removed from Cooking Board.` });
        },
        onError: () => toast({ title: "Error", description: "Could not unpin meal.", variant: "destructive" }),
      }
    );
  }

  function handleAddMealToGrocery(meal: FavMeal) {
    addToGroceryMutation.mutate(
      { mealId: meal.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          toast({ title: `"${meal.name}" added to grocery list!` });
        },
        onError: () =>
          toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" }),
      }
    );
  }

  const IngredientsList = ({ ingredients }: { ingredients: Ingredient[] }) => (
    <div className="mt-2.5 pt-2.5 border-t border-border/60">
      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
        <ShoppingBasket className="w-3 h-3 text-primary" />
        Ingredients
      </p>
      <ul className="grid grid-cols-1 gap-0.5">
        {ingredients.map((ing) => (
          <li key={ing.id} className="text-xs text-muted-foreground flex gap-1">
            <span className="font-medium text-foreground whitespace-nowrap">
              {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
            </span>
            <span>{ing.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const RecipeCard = ({ entry }: { entry: HistoryEntry }) => {
    const meal = entry.mealId != null ? mealMap.get(entry.mealId) : undefined;
    const ingredients = meal?.ingredients ?? [];

    return (
      <Card
        className="cursor-pointer border-amber-300/60 bg-amber-50/50 hover:border-amber-400/80 dark:bg-amber-950/20 transition-colors"
        onClick={() => {
          setSelected(entry);
          setShowInstructions(false);
        }}
      >
        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{entry.name}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant="secondary" className="text-xs">{entry.cuisine}</Badge>
                {entry.isGlutenFree && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">Gluten Free</Badge>
                )}
                {entry.cookTimeMinutes > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />{entry.cookTimeMinutes}m
                  </span>
                )}
                {entry.calories > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3" />{entry.calories}kcal
                  </span>
                )}
              </div>
              {ingredients.length > 0 && <IngredientsList ingredients={ingredients} />}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                className="p-1.5 text-amber-500 hover:text-amber-600 transition-colors rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnpinTarget(entry);
                }}
                title="Remove from Cooking Board"
              >
                <PinOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MealCard = ({ meal }: { meal: FavMeal }) => (
    <Card
      className="cursor-pointer border-amber-300/60 bg-amber-50/50 hover:border-amber-400/80 dark:bg-amber-950/20 transition-colors"
      onClick={() => {
        setSelectedFavMeal(meal);
        setShowFavInstructions(false);
      }}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">{meal.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge variant="secondary" className="text-xs">{meal.cuisine}</Badge>
              {meal.isGlutenFree && (
                <Badge variant="outline" className="text-xs border-green-500 text-green-600">Gluten Free</Badge>
              )}
              {meal.cookTimeMinutes > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{meal.cookTimeMinutes}m
                </span>
              )}
              {meal.calories > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3" />{meal.calories}kcal
                </span>
              )}
            </div>
            {meal.ingredients && meal.ingredients.length > 0 && (
              <IngredientsList ingredients={meal.ingredients} />
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleAddMealToGrocery(meal);
              }}
              title="Add to grocery list"
              disabled={addToGroceryMutation.isPending}
            >
              <ShoppingBasket className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 text-amber-500 hover:text-amber-600 transition-colors rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleUnpinMeal(meal.id, meal.name);
              }}
              title="Remove from Cooking Board"
            >
              <PinOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1">Cooking Board</h1>
        <p className="text-muted-foreground">Recipes and meals pinned for your next cook.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-xl" />)}
        </div>
      ) : !hasItems ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed rounded-xl">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-25" />
          <p className="font-medium text-sm mb-1">Your Cooking Board is empty</p>
          <p className="text-xs max-w-xs mx-auto">
            Pin meals from the Weekly Plan, or pin saved recipes from the Saved tab, to keep them front and centre while you cook.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Pinned</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {pinnedEntries.length + pinnedMeals.length} item{pinnedEntries.length + pinnedMeals.length !== 1 ? "s" : ""}
            </span>
          </div>
          {pinnedEntries.map((entry) => (
            <RecipeCard key={`h-${entry.id}`} entry={entry} />
          ))}
          {pinnedMeals.map((meal) => (
            <MealCard key={`m-${meal.id}`} meal={meal} />
          ))}
        </div>
      )}

      {/* Unpin recipe dialog */}
      <Dialog open={!!unpinTarget} onOpenChange={(open) => { if (!open) setUnpinTarget(null); }}>
        {unpinTarget && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <PinOff className="w-5 h-5 text-muted-foreground" />
                Remove from Cooking Board
              </DialogTitle>
              <DialogDescription>
                What would you like to do with{" "}
                <span className="font-medium text-foreground">"{unpinTarget.name}"</span>?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3 px-4"
                onClick={() => handleUnpinEntry(unpinTarget, "back")}
                disabled={removePinMutation.isPending}
              >
                <Pin className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Keep in Saved</p>
                  <p className="text-xs text-muted-foreground">Unpin it — it stays in your Saved Recipes list</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5"
                onClick={() => handleUnpinEntry(unpinTarget, "delete")}
                disabled={deleteMutation.isPending || removePinMutation.isPending}
              >
                <Trash2 className="w-4 h-4 text-destructive shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm text-destructive">Remove from Saved</p>
                  <p className="text-xs text-muted-foreground">Delete from your Saved Recipes list entirely</p>
                </div>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setUnpinTarget(null)} className="mt-1">
                Cancel
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Recipe detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl leading-tight">{selected.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selected.cuisine}</Badge>
              {selected.isGlutenFree && (
                <Badge variant="outline" className="border-green-500 text-green-600">Gluten-Free</Badge>
              )}
              {selected.protein && <Badge variant="outline">{selected.protein}</Badge>}
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              {selected.cookTimeMinutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{selected.cookTimeMinutes} min
                </span>
              )}
              {selected.calories > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />{selected.calories} kcal
                </span>
              )}
            </div>

            {selected.sourceUrl && (
              <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View original recipe
              </a>
            )}

            <div className="overflow-y-auto flex-1 space-y-3 min-h-0">
              {(() => {
                const meal = selected.mealId != null ? mealMap.get(selected.mealId) : undefined;
                const ingredients = meal?.ingredients ?? [];
                return ingredients.length > 0 ? (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <ShoppingBasket className="w-4 h-4 text-primary" />
                      Ingredients
                    </p>
                    <ul className="space-y-1">
                      {ingredients.map((ing) => (
                        <li key={ing.id} className="flex items-baseline gap-2 text-sm px-2.5 py-1 rounded-md bg-muted/40 border border-border">
                          <span className="font-medium tabular-nums shrink-0">
                            {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                          </span>
                          <span className="text-muted-foreground">{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              {selected.instructions && (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
                    onClick={() => setShowInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      Instructions
                    </span>
                    {showInstructions ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {showInstructions && (
                    <div className="px-4 pb-4 border-t">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mt-3">{selected.instructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Meal detail dialog */}
      <Dialog open={!!selectedFavMeal} onOpenChange={(open) => { if (!open) setSelectedFavMeal(null); }}>
        {selectedFavMeal && (
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl leading-tight">{selectedFavMeal.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selectedFavMeal.cuisine}</Badge>
              {selectedFavMeal.isGlutenFree && (
                <Badge variant="outline" className="border-green-500 text-green-600">Gluten-Free</Badge>
              )}
              {selectedFavMeal.protein && <Badge variant="outline">{selectedFavMeal.protein}</Badge>}
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              {selectedFavMeal.cookTimeMinutes > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{selectedFavMeal.cookTimeMinutes} min
                </span>
              )}
              {selectedFavMeal.calories > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />{selectedFavMeal.calories} kcal
                </span>
              )}
            </div>

            {selectedFavMeal.description && (
              <p className="text-sm text-muted-foreground">{selectedFavMeal.description}</p>
            )}

            <div className="overflow-y-auto flex-1 space-y-3 min-h-0">
              {selectedFavMeal.ingredients && selectedFavMeal.ingredients.length > 0 && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <ShoppingBasket className="w-4 h-4 text-primary" />
                    Ingredients
                  </p>
                  <ul className="space-y-1">
                    {selectedFavMeal.ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-baseline gap-2 text-sm px-2.5 py-1 rounded-md bg-muted/40 border border-border">
                        <span className="font-medium tabular-nums shrink-0">
                          {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                        <span className="text-muted-foreground">{ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFavMeal.instructions && (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
                    onClick={() => setShowFavInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      Instructions
                    </span>
                    {showFavInstructions ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {showFavInstructions && (
                    <div className="px-4 pb-4 border-t">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mt-3">{selectedFavMeal.instructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
