checkAuth();

let allTasks = [];
let activeCardFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {

    // Theme
    initTheme();

    // Load data
    loadUserProfile();
    loadTasks();

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        removeToken();
        window.location.href = 'login.html';
    });

    // Task form
    document
        .getElementById('task-form')
        .addEventListener('submit', handleTaskSubmit);

    // Cancel edit
    document
        .getElementById('cancel-edit-btn')
        .addEventListener('click', resetForm);

    // Search
    document
        .getElementById('search-input')
        .addEventListener('input', filterAndRenderTasks);

    // Status filter
    document
        .getElementById('filter-status')
        .addEventListener('change', () => {
            activeCardFilter = 'all';
            filterAndRenderTasks();
        });

    // Priority filter
    document
        .getElementById('filter-priority')
        .addEventListener('change', () => {
            activeCardFilter = 'all';
            filterAndRenderTasks();
        });

    // Category filter
    document
        .getElementById('filter-category')
        .addEventListener('change', () => {
            activeCardFilter = 'all';
            filterAndRenderTasks();
        });

});


/* ==========================================
   DARK MODE
========================================== */

function initTheme() {

    const themeToggleBtn =
        document.getElementById('theme-toggle');

    const themeIcon =
        document.getElementById('theme-icon');

    const savedTheme =
        localStorage.getItem('theme');

    if (savedTheme === 'dark') {

        document.body.classList.add('dark-mode');

        if (themeIcon) {
            themeIcon.textContent = '☀️';
        }

    }

    if (themeToggleBtn) {

        themeToggleBtn.addEventListener('click', () => {

            document.body.classList.toggle('dark-mode');

            const isDark =
                document.body.classList.contains('dark-mode');

            if (themeIcon) {
                themeIcon.textContent =
                    isDark ? '☀️' : '🌙';
            }

            localStorage.setItem(
                'theme',
                isDark ? 'dark' : 'light'
            );

        });

    }

}


/* ==========================================
   LOAD USER PROFILE
========================================== */

async function loadUserProfile() {

    try {

        const user =
            await fetchAPI('/auth/me');

        document.getElementById('user-name')
            .textContent = user.name;

    } catch (err) {

        console.error(err);

    }

}


/* ==========================================
   LOAD TASKS
========================================== */

async function loadTasks() {

    try {

        allTasks =
            await fetchAPI('/tasks');

        updateStats();

        filterAndRenderTasks();

    } catch (err) {

        showToast(
            err.message,
            'danger'
        );

    }

}


/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStats() {

    const today =
        new Date().setHours(
            0,
            0,
            0,
            0
        );

    const total =
        allTasks.length;

    const pending =
        allTasks.filter(
            task => task.status === 'Pending'
        ).length;

    const completed =
        allTasks.filter(
            task => task.status === 'Completed'
        ).length;

    const high =
        allTasks.filter(
            task =>
                task.priority === 'High' &&
                task.status === 'Pending'
        ).length;

    const overdue =
        allTasks.filter(task => {

            if (
                task.status === 'Completed' ||
                !task.dueDate
            ) {
                return false;
            }

            const taskDate =
                new Date(task.dueDate)
                    .setHours(0, 0, 0, 0);

            return taskDate < today;

        }).length;


    document.getElementById('stat-total')
        .textContent = total;

    document.getElementById('stat-pending')
        .textContent = pending;

    document.getElementById('stat-completed')
        .textContent = completed;

    document.getElementById('stat-high')
        .textContent = high;

    document.getElementById('stat-overdue')
        .textContent = overdue;

}


/* ==========================================
   CARD FILTER
========================================== */

function filterByCard(type) {

    activeCardFilter = type;

    filterAndRenderTasks();

}


/* ==========================================
   FILTER TASKS
========================================== */

function filterAndRenderTasks() {

    const search =
        document.getElementById('search-input')
            .value
            .toLowerCase();

    const status =
        document.getElementById('filter-status')
            .value;

    const priority =
        document.getElementById('filter-priority')
            .value;

    const category =
        document.getElementById('filter-category')
            .value;

    const today =
        new Date().setHours(
            0,
            0,
            0,
            0
        );


    const filtered =
        allTasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search) ||

                (
                    task.description &&
                    task.description
                        .toLowerCase()
                        .includes(search)
                );


            const matchesStatus =
                status === 'All' ||
                task.status === status;


            const matchesPriority =
                priority === 'All' ||
                task.priority === priority;


            const matchesCategory =
                category === 'All' ||
                task.category === category;


            let matchesCard = true;


            if (activeCardFilter === 'pending') {

                matchesCard =
                    task.status === 'Pending';

            }


            else if (activeCardFilter === 'completed') {

                matchesCard =
                    task.status === 'Completed';

            }


            else if (activeCardFilter === 'high') {

                matchesCard =
                    task.priority === 'High' &&
                    task.status === 'Pending';

            }


            else if (activeCardFilter === 'overdue') {

                const taskDate =
                    task.dueDate
                        ? new Date(task.dueDate)
                            .setHours(0, 0, 0, 0)
                        : null;

                matchesCard =
                    task.status !== 'Completed' &&
                    taskDate &&
                    taskDate < today;

            }


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory &&
                matchesCard
            );

        });


    document.getElementById('task-count-badge')
        .textContent =
        `${filtered.length} Tasks`;


    renderTaskList(filtered);

}


/* ==========================================
   RENDER TASK LIST
========================================== */

function renderTaskList(tasks) {

    const container =
        document.getElementById('task-list');


    if (tasks.length === 0) {

        container.innerHTML = `

            <div class="card border-0 shadow-sm rounded-4 text-center py-5">

                <div class="card-body">

                    <i class="bi bi-inbox fs-1 text-muted"></i>

                    <h6 class="fw-bold text-dark mt-2 mb-1">
                        No tasks found
                    </h6>

                    <p class="text-muted small mb-0">
                        Try adjusting your filters or create a new task.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML = tasks.map(task => {

        const isDone =
            task.status === 'Completed';


        const pBadge =
            task.priority === 'High'
                ? 'bg-danger-soft text-danger'
                : task.priority === 'Medium'
                    ? 'bg-warning-soft text-warning'
                    : 'bg-primary-soft text-primary';


        const dateStr =
            task.dueDate
                ? new Date(task.dueDate)
                    .toLocaleDateString(
                        'en-US',
                        {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }
                    )
                : '';


        const timeStr =
            task.dueTime
                ? task.dueTime
                : '';


        const reminderStr =
            task.dueTime
                ? getReminderText(task.reminderMinutes)
                : '';


        return `

            <div class="card task-card shadow-sm mb-3 border-0 ${isDone ? 'completed-task' : ''}">

                <div class="card-body p-3 p-md-4">

                    <div class="d-flex align-items-start justify-content-between gap-3">

                        <div class="d-flex align-items-start gap-3">

                            <div class="pt-1">

                                <input
                                    type="checkbox"
                                    class="form-check-input custom-chk"
                                    style="width:1.25rem;height:1.25rem;cursor:pointer;"
                                    ${isDone ? 'checked' : ''}
                                    onclick="toggleStatus('${task._id}')"
                                >

                            </div>


                            <div>

                                <h6 class="fw-bold mb-1 ${isDone ? 'completed-title' : ''}">
                                    ${escapeHTML(task.title)}
                                </h6>


                                ${
                                    task.description
                                        ? `
                                            <p class="small text-secondary mb-2">
                                                ${escapeHTML(task.description)}
                                            </p>
                                          `
                                        : ''
                                }


                                <div class="d-flex flex-wrap align-items-center gap-2 mt-2">


                                    <span class="badge bg-light text-secondary border fw-normal">

                                        <i class="bi bi-tag me-1"></i>

                                        ${task.category}

                                    </span>


                                    <span class="badge ${pBadge} fw-semibold">

                                        <i class="bi bi-flag me-1"></i>

                                        ${task.priority} Priority

                                    </span>


                                    ${
                                        dateStr
                                            ? `
                                                <span class="badge bg-light text-muted border fw-normal">

                                                    <i class="bi bi-calendar3 me-1"></i>

                                                    Due: ${dateStr}

                                                </span>
                                              `
                                            : ''
                                    }


                                    ${
                                        timeStr
                                            ? `
                                                <span class="badge bg-light text-muted border fw-normal">

                                                    <i class="bi bi-clock me-1"></i>

                                                    ${timeStr}

                                                </span>
                                              `
                                            : ''
                                    }


                                    ${
                                        reminderStr
                                            ? `
                                                <span class="badge bg-light text-primary border fw-normal">

                                                    <i class="bi bi-bell me-1"></i>

                                                    ${reminderStr}

                                                </span>
                                              `
                                            : ''
                                    }

                                </div>

                            </div>

                        </div>


                        <div class="d-flex gap-1">

                            <button
                                class="btn btn-sm btn-light text-primary rounded-circle"
                                style="width:32px;height:32px;padding:0;"
                                onclick="editTask('${task._id}')"
                                title="Edit Task">

                                <i class="bi bi-pencil"></i>

                            </button>


                            <button
                                class="btn btn-sm btn-light text-danger rounded-circle"
                                style="width:32px;height:32px;padding:0;"
                                onclick="deleteTask('${task._id}')"
                                title="Delete Task">

                                <i class="bi bi-trash"></i>

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;

    }).join('');

}


/* ==========================================
   REMINDER TEXT
========================================== */

function getReminderText(minutes) {

    const value =
        Number(minutes);

    if (value === 0) {
        return 'Reminder at due time';
    }

    if (value === 60) {
        return 'Reminder 1 hour before';
    }

    return `Reminder ${value} min before`;

}


/* ==========================================
   CREATE / UPDATE TASK
========================================== */

async function handleTaskSubmit(e) {

    e.preventDefault();


    const id =
        document.getElementById('task-id')
            .value;


    const dueDate =
        document.getElementById('task-date')
            .value;


    const dueTime =
        document.getElementById('task-time')
            .value;


    const reminderMinutes =
        Number(
            document.getElementById('task-reminder')
                .value
        );


    const taskData = {

        title:
            document.getElementById('task-title')
                .value
                .trim(),

        description:
            document.getElementById('task-desc')
                .value
                .trim(),

        category:
            document.getElementById('task-category')
                .value,

        priority:
            document.getElementById('task-priority')
                .value,

        dueDate:
            dueDate || null,

        dueTime:
            dueTime || '',

        reminderMinutes:
            reminderMinutes

    };


    // If time is selected, date is required
    if (dueTime && !dueDate) {

        showToast(
            'Please select Due Date before Due Time.',
            'danger'
        );

        return;

    }


    try {

        if (id) {

            await fetchAPI(
                `/tasks/${id}`,
                'PUT',
                taskData
            );

            showToast(
                'Task updated successfully!',
                'success'
            );

        } else {

            await fetchAPI(
                '/tasks',
                'POST',
                taskData
            );

            showToast(
                'New task added successfully!',
                'success'
            );

        }


        resetForm();

        loadTasks();


    } catch (err) {

        showToast(
            err.message,
            'danger'
        );

    }

}


/* ==========================================
   TOGGLE COMPLETE
========================================== */

async function toggleStatus(id) {

    try {

        await fetchAPI(
            `/tasks/${id}/complete`,
            'PUT'
        );

        showToast(
            'Task status updated!',
            'info'
        );

        loadTasks();

    } catch (err) {

        showToast(
            err.message,
            'danger'
        );

    }

}


/* ==========================================
   EDIT TASK
========================================== */

function editTask(id) {

    const task =
        allTasks.find(
            t => t._id === id
        );


    if (!task) return;


    document.getElementById('task-id')
        .value = task._id;


    document.getElementById('task-title')
        .value = task.title;


    document.getElementById('task-desc')
        .value = task.description || '';


    document.getElementById('task-category')
        .value = task.category;


    document.getElementById('task-priority')
        .value = task.priority;


    document.getElementById('task-date')
        .value =
        task.dueDate
            ? task.dueDate.substring(0, 10)
            : '';


    document.getElementById('task-time')
        .value =
        task.dueTime || '';


    document.getElementById('task-reminder')
        .value =
        task.reminderMinutes !== undefined
            ? task.reminderMinutes
            : 10;


    document.getElementById('form-title')
        .innerHTML =
        '<i class="bi bi-pencil-square text-primary me-2"></i>Edit Task';


    document.getElementById('save-task-btn')
        .innerHTML =
        '<i class="bi bi-check-lg me-1"></i><span>Update Task</span>';


    document.getElementById('cancel-edit-btn')
        .classList
        .remove('d-none');


    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

}


/* ==========================================
   DELETE TASK
========================================== */

async function deleteTask(id) {

    if (
        !confirm(
            'Are you sure you want to delete this task?'
        )
    ) {
        return;
    }


    try {

        await fetchAPI(
            `/tasks/${id}`,
            'DELETE'
        );

        showToast(
            'Task deleted successfully!',
            'success'
        );

        loadTasks();

    } catch (err) {

        showToast(
            err.message,
            'danger'
        );

    }

}


/* ==========================================
   RESET FORM
========================================== */

function resetForm() {

    document.getElementById('task-id')
        .value = '';


    document.getElementById('task-form')
        .reset();


    document.getElementById('form-title')
        .innerHTML =
        '<i class="bi bi-plus-circle text-primary me-2"></i>Add New Task';


    document.getElementById('save-task-btn')
        .innerHTML =
        '<i class="bi bi-plus-lg me-1"></i><span>Add Task</span>';


    document.getElementById('cancel-edit-btn')
        .classList
        .add('d-none');


    // Restore default reminder
    document.getElementById('task-reminder')
        .value = '10';

}


/* ==========================================
   TOAST
========================================== */

function showToast(msg, type = 'info') {

    const toast =
        document.getElementById('toast-notification');

    const toastMsg =
        document.getElementById('toast-msg');

    const toastIcon =
        document.getElementById('toast-icon');


    toastMsg.textContent = msg;


    toast.className =
        `toast-custom bg-${
            type === 'danger'
                ? 'danger'
                : type === 'success'
                    ? 'success'
                    : 'primary'
        } d-flex align-items-center`;


    toastIcon.className =
        `bi bi-${
            type === 'danger'
                ? 'exclamation-circle'
                : type === 'success'
                    ? 'check-circle'
                    : 'info-circle'
        } me-2 fs-5`;


    setTimeout(() => {

        toast.classList.add('d-none');

    }, 3000);

}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(value) {

    if (!value) return '';

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}