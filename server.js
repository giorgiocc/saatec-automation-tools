const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const routers = require('./routers');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { openDb, setup } = require('./db');
const { v4: uuidv4 } = require('uuid');

let sessionLogs = {}; // Use an object to store logs per session

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

let seleniumProcess = null;

// Middleware setup
app.use(session({
  secret: 'your-secret-key', // Replace with a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Middleware to assign a session ID if not present
app.use((req, res, next) => {
  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4(); // Generate a unique session ID
  }
  next();
});

// User registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await openDb();

  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send('Username already exists');
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send('Invalid username or password');
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.send('Logged in');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/login');
  });
});

// Use the routers for handling routes
app.use('/', routers);

// Log saving route
app.post('/logs', (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).send('Log message and session ID required');
  }

  if (!sessionLogs[sessionId]) {
    sessionLogs[sessionId] = [];
  }

  sessionLogs[sessionId].push({ type: 'info', message });
  res.status(200).send('Log received');
});

// Fetch logs route
app.get('/logs', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const logs = sessionLogs[sessionId] || [];
  res.json({ logs });
});

// Clear logs route
app.get('/clear-logs', (req, res) => {
  const { sessionId } = req.query;
  if (sessionId && sessionLogs[sessionId]) {
    sessionLogs[sessionId] = [];
  }
  res.send('Logs cleared');
});

// Start Selenium test route
app.get('/start', (req, res) => {
  if (!seleniumProcess) {
    const sessionId = req.session.sessionId; // Get the session ID

    seleniumProcess = spawn('node', [path.join(__dirname, 'selenium', 'projects', 'ciht', 'ciht-registration.js'), sessionId]);

    seleniumProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    seleniumProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    seleniumProcess.on('close', (code) => {
      console.log(`process exited with code: ${code}`);
      seleniumProcess = null;
    });

    seleniumProcess.on('error', (err) => {
      console.error(`Error starting Selenium process: ${err.message}`);
      seleniumProcess = null;
      res.status(500).send('Error starting Selenium test');
    });

    res.send('Test started');
  } else {
    res.send('Test is already running');
  }
});

// Fetch session ID route
app.get('/session-id', (req, res) => {
  res.json({ sessionId: req.session.sessionId });
});

// Restart Selenium test route
app.get('/restart', (req, res) => {
  if (seleniumProcess) {
    seleniumProcess.kill();
    seleniumProcess = null;
    res.send('Test stopped');
  } else {
    res.send('No test is currently running');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Initialize the database
setup().then(() => console.log('Database setup complete'));


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
