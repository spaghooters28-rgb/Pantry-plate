/// <reference lib="webworker" />
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload: { title?: string; body?: string; tag?: string };
  try {
    payload = event.data.json() as typeof payload;
  } catch {
    payload = { title: "Pantry & Plate", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Pantry & Plate", {
      body: payload.body ?? "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: payload.tag ?? "pp-reminder",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    }),
  );
});
