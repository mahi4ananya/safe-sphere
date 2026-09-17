const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Initialize Database
const db = new sqlite3.Database('./safesphere.db', (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to SafeSphere SQLite Database.');
});

// Create Tables
db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS alerts_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    location TEXT NOT NULL,
    status TEXT NOT NULL
)`);

// API: Get Emergency Contacts
app.get('/api/contacts', (req, res) => {
    db.all(`SELECT * FROM contacts`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ contacts: rows });
    });
});

// API: Add Contact
app.post('/api/contacts', (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
    
    db.run(`INSERT INTO contacts (name, phone) VALUES (?, ?)`, [name, phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, phone });
    });
});

// API: Delete Contact
app.delete('/api/contacts/:id', (req, res) => {
    db.run(`DELETE FROM contacts WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted successfully" });
    });
});

// API: Log Emergency Alert
app.post('/api/alerts', (req, res) => {
    const { location, status } = req.body;
    db.run(`INSERT INTO alerts_log (location, status) VALUES (?, ?)`, [location, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ alertId: this.lastID, message: "Emergency broadcast logged successfully." });
    });
});

app.listen(PORT, () => {
    console.log(`SafeSphere server running at http://localhost:${PORT}`);
});
