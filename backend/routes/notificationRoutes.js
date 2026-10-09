const express = require("express");
const router = express.Router();

const {
    subscribeToPush,
    sendTestNotification,
    checkPushSubscription
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// Debug logs
console.log("protect type:", typeof protect);
console.log("subscribeToPush type:", typeof subscribeToPush);
console.log("sendTestNotification type:", typeof sendTestNotification);
console.log("checkPushSubscription type:", typeof checkPushSubscription);

// Save push subscription
router.post(
    "/subscribe",
    protect,
    subscribeToPush
);

// Send test notification
router.post(
    "/test",
    protect,
    sendTestNotification
);

// Check current user's subscription
router.get(
    "/status",
    protect,
    checkPushSubscription
);

module.exports = router;
