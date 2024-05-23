const express = require('express');
const mysql = require('mysql');
const path = require('path');

const PORT = 3000;
const app = express();

// Create a MySQL connection pool
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

// SQL query to insert a new user into the database
const INSERT_USER_QUERY = `INSERT INTO users (username, password) VALUES (?, ?)`;

// Registration endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Execute the SQL query to insert a new user
  pool.query(INSERT_USER_QUERY, [username, password], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }

    console.log(`User ${username} registered successfully`);
    return res.json({ success: true, message: 'Registration successful' });
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
