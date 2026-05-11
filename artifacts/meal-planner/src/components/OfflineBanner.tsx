import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 text-sm font-medium shadow-md">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You're offline — changes will sync when you reconnect</span>
    </div>
  );
}
