document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            document.getElementById('user-email').textContent = data.username;
        })
        .catch(error => console.error('Error fetching user data:', error));
});