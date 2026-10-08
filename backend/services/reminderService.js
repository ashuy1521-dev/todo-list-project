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
            now.toLocaleString("en-IN")
        );


        // ==========================================
        // FIND PENDING TASKS WITH REMINDER DETAILS
        // ==========================================

        const tasks = await Task.find({

            status: "Pending",

            dueDate: {
                $ne: null
            },

            dueTime: {
                $exists: true,
                $nin: ["", null]
            },

            reminderSent: false

        });


        console.log(
            "Reminder tasks found:",
            tasks.length
        );


        // ==========================================
        // PROCESS EACH TASK
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
                // CHECK DUE DATE
                // ======================================

                if (!task.dueDate) {

                    console.log(
                        "⏭️ Skipping task because due date is missing:",
                        task.title
                    );

                    continue;
                }


                const dueDate =
                    new Date(task.dueDate);


                // ======================================
                // VALIDATE DUE DATE
                // ======================================

                if (
                    isNaN(
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
                // CHECK DUE TIME
                // ======================================

                if (!task.dueTime) {

                    console.log(
                        "⏭️ Skipping task because due time is not set:",
                        task.title
                    );

                    continue;
                }


                // ======================================
                // READ DUE TIME
                // ======================================

                const timeParts =
                    String(task.dueTime).split(":");


                const hours =
                    Number(timeParts[0]);

                const minutes =
                    Number(timeParts[1]);


                // ======================================
                // VALIDATE DUE TIME
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
                // GET REMINDER MINUTES
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
                // LOG TIME INFORMATION
                // ======================================

                console.log(
                    "Current Time:",
                    now.toLocaleString("en-IN")
                );

                console.log(
                    "Due Time:",
                    dueDate.toLocaleString("en-IN")
                );

                console.log(
                    "Reminder Minutes:",
                    reminderMinutes
                );

                console.log(
                    "Reminder Time:",
                    reminderTime.toLocaleString("en-IN")
                );


                // ======================================
                // CHECK WHETHER REMINDER TIME REACHED
                // ======================================

                const reminderReached =
                    now.getTime() >=
                    reminderTime.getTime();


                console.log(
                    "Reminder reached:",
                    reminderReached
                );


                // ======================================
                // REMINDER NOT YET REACHED
                // ======================================

                if (!reminderReached) {

                    console.log(
                        "⏳ Reminder time has not arrived yet."
                    );

                    continue;
                }


                // ======================================
                // REMINDER TIME REACHED
                // ======================================

                console.log(
                    "🔔 Reminder time reached!"
                );

                console.log(
                    "Sending reminder for:",
                    task.title
                );


                // ======================================
                // FIND USER PUSH SUBSCRIPTION
                // ======================================

                const subscription =
                    await PushSubscription.findOne({

                        user: task.user

                    });


                // ======================================
                // NO SUBSCRIPTION
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
                // ==========================================

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


                // ======================================
                // SEND PUSH NOTIFICATION
                // ======================================

                console.log(
                    "📤 Sending push notification..."
                );


                const sent =
                    await sendPushNotification(
                        pushSubscription,
                        payload
                    );


                // ======================================
                // PUSH SUCCESS
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
                    task._id,
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
