const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// ==================== API ROUTES ====================

// GET /api/about - Fetch bio data
app.get('/api/about', (req, res) => {
    try {
        const about = db.prepare('SELECT * FROM about LIMIT 1').get();
        if (about && about.tags) {
            about.tags = JSON.parse(about.tags);
        }
        res.json({ success: true, data: about });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/skills - Fetch all skills
app.get('/api/skills', (req, res) => {
    try {
        const skills = db.prepare('SELECT * FROM skills ORDER BY proficiency DESC').all();
        res.json({ success: true, data: skills });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/projects - Fetch all projects
app.get('/api/projects', (req, res) => {
    try {
        const projects = db.prepare('SELECT * FROM projects').all();
        projects.forEach(p => {
            if (p.technologies) p.technologies = JSON.parse(p.technologies);
        });
        res.json({ success: true, data: projects });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/education - Fetch education timeline
app.get('/api/education', (req, res) => {
    try {
        const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC').all();
        res.json({ success: true, data: education });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/contact - Fetch contact info
app.get('/api/contact', (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM contact_info').all();
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/contact - Submit a contact message
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        const stmt = db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)');
        const result = stmt.run(name, email, message);
        res.json({ success: true, message: 'Message sent successfully!', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/messages - Fetch all messages (admin)
app.get('/api/messages', (req, res) => {
    try {
        const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/help - Fetch help/FAQ items
app.get('/api/help', (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM help_items').all();
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Fallback: serve vtop.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'vtop.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 VTop Portfolio Server running at http://localhost:${PORT}`);
    console.log(`📂 Serving frontend from: ${path.join(__dirname, 'frontend')}`);
    console.log(`🗄️  Database: portfolio.db\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('\n👋 Database closed. Server stopped.');
    process.exit(0);
});
