const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();

// ==========================================
// IMPORT REMINDER SERVICE
// ==========================================

const {
    checkTaskReminders
} = require("./services/reminderService");

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/tasks",
    require("./routes/taskRoutes")
);

app.use(
    "/api/notifications",
    require("./routes/notificationRoutes")
);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );

});

// ==========================================
// SERVER PORT
// ==========================================

const PORT =
    process.env.PORT || 5000;


// ==========================================
// REMINDER CHECK LOCK
// ==========================================
//
// Prevents multiple reminder checks from
// running at the same time.
//

let reminderCheckRunning = false;


// ==========================================
// RUN REMINDER CHECK
// ==========================================

const runReminderCheck = async () => {

    // If previous check is still running,
    // skip this cycle.

    if (reminderCheckRunning) {

        console.log(
            "⏳ Previous reminder check is still running..."
        );

        return;
    }


    reminderCheckRunning = true;


    try {

        await checkTaskReminders();

    } catch (error) {

        console.error(
            "❌ Reminder scheduler error:",
            error.message
        );

    } finally {

        reminderCheckRunning = false;

    }

};


// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {

    try {

        // ======================================
        // CONNECT MONGODB FIRST
        // ======================================

        await connectDB();

        console.log(
            "=========================================="
        );

        console.log(
            "MongoDB connection ready."
        );


        // ======================================
        // START EXPRESS SERVER
        // ======================================

        app.listen(PORT, () => {

            console.log(
                `Server running on port ${PORT}`
            );

        });


        // ======================================
        // CHECK REMINDERS IMMEDIATELY
        // ======================================

        console.log(
            "Checking reminders on server start..."
        );

        await runReminderCheck();


        // ======================================
        // REMINDER SCHEDULER
        // ======================================

        // Check every 1 second

        setInterval(
            async () => {

                await runReminderCheck();

            },
            1000
        );


        console.log(
            "=========================================="
        );

        console.log(
            "✅ Reminder scheduler started."
        );

        console.log(
            "⏱️ Reminder check interval: 1 second"
        );

        console.log(
            "=========================================="
        );


    } catch (error) {

        console.error(
            "❌ Server startup error:",
            error.message
        );

        process.exit(1);

    }

};


// ==========================================
// RUN SERVER
// ==========================================

startServer();
