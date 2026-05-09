self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Pantry & Plate", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Pantry & Plate", {
      body: payload.body ?? "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: payload.tag ?? "pp-reminder",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
