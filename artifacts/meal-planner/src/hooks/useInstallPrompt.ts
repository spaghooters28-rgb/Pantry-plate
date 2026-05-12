import { useState, useEffect } from "react";
import {
  getCapturedPrompt,
  subscribeToCapturedPrompt,
  clearCapturedPrompt,
} from "@/lib/installPromptCapture";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UseInstallPromptReturn {
  canInstall: boolean;
  isIos: boolean;
  isStandalone: boolean;
  triggerInstall: () => Promise<void>;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(getCapturedPrompt);

  const isIos =
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  useEffect(() => {
    return subscribeToCapturedPrompt((e) => setDeferredPrompt(e));
  }, []);

  async function triggerInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearCapturedPrompt();
    setDeferredPrompt(null);
  }

  const canInstall = !isStandalone && (deferredPrompt !== null || isIos);

  return { canInstall, isIos, isStandalone, triggerInstall };
}
