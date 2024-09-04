const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const routers = require('./routers'); // Import routers.js
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { openDb } = require('./db');

// Create the Express app
const app = express();
const port = process.env.PORT || 3001;

let logs = [];
let seleniumProcess = null;

// Middleware setup
app.use(session({
  secret: 'your-secret-key', // Replace with a secure key
  resave: false,
  saveUninitialized: true
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Register Route
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

// Login Route
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
  res.send('Logged in');
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.send('Logged out');
  });
});

// Use the routers for handling routes
app.use('/', routers);

app.post('/logs', (req, res) => {
  const { message } = req.body;
  if (message) {
    logs.push({ type: 'info', message });
    res.status(200).send('Log received');
  } else {
    res.status(400).send('No log message provided');
  }
});

app.get('/logs', (req, res) => {
  res.json({ logs });
});

app.get('/clear-logs', (req, res) => {
  logs = [];
  res.send('Logs cleared');
});

app.get('/start', (req, res) => {
  if (!seleniumProcess) {
    seleniumProcess = spawn('node', [path.join(__dirname, 'selenium', 'projects', 'ciht', 'ciht-registration.js')]);

    seleniumProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    seleniumProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    seleniumProcess.on('close', (code) => {
      console.log(`process exited with: ${code}`);
      seleniumProcess = null;
    });

    res.send('Test started');
  } else {
    res.send('Test is already running');
  }
});

app.get('/restart', (req, res) => {
  if (seleniumProcess) {
    seleniumProcess.kill();
    seleniumProcess = null;
    res.send('Test stopped');
  } else {
    res.send('No test is currently running');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Initialize database
const { setup } = require('./db');
setup().then(() => console.log('Database setup complete'));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
