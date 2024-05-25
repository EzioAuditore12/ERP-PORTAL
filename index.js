const express = require('express');
const mysql = require('mysql');
const path = require('path');

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

        return res.json({ success: true, message: 'Login successful' });
    });
});

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, password } = req.body;``

    pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }

        return res.json({ success: true, message: 'Registration successful' });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
