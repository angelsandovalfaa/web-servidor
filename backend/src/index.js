const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
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
    status TEXT DEFAULT 'stopped'
  )`);

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

  // Insert default servers
  const servers = [
    { name: 'Servidor de Producción' },
    { name: 'Servidor de Desarrollo' },
    { name: 'Servidor de Pruebas' },
    { name: 'Servidor de Backup' }
  ];
  servers.forEach(server => {
    db.run(`INSERT INTO servers (name) VALUES (?) ON CONFLICT(name) DO NOTHING`, [server.name]);
  });
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
  const { name } = req.body;
  db.run('INSERT INTO servers (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.post('/api/servers/:id/restart', (req, res) => {
  const { id } = req.params;
  // Simulate restart
  setTimeout(() => {
    res.json({ message: `Server ${id} restarted` });
  }, 2000);
});

app.post('/api/servers/:id/stop', (req, res) => {
  const { id } = req.params;
  // Simulate stop
  setTimeout(() => {
    res.json({ message: `Server ${id} stopped` });
  }, 1000);
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

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});