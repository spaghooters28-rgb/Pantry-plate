import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSyncPins, getGetPinsQueryKey } from "@workspace/api-client-react";

const LS_KEY_RECIPES = "pp-pinned-recipes";
const LS_KEY_MEALS = "pp-pinned-fav-meals";
const LS_MIGRATED_KEY = "pp-pins-migrated";

function readBothLocalStorageKeys(): { recipeIds: number[]; mealIds: number[] } | null {
  try {
    const rawRecipes = localStorage.getItem(LS_KEY_RECIPES);
    const rawMeals = localStorage.getItem(LS_KEY_MEALS);
    const recipeIds: number[] = rawRecipes ? (JSON.parse(rawRecipes) as number[]) : [];
    const mealIds: number[] = rawMeals ? (JSON.parse(rawMeals) as number[]) : [];
    if (recipeIds.length === 0 && mealIds.length === 0) return null;
    return { recipeIds, mealIds };
  } catch {
    return null;
  }
}

export function usePinsMigration() {
  const queryClient = useQueryClient();
  const pinsQueryKey = getGetPinsQueryKey();
  const syncPinsMutation = useSyncPins();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (localStorage.getItem(LS_MIGRATED_KEY)) return;

    const localPins = readBothLocalStorageKeys();
    if (!localPins) {
      localStorage.setItem(LS_MIGRATED_KEY, "1");
      return;
    }

    syncPinsMutation.mutate(
      { data: localPins },
      {
        onSuccess: () => {
          localStorage.removeItem(LS_KEY_RECIPES);
          localStorage.removeItem(LS_KEY_MEALS);
          localStorage.setItem(LS_MIGRATED_KEY, "1");
          queryClient.invalidateQueries({ queryKey: pinsQueryKey });
        },
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
