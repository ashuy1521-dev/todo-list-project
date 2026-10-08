// ==========================================
// TaskMaster Pro - Service Worker
// Background Push Notifications
// ==========================================


// ------------------------------------------
// INSTALL
// ------------------------------------------

self.addEventListener("install", (event) => {

    console.log(
        "🔥 TaskMaster Pro Service Worker installed."
    );

    self.skipWaiting();

});


// ------------------------------------------
// ACTIVATE
// ------------------------------------------

self.addEventListener("activate", (event) => {

    console.log(
        "✅ TaskMaster Pro Service Worker activated."
    );

    event.waitUntil(
        self.clients.claim()
    );

});


// ------------------------------------------
// PUSH NOTIFICATION
// ------------------------------------------

self.addEventListener("push", (event) => {

    console.log(
        "🔔 PUSH EVENT RECEIVED"
    );


    let data = {

        title:
            "TaskMaster Pro",

        body:
            "You have a task notification.",

        icon:
            "/icon.png",

        badge:
            "/icon.png",

        url:
            "/dashboard.html"

    };


    // ==========================================
    // READ PUSH DATA
    // ==========================================

    if (event.data) {

        try {

            const pushData =
                event.data.json();


            console.log(
                "📦 Push data received:",
                pushData
            );


            data = {

                ...data,

                ...pushData

            };

        } catch (error) {

            console.error(
                "❌ Push JSON error:",
                error
            );


            try {

                const text =
                    event.data.text();


                console.log(
                    "📦 Push text received:",
                    text
                );


                data.body = text;

            } catch (textError) {

                console.error(
                    "❌ Unable to read push data:",
                    textError
                );

            }

        }

    }


    // ==========================================
    // SHOW NOTIFICATION
    // ==========================================

    event.waitUntil(

        (async () => {

            try {

                console.log(
                    "🔔 Showing notification..."
                );


                await self.registration.showNotification(

                    data.title ||
                    "TaskMaster Pro",

                    {

                        body:
                            data.body ||
                            "You have a new task notification.",


                        icon:
                            data.icon ||
                            "/icon.png",


                        badge:
                            data.badge ||
                            data.icon ||
                            "/icon.png",


                        data: {

                            url:
                                data.url ||
                                "/dashboard.html"

                        },


                        requireInteraction:
                            true,


                        vibrate: [

                            200,

                            100,

                            200

                        ],


                        tag:
                            "taskmaster-notification",


                        renotify:
                            true

                    }

                );


                console.log(
                    "✅ Browser notification displayed successfully."
                );


            } catch (error) {

                console.error(
                    "❌ showNotification() failed:",
                    error
                );

            }

        })()

    );

});


// ------------------------------------------
// NOTIFICATION CLICK
// ------------------------------------------

self.addEventListener(
    "notificationclick",
    (event) => {

        console.log(
            "🖱️ Notification clicked."
        );


        event.notification.close();


        const notificationData =
            event.notification.data;


        const notificationUrl =
            notificationData &&
            notificationData.url
                ? notificationData.url
                : "/dashboard.html";


        event.waitUntil(

            clients
                .matchAll({

                    type:
                        "window",

                    includeUncontrolled:
                        true

                })

                .then((clientList) => {

                    // ==================================
                    // FIND EXISTING DASHBOARD
                    // ==================================

                    for (
                        const client
                        of clientList
                    ) {

                        if (

                            client.url.includes(
                                "/dashboard.html"
                            )

                            &&

                            "focus" in client

                        ) {

                            console.log(
                                "📂 Existing dashboard focused."
                            );

                            return client.focus();

                        }

                    }


                    // ==================================
                    // OPEN DASHBOARD
                    // ==================================

                    if (
                        clients.openWindow
                    ) {

                        console.log(
                            "🌐 Opening dashboard."
                        );


                        return clients.openWindow(
                            notificationUrl
                        );

                    }

                })

        );

    }

);


// ------------------------------------------
// NOTIFICATION CLOSE
// ------------------------------------------

self.addEventListener(
    "notificationclose",
    (event) => {

        console.log(
            "🔕 TaskMaster Pro notification closed."
        );

    }
);