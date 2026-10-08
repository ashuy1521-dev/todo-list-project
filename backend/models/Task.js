const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    // ==========================================
    // USER
    // ==========================================

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    // ==========================================
    // TASK TITLE
    // ==========================================

    title: {
        type: String,
        required: true,
        trim: true
    },


    // ==========================================
    // DESCRIPTION
    // ==========================================

    description: {
        type: String,
        default: ''
    },


    // ==========================================
    // CATEGORY
    // ==========================================

    category: {
        type: String,
        enum: [
            'Personal',
            'Work',
            'Study',
            'Other'
        ],
        default: 'Personal'
    },


    // ==========================================
    // PRIORITY
    // ==========================================

    priority: {
        type: String,
        enum: [
            'Low',
            'Medium',
            'High'
        ],
        default: 'Medium'
    },


    // ==========================================
    // STATUS
    // ==========================================

    status: {
        type: String,
        enum: [
            'Pending',
            'Completed'
        ],
        default: 'Pending'
    },


    // ==========================================
    // DUE DATE
    // ==========================================

    dueDate: {
        type: Date,
        default: null
    },


    // ==========================================
    // DUE TIME
    // Example: "18:30"
    // ==========================================

    dueTime: {
        type: String,
        default: ''
    },


    // ==========================================
    // REMINDER MINUTES
    //
    // 0  = at due time
    // 5  = 5 minutes before
    // 10 = 10 minutes before
    // 30 = 30 minutes before
    // 60 = 1 hour before
    // ==========================================

    reminderMinutes: {
        type: Number,
        default: 10,
        min: 0
    },


    // ==========================================
    // REMINDER SENT
    //
    // false = reminder pending
    // true  = reminder already sent
    // ==========================================

    reminderSent: {
        type: Boolean,
        default: false
    }

}, {

    timestamps: true

});


// ==========================================
// EXPORT MODEL
// ==========================================

module.exports =
    mongoose.model('Task', taskSchema);
