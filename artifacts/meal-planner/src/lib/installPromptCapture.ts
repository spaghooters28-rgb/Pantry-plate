interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let _captured: BeforeInstallPromptEvent | null = null;
const _subscribers = new Set<(e: BeforeInstallPromptEvent) => void>();

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _captured = e as BeforeInstallPromptEvent;
  _subscribers.forEach((fn) => fn(_captured!));
});

export function getCapturedPrompt(): BeforeInstallPromptEvent | null {
  return _captured;
}

export function subscribeToCapturedPrompt(
  fn: (e: BeforeInstallPromptEvent) => void,
): () => void {
  _subscribers.add(fn);
  if (_captured) fn(_captured);
  return () => _subscribers.delete(fn);
}

export function clearCapturedPrompt(): void {
  _captured = null;
}
