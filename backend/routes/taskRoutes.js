const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, toggleCompleteTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.put('/:id/complete', toggleCompleteTask);

module.exports = router;