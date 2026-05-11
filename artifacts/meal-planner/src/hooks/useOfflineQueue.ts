import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGroceryListQueryKey, getListPantryItemsQueryKey } from "@workspace/api-client-react";

const QUEUE_KEY = "pp_offline_queue";

export type OfflineOpType =
  | "grocery-toggle"
  | "grocery-add"
  | "grocery-delete"
  | "grocery-clear"
  | "pantry-quantity"
  | "pantry-instock";

export type QueuedOp = {
  key: string;
  type: OfflineOpType;
  itemId: number;
  payload: Record<string, unknown>;
  enqueuedAt: number;
};

type Queue = Record<string, QueuedOp>;

let isSyncingModule = false;
const syncListeners = new Set<(syncing: boolean) => void>();
const countListeners = new Set<(count: number) => void>();

function readQueue(): Queue {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Queue) : {};
  } catch {
    return {};
  }
}

function saveQueue(q: Queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  countListeners.forEach((fn) => fn(Object.keys(q).length));
}

export function enqueueOp(op: Omit<QueuedOp, "enqueuedAt">) {
  const q = readQueue();
  q[op.key] = { ...op, enqueuedAt: Date.now() };
  saveQueue(q);
}

export function dequeueOp(key: string) {
  const q = readQueue();
  if (key in q) {
    delete q[key];
    saveQueue(q);
  }
}

export function getPendingCount(): number {
  return Object.keys(readQueue()).length;
}

async function runSync(queryClient: ReturnType<typeof useQueryClient>) {
  if (isSyncingModule) return;
  const queue = readQueue();
  if (Object.keys(queue).length === 0) return;

  isSyncingModule = true;
  syncListeners.forEach((fn) => fn(true));

  const ops = Object.values(queue).sort((a, b) => a.enqueuedAt - b.enqueuedAt);
  let groceryChanged = false;
  let pantryChanged = false;

  for (const op of ops) {
    try {
      let url = "";
      let method = "PATCH";

      if (op.type === "grocery-toggle") {
        url = `/api/grocery-list/items/${op.itemId}`;
        groceryChanged = true;
      } else if (op.type === "grocery-add") {
        url = `/api/grocery-list/items`;
        method = "POST";
        groceryChanged = true;
      } else if (op.type === "grocery-delete") {
        url = `/api/grocery-list/items/${op.itemId}`;
        method = "DELETE";
        groceryChanged = true;
      } else if (op.type === "grocery-clear") {
        url = `/api/grocery-list/clear`;
        method = "POST";
        groceryChanged = true;
      } else if (op.type === "pantry-quantity") {
        url = `/api/pantry/items/${op.itemId}`;
        pantryChanged = true;
      } else if (op.type === "pantry-instock") {
        url = `/api/pantry/items/${op.itemId}`;
        pantryChanged = true;
      }

      if (!url) continue;

      const res = await fetch(url, {
        method,
        headers: method !== "DELETE" ? { "Content-Type": "application/json" } : undefined,
        body: method !== "DELETE" ? JSON.stringify(op.payload) : undefined,
      });

      if (res.ok) {
        dequeueOp(op.key);
      }
    } catch {
      // Still offline for this op — keep in queue
    }
  }

  if (groceryChanged) {
    queryClient.invalidateQueries({ queryKey: getGetGroceryListQueryKey() });
  }
  if (pantryChanged) {
    queryClient.invalidateQueries({ queryKey: getListPantryItemsQueryKey() });
  }

  isSyncingModule = false;
  syncListeners.forEach((fn) => fn(false));
}

/**
 * Read-only hook — subscribes to queue count and sync state.
 * Safe to call from any page; registers no network listeners.
 */
export function useOfflineQueueState() {
  const [pendingCount, setPendingCount] = useState(getPendingCount);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleCount = (count: number) => setPendingCount(count);
    const handleSync = (syncing: boolean) => setIsSyncing(syncing);
    countListeners.add(handleCount);
    syncListeners.add(handleSync);
    return () => {
      countListeners.delete(handleCount);
      syncListeners.delete(handleSync);
    };
  }, []);

  return { pendingCount, isSyncing };
}

/**
 * Full sync hook — also registers the online listener and drains the queue.
 * Should be mounted ONCE (via SyncManager in App.tsx).
 */
export function useOfflineQueue() {
  const queryClient = useQueryClient();
  const state = useOfflineQueueState();

  useEffect(() => {
    function handleOnline() {
      runSync(queryClient);
    }
    window.addEventListener("online", handleOnline);
    if (navigator.onLine) {
      runSync(queryClient);
    }
    return () => window.removeEventListener("online", handleOnline);
  }, [queryClient]);

  return state;
}
