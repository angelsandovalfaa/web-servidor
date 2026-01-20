


const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { Client } = require('ssh2');
require('dotenv').config();
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// Create tables
db.serialize(() => {
  console.log('Initializing database...');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    allowedServers TEXT DEFAULT '[]'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    ip TEXT,
    username TEXT,
    password TEXT,
    status TEXT DEFAULT 'stopped'
  )`);

  // Add columns if not exist
  db.run(`ALTER TABLE servers ADD COLUMN ip TEXT`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE servers ADD COLUMN username TEXT`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE servers ADD COLUMN password TEXT`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin user
  db.run(`INSERT OR IGNORE INTO users (username, password, role, allowedServers) VALUES ('admin', 'admin123', 'admin', '[]')`, function(err) {
    if (err) {
      console.error('Error inserting admin:', err);
    } else {
      console.log('Admin user inserted or already exists');
    }
  });

   // Insert real server
   db.run(`INSERT INTO servers (name) VALUES (?) ON CONFLICT(name) DO NOTHING`, ['Servidor Real - 192.168.0.111']);
});

// Routes
app.get('/api/users', (req, res) => {
  console.log('GET /api/users called');
  db.all('SELECT id, username, role, allowedServers FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log('Users:', rows);
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  console.log('POST /api/users body:', req.body);
  const { username, password, role, allowedServers } = req.body;
  const allowedStr = JSON.stringify(allowedServers || []);
  db.run('INSERT INTO users (username, password, role, allowedServers) VALUES (?, ?, ?, ?)', [username, password, role, allowedStr], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  console.log('DELETE /api/users/:id called with id:', id, 'numId:', numId);
  db.run('DELETE FROM users WHERE id = ?', [numId], function(err) {
    if (err) {
      console.log('Error deleting user:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Deleted rows:', this.changes);
    // Check remaining users
    db.all('SELECT id, username, role FROM users', [], (err2, rows) => {
      if (err2) console.log('Error getting users:', err2);
      else console.log('Users after delete:', rows);
    });
    res.json({ deleted: this.changes });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, username, role, allowedServers FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ user: { id: row.id, username: row.username, role: row.role, allowedServers: JSON.parse(row.allowedServers || '[]') } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/api/servers', (req, res) => {
  db.all('SELECT * FROM servers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/servers', (req, res) => {
  const { name, ip, username, password, adminUsername } = req.body;
  // Verify admin
  db.get('SELECT role FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.role !== 'admin') return res.status(403).json({ error: 'Only administrators can add servers' });
    db.run('INSERT INTO servers (name, ip, username, password) VALUES (?, ?, ?, ?)', [name, ip, username, password], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  });
});

app.delete('/api/servers/:id', (req, res) => {
  const { id } = req.params;
  const { adminUsername } = req.body;
  // Verify admin
  db.get('SELECT role FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.role !== 'admin') return res.status(403).json({ error: 'Only administrators can delete servers' });
    db.run('DELETE FROM servers WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });
});

app.post('/api/servers/:id/restart', (req, res) => {
  const { id } = req.params;
  console.log('Attempting to restart server:', id);
  db.get('SELECT ip, username, password FROM servers WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Server not found' });
    const { ip, username, password } = row;
    const conn = new Client();
    conn.connect({
      host: ip,
      port: 22,
      username: username,
      password: password
    });
    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).json({ error: 'SSH connection failed: ' + err.message });
    });
    conn.on('ready', () => {
      console.log('SSH Client :: ready');
      conn.exec(`echo "${password}" | sudo -S reboot`, (err, stream) => {
        if (err) {
          console.error('SSH exec error:', err);
          res.status(500).json({ error: err.message });
          conn.end();
          return;
        }
        let stdout = '';
        stream.on('close', (code, signal) => {
          console.log('SSH stream closed, code:', code, 'signal:', signal);
          res.json({ message: `Server ${id} restarted`, output: stdout });
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
          stdout += data;
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    });
  });
});

app.post('/api/servers/:id/stop', (req, res) => {
  const { id } = req.params;
  console.log('Attempting to stop server:', id);
  db.get('SELECT ip, username, password FROM servers WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Server not found' });
    const { ip, username, password } = row;
    const conn = new Client();
    conn.connect({
      host: ip,
      port: 22,
      username: username,
      password: password
    });
    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res.status(500).json({ error: 'SSH connection failed: ' + err.message });
    });
    conn.on('ready', () => {
      console.log('SSH Client :: ready');
      conn.exec(`echo "${password}" | sudo -S poweroff`, (err, stream) => {
        if (err) {
          console.error('SSH exec error:', err);
          res.status(500).json({ error: err.message });
          conn.end();
          return;
        }
        let stdout = '';
        stream.on('close', (code, signal) => {
          console.log('SSH stream closed, code:', code, 'signal:', signal);
          res.json({ message: `Server ${id} stopped`, output: stdout });
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
          stdout += data;
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    });
  });
});

app.post('/api/logs', (req, res) => {
  const { action } = req.body;
  console.log('POST /api/logs action:', action);
  db.run('INSERT INTO logs (action) VALUES (?)', [action], function(err) {
    if (err) {
      console.log('Error inserting log:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Log inserted, id:', this.lastID);
    res.json({ id: this.lastID });
  });
});

app.get('/api/logs', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    SERVER_IP: process.env.SERVER_IP,
    SERVER_USER: process.env.SERVER_USER,
    SERVER_PASS_SET: !!process.env.SERVER_PASS
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});