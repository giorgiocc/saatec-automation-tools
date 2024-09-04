function fetchLogs() {
    fetch('/logs')
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


function restartTest() {
    fetch('/restart')
        .then(() => fetchLogs())
        .catch(error => console.error('Error restarting test:', error));
}

function clearLogs() {
    fetch('/clear-logs')
        .then(() => fetchLogs())
        .catch(error => console.error('Error clearing logs:', error));
}

setInterval(fetchLogs, 1000);
