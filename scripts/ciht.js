

function startTest() {
    fetch('/start')
        .then()
        .catch(error => console.error('Error starting test:', error));
}

function clearLogs() {
    if (!sessionId) return;

    fetch(`/clear-logs?sessionId=${sessionId}`)
        .then()
        .catch(error => console.error('Error clearing logs:', error));
}

