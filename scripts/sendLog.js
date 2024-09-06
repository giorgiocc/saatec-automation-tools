const axios = require('axios');

async function sendLog(message, sessionId) {
    try {
        if (!message || !sessionId) {
            throw new Error('Log message and session ID required');
        }

        await axios.post('http://localhost:3001/logs', { message, sessionId });
    } catch (error) {
        console.error('Error sending log:', error.response ? error.response.data : error.message);
    }
}

module.exports = sendLog;  // Ensure it is exported correctly
