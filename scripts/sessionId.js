const { v4: uuidv4 } = require('uuid');

function generateSessionId() {
  return uuidv4();
}

module.exports = generateSessionId;
