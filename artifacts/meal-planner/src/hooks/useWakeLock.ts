import { useState, useEffect, useCallback, useRef } from "react";

export function useWakeLock(autoEnable = true) {
  const [isActive, setIsActive] = useState(false);
  const [isSupported] = useState(() => "wakeLock" in navigator);
  const lockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!isSupported) return;
    try {
      lockRef.current = await navigator.wakeLock.request("screen");
      lockRef.current.addEventListener("release", () => setIsActive(false));
      setIsActive(true);
    } catch {
      setIsActive(false);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (lockRef.current) {
      await lockRef.current.release();
      lockRef.current = null;
      setIsActive(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isActive) release();
    else request();
  }, [isActive, request, release]);

  // Auto-enable on mount
  useEffect(() => {
    if (autoEnable) request();
    return () => { release(); };
  }, [autoEnable, request, release]);

  // Re-acquire after tab becomes visible again (browser releases lock on tab switch)
  useEffect(() => {
    if (!isSupported) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isActive && !lockRef.current) {
        request();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isSupported, isActive, request]);

  return { isActive, isSupported, toggle };
}
