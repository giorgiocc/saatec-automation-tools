let sessionId = null;

// Fetch session ID when the page loads
function fetchSessionId() {
    fetch('/session-id')
        .then(response => response.json())
        .then(data => {
            sessionId = data.sessionId;
            console.log('Session ID :', sessionId);
            // Start fetching logs after sessionId is fetched
            fetchLogs();
            setInterval(fetchLogs, 1000); // Start log fetching interval
        })
        .catch(error => {
            console.error('Error fetching session ID:', error);
        });
}

function fetchLogs() {
    if (!sessionId) return;

    fetch(`/logs?sessionId=${sessionId}`)
        .then(response => response.json())
        .then(data => {
            const logContainer = document.getElementById('log-container');
            logContainer.innerHTML = '';
            data.logs.forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = `log-${log.type}`;
                logElement.textContent = log.message;
                logContainer.appendChild(logElement);
            });
            logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll to bottom
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
        });
}

function startTest() {
    fetch('/start')
        .then(() => fetchLogs())
        .catch(error => console.error('Error starting test:', error));
}

function clearLogs() {
    if (!sessionId) return;

    fetch(`/clear-logs?sessionId=${sessionId}`)
        .then(() => fetchLogs())
        .catch(error => console.error('Error clearing logs:', error));
}

// Fetch session ID on page load
document.addEventListener('DOMContentLoaded', fetchSessionId);
