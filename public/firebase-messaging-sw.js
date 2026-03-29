importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA0bwrEFl-FsF7KSetTzd9CJfxLbKVC1sM",
  authDomain: "stalk-shops.firebaseapp.com",
  projectId: "stalk-shops",
  messagingSenderId: "513255172164",
  appId: "1:513255172164:web:7bafdad47f7f146aaeb411"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[ServiceWorker] Background message received:", payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "Stalk Shops Alert";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "New update from Stalk Shops!",
    icon: "/mylogo.png",
    badge: "/mylogo.png",
    tag: "stalk-shops-bg",
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});