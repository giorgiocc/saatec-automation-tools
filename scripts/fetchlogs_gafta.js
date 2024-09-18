let sessionId = null;

function fetchSessionId() {
    fetch('/session-id')
        .then(response => response.json())
        .then(data => {
            sessionId = data.sessionId;
            console.log('Session ID :', sessionId);
            fetchLogsGafta();
            setInterval(fetchLogsGafta, 1000); 
        })
        .catch(error => {
            console.error('Error fetching session ID:', error);
        });
}

function fetchLogsGafta() {
    if (!sessionId) return;

    fetch(`/logs?sessionId=${sessionId}`)
        .then(response => response.json())
        .then(data => {
            const logContainerGafta = document.getElementById('gafta-log-container');
            logContainerGafta.innerHTML = '';
            data.logs.forEach(log => {
                const logElement = document.createElement('div');
                logElement.className = `log-gafta-${log.type}`;
                logElement.textContent = log.message;
                logContainerGafta.appendChild(logElement);
            });
            logContainerGafta.scrollTop = logContainerGafta.scrollHeight; 
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
        });
}


document.addEventListener('DOMContentLoaded', fetchSessionId);
