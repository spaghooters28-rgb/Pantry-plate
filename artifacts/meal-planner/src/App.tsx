import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";

import { Discover } from "@/pages/Discover";
import { WeeklyPlan } from "@/pages/WeeklyPlan";
import { GroceryList } from "@/pages/GroceryList";
import { Pantry } from "@/pages/Pantry";
import { ScheduledItems } from "@/pages/ScheduledItems";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Discover} />
        <Route path="/weekly-plan" component={WeeklyPlan} />
        <Route path="/grocery-list" component={GroceryList} />
        <Route path="/pantry" component={Pantry} />
        <Route path="/schedule" component={ScheduledItems} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;