const VAPID_PUBLIC_KEY =
    "BFFFprRbDqSUgpdgu32puCJN_NBusRFJSGs4ar4LIkFAmXEiJcIDJ9q-_EI5MlmYE0mdsz0dYr7_IebqOyjrcjc";

const API_URL = "http://localhost:5000";


// ==========================================
// CONVERT VAPID KEY
// ==========================================

function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}


// ==========================================
// ENABLE PUSH NOTIFICATIONS
// ==========================================

async function enablePushNotifications() {

    try {

        console.log(
            "Notification permission before:",
            Notification.permission
        );


        // ======================================
        // CHECK NOTIFICATION SUPPORT
        // ======================================

        if (!("Notification" in window)) {

            alert(
                "This browser does not support notifications."
            );

            return;
        }


        // ======================================
        // CHECK SERVICE WORKER SUPPORT
        // ======================================

        if (!("serviceWorker" in navigator)) {

            alert(
                "Service Worker is not supported."
            );

            return;
        }


        // ======================================
        // REQUEST NOTIFICATION PERMISSION
        // ======================================

        const permission =
            await Notification.requestPermission();

        console.log(
            "Notification permission result:",
            permission
        );


        if (permission !== "granted") {

            alert(
                "Notification permission was not granted."
            );

            return;
        }


        // ======================================
        // REGISTER SERVICE WORKER
        // ======================================

        console.log(
            "Registering Service Worker..."
        );


        const registration =
            await navigator.serviceWorker.register(
                "/service-worker.js",
                {
                    scope: "/"
                }
            );


        console.log(
            "Service Worker registered:",
            registration
        );


        // ======================================
        // WAIT FOR SERVICE WORKER
        // ======================================

        await navigator.serviceWorker.ready;

        console.log(
            "Service Worker is ready."
        );


        // ======================================
        // GET EXISTING PUSH SUBSCRIPTION
        // ======================================

        let subscription =
            await registration.pushManager
                .getSubscription();


        if (subscription) {

            console.log(
                "Existing push subscription found."
            );

        } else {

            console.log(
                "No existing subscription found."
            );

        }


        // ======================================
        // CREATE NEW PUSH SUBSCRIPTION
        // ======================================

        if (!subscription) {

            console.log(
                "Creating new push subscription..."
            );


            subscription =
                await registration.pushManager
                    .subscribe({

                        userVisibleOnly: true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                VAPID_PUBLIC_KEY
                            )

                    });


            console.log(
                "New push subscription created."
            );

        }


        // ======================================
        // SHOW SUBSCRIPTION
        // ======================================

        console.log(
            "Push subscription:",
            subscription.toJSON()
        );


        // ======================================
        // GET LOGIN TOKEN
        // ======================================

        const token =
            localStorage.getItem("token");


        if (!token) {

            alert(
                "Please login first."
            );

            console.log(
                "Login token not found."
            );

            return;
        }


        console.log(
            "Login token found."
        );


        // ======================================
        // SAVE SUBSCRIPTION TO BACKEND
        // ======================================

        console.log(
            "Saving subscription to backend..."
        );


        const response =
            await fetch(
                `${API_URL}/api/notifications/subscribe`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        subscription:
                            subscription.toJSON()

                    })

                }
            );


        // ======================================
        // READ BACKEND RESPONSE
        // ======================================

        const data =
            await response.json();


        console.log(
            "Backend response:",
            data
        );


        // ======================================
        // BACKEND ERROR
        // ======================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save subscription."
            );

        }


        // ======================================
        // SUCCESS
        // ======================================

        console.log(
            "Push subscription saved successfully."
        );


        alert(
            "🔔 Notifications enabled successfully!"
        );


    } catch (error) {

        console.error(
            "Notification setup error:",
            error
        );


        alert(
            "Notification setup failed: " +
            error.message
        );

    }

}


// ==========================================
// BUTTON CLICK
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "enable-notifications"
            );


        if (button) {

            button.addEventListener(
                "click",
                enablePushNotifications
            );

            console.log(
                "Notification button connected."
            );

        } else {

            console.log(
                "Enable Notifications button not found."
            );

        }

    }
);