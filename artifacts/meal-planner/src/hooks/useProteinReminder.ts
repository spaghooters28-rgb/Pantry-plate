import { useEffect } from "react";

export const LS_REMINDER_KEY = "pp-protein-reminder";
const LS_SENT_PREFIX = "pp-protein-reminder-sent-";

export type ReminderSettings = {
  enabled: boolean;
  time: string; // "HH:MM" 24-hour
};

const ALL_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const VALID_TIME_RE = /^\d{2}:\d{2}$/;

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(LS_REMINDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ReminderSettings;
      if (!VALID_TIME_RE.test(parsed.time ?? "")) {
        parsed.time = "18:00";
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return { enabled: false, time: "18:00" };
}

export function saveReminderSettings(s: ReminderSettings) {
  localStorage.setItem(LS_REMINDER_KEY, JSON.stringify(s));
}

function getTomorrowDayName(): string {
  const todayIndex = new Date().getDay();
  return ALL_DAYS[(todayIndex + 1) % 7];
}

async function fetchTomorrowProtein(): Promise<{ protein: string; mealName: string } | null> {
  try {
    const res = await fetch("/api/weekly-plan");
    if (!res.ok) return null;
    const plan = await res.json() as { days?: { day: string; meal: { name: string; protein: string } | null }[] };
    if (!plan.days) return null;
    const tomorrow = getTomorrowDayName();
    const dayData = plan.days.find((d) => d.day === tomorrow);
    if (!dayData?.meal) return null;
    const { protein, name } = dayData.meal;
    if (!protein || ["none", "vegetarian", "vegan", ""].includes(protein.toLowerCase())) return null;
    return { protein, mealName: name };
  } catch {
    return null;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch {
    return null;
  }
}

function showNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // Prefer service worker notification (works on mobile / when app is backgrounded)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag,
      }).catch(() => {
        new Notification(title, { body, icon: "/favicon.svg", tag });
      });
    }).catch(() => {
      new Notification(title, { body, icon: "/favicon.svg", tag });
    });
  } else {
    try {
      new Notification(title, { body, icon: "/favicon.svg", tag });
    } catch { /* some browsers block new Notification in certain contexts */ }
  }
}

export async function sendTestNotification(): Promise<string> {
  if (!("Notification" in window)) {
    return "not-supported";
  }
  if (Notification.permission !== "granted") {
    return "permission-denied";
  }
  try {
    showNotification(
      "🍽️ Kitchen AI-d Reminder",
      "This is a test — your protein reminders are working!",
      "protein-reminder-test"
    );
    return "sent";
  } catch {
    return "error";
  }
}

export function useProteinReminder(isPro = false) {
  // When the user loses Pro status, clear the enabled flag from localStorage
  // so stale settings don't silently re-enable reminders on re-upgrade.
  useEffect(() => {
    if (isPro) return;
    const settings = loadReminderSettings();
    if (settings.enabled) {
      saveReminderSettings({ ...settings, enabled: false });
    }
  }, [isPro]);

  // Register the service worker on mount (only for Pro users)
  useEffect(() => {
    if (!isPro) return;
    registerServiceWorker();
  }, [isPro]);

  useEffect(() => {
    if (!isPro) return;
    async function check() {
      const settings = loadReminderSettings();
      if (!settings.enabled) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const [hh, mm] = settings.time.split(":").map(Number);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = hh * 60 + mm;

      if (nowMinutes !== targetMinutes) return;

      const todayStr = now.toISOString().split("T")[0];
      const sentKey = `${LS_SENT_PREFIX}${todayStr}`;
      if (localStorage.getItem(sentKey)) return;

      const data = await fetchTomorrowProtein();
      if (!data) return;

      showNotification(
        "🍽️ Kitchen AI-d — Protein Reminder",
        `Set out ${data.protein} tonight — "${data.mealName}" is on tomorrow's menu!`,
        "protein-reminder"
      );

      localStorage.setItem(sentKey, "1");
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [isPro]);
}
