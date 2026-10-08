const Task = require("../models/Task");


// ==========================================
// GET ALL TASKS
// ==========================================

exports.getTasks = async (req, res) => {

    try {

        const tasks = await Task.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================================
// CREATE TASK
// ==========================================

exports.createTask = async (req, res) => {

    try {

        const {
            title,
            description,
            category,
            priority,
            dueDate,
            dueTime,
            reminderMinutes
        } = req.body;


        // Title validation

        if (!title || !title.trim()) {

            return res.status(400).json({
                message: "Title is required"
            });

        }


        // Create task

        const task = await Task.create({

            user: req.user._id,

            title: title.trim(),

            description: description || "",

            category: category || "Personal",

            priority: priority || "Medium",

            dueDate: dueDate || null,

            dueTime: dueTime || "",

            reminderMinutes:
                reminderMinutes !== undefined
                    ? Number(reminderMinutes)
                    : 10,

            reminderSent: false

        });


        res.status(201).json(task);


    } catch (error) {

        console.error(
            "Create task error:",
            error.message
        );

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================================
// UPDATE TASK
// ==========================================

exports.updateTask = async (req, res) => {

    try {

        const task = await Task.findById(
            req.params.id
        );


        // Task not found

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }


        // Check task ownership

        if (
            task.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(401).json({
                message: "Not authorized"
            });

        }


        const {
            title,
            description,
            category,
            priority,
            status,
            dueDate,
            dueTime,
            reminderMinutes
        } = req.body;


        // Update only provided fields

        if (title !== undefined) {
            task.title = title.trim();
        }

        if (description !== undefined) {
            task.description = description;
        }

        if (category !== undefined) {
            task.category = category;
        }

        if (priority !== undefined) {
            task.priority = priority;
        }

        if (status !== undefined) {
            task.status = status;
        }

        if (dueDate !== undefined) {
            task.dueDate = dueDate || null;
        }

        if (dueTime !== undefined) {
            task.dueTime = dueTime || "";
        }

        if (reminderMinutes !== undefined) {

            task.reminderMinutes =
                Number(reminderMinutes);

        }


        // If reminder details are changed,
        // allow reminder to be sent again

        if (
            dueDate !== undefined ||
            dueTime !== undefined ||
            reminderMinutes !== undefined
        ) {

            task.reminderSent = false;

        }


        await task.save();


        res.json(task);


    } catch (error) {

        console.error(
            "Update task error:",
            error.message
        );

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================================
// TOGGLE COMPLETE / PENDING
// ==========================================

exports.toggleCompleteTask = async (req, res) => {

    try {

        const task = await Task.findById(
            req.params.id
        );


        // Task not found

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }


        // Check ownership

        if (
            task.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(401).json({
                message: "Not authorized"
            });

        }


        // Toggle status

        task.status =
            task.status === "Completed"
                ? "Pending"
                : "Completed";


        // If task becomes pending again,
        // allow reminder again

        if (task.status === "Pending") {

            task.reminderSent = false;

        }


        await task.save();


        res.json(task);


    } catch (error) {

        console.error(
            "Toggle task error:",
            error.message
        );

        res.status(500).json({
            message: error.message
        });

    }

};


// ==========================================
// DELETE TASK
// ==========================================

exports.deleteTask = async (req, res) => {

    try {

        const task = await Task.findById(
            req.params.id
        );


        // Task not found

        if (!task) {

            return res.status(404).json({
                message: "Task not found"
            });

        }


        // Check ownership

        if (
            task.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(401).json({
                message: "Not authorized"
            });

        }


        await Task.findByIdAndDelete(
            req.params.id
        );


        res.json({
            message: "Task deleted successfully"
        });


    } catch (error) {

        console.error(
            "Delete task error:",
            error.message
        );

        res.status(500).json({
            message: error.message
        });

    }

};
