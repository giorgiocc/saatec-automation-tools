const express = require('express');
const path = require('path');
const router = express.Router();
const { runSeleniumTest } = require('./scripts/sideruner');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Middleware to add user data to templates
function addUserData(req, res, next) {
  res.locals.user = req.session.username || null;
  next();
}

// Public routes
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Protected routes
router.get('/', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

router.get('/projects', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'projects.html'));
});

router.get('/management', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'management.html'));
});

router.get('/others', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'others.html'));
});

router.get('/ciht', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views','ciht' ,'ciht.html'));
});

router.get('/registration_ciht', isAuthenticated, addUserData, (req, res) => {
  res.sendFile(path.join(__dirname, 'views','ciht' ,'registration_ciht.html'));
});


router.get('/api/user', isAuthenticated, (req, res) => {
    res.json({ username: req.session.username });
});




module.exports = router;
