document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const messageDiv = document.getElementById('login-message');
    if (response.ok) {
        messageDiv.textContent = 'Login successful';
        messageDiv.style.color = 'green';
        setTimeout(() => {
            window.location.href = '/';
        }, 500); // Redirect after 1.5 seconds
    } else {
        messageDiv.textContent = 'Login failed. Please try again.';
        messageDiv.style.color = 'red';
    }
};