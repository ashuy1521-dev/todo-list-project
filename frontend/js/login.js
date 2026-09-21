if (getToken()) window.location.href = 'dashboard.html';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertMsg = document.getElementById('alert-msg');
    const submitBtn = document.getElementById('login-btn');
    alertMsg.classList.add('d-none');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
        
        const data = await fetchAPI('/auth/login', 'POST', { email, password });
        setToken(data.token);
        window.location.href = 'dashboard.html';
    } catch (err) {
        alertMsg.textContent = err.message;
        alertMsg.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span><i class="bi bi-arrow-right ms-2"></i>';
    }
});