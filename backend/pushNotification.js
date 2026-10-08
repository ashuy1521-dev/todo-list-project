const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    console.log("Push notification sent successfully");
    return true;
  } catch (error) {
    console.error("Push notification error:", error.message);
    return false;
  }
};

module.exports = {
  sendPushNotification
};