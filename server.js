require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { About, Skill, Semester, Attendance, Mark, ContactInfo, Message, HelpItem } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ─── Connect to MongoDB ───
mongoose.connect(MONGODB_URI)
    .then(() => console.log('  ✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('  ❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.get('/api/about', async (req, res) => {
    try {
        const about = await About.findOne({}).lean();
        res.json({ success: true, data: about || null });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find({}).sort({ proficiency: -1 }).lean();
        res.json({ success: true, data: skills });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/semesters', async (req, res) => {
    try {
        const semesters = await Semester.find({}).sort({ semester_number: 1 }).lean();
        res.json({ success: true, data: semesters });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const semNum = parseInt(req.query.semester) || 1;
        const semester = await Semester.findOne({ semester_number: semNum }).lean();
        if (!semester) {
            return res.status(404).json({ success: false, error: 'Semester not found' });
        }
        const records = await Attendance.find({ semester_number: semNum }).lean();

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

app.get('/api/marks', async (req, res) => {
    try {
        const semNum = parseInt(req.query.semester) || 1;
        const semester = await Semester.findOne({ semester_number: semNum }).lean();
        if (!semester) {
            return res.status(404).json({ success: false, error: 'Semester not found' });
        }
        const records = await Mark.find({ semester_number: semNum }).lean();

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

app.get('/api/contact', async (req, res) => {
    try {
        const contacts = await ContactInfo.find({}).lean();
        res.json({ success: true, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email.' });
        }
        const newMessage = await Message.create({
            name: name.trim().substring(0, 100),
            email: email.trim().substring(0, 200),
            message: message.trim().substring(0, 2000),
        });
        console.log(`  📩 New message from: ${name.trim()}`);
        res.json({ success: true, message: 'Message sent successfully!', id: newMessage._id });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to send message.' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find({}).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: messages, count: messages.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/help', async (req, res) => {
    try {
        const items = await HelpItem.find({}).sort({ sort_order: 1 }).lean();
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'vtop.html'));
});
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ success: false, error: 'Endpoint not found.' });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'frontend', 'vtop.html'));
    }
});

app.listen(PORT, () => {
    console.log(`\n  🚀 VTop Server running at http://localhost:${PORT}\n`);
});

process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('\n  Database disconnected. Server stopped.\n');
    process.exit(0);
});
