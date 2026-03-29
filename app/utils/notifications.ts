import { getToken, Messaging, isSupported, getMessaging, onMessage } from "firebase/messaging";
import { app } from "./firebase.js";
import { toast } from "react-toastify";

export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log("This browser does not support notifications.");
        return null;
    }

    const role = localStorage.getItem('role') || 'user';
    const contextName = role === 'vendor' ? 'new pins' : 'vendor confirmations';

    try {
        const supported = await isSupported();
        if (!supported) {
            console.log("FCM is not supported in this browser.");
            return null;
        }

        const messaging = getMessaging(app);

        // Check current status
        if (Notification.permission === "denied") {
            toast.warn(`Notifications are blocked! Please enable them in your browser settings to see ${contextName}.`, {
                toastId: 'notif-blocked'
            });
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === "denied") {
            toast.error(`Permission denied! You won't receive native alerts. Check your browser lock icon to fix this.`, {
                toastId: 'notif-denied'
            });
            return null;
        }
        
        if (permission !== "granted") return null;

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
            console.log("FCM Token assigned:", token);
            
            // Register/Ensure Service Worker
            let registration: ServiceWorkerRegistration | undefined;
            if ('serviceWorker' in navigator) {
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log("Service Worker registered/verified.");
            }

            // Send to backend
            const authToken = localStorage.getItem('token');
            if (authToken) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${role}/save-fcm-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ token })
                });
                
                if (res.ok) {
                    console.log("FCM Token synced with backend.");
                }
            }

            // --- Handle Foreground Messages with Native Alerts ---
            if (!(window as any)._fcmListenerAttached) {
                onMessage(messaging, (payload) => {
                    console.log("Foreground Payload:", payload);
                    
                    // Trigger NATIVE notification if supported and permission granted
                    if (registration && Notification.permission === "granted") {
                        registration.showNotification(payload.notification?.title || "Stalk Shops", {
                            body: payload.notification?.body || "New alert received!",
                            icon: "/mylogo.png",
                            badge: "/mylogo.png",
                            tag: "stalk-shops-alert",
                            data: payload.data
                        });
                    }

                    // Also show a fallback toast for immediate feedback
                    if (payload.notification?.body) {
                        toast.info(payload.notification.body, {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "dark"
                        });
                    }
                });
                (window as any)._fcmListenerAttached = true;
            }

            return token;
        }
    } catch (error) {
        console.error("FCM Permission/Token Error:", error);
    }
    return null;
};
