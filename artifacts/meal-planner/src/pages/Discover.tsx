import { useState } from "react";
import {
  useListMeals,
  getListMealsQueryKey,
  useListCuisines,
  useListProteins,
  useAddMealToGroceryList,
  useCheckPantryForMeal,
  useGenerateAiMeals,
  useToggleMealFavorite,
  useDeleteGroceryItem,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Flame, ChefHat, ShoppingCart, CheckCircle2, AlertCircle, Users, Sparkles, RefreshCw, Star, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Meal = {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  imageUrl?: string | null;
  isFavorited?: boolean;
  instructions?: string | null;
  tags?: string[];
  ingredients?: Array<{ id: number; name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean }>;
  availableSides?: Array<{ id: number; name: string; description?: string }>;
};

type PantryCheckResult = {
  haveInPantry: Array<{ id: number; name: string }>;
  needToBuy: Array<{ name: string; quantity: string; unit: string; category: string }>;
};

type PantryPrompt = {
  pantryItemId: number;
  ingredientName: string;
  question: string;
  groceryItemId: number;
};

const CUISINE_COLORS: Record<string, string> = {
  American: "bg-blue-100 text-blue-800",
  Mexican: "bg-orange-100 text-orange-800",
  Asian: "bg-red-100 text-red-800",
  Indian: "bg-yellow-100 text-yellow-800",
  Italian: "bg-green-100 text-green-800",
  Mediterranean: "bg-teal-100 text-teal-800",
};

export function Discover() {
  const [cuisine, setCuisine] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [pantryCheck, setPantryCheck] = useState<PantryCheckResult | null>(null);
  const [pantryCheckLoading, setPantryCheckLoading] = useState(false);
  const [addingMealId, setAddingMealId] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [pantryPrompts, setPantryPrompts] = useState<PantryPrompt[]>([]);
  const [dismissedPrompts, setDismissedPrompts] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = {
    cuisine: cuisine || undefined,
    protein: protein || undefined,
    glutenFree: glutenFreeOnly || undefined,
  };

  const { data: allMeals, isLoading } = useListMeals(params, {
    query: { queryKey: getListMealsQueryKey(params) },
  });

  const meals = favoritesOnly ? allMeals?.filter((m) => (m as Meal).isFavorited) : allMeals;

  const { data: cuisines } = useListCuisines();
  const { data: proteins } = useListProteins();

  const addMealMutation = useAddMealToGroceryList();
  const checkPantryMutation = useCheckPantryForMeal();
  const generateAiMealsMutation = useGenerateAiMeals();
  const toggleFavoriteMutation = useToggleMealFavorite();
  const deleteGroceryItemMutation = useDeleteGroceryItem();

  function handleOpenMeal(meal: Meal) {
    setSelectedMeal(meal);
    setShowInstructions(false);
    setPantryCheck(null);
    setPantryCheckLoading(true);
    checkPantryMutation.mutate(
      { data: { mealId: meal.id } },
      {
        onSuccess: (result) => {
          setPantryCheck(result as PantryCheckResult);
          setPantryCheckLoading(false);
        },
        onError: () => setPantryCheckLoading(false),
      }
    );
  }

  function handleAddToGrocery(meal: Meal) {
    setAddingMealId(meal.id);
    addMealMutation.mutate(
      { mealId: meal.id },
      {
        onSuccess: (result) => {
          setAddingMealId(null);
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          const prompts = (result as { pantryPrompts?: PantryPrompt[] }).pantryPrompts ?? [];
          setSelectedMeal(null);
          if (prompts.length > 0) {
            setDismissedPrompts(new Set());
            setPantryPrompts(prompts);
          } else {
            toast({ title: "Added to grocery list!", description: `${meal.name} ingredients added.` });
          }
        },
        onError: () => {
          setAddingMealId(null);
          toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" });
        },
      }
    );
  }

  function handlePantryYes(prompt: PantryPrompt) {
    // User has it — remove from grocery list
    deleteGroceryItemMutation.mutate(
      { id: prompt.groceryItemId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          setDismissedPrompts((prev) => new Set([...prev, prompt.groceryItemId]));
        },
        onError: () => toast({ title: "Error", description: "Could not remove item.", variant: "destructive" }),
      }
    );
  }

  function handlePantryNo(prompt: PantryPrompt) {
    // User needs it — keep it in grocery list, just dismiss this prompt
    setDismissedPrompts((prev) => new Set([...prev, prompt.groceryItemId]));
  }

  const activePrompts = pantryPrompts.filter((p) => !dismissedPrompts.has(p.groceryItemId));

  function handleToggleFavorite(e: React.MouseEvent, meal: Meal) {
    e.stopPropagation();
    toggleFavoriteMutation.mutate(
      { id: meal.id },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
          // Update dialog meal if open
          if (selectedMeal?.id === meal.id) {
            setSelectedMeal((prev) => prev ? { ...prev, isFavorited: (updated as Meal).isFavorited } : null);
          }
        },
        onError: () => toast({ title: "Error", description: "Could not update favorite.", variant: "destructive" }),
      }
    );
  }

  function handleGenerateAi() {
    generateAiMealsMutation.mutate(
      {
        data: {
          cuisine: cuisine || undefined,
          protein: protein || undefined,
          glutenFree: glutenFreeOnly || undefined,
          count: 10,
        },
      },
      {
        onSuccess: (newMeals) => {
          queryClient.invalidateQueries({ queryKey: getListMealsQueryKey(params) });
          toast({
            title: `${newMeals.length} new meal ideas added!`,
            description: "AI-generated meals are now in your list.",
          });
        },
        onError: () => {
          toast({
            title: "Could not generate meals",
            description: "AI generation failed. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  }

  const activeFilters = [
    cuisine && `Cuisine: ${cuisine}`,
    protein && `Protein: ${protein}`,
    glutenFreeOnly && "Gluten-Free",
    favoritesOnly && "Favorites",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Discover</h1>
          <p className="text-muted-foreground">Find your next favorite meal.</p>
        </div>
        <Button
          onClick={handleGenerateAi}
          disabled={generateAiMealsMutation.isPending}
          className="gap-2 shrink-0"
          variant="outline"
        >
          {generateAiMealsMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate More Ideas
              {activeFilters.length > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({activeFilters.join(", ")})
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* AI generation loading banner */}
      {generateAiMealsMutation.isPending && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 text-sm text-primary">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            AI is searching for new{" "}
            {activeFilters.length > 0 ? activeFilters.join(", ").toLowerCase() + " " : ""}
            meal ideas and adding them to your library…
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        {/* Cuisine filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCuisine("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              !cuisine ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            All Cuisines
          </button>
          {cuisines?.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(cuisine === c ? "" : c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                cuisine === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Protein + GF + Favorites filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setProtein("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              !protein ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card border-border text-muted-foreground hover:border-secondary hover:text-secondary"
            }`}
          >
            All Proteins
          </button>
          {proteins?.map((p) => (
            <button
              key={p}
              onClick={() => setProtein(protein === p ? "" : p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                protein === p ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card border-border text-muted-foreground hover:border-secondary hover:text-secondary"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setGlutenFreeOnly(!glutenFreeOnly)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ml-2 ${
              glutenFreeOnly ? "bg-green-600 text-white border-green-600" : "bg-card border-border text-muted-foreground hover:border-green-600 hover:text-green-600"
            }`}
          >
            Gluten-Free Only
          </button>
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1 ${
              favoritesOnly ? "bg-amber-400 text-white border-amber-400" : "bg-card border-border text-muted-foreground hover:border-amber-400 hover:text-amber-500"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Favorites
          </button>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && meals && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {meals.length} meal{meals.length !== 1 ? "s" : ""} found
            {activeFilters.length > 0 && (
              <span className="ml-1">for <strong>{activeFilters.join(", ")}</strong></span>
            )}
          </p>
          <button
            onClick={handleGenerateAi}
            disabled={generateAiMealsMutation.isPending}
            className="text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {generateAiMealsMutation.isPending ? "Generating…" : "Find more with AI"}
          </button>
        </div>
      )}

      {/* Meal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : meals?.length === 0 ? (
        <div className="py-16 text-center">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground mb-4">
            {favoritesOnly ? "You haven't starred any meals yet." : "No meals match your filters yet."}
          </p>
          {!favoritesOnly && (
            <Button onClick={handleGenerateAi} disabled={generateAiMealsMutation.isPending} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {generateAiMealsMutation.isPending ? "Generating…" : "Generate Meals with AI"}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals?.map((meal) => {
              const m = meal as Meal;
              return (
                <Card key={m.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleOpenMeal(m)}>
                  <div className={`h-3 w-full ${CUISINE_COLORS[m.cuisine]?.split(" ")[0] ?? "bg-primary"}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <Badge
                        className={`text-xs font-medium ${CUISINE_COLORS[m.cuisine] ?? "bg-muted text-muted-foreground"}`}
                        variant="outline"
                      >
                        {m.cuisine}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {m.isGlutenFree && (
                          <Badge variant="outline" className="text-xs border-green-600 text-green-600">GF</Badge>
                        )}
                        <button
                          onClick={(e) => handleToggleFavorite(e, m)}
                          className={`p-1 rounded-full transition-colors ${m.isFavorited ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground hover:text-amber-400"}`}
                          title={m.isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={`w-4 h-4 ${m.isFavorited ? "fill-amber-400" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-serif leading-tight group-hover:text-primary transition-colors">
                      {m.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{m.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.cookTimeMinutes}m</span>
                      <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{m.calories} kcal</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Serves {m.servings}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">{m.protein}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleOpenMeal(m); }}
                    >
                      View Recipe
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}

            {/* AI generation skeleton cards */}
            {generateAiMealsMutation.isPending && (
              [1, 2, 3].map((i) => (
                <Card key={`ai-loading-${i}`} className="overflow-hidden flex flex-col opacity-60">
                  <div className="h-3 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 animate-pulse" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span className="text-xs text-primary font-medium">AI generating…</span>
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="flex gap-3">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-14" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {/* Load More strip */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleGenerateAi}
              disabled={generateAiMealsMutation.isPending}
              className="gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {generateAiMealsMutation.isPending ? "Generating 10 more…" : "Generate 10 More with AI"}
            </Button>
          </div>
        </>
      )}

      {/* Pantry Confirmation Dialog */}
      <Dialog
        open={pantryPrompts.length > 0}
        onOpenChange={(open) => { if (!open) { setPantryPrompts([]); setDismissedPrompts(new Set()); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Pantry Check
            </DialogTitle>
            <DialogDescription>
              We added all ingredients to your grocery list. Do you still have these items at home?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {pantryPrompts.map((prompt) => {
              const dismissed = dismissedPrompts.has(prompt.groceryItemId);
              return (
                <div
                  key={prompt.groceryItemId}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-all ${
                    dismissed ? "opacity-40 bg-muted border-transparent" : "bg-card border-border"
                  }`}
                >
                  <span className="text-sm font-medium flex-1">{prompt.ingredientName}</span>
                  {dismissed ? (
                    <span className="text-xs text-muted-foreground italic">Done</span>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs border-green-400 text-green-700 hover:bg-green-50"
                        onClick={() => handlePantryYes(prompt)}
                        disabled={deleteGroceryItemMutation.isPending}
                      >
                        Yes, I have it
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => handlePantryNo(prompt)}
                      >
                        No, keep it
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {activePrompts.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-1">
              All done! Your grocery list is up to date.
            </p>
          )}

          <Button
            className="w-full"
            onClick={() => { setPantryPrompts([]); setDismissedPrompts(new Set()); }}
          >
            {activePrompts.length === 0 ? "Close" : "Skip remaining"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Meal Detail Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) setSelectedMeal(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={`text-xs ${CUISINE_COLORS[selectedMeal.cuisine] ?? "bg-muted"}`} variant="outline">
                    {selectedMeal.cuisine}
                  </Badge>
                  {selectedMeal.isGlutenFree && (
                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">Gluten-Free</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{selectedMeal.protein}</Badge>
                  <button
                    onClick={(e) => handleToggleFavorite(e, selectedMeal)}
                    className={`ml-auto p-1.5 rounded-full transition-colors flex items-center gap-1 text-sm ${selectedMeal.isFavorited ? "text-amber-400 hover:text-amber-500" : "text-muted-foreground hover:text-amber-400"}`}
                  >
                    <Star className={`w-4 h-4 ${selectedMeal.isFavorited ? "fill-amber-400" : ""}`} />
                    {selectedMeal.isFavorited ? "Favorited" : "Favorite"}
                  </button>
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedMeal.name}</DialogTitle>
                <DialogDescription>{selectedMeal.description}</DialogDescription>
              </DialogHeader>

              <div className="flex gap-4 text-sm text-muted-foreground py-2 border-y">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedMeal.cookTimeMinutes} minutes</span>
                <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{selectedMeal.calories} kcal</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />Serves {selectedMeal.servings}</span>
              </div>

              {/* Pantry Check */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Pantry Check</h3>
                {pantryCheckLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ) : pantryCheck ? (
                  <div className="space-y-2">
                    {pantryCheck.haveInPantry.length > 0 && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs font-medium text-green-700 mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Already in your pantry ({pantryCheck.haveInPantry.length})
                        </p>
                        <p className="text-sm text-green-800">
                          {pantryCheck.haveInPantry.map((p) => p.name).join(", ")}
                        </p>
                      </div>
                    )}
                    {pantryCheck.needToBuy.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-xs font-medium text-amber-700 mb-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          You'll need to buy ({pantryCheck.needToBuy.length} items)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pantryCheck.needToBuy.map((i) => (
                            <span key={i.name} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              {i.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {pantryCheck.haveInPantry.length === 0 && pantryCheck.needToBuy.length === 0 && (
                      <p className="text-sm text-muted-foreground">No ingredient data for this meal yet.</p>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Recipe Instructions */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  How to Cook This
                </h3>
                {selectedMeal.instructions ? (
                  <div className="p-4 rounded-lg bg-muted/50 border text-sm leading-relaxed whitespace-pre-line">
                    {selectedMeal.instructions}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No cooking instructions available for this recipe.</p>
                )}
              </div>

              {/* Sides */}
              {selectedMeal.availableSides && selectedMeal.availableSides.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Suggested Sides</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMeal.availableSides.map((side) => (
                      <div key={side.id} className="p-2.5 rounded-lg bg-muted text-sm">
                        <p className="font-medium">{side.name}</p>
                        {side.description && <p className="text-xs text-muted-foreground mt-0.5">{side.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedMeal.tags && selectedMeal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedMeal.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => handleAddToGrocery(selectedMeal)}
                disabled={addingMealId === selectedMeal.id}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {addingMealId === selectedMeal.id ? "Adding…" : "Add to Grocery List"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
