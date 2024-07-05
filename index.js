const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const PORT = 3000;
const app = express();

// Create MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Dp@20080139',
    database: 'erp_portal'
});

// Use session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve profile.html
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Fetch user data endpoint
app.get('/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.json(req.session.user);
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ success: false, message: 'Login failed' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        req.session.user = results[0];
        return res.json({ success: true, message: 'Login successful' });
    });
});

// Signup endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }

        console.log('User registered:', { username, password });
        return res.json({ success: true, message: 'Registration successful' });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
