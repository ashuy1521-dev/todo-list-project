const Task = require("../models/Task");
const PushSubscription = require("../models/PushSubscription");

const {
    sendPushNotification
} = require("./pushNotification");


// ==========================================
// CHECK TASK REMINDERS
// ==========================================

const checkTaskReminders = async () => {

    try {

        const now = new Date();

        console.log(
            "=========================================="
        );

        console.log(
            "Checking task reminders:",
            now.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata"
            })
        );


        // ==========================================
        // FIND PENDING TASKS
        // ==========================================

        const tasks = await Task.find({

            status: "Pending",

            dueDate: {
                $ne: null
            },

            dueTime: {
                $ne: ""
            },

            $or: [
                {
                    reminderSent: false
                },
                {
                    reminderSent: {
                        $exists: false
                    }
                }
            ]

        });


        console.log(
            "Reminder tasks found:",
            tasks.length
        );


        // ==========================================
        // NO TASKS
        // ==========================================

        if (tasks.length === 0) {

            console.log(
                "No pending reminder tasks found."
            );

            return;
        }


        // ==========================================
        // PROCESS TASKS
        // ==========================================

        for (const task of tasks) {

            try {

                console.log(
                    "------------------------------------------"
                );

                console.log(
                    "Processing task:",
                    task.title
                );

                console.log(
                    "Task ID:",
                    task._id.toString()
                );


                // ======================================
                // CREATE DATE
                // ======================================

                const dueDate =
                    new Date(task.dueDate);


                if (
                    Number.isNaN(
                        dueDate.getTime()
                    )
                ) {

                    console.log(
                        "❌ Invalid due date:",
                        task.dueDate
                    );

                    continue;
                }


                // ======================================
                // READ DUE TIME
                // ======================================

                const timeParts =
                    String(task.dueTime)
                        .trim()
                        .split(":");


                const hours =
                    Number(timeParts[0]);

                const minutes =
                    Number(timeParts[1]);


                // ======================================
                // VALIDATE TIME
                // ======================================

                if (
                    !Number.isInteger(hours) ||
                    !Number.isInteger(minutes) ||
                    hours < 0 ||
                    hours > 23 ||
                    minutes < 0 ||
                    minutes > 59
                ) {

                    console.log(
                        "❌ Invalid due time:",
                        task.dueTime
                    );

                    continue;
                }


                // ======================================
                // SET DUE TIME
                // ======================================

                dueDate.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );


                // ======================================
                // REMINDER MINUTES
                // ======================================

                let reminderMinutes =
                    Number(
                        task.reminderMinutes
                    );


                if (
                    !Number.isFinite(
                        reminderMinutes
                    ) ||
                    reminderMinutes < 0
                ) {

                    reminderMinutes = 10;
                }


                // ======================================
                // CALCULATE REMINDER TIME
                // ======================================

                const reminderTime =
                    new Date(
                        dueDate.getTime() -
                        (
                            reminderMinutes *
                            60 *
                            1000
                        )
                    );


                // ======================================
                // LOG ALL TIMES
                // ======================================

                console.log(
                    "Current Time:",
                    now.toLocaleString(
                        "en-IN",
                        {
                            timeZone:
                                "Asia/Kolkata"
                        }
                    )
                );

                console.log(
                    "Due Date:",
                    dueDate.toLocaleString(
                        "en-IN",
                        {
                            timeZone:
                                "Asia/Kolkata"
                        }
                    )
                );

                console.log(
                    "Reminder Minutes:",
                    reminderMinutes
                );

                console.log(
                    "Reminder Time:",
                    reminderTime.toLocaleString(
                        "en-IN",
                        {
                            timeZone:
                                "Asia/Kolkata"
                        }
                    )
                );


                // ======================================
                // CHECK REMINDER TIME
                // ======================================

                const reminderReached =
                    now.getTime() >=
                    reminderTime.getTime();


                console.log(
                    "Reminder reached:",
                    reminderReached
                );


                // ======================================
                // NOT YET TIME
                // ======================================

                if (!reminderReached) {

                    console.log(
                        "⏳ Reminder time has not arrived yet."
                    );

                    continue;
                }


                // ======================================
                // REMINDER REACHED
                // ======================================

                console.log(
                    "🔔 Reminder time reached!"
                );

                console.log(
                    "Sending reminder for:",
                    task.title
                );


                // ======================================
                // FIND PUSH SUBSCRIPTION
                // ======================================

                const subscription =
                    await PushSubscription.findOne({
                        user: task.user
                    });


                // ======================================
                // SUBSCRIPTION NOT FOUND
                // ======================================

                if (!subscription) {

                    console.log(
                        "❌ No push subscription found for user:",
                        task.user.toString()
                    );

                    continue;
                }


                console.log(
                    "✅ Push subscription found."
                );


                // ======================================
                // CREATE PUSH SUBSCRIPTION OBJECT
                // ======================================

                const pushSubscription = {

                    endpoint:
                        subscription.endpoint,

                    keys: {

                        p256dh:
                            subscription.keys.p256dh,

                        auth:
                            subscription.keys.auth

                    }

                };


                // ======================================
                // NOTIFICATION PAYLOAD
                // ======================================

                const payload = {

                    title:
                        "⏰ Task Reminder",

                    body:
                        `Reminder: ${task.title}`,

                    icon:
                        "/icon.png",

                    badge:
                        "/icon.png",

                    url:
                        "/dashboard.html"

                };


                console.log(
                    "📤 Sending push notification..."
                );


                // ======================================
                // SEND NOTIFICATION
                // ======================================

                const sent =
                    await sendPushNotification(
                        pushSubscription,
                        payload
                    );


                // ======================================
                // SUCCESS
                // ======================================

                if (sent) {

                    task.reminderSent = true;

                    await task.save();


                    console.log(
                        "=========================================="
                    );

                    console.log(
                        "✅ Reminder sent successfully:",
                        task.title
                    );

                    console.log(
                        "=========================================="
                    );

                } else {

                    console.log(
                        "❌ Push notification failed:",
                        task.title
                    );

                }

            } catch (taskError) {

                console.error(
                    "❌ Error processing task:",
                    task._id.toString(),
                    taskError.message
                );

            }

        }

    } catch (error) {

        console.error(
            "❌ Reminder service error:",
            error.message
        );

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    checkTaskReminders
};
