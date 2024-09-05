document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const messageDiv = document.getElementById('register-message');
    if (response.ok) {
        messageDiv.textContent = 'Registration successful';
        messageDiv.style.color = 'green';
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000); // Redirect after 1.5 seconds
    } else {
        messageDiv.textContent = 'Registration failed. Please try again.';
        messageDiv.style.color = 'red';
    }
};