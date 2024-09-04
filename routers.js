const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

router.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'projects.html'));
});

router.get('/management', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'management.html'));
});

router.get('/others', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'others.html'));
});

router.get('/ciht', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ciht.html'));
});

// Serve register and login pages
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

module.exports = router;
