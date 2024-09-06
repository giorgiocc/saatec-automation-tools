const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const routers = require('./routers');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { openDb, setup } = require('./db');
const { v4: uuidv4 } = require('uuid');

let sessionLogs = {}; 

const app = express();
const port = process.env.PORT || 3001;

let seleniumProcess = null;

app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.use((req, res, next) => {
  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4();
  }
  next();
});

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

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/login');
  });
});

app.use('/', routers);

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

app.get('/logs', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const logs = sessionLogs[sessionId] || [];
  res.json({ logs });
});

app.get('/clear-logs', (req, res) => {
  const { sessionId } = req.query;
  if (sessionId && sessionLogs[sessionId]) {
    sessionLogs[sessionId] = [];
  }
  res.send('Logs cleared');
});

app.get('/start', (req, res) => {
  if (!seleniumProcess) {
    const sessionId = req.session.sessionId; 

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

app.get('/session-id', (req, res) => {
  res.json({ sessionId: req.session.sessionId });
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

setup().then(() => console.log('Database setup complete'));


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});