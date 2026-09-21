const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Personal', 'Work', 'Study', 'Other'], default: 'Personal' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);