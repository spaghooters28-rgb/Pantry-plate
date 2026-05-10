import { useState } from "react";
import {
  useListMeals,
  getListMealsQueryKey,
  useToggleMealFavorite,
  useAddMealToGroceryList,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Clock, Flame, Users, BookOpen, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
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
  isFavorited?: boolean;
  instructions?: string | null;
  ingredients?: Array<{ id: number; name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean }>;
};

const CUISINE_COLORS: Record<string, string> = {
  American: "bg-blue-100 text-blue-800",
  Mexican: "bg-orange-100 text-orange-800",
  Asian: "bg-red-100 text-red-800",
  Indian: "bg-yellow-100 text-yellow-800",
  Italian: "bg-green-100 text-green-800",
  Mediterranean: "bg-teal-100 text-teal-800",
};

export function Favorites() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showInstructionsId, setShowInstructionsId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listMealsData, isLoading } = useListMeals(
    {},
    { query: { queryKey: getListMealsQueryKey({}) } }
  );

  const favorites = (listMealsData?.meals ?? []).filter((m) => m.isFavorited);

  const toggleFavoriteMutation = useToggleMealFavorite();
  const addMealMutation = useAddMealToGroceryList();

  function toggleExpand(meal: Meal) {
    if (expandedId === meal.id) {
      setExpandedId(null);
      setShowInstructionsId(null);
    } else {
      setExpandedId(meal.id);
      setShowInstructionsId(null);
    }
  }

  function handleUnfavorite(meal: Meal) {
    toggleFavoriteMutation.mutate(
      { id: meal.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMealsQueryKey({}) });
          if (expandedId === meal.id) setExpandedId(null);
          toast({ title: `${meal.name} removed from favorites.` });
        },
        onError: () => toast({ title: "Error", description: "Could not update favorite.", variant: "destructive" }),
      }
    );
  }

  function handleAddToGrocery(meal: Meal) {
    addMealMutation.mutate(
      { mealId: meal.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
          toast({ title: "Added to grocery list!", description: `${meal.name} ingredients added.` });
        },
        onError: () => toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1">Favorites</h1>
        <p className="text-muted-foreground">Your starred meals, all in one place.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[220px] rounded-xl" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium mb-1 text-base">No favorites yet</p>
          <p className="text-sm">Tap the star on any meal in Discover to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((meal) => {
            const isExpanded = expandedId === meal.id;
            const showInstructions = showInstructionsId === meal.id;
            return (
              <Card key={meal.id} className="overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                <div className={`h-3 w-full ${CUISINE_COLORS[meal.cuisine]?.split(" ")[0] ?? "bg-primary"}`} />

                {/* Header — click to expand */}
                <CardHeader
                  className="pb-2 cursor-pointer select-none"
                  onClick={() => toggleExpand(meal)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <Badge
                      className={`text-xs font-medium ${CUISINE_COLORS[meal.cuisine] ?? "bg-muted text-muted-foreground"}`}
                      variant="outline"
                    >
                      {meal.cuisine}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {meal.isGlutenFree && (
                        <Badge variant="outline" className="text-xs border-green-600 text-green-600">GF</Badge>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnfavorite(meal); }}
                        className="p-1 rounded-full text-amber-400 hover:text-amber-500 transition-colors"
                        title="Remove from favorites"
                        disabled={toggleFavoriteMutation.isPending}
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                      <span className="p-1 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-serif leading-tight">{meal.name}</CardTitle>
                  {!isExpanded && (
                    <CardDescription className="text-sm line-clamp-2">{meal.description}</CardDescription>
                  )}
                </CardHeader>

                {/* Stats — always visible */}
                <CardContent className="pb-2">
                  <div className="flex gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{meal.cookTimeMinutes}m</span>
                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{meal.calories} kcal</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Serves {meal.servings}</span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">{meal.protein}</Badge>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {meal.description && (
                        <p className="text-sm text-muted-foreground">{meal.description}</p>
                      )}

                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ingredients</p>
                          <ul className="space-y-1 max-h-40 overflow-y-auto">
                            {meal.ingredients.map((ing) => (
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

                      {meal.instructions ? (
                        <div className="border rounded-lg overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                            onClick={(e) => { e.stopPropagation(); setShowInstructionsId(showInstructions ? null : meal.id); }}
                          >
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              How to Cook This
                            </span>
                            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {showInstructions && (
                            <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                              {meal.instructions}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No cooking instructions available.</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); handleUnfavorite(meal); }}
                        disabled={toggleFavoriteMutation.isPending}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        Remove from Favorites
                      </Button>
                    </div>
                  )}
                </CardContent>

                {/* Footer — cart button always visible */}
                <div className="mt-auto px-6 pb-4 pt-1">
                  <Button
                    className="w-full gap-2"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAddToGrocery(meal); }}
                    disabled={addMealMutation.isPending}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addMealMutation.isPending ? "Adding…" : "Add to Grocery List"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
