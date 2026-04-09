const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.db');

function initializeDatabase() {
    const db = new Database(DB_PATH);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS about (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            bio TEXT NOT NULL,
            university TEXT,
            tags TEXT
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT,
            proficiency INTEGER DEFAULT 50
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            technologies TEXT
        );

        CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            degree TEXT NOT NULL,
            institution TEXT NOT NULL,
            year_range TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS contact_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            icon TEXT,
            label TEXT NOT NULL,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS help_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        );
    `);

    // Seed data only if tables are empty
    const aboutCount = db.prepare('SELECT COUNT(*) as count FROM about').get();
    if (aboutCount.count === 0) {
        seedData(db);
    }

    return db;
}

function seedData(db) {
    // About
    db.prepare(`INSERT INTO about (name, title, bio, university, tags) VALUES (?, ?, ?, ?, ?)`)
      .run(
        'Varsha Shekhawat',
        'Computer Science Engineer',
        'Hello! My name is Varsha Shekhawat. I am a Computer Science student at VIT-AP University. I love building creative and efficient applications like Spotify clones and student management systems.',
        'VIT-AP University',
        JSON.stringify(['CS Student', 'Web Developer', 'VIT-AP'])
      );

    // Skills
    const insertSkill = db.prepare('INSERT INTO skills (name, icon, proficiency) VALUES (?, ?, ?)');
    const skills = [
        ['Java', '☕', 85],
        ['HTML & CSS', '🌐', 90],
        ['JavaScript', '⚡', 80],
        ['DSA', '📊', 75],
        ['SQL', '🗄️', 70],
        ['React', '⚛️', 65]
    ];
    const insertSkills = db.transaction((items) => {
        for (const s of items) insertSkill.run(...s);
    });
    insertSkills(skills);

    // Projects
    const insertProject = db.prepare('INSERT INTO projects (name, description, icon, technologies) VALUES (?, ?, ?, ?)');
    const projects = [
        ['VTOP Clone Web App', 'A full-featured clone of the VIT-AP student portal with dashboard, grades, and attendance tracking.', '🎯', JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Node.js'])],
        ['Spotify 2.0 Music App', 'A modern music streaming application with playlist management, search, and audio playback features.', '🎵', JSON.stringify(['React', 'CSS', 'API'])],
        ['Student Management System', 'Complete CRUD application for managing student records with search, filter, and reporting capabilities.', '📚', JSON.stringify(['Java', 'SQL', 'JDBC'])],
        ['Portfolio Website', 'This personal portfolio website showcasing my skills, projects, and professional journey.', '🌐', JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Node.js'])]
    ];
    const insertProjects = db.transaction((items) => {
        for (const p of items) insertProject.run(...p);
    });
    insertProjects(projects);

    // Education
    const insertEdu = db.prepare('INSERT INTO education (degree, institution, year_range, sort_order) VALUES (?, ?, ?, ?)');
    const education = [
        ['B.Tech in Computer Science Engineering', 'VIT-AP University', '2024 – 2028', 1],
        ['Higher Secondary Education', 'Senior Secondary School', '2022 – 2024', 2],
        ['Secondary Education', 'High School', '2020 – 2022', 3]
    ];
    const insertEdus = db.transaction((items) => {
        for (const e of items) insertEdu.run(...e);
    });
    insertEdus(education);

    // Contact Info
    const insertContact = db.prepare('INSERT INTO contact_info (type, icon, label, value) VALUES (?, ?, ?, ?)');
    const contacts = [
        ['email', '📧', 'Email', 'varsha@example.com'],
        ['phone', '📱', 'Phone', '+91-XXXXXXXXXX'],
        ['linkedin', '💼', 'LinkedIn', 'linkedin.com/in/varsha'],
        ['github', '🐙', 'GitHub', 'github.com/Varsha-shekhawat']
    ];
    const insertContacts = db.transaction((items) => {
        for (const c of items) insertContact.run(...c);
    });
    insertContacts(contacts);

    // Help items
    const insertHelp = db.prepare('INSERT INTO help_items (question, answer) VALUES (?, ?)');
    const helpItems = [
        ['What is this website?', 'This is a personal portfolio website built by Varsha Shekhawat to showcase her skills, projects, education, and professional journey.'],
        ['How do I navigate?', 'Use the top header menu or expand the sidebar by clicking the ☰ hamburger icon to navigate between different sections.'],
        ['How can I contact?', 'Visit the Contact page to find email, phone, and social media links, or use the contact form to send a message directly.'],
        ['Page not loading?', 'Make sure all files are in the same folder and you are running the application through the server. Check network connectivity.']
    ];
    const insertHelps = db.transaction((items) => {
        for (const h of items) insertHelp.run(...h);
    });
    insertHelps(helpItems);

    console.log('✅ Database seeded successfully!');
}

module.exports = { initializeDatabase };
