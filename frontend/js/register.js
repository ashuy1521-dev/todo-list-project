if (getToken()) window.location.href = 'dashboard.html';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertMsg = document.getElementById('alert-msg');
    const submitBtn = document.getElementById('register-btn');
    alertMsg.classList.add('d-none');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (password !== confirmPassword) {
        alertMsg.textContent = 'Passwords do not match!';
        alertMsg.classList.remove('d-none');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';

        const data = await fetchAPI('/auth/register', 'POST', { name, email, password });
        setToken(data.token);
        window.location.href = 'dashboard.html';
    } catch (err) {
        alertMsg.textContent = err.message;
        alertMsg.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span><i class="bi bi-arrow-right ms-2"></i>';
    }
});