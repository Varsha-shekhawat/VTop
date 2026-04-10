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

// Simple request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        if (req.path.startsWith('/api')) {
            console.log(`  ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`);
        }
    });
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// ==================== API ROUTES ====================

// GET /api/about
app.get('/api/about', (req, res) => {
    try {
        const about = db.prepare('SELECT * FROM about LIMIT 1').get();
        if (about && about.tags) about.tags = JSON.parse(about.tags);
        res.json({ success: true, data: about || null });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/skills
app.get('/api/skills', (req, res) => {
    try {
        const skills = db.prepare('SELECT * FROM skills ORDER BY proficiency DESC').all();
        res.json({ success: true, data: skills });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/semesters
app.get('/api/semesters', (req, res) => {
    try {
        const semesters = db.prepare('SELECT * FROM semesters ORDER BY semester_number ASC').all();
        res.json({ success: true, data: semesters });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/attendance?semester=1
app.get('/api/attendance', (req, res) => {
    try {
        const semNum = parseInt(req.query.semester) || 1;
        const semester = db.prepare('SELECT * FROM semesters WHERE semester_number = ?').get(semNum);
        if (!semester) {
            return res.status(404).json({ success: false, error: 'Semester not found' });
        }
        const records = db.prepare('SELECT * FROM attendance WHERE semester_id = ? ORDER BY id ASC').all(semester.id);

        // Calculate overall attendance
        let totalAttended = 0, totalClasses = 0;
        records.forEach(r => {
            totalAttended += r.classes_attended;
            totalClasses += r.total_classes;
        });
        const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                semester: semester,
                subjects: records,
                overall: {
                    attended: totalAttended,
                    total: totalClasses,
                    percentage: parseFloat(overallPercentage)
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/marks?semester=1
app.get('/api/marks', (req, res) => {
    try {
        const semNum = parseInt(req.query.semester) || 1;
        const semester = db.prepare('SELECT * FROM semesters WHERE semester_number = ?').get(semNum);
        if (!semester) {
            return res.status(404).json({ success: false, error: 'Semester not found' });
        }
        const records = db.prepare('SELECT * FROM marks WHERE semester_id = ? ORDER BY id ASC').all(semester.id);

        // Calculate totals
        let totalMarks = 0, totalMaxMarks = 0, totalCredits = 0;
        records.forEach(r => {
            totalMarks += r.marks_obtained;
            totalMaxMarks += r.max_marks;
            totalCredits += r.credits;
        });
        const overallPercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                semester: semester,
                subjects: records,
                summary: {
                    totalMarks: totalMarks,
                    totalMaxMarks: totalMaxMarks,
                    totalCredits: totalCredits,
                    percentage: parseFloat(overallPercentage),
                    cgpa: semester.cgpa
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/contact
app.get('/api/contact', (req, res) => {
    try {
        const contacts = db.prepare('SELECT * FROM contact_info ORDER BY id ASC').all();
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email.' });
        }
        const stmt = db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)');
        const result = stmt.run(name.trim().substring(0, 100), email.trim().substring(0, 200), message.trim().substring(0, 2000));
        console.log(`  📩 New message from: ${name.trim()}`);
        res.json({ success: true, message: 'Message sent successfully!', id: Number(result.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to send message.' });
    }
});

// GET /api/messages (admin)
app.get('/api/messages', (req, res) => {
    try {
        const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
        res.json({ success: true, data: messages, count: messages.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/help
app.get('/api/help', (req, res) => {
    try {
        const items = db.prepare('SELECT * FROM help_items ORDER BY sort_order ASC').all();
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==================== FRONTEND ROUTES ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'vtop.html'));
});

// 404
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ success: false, error: 'Endpoint not found.' });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'frontend', 'vtop.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n  🚀 VTop Server running at http://localhost:${PORT}\n`);
});

process.on('SIGINT', () => {
    db.close();
    console.log('\n  Database closed. Server stopped.\n');
    process.exit(0);
});
