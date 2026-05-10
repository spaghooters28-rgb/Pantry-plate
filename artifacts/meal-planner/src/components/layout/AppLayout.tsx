import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Calendar,
  ShoppingCart,
  PackageSearch,
  Clock,
  History,
  Star,
  Menu,
  Settings,
  ChefHat,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const routes = [
  { name: "Discover", path: "/", icon: Home },
  { name: "Weekly Plan", path: "/weekly-plan", icon: Calendar },
  { name: "Grocery List", path: "/grocery-list", icon: ShoppingCart },
  { name: "Pantry", path: "/pantry", icon: PackageSearch },
  { name: "Favorites", path: "/favorites", icon: Star },
  { name: "Scheduled", path: "/schedule", icon: Clock },
  { name: "Saved", path: "/history", icon: History },
];

const bottomRoutes = [routes[0], routes[1], routes[2], routes[3], routes[6]];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavItems = () => (
    <>
      <div className="px-4 py-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="w-7 h-7 text-primary shrink-0" />
          <h2 className="text-2xl font-serif font-bold text-primary">Pantry & Plate</h2>
        </div>
        <nav className="space-y-2 flex-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = location === route.path;
            return (
              <Link key={route.path} href={route.path} onClick={() => setOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{route.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Settings at the bottom of the sidebar */}
        <div className="mt-4 pt-4 border-t">
          <Link href="/settings" onClick={() => setOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                location === "/settings"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-1.5">
          <ChefHat className="w-5 h-5 text-primary shrink-0" />
          <h1 className="text-xl font-serif font-bold text-primary">Pantry & Plate</h1>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <NavItems />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen sticky top-0 shrink-0">
        <NavItems />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-[1200px] w-full mx-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card flex justify-around p-2 pb-safe z-50">
        {bottomRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location === route.path;
          return (
            <Link key={route.path} href={route.path}>
              <div className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{route.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
