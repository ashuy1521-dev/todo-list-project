const express = require("express");

const router = express.Router();

const {
    subscribeToPush,
    sendTestNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

console.log("protect type:", typeof protect);
console.log("subscribeToPush type:", typeof subscribeToPush);
console.log("sendTestNotification type:", typeof sendTestNotification);

router.post(
    "/subscribe",
    protect,
    subscribeToPush
);

router.post(
    "/test",
    protect,
    sendTestNotification
);

module.exports = router;