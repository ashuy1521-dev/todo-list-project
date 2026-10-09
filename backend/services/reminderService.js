const Task = require("../models/Task");
const PushSubscription = require("../models/PushSubscription");
const { sendPushNotification } = require("./pushNotification");

const TIME_ZONE = "Asia/Kolkata";

const checkTaskReminders = async () => {
    try {
        const now = new Date();

        console.log("==========================================");
        console.log(
            "Checking task reminders:",
            now.toLocaleString("en-IN", { timeZone: TIME_ZONE })
        );

        const tasks = await Task.find({
            status: "Pending",
            dueDate: { $ne: null },
            dueTime: { $exists: true, $nin: ["", null] },
            reminderSent: false
        });

        console.log("Reminder tasks found:", tasks.length);

        for (const task of tasks) {
            try {
                console.log("------------------------------------------");
                console.log("Processing task:", task.title);
                console.log("Task ID:", task._id.toString());
                console.log("Task user ID:", String(task.user));

                if (!task.dueDate || !task.dueTime) {
                    console.log("Skipping: due date/time missing");
                    continue;
                }

                const timeParts = String(task.dueTime).split(":");
                const hours = Number(timeParts[0]);
                const minutes = Number(timeParts[1]);

                if (
                    !Number.isInteger(hours) ||
                    !Number.isInteger(minutes) ||
                    hours < 0 || hours > 23 ||
                    minutes < 0 || minutes > 59
                ) {
                    console.log("Invalid due time:", task.dueTime);
                    continue;
                }

                const dateText = task.dueDate instanceof Date
                    ? task.dueDate.toISOString().slice(0, 10)
                    : String(task.dueDate).slice(0, 10);

                const dateParts = dateText.split("-").map(Number);

                if (
                    dateParts.length !== 3 ||
                    dateParts.some(Number.isNaN)
                ) {
                    console.log("Invalid due date:", task.dueDate);
                    continue;
                }

                // Convert India local date/time to UTC timestamp.
                const dueTime = new Date(
                    Date.UTC(
                        dateParts[0],
                        dateParts[1] - 1,
                        dateParts[2],
                        hours - 5,
                        minutes - 30
                    )
                );

                let reminderMinutes = Number(task.reminderMinutes);

                if (
                    !Number.isFinite(reminderMinutes) ||
                    reminderMinutes < 0
                ) {
                    reminderMinutes = 10;
                }

                const reminderTime = new Date(
                    dueTime.getTime() -
                    reminderMinutes * 60 * 1000
                );

                console.log(
                    "Current IST:",
                    now.toLocaleString("en-IN", {
                        timeZone: TIME_ZONE
                    })
                );

                console.log(
                    "Due IST:",
                    dueTime.toLocaleString("en-IN", {
                        timeZone: TIME_ZONE
                    })
                );

                console.log("Reminder minutes:", reminderMinutes);

                console.log(
                    "Reminder IST:",
                    reminderTime.toLocaleString("en-IN", {
                        timeZone: TIME_ZONE
                    })
                );

                if (now.getTime() < reminderTime.getTime()) {
                    console.log("Reminder time has not arrived yet.");
                    continue;
                }

                console.log("Reminder time reached!");

                const subscription = await PushSubscription.findOne({
                    user: task.user
                });

                if (!subscription) {
                    console.log(
                        "No push subscription for task user:",
                        String(task.user)
                    );
                    continue;
                }

                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                };

                const payload = {
                    title: "⏰ Task Reminder",
                    body: `Reminder: ${task.title}`,
                    icon: "/icon.png",
                    badge: "/icon.png",
                    url: "/dashboard.html"
                };

                console.log("Sending push notification...");

                const sent = await sendPushNotification(
                    pushSubscription,
                    payload
                );

                if (sent) {
                    task.reminderSent = true;
                    await task.save();

                    console.log(
                        "Reminder sent successfully:",
                        task.title
                    );
                } else {
                    console.log(
                        "Push failed; will retry:",
                        task.title
                    );
                }
            } catch (taskError) {
                console.error(
                    "Error processing task:",
                    task._id,
                    taskError.message
                );
            }
        }
    } catch (error) {
        console.error(
            "Reminder service error:",
            error.message
        );
    }
};

module.exports = {
    checkTaskReminders
};
