function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const path = window.location.pathname;

  if (!token && path.includes('dashboard.html')) {
    window.location.href = 'login.html';
  } else if (token && (path.includes('login.html') || path.includes('register.html'))) {
    window.location.href = 'dashboard.html';
  }
}

function logoutUser() {
  localStorage.clear();
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', checkAuthStatus);
