const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const app = express();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Dp@20080139',
    database: 'erp_portal'
});

const secretKey = crypto.randomBytes(64).toString('hex');

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Error logging in user:', err);
            return res.status(500).json({ success: false, message: 'Login failed' });
        }

        if (results.length > 0) {
            req.session.username = username;
            return res.json({ success: true, message: 'Login successful' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.redirect('/login');
    });
});

// Serve signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/register', upload.single('profile_image'), (req, res) => {
    const { username, password, roll_number, percentage_10th, percentage_12th } = req.body;
    const profile_image = req.file.buffer;

    if (!username || !password || !roll_number || !percentage_10th || !percentage_12th || !profile_image) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    pool.query('INSERT INTO users (username, password, roll_number, percentage_10th, percentage_12th, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
               [username, password, roll_number, percentage_10th, percentage_12th, profile_image],
               (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }

        req.session.username = username;
        console.log('User registered:', { username });
        return res.json({ success: true, message: 'Registration successful' });
    });
});

app.get('/user', (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    pool.query('SELECT username, roll_number, percentage_10th, percentage_12th, profile_image FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch user data' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = results[0];
        const base64Image = user.profile_image ? user.profile_image.toString('base64') : null;
        return res.json({
            success: true,
            username: user.username,
            roll_number: user.roll_number,
            percentage_10th: user.percentage_10th,
            percentage_12th: user.percentage_12th,
            profile_image: base64Image
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
