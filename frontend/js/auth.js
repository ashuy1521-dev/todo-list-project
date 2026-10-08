const API_BASE_URL = 'http://localhost:5000/api';
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
            window.location.href = 'login.html';
        }
        throw new Error(data.message || 'Server request failed');
    }

    return data;
}
