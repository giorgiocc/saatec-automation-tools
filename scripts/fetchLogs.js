let sessionId = null;

function fetchSessionId() {
    fetch('/session-id')
        .then(response => response.json())
        .then(data => {
            sessionId = data.sessionId;
            console.log('Session ID :', sessionId);
            fetchLogs();
            setInterval(fetchLogs, 1000); 
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
            logContainer.scrollTop = logContainer.scrollHeight; 
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
        });
}


document.addEventListener('DOMContentLoaded', fetchSessionId);
