import { useState } from "react";
import {
  useListMeals,
  getListMealsQueryKey,
  useListCuisines,
  useListProteins,
  useAddMealToGroceryList,
  useCheckPantryForMeal,
  getGetGroceryListQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Flame, ChefHat, ShoppingCart, CheckCircle2, AlertCircle, Users } from "lucide-react";
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
  tags?: string[];
  ingredients?: Array<{ id: number; name: string; quantity: string; unit: string; category: string; isCommonPantryItem: boolean }>;
  availableSides?: Array<{ id: number; name: string; description?: string }>;
};

type PantryCheckResult = {
  haveInPantry: Array<{ id: number; name: string }>;
  needToBuy: Array<{ name: string; quantity: string; unit: string; category: string }>;
};

const CUISINE_COLORS: Record<string, string> = {
  American: "bg-blue-100 text-blue-800",
  Mexican: "bg-orange-100 text-orange-800",
  Asian: "bg-red-100 text-red-800",
  Indian: "bg-yellow-100 text-yellow-800",
  Italian: "bg-green-100 text-green-800",
  Mediterranean: "bg-teal-100 text-teal-800",
  Korean: "bg-purple-100 text-purple-800",
};

export function Discover() {
  const [cuisine, setCuisine] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [pantryCheck, setPantryCheck] = useState<PantryCheckResult | null>(null);
  const [pantryCheckLoading, setPantryCheckLoading] = useState(false);
  const [addingMealId, setAddingMealId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = {
    cuisine: cuisine || undefined,
    protein: protein || undefined,
    glutenFree: glutenFreeOnly || undefined,
  };

  const { data: meals, isLoading } = useListMeals(params, {
    query: { queryKey: getListMealsQueryKey(params) },
  });

  const { data: cuisines } = useListCuisines();
  const { data: proteins } = useListProteins();

  const addMealMutation = useAddMealToGroceryList();
  const checkPantryMutation = useCheckPantryForMeal();

  function handleOpenMeal(meal: Meal) {
    setSelectedMeal(meal);
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
          const prompts = (result as { pantryPrompts?: Array<{ question: string }> }).pantryPrompts ?? [];
          if (prompts.length > 0) {
            toast({
              title: "Added to grocery list!",
              description: `Pantry heads-up: ${prompts[0].question}`,
            });
          } else {
            toast({ title: "Added to grocery list!", description: `${meal.name} ingredients added.` });
          }
          setSelectedMeal(null);
        },
        onError: () => {
          setAddingMealId(null);
          toast({ title: "Error", description: "Could not add to grocery list.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1">Discover</h1>
        <p className="text-muted-foreground">Find your next favorite meal.</p>
      </div>

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

        {/* Protein + GF filter */}
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
        </div>
      </div>

      {/* Meal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : meals?.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No meals match your filters. Try broadening your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals?.map((meal) => (
            <Card key={meal.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleOpenMeal(meal as Meal)}>
              <div className={`h-3 w-full ${CUISINE_COLORS[meal.cuisine]?.split(" ")[0] ?? "bg-primary"}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <Badge
                    className={`text-xs font-medium ${CUISINE_COLORS[meal.cuisine] ?? "bg-muted text-muted-foreground"}`}
                    variant="outline"
                  >
                    {meal.cuisine}
                  </Badge>
                  {meal.isGlutenFree && (
                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">GF</Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-serif leading-tight group-hover:text-primary transition-colors">
                  {meal.name}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">{meal.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{meal.cookTimeMinutes}m</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{meal.calories} kcal</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Serves {meal.servings}</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">{meal.protein}</Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleOpenMeal(meal as Meal); }}
                >
                  View Recipe
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Meal Detail Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) setSelectedMeal(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${CUISINE_COLORS[selectedMeal.cuisine] ?? "bg-muted"}`} variant="outline">
                    {selectedMeal.cuisine}
                  </Badge>
                  {selectedMeal.isGlutenFree && (
                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">Gluten-Free</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{selectedMeal.protein}</Badge>
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
                  </div>
                ) : null}
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
