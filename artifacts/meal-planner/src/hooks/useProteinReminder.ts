import { useEffect } from "react";

export const LS_REMINDER_KEY = "pp-protein-reminder";
const LS_SENT_PREFIX = "pp-protein-reminder-sent-";

export type ReminderSettings = {
  enabled: boolean;
  time: string; // "HH:MM" 24-hour
};

const ALL_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(LS_REMINDER_KEY);
    if (raw) return JSON.parse(raw) as ReminderSettings;
  } catch { /* ignore */ }
  return { enabled: false, time: "18:00" };
}

export function saveReminderSettings(s: ReminderSettings) {
  localStorage.setItem(LS_REMINDER_KEY, JSON.stringify(s));
}

function getTomorrowDayName(): string {
  const todayIndex = new Date().getDay(); // 0 = sunday
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

export async function sendTestNotification(): Promise<boolean> {
  if (Notification.permission !== "granted") return false;
  new Notification("🍽️ Pantry & Plate Reminder", {
    body: "Remember to set out your protein for tomorrow's meal!",
    icon: "/favicon.ico",
    tag: "protein-reminder-test",
  });
  return true;
}

export function useProteinReminder() {
  useEffect(() => {
    async function check() {
      const settings = loadReminderSettings();
      if (!settings.enabled) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const [hh, mm] = settings.time.split(":").map(Number);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = hh * 60 + mm;

      // Fire only during the target minute
      if (nowMinutes !== targetMinutes) return;

      // Avoid duplicate sends on the same day
      const todayStr = now.toISOString().split("T")[0];
      const sentKey = `${LS_SENT_PREFIX}${todayStr}`;
      if (localStorage.getItem(sentKey)) return;

      const data = await fetchTomorrowProtein();
      if (!data) return;

      new Notification("🍽️ Pantry & Plate — Protein Reminder", {
        body: `Set out ${data.protein} tonight — "${data.mealName}" is on tomorrow's menu!`,
        icon: "/favicon.ico",
        tag: "protein-reminder",
      });

      localStorage.setItem(sentKey, "1");
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);
}
