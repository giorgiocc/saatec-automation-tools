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
        messageDiv.textContent = 'Registration disabled - redirecting to login';
        messageDiv.style.color = 'red';
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000); 
    } else {
        messageDiv.textContent = 'Registration disabled - redirecting to login';
        messageDiv.style.color = 'red';
    }
};