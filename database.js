const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.db');

function initializeDatabase() {
    const db = new Database(DB_PATH);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS about (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            bio TEXT NOT NULL,
            university TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            proficiency INTEGER DEFAULT 50 CHECK(proficiency >= 0 AND proficiency <= 100),
            category TEXT DEFAULT 'General'
        );

        CREATE TABLE IF NOT EXISTS semesters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            semester_number INTEGER NOT NULL UNIQUE,
            label TEXT NOT NULL,
            year TEXT NOT NULL,
            cgpa REAL DEFAULT 0.0
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            semester_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            classes_attended INTEGER DEFAULT 0,
            total_classes INTEGER DEFAULT 0,
            percentage REAL DEFAULT 0.0,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        );

        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            semester_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            marks_obtained REAL DEFAULT 0,
            max_marks REAL DEFAULT 100,
            grade TEXT,
            credits INTEGER DEFAULT 3,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        );

        CREATE TABLE IF NOT EXISTS contact_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            icon TEXT,
            label TEXT NOT NULL,
            value TEXT NOT NULL,
            url TEXT
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS help_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );
    `);

    // Seed data only if tables are empty
    const aboutCount = db.prepare('SELECT COUNT(*) as count FROM about').get();
    if (aboutCount.count === 0) {
        seedData(db);
    }

    console.log('  ✅ Database initialized');
    return db;
}

function seedData(db) {
    // ─── About ───
    db.prepare(`INSERT INTO about (name, title, bio, university, tags) VALUES (?, ?, ?, ?, ?)`)
      .run(
        'Varsha Shekhawat',
        'Computer Science Engineer',
        'Hello! My name is Varsha Shekhawat. I am a Computer Science student at VIT-AP University. I love building creative and efficient applications. I am passionate about web development, problem-solving, and creating user-friendly solutions.',
        'VIT-AP University',
        JSON.stringify(['CS Student', 'Web Developer', 'VIT-AP', 'Full Stack'])
      );

    // ─── Skills ───
    const insertSkill = db.prepare('INSERT INTO skills (name, icon, proficiency, category) VALUES (?, ?, ?, ?)');
    const skills = [
        ['Java',          '☕', 85, 'Programming'],
        ['HTML & CSS',    '🌐', 90, 'Frontend'],
        ['JavaScript',    '⚡', 80, 'Frontend'],
        ['DSA',           '📊', 75, 'Computer Science'],
        ['SQL',           '🗄️', 70, 'Database'],
        ['React',         '⚛️', 65, 'Frontend'],
        ['Node.js',       '🟢', 70, 'Backend'],
        ['Git & GitHub',  '🔀', 75, 'Tools']
    ];
    const insertSkills = db.transaction((items) => {
        for (const s of items) insertSkill.run(...s);
    });
    insertSkills(skills);

    // ─── Semesters ───
    const insertSem = db.prepare('INSERT INTO semesters (semester_number, label, year, cgpa) VALUES (?, ?, ?, ?)');
    insertSem.run(1, 'Semester 1', '2024-25', 8.72);
    insertSem.run(2, 'Semester 2', '2024-25', 8.45);

    // ─── Attendance — Semester 1 ───
    const insertAtt = db.prepare('INSERT INTO attendance (semester_id, subject, classes_attended, total_classes, percentage) VALUES (?, ?, ?, ?, ?)');
    const attendance = [
        // Sem 1
        [1, 'Web Technologies',              38, 42, 90.5],
        [1, 'Theory of Computation',         35, 40, 87.5],
        [1, 'Data Structures and Algorithm', 40, 44, 90.9],
        [1, 'Operating Systems',             32, 38, 84.2],
        [1, 'English',                       28, 30, 93.3],
        // Sem 2
        [2, 'Web Technologies',              33, 38, 86.8],
        [2, 'Theory of Computation',         36, 42, 85.7],
        [2, 'Data Structures and Algorithm', 39, 43, 90.7],
        [2, 'Operating Systems',             35, 40, 87.5],
        [2, 'English',                       27, 30, 90.0],
    ];
    const insertAtts = db.transaction((items) => {
        for (const a of items) insertAtt.run(...a);
    });
    insertAtts(attendance);

    // ─── Marks — Semester 1 & 2 ───
    const insertMark = db.prepare('INSERT INTO marks (semester_id, subject, marks_obtained, max_marks, grade, credits) VALUES (?, ?, ?, ?, ?, ?)');
    const marksData = [
        // Sem 1
        [1, 'Web Technologies',              82, 100, 'A',  4],
        [1, 'Theory of Computation',         75, 100, 'B+', 4],
        [1, 'Data Structures and Algorithm', 88, 100, 'A+', 4],
        [1, 'Operating Systems',             71, 100, 'B',  3],
        [1, 'English',                       85, 100, 'A',  2],
        // Sem 2
        [2, 'Web Technologies',              78, 100, 'B+', 4],
        [2, 'Theory of Computation',         80, 100, 'A',  4],
        [2, 'Data Structures and Algorithm', 85, 100, 'A',  4],
        [2, 'Operating Systems',             74, 100, 'B+', 3],
        [2, 'English',                       88, 100, 'A+', 2],
    ];
    const insertMarks = db.transaction((items) => {
        for (const m of items) insertMark.run(...m);
    });
    insertMarks(marksData);

    // ─── Contact Info ───
    const insertContact = db.prepare('INSERT INTO contact_info (type, icon, label, value, url) VALUES (?, ?, ?, ?, ?)');
    const contacts = [
        ['email',    '📧', 'Email',    'varsha@example.com',            'mailto:varsha@example.com'],
        ['phone',    '📱', 'Phone',    '+91-XXXXXXXXXX',                null],
        ['linkedin', '💼', 'LinkedIn', 'linkedin.com/in/varsha',        'https://linkedin.com/in/varsha'],
        ['github',   '🐙', 'GitHub',   'github.com/Varsha-shekhawat',  'https://github.com/Varsha-shekhawat']
    ];
    const insertContacts = db.transaction((items) => {
        for (const c of items) insertContact.run(...c);
    });
    insertContacts(contacts);

    // ─── Help items ───
    const insertHelp = db.prepare('INSERT INTO help_items (question, answer, sort_order) VALUES (?, ?, ?)');
    const helpItems = [
        ['What is this website?',   'This is a student portal / portfolio website built by Varsha Shekhawat to track academic progress including attendance, marks, skills, and contact information.', 1],
        ['How do I navigate?',      'Use the top header menu or expand the sidebar by clicking the ☰ hamburger icon to navigate between Home, About, Skills, Attendance, Marks, Contact, and Help.', 2],
        ['How does attendance work?', 'Select a semester from the dropdown on the Attendance page to view subject-wise attendance percentages and classes attended.', 3],
        ['How do marks work?',       'Select a semester from the dropdown on the Marks page to view subject-wise marks, grades, credits, and overall CGPA for that semester.', 4],
        ['How can I contact?',      'Visit the Contact page to find email, phone, and social media links, or use the contact form to send a message.', 5],
        ['Page not loading?',       'Make sure the Node.js server is running with "npm start" and check your network connection.', 6],
    ];
    const insertHelps = db.transaction((items) => {
        for (const h of items) insertHelp.run(...h);
    });
    insertHelps(helpItems);

    console.log('  ✅ Database seeded with initial data');
}

module.exports = { initializeDatabase };
