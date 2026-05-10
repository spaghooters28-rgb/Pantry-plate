import { useState, useEffect } from "react";
import {
  useListRecipeHistory,
  useDeleteRecipeHistory,
  getListRecipeHistoryQueryKey,
  useListMeals,
  getListMealsQueryKey,
  useToggleMealFavorite,
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
  History,
  Trash2,
  Clock,
  Flame,
  ChefHat,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Pin,
  PinOff,
  ShoppingBasket,
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return formatDate(iso);
}

type Tab = "saved" | "favorites";

const LS_KEY = "pp-pinned-recipes";
const LS_KEY_MEALS = "pp-pinned-fav-meals";

function loadPinned(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function savePinned(ids: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
}

function loadPinnedMeals(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY_MEALS);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function savePinnedMeals(ids: Set<number>) {
  localStorage.setItem(LS_KEY_MEALS, JSON.stringify([...ids]));
}

export function HistoryPage() {
  const [tab, setTab] = useState<Tab>("saved");
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedFavMeal, setSelectedFavMeal] = useState<FavMeal | null>(null);
  const [showFavInstructions, setShowFavInstructions] = useState(false);

  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set());
  const [pinnedMealIds, setPinnedMealIds] = useState<Set<number>>(new Set());
  const [pinTarget, setPinTarget] = useState<HistoryEntry | null>(null);
  const [unpinTarget, setUnpinTarget] = useState<HistoryEntry | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getListRecipeHistoryQueryKey();
  const allMealsKey = getListMealsQueryKey({});

  const { data: entries, isLoading: historyLoading } = useListRecipeHistory({ query: { queryKey: qKey } });
  const deleteMutation = useDeleteRecipeHistory();

  const { data: allMeals, isLoading: favLoading } = useListMeals(
    {},
    { query: { queryKey: allMealsKey, staleTime: 5 * 60 * 1000 } }
  );
  const toggleFavMutation = useToggleMealFavorite();

  const favorites = ((allMeals ?? []) as FavMeal[]).filter((m) => m.isFavorited);

  useEffect(() => {
    setPinnedIds(loadPinned());
    setPinnedMealIds(loadPinnedMeals());
  }, []);

  function handlePin(entry: HistoryEntry) {
    const next = new Set(pinnedIds);
    next.add(entry.id);
    setPinnedIds(next);
    savePinned(next);
    setPinTarget(null);
    toast({ title: `"${entry.name}" added to Cooking Board!` });
  }

  function handleUnpin(entry: HistoryEntry, action: "back" | "saved" | "delete") {
    const next = new Set(pinnedIds);
    next.delete(entry.id);
    setPinnedIds(next);
    savePinned(next);
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
      toast({ title: `"${entry.name}" moved back to Saved.` });
    }
  }

  function handlePinMeal(meal: FavMeal) {
    const next = new Set(pinnedMealIds);
    next.add(meal.id);
    setPinnedMealIds(next);
    savePinnedMeals(next);
    toast({ title: `"${meal.name}" added to Cooking Board!` });
  }

  function handleUnpinMeal(mealId: number, mealName: string) {
    const next = new Set(pinnedMealIds);
    next.delete(mealId);
    setPinnedMealIds(next);
    savePinnedMeals(next);
    toast({ title: `"${mealName}" removed from Cooking Board.` });
  }

  function handleDelete(entry: HistoryEntry) {
    if (pinnedIds.has(entry.id)) {
      const next = new Set(pinnedIds);
      next.delete(entry.id);
      setPinnedIds(next);
      savePinned(next);
    }
    deleteMutation.mutate(
      { id: entry.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: qKey });
          if (selected?.id === entry.id) setSelected(null);
          toast({ title: `"${entry.name}" removed from saved.` });
        },
        onError: () => toast({ title: "Error", description: "Could not remove from saved.", variant: "destructive" }),
      }
    );
  }

  function handleToggleFavorite(meal: FavMeal) {
    toggleFavMutation.mutate(
      { id: meal.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: allMealsKey });
          toast({ title: meal.isFavorited ? "Removed from favorites." : "Added to favorites!" });
        },
        onError: () =>
          toast({ title: "Error", description: "Could not update favorite.", variant: "destructive" }),
      }
    );
  }

  const isLoading = historyLoading || favLoading;
  const allEntries = (entries ?? []) as HistoryEntry[];
  const pinned = allEntries.filter((e) => pinnedIds.has(e.id));
  const unpinned = allEntries.filter((e) => !pinnedIds.has(e.id));

  const mealMap = new Map<number, FavMeal>(
    ((allMeals ?? []) as FavMeal[]).map((m) => [m.id, m])
  );

  const pinnedMeals = [...pinnedMealIds]
    .map((id) => mealMap.get(id))
    .filter((m): m is FavMeal => m != null);

  const hasCookingBoard = pinned.length > 0 || pinnedMeals.length > 0;

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

  const RecipeCard = ({
    entry,
    isPinned = false,
  }: {
    entry: HistoryEntry;
    isPinned?: boolean;
  }) => {
    const meal = entry.mealId != null ? mealMap.get(entry.mealId) : undefined;
    const ingredients = meal?.ingredients ?? [];

    return (
      <Card
        className={`cursor-pointer transition-colors ${
          isPinned
            ? "border-amber-300/60 bg-amber-50/50 hover:border-amber-400/80 dark:bg-amber-950/20"
            : "hover:border-primary/40"
        }`}
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
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(entry.addedAt)}</span>
              {meal && (
                <button
                  className={`p-1.5 transition-colors rounded ${
                    meal.isFavorited
                      ? "text-amber-400 hover:text-amber-500"
                      : "text-muted-foreground hover:text-amber-400"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(meal);
                  }}
                  disabled={toggleFavMutation.isPending}
                  title={meal.isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={`w-3.5 h-3.5 ${meal.isFavorited ? "fill-amber-400" : ""}`} />
                </button>
              )}
              {isPinned ? (
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
              ) : (
                <button
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinTarget(entry);
                  }}
                  title="Add to Cooking Board"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(entry);
                }}
                title="Remove from saved"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PinnedMealCard = ({ meal }: { meal: FavMeal }) => (
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
        <h1 className="text-3xl font-serif font-bold text-primary mb-1">Saved</h1>
        <p className="text-muted-foreground">Your saved recipes and starred meals.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setTab("saved")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          Saved Recipes
          {!isLoading && allEntries.length > 0 && (
            <span className="ml-1 bg-muted text-muted-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
              {allEntries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "favorites"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="w-4 h-4" />
          Favorites
          {!isLoading && favorites.length > 0 && (
            <span className="ml-1 bg-muted text-muted-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
              {favorites.length}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-xl" />)}
        </div>
      ) : tab === "saved" ? (
        <div className="space-y-5">
          {/* ── Cooking Board ── */}
          {hasCookingBoard && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h2 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Cooking Board</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {pinned.length + pinnedMeals.length} pinned
                </span>
              </div>
              <div className="space-y-2">
                {pinned.map((entry) => (
                  <RecipeCard key={`h-${entry.id}`} entry={entry} isPinned />
                ))}
                {pinnedMeals.map((meal) => (
                  <PinnedMealCard key={`m-${meal.id}`} meal={meal} />
                ))}
              </div>
            </div>
          )}

          {/* ── Saved Recipes ── */}
          {allEntries.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground border border-dashed rounded-xl">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm mb-1">No saved recipes yet</p>
              <p className="text-xs">Add meals to your grocery list and they'll appear here.</p>
            </div>
          ) : unpinned.length > 0 ? (
            <div>
              {hasCookingBoard && (
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
                  All Saved
                </p>
              )}
              <div className="space-y-2">
                {unpinned.map((entry) => (
                  <RecipeCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ) : hasCookingBoard ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All your saved recipes are on the Cooking Board.
            </p>
          ) : null}
        </div>
      ) : (
        /* ── Favorites ── */
        favorites.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border border-dashed rounded-xl">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm mb-1">No favorites yet</p>
            <p className="text-xs">Star meals in Discover to save them here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((meal) => (
              <Card key={meal.id} className="hover:border-amber-300/60 transition-colors">
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
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className={`p-1.5 transition-colors rounded ${
                          pinnedMealIds.has(meal.id)
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                        onClick={() =>
                          pinnedMealIds.has(meal.id)
                            ? handleUnpinMeal(meal.id, meal.name)
                            : handlePinMeal(meal)
                        }
                        title={pinnedMealIds.has(meal.id) ? "Remove from Cooking Board" : "Add to Cooking Board"}
                      >
                        {pinnedMealIds.has(meal.id)
                          ? <PinOff className="w-3.5 h-3.5" />
                          : <Pin className="w-3.5 h-3.5" />
                        }
                      </button>
                      <button
                        className="p-1 text-amber-400 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
                        onClick={() => handleToggleFavorite(meal)}
                        disabled={toggleFavMutation.isPending}
                        title="Remove from favorites"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── Add to Cooking Board prompt ── */}
      <Dialog open={!!pinTarget} onOpenChange={(open) => { if (!open) setPinTarget(null); }}>
        {pinTarget && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-500" />
                Add to Cooking Board?
              </DialogTitle>
              <DialogDescription>
                Pin <span className="font-medium text-foreground">"{pinTarget.name}"</span> to your Cooking Board so it stays front and centre while you cook.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setPinTarget(null)}>Cancel</Button>
              <Button
                size="sm"
                className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => handlePin(pinTarget)}
              >
                <Pin className="w-3.5 h-3.5" />
                Add to Cooking Board
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Remove from Cooking Board dialog ── */}
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
                onClick={() => handleUnpin(unpinTarget, "saved")}
              >
                <Pin className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm">Move to Saved</p>
                  <p className="text-xs text-muted-foreground">Unpin and place at the top of your Saved list</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-3 px-4 border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5"
                onClick={() => handleUnpin(unpinTarget, "delete")}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 text-destructive shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm text-destructive">Remove from Saved</p>
                  <p className="text-xs text-muted-foreground">Delete from Saved list entirely</p>
                </div>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setUnpinTarget(null)} className="mt-1">
                Cancel
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Recipe Detail Dialog (history entry) ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      >
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
              <span className="ml-auto text-xs">{formatDate(selected.addedAt)}</span>
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
                        <li key={ing.id} className="text-sm flex gap-2">
                          <span className="font-medium whitespace-nowrap">
                            {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                          </span>
                          <span className="text-muted-foreground">{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              {selected.instructions ? (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                    onClick={() => setShowInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      Recipe Instructions
                    </span>
                    {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showInstructions && (
                    <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {selected.instructions}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No instructions available for this recipe.</p>
              )}
            </div>

            <div className="flex justify-between pt-1 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5"
                onClick={() => handleDelete(selected)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Remove from saved
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Pinned Fav Meal Detail Dialog ── */}
      <Dialog
        open={!!selectedFavMeal}
        onOpenChange={(open) => { if (!open) setSelectedFavMeal(null); }}
      >
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

            <div className="overflow-y-auto flex-1 space-y-3 min-h-0">
              {selectedFavMeal.ingredients && selectedFavMeal.ingredients.length > 0 && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <ShoppingBasket className="w-4 h-4 text-primary" />
                    Ingredients
                  </p>
                  <ul className="space-y-1">
                    {selectedFavMeal.ingredients.map((ing) => (
                      <li key={ing.id} className="text-sm flex gap-2">
                        <span className="font-medium whitespace-nowrap">
                          {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                        <span className="text-muted-foreground">{ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFavMeal.instructions ? (
                <div className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                    onClick={() => setShowFavInstructions((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      Recipe Instructions
                    </span>
                    {showFavInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showFavInstructions && (
                    <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedFavMeal.instructions}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No instructions available.</p>
              )}
            </div>

            <div className="flex justify-end pt-1 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedFavMeal(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
