// API Configuration
const API_URL = '/api';

function getStoredUser() {
    try {
        const rawUser = localStorage.getItem('user');
        return rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
        return null;
    }
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            successMessage.textContent = 'Login successful! Redirecting...';
            successMessage.style.display = 'block';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../admin/admin-dashboard.html';
            }, 1000);
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Network error. Please check if the server is running.';
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Check if already logged in with a valid stored session
const existingToken = localStorage.getItem('token');
const existingUser = getStoredUser();

if (existingToken && existingUser) {
    window.location.href = '../admin/admin-dashboard.html';
} else if (existingToken || localStorage.getItem('user')) {
    // Clear broken/stale session data to avoid redirect loops
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
