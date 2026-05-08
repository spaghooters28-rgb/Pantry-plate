import { useState } from "react";
import {
  useListRecipeHistory,
  useDeleteRecipeHistory,
  getListRecipeHistoryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { History, Trash2, Clock, Flame, ChefHat, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function HistoryPage() {
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qKey = getListRecipeHistoryQueryKey();

  const { data: entries, isLoading } = useListRecipeHistory({ query: { queryKey: qKey } });
  const deleteMutation = useDeleteRecipeHistory();

  function handleDelete(entry: HistoryEntry) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-1">Saved</h1>
        <p className="text-muted-foreground">Recipes you've added to your grocery list.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No saved recipes yet</p>
          <p className="text-sm">Add meals to your grocery list and they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(entries as HistoryEntry[]).map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => { setSelected(entry); setShowInstructions(false); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base leading-tight">{entry.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-xs">{entry.cuisine}</Badge>
                      {entry.isGlutenFree && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">GF</Badge>
                      )}
                      {entry.cookTimeMinutes > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{entry.cookTimeMinutes}m
                        </span>
                      )}
                      {entry.calories > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Flame className="w-3 h-3" />{entry.calories} kcal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(entry.addedAt)}</span>
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry); }}
                      title="Remove from saved"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl leading-tight">{selected.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selected.cuisine}</Badge>
              {selected.isGlutenFree && <Badge variant="outline" className="border-green-500 text-green-600">Gluten-Free</Badge>}
              {selected.protein && <Badge variant="outline">{selected.protein}</Badge>}
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              {selected.cookTimeMinutes > 0 && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selected.cookTimeMinutes} min</span>
              )}
              {selected.calories > 0 && (
                <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{selected.calories} kcal</span>
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
                  <div className="px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-60">
                    {selected.instructions}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No instructions available for this recipe.</p>
            )}

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
    </div>
  );
}
