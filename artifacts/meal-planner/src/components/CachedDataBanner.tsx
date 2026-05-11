import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface CachedDataBannerProps {
  hasData: boolean;
  readOnly?: boolean;
}

export function CachedDataBanner({ hasData, readOnly = false }: CachedDataBannerProps) {
  const isOnline = useOnlineStatus();

  if (isOnline || !hasData) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
      <WifiOff className="w-3 h-3 shrink-0" />
      <span>
        {readOnly
          ? "You're offline — showing cached data"
          : "Showing cached data — edits will sync when you reconnect"}
      </span>
    </div>
  );
}
