const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

// ==========================================
// VAPID CONFIGURATION
// ==========================================

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);


// ==========================================
// SAVE PUSH SUBSCRIPTION
// ==========================================

const subscribeToPush = async (req, res) => {

    try {

        const { subscription } = req.body;

        if (
            !subscription ||
            !subscription.endpoint ||
            !subscription.keys ||
            !subscription.keys.p256dh ||
            !subscription.keys.auth
        ) {

            return res.status(400).json({
                message: "Invalid push subscription"
            });

        }

        const savedSubscription =
            await PushSubscription.findOneAndUpdate(

                {
                    endpoint: subscription.endpoint
                },

                {
                    user: req.user._id,

                    endpoint: subscription.endpoint,

                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                },

                {
                    new: true,
                    upsert: true
                }
            );

        return res.status(201).json({

            message: "Push subscription saved successfully",

            subscription: savedSubscription

        });

    } catch (error) {

        console.error("Subscribe error:", error);

        return res.status(500).json({

            message: "Failed to save push subscription",

            error: error.message

        });

    }

};


// ==========================================
// SEND TEST NOTIFICATION
// ==========================================

const sendTestNotification = async (req, res) => {

    try {

        console.log("Sending test notification...");
        console.log("User ID:", req.user._id);


        // Find user's subscription
        const subscription =
            await PushSubscription.findOne({
                user: req.user._id
            });


        if (!subscription) {

            return res.status(404).json({

                message:
                    "No push subscription found. Please enable notifications first."

            });

        }


        console.log(
            "Subscription found:",
            subscription.endpoint
        );


        const pushSubscription = {

            endpoint: subscription.endpoint,

            keys: {

                p256dh: subscription.keys.p256dh,

                auth: subscription.keys.auth

            }

        };


        const payload = JSON.stringify({

            title: "TaskMaster Pro",

            body: "🎉 Background notifications are working!",

            icon: "/icon.png",

            badge: "/icon.png",

            url: "/frontend/dashboard.html"

        });


        await webpush.sendNotification(
            pushSubscription,
            payload
        );


        console.log(
            "Notification sent successfully!"
        );


        return res.status(200).json({

            message:
                "Test notification sent successfully"

        });


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );


        // ======================================
        // DELETE EXPIRED SUBSCRIPTION
        // ======================================

        if (
            error.statusCode === 404 ||
            error.statusCode === 410
        ) {

            console.log(
                "Expired subscription found. Deleting..."
            );


            try {

                await PushSubscription.deleteOne({

                    user: req.user._id

                });


                console.log(
                    "Expired subscription deleted."
                );

            } catch (deleteError) {

                console.error(
                    "Failed to delete expired subscription:",
                    deleteError
                );

            }


            return res.status(410).json({

                message:
                    "Push subscription expired. Please enable notifications again."

            });

        }


        return res.status(500).json({

            message:
                "Failed to send notification",

            error:
                error.message

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    subscribeToPush,

    sendTestNotification

};