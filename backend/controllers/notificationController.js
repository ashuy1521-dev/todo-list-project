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
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User authentication required"
            });
        }

        const userId = req.user._id;
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

        console.log("========== SAVE PUSH SUBSCRIPTION ==========");
        console.log("Authenticated user ID:", userId.toString());
        console.log("Subscription endpoint:", subscription.endpoint);

        const savedSubscription =
            await PushSubscription.findOneAndUpdate(
                { endpoint: subscription.endpoint },
                {
                    $set: {
                        user: userId,
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

        console.log(
            "Saved subscription user ID:",
            savedSubscription.user.toString()
        );

        console.log("Push subscription saved successfully");

        return res.status(201).json({
            message: "Push subscription saved successfully",
            subscription: {
                user: savedSubscription.user,
                endpoint: savedSubscription.endpoint
            }
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
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User authentication required"
            });
        }

        const userId = req.user._id;

        console.log("========== TEST PUSH NOTIFICATION ==========");
        console.log("Authenticated user ID:", userId.toString());

        const subscription = await PushSubscription.findOne({
            user: userId
        });

        if (!subscription) {
            console.log(
                "No subscription found for user:",
                userId.toString()
            );

            return res.status(404).json({
                message:
                    "No push subscription found. Please enable notifications first."
            });
        }

        console.log("Subscription found:", subscription.endpoint);
        console.log(
            "Subscription owner ID:",
            subscription.user.toString()
        );

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        };

        const payload = JSON.stringify({
            title: "Master Pro",
            body: "🎉 Push notifications are working!",
            icon: "/icon.png",
            badge: "/icon.png",
            url: "/dashboard.html"
        });

        await webpush.sendNotification(
            pushSubscription,
            payload
        );

        console.log("Test notification sent successfully");

        return res.status(200).json({
            message: "Test notification sent successfully"
        });

    } catch (error) {
        console.error("Notification error:", error);

        if (
            error.statusCode === 404 ||
            error.statusCode === 410
        ) {
            try {
                await PushSubscription.deleteOne({
                    user: req.user._id
                });

                console.log(
                    "Expired subscription deleted for user:",
                    req.user._id.toString()
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
            message: "Failed to send notification",
            error: error.message
        });
    }
};

// ==========================================
// CHECK CURRENT USER SUBSCRIPTION
// ==========================================

const checkPushSubscription = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "User authentication required"
            });
        }

        const subscription = await PushSubscription.findOne({
            user: req.user._id
        }).select("user endpoint createdAt");

        if (!subscription) {
            return res.status(200).json({
                subscribed: false,
                message: "No push subscription found for this user"
            });
        }

        return res.status(200).json({
            subscribed: true,
            subscription: {
                user: subscription.user,
                endpoint: subscription.endpoint,
                createdAt: subscription.createdAt
            }
        });

    } catch (error) {
        console.error("Check subscription error:", error);

        return res.status(500).json({
            message: "Failed to check push subscription",
            error: error.message
        });
    }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    subscribeToPush,
    sendTestNotification,
    checkPushSubscription
};
