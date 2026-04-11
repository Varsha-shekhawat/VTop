/**
 * seed.js — Run once to populate MongoDB with all existing data.
 * Usage:  node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { About, Skill, Semester, Attendance, Mark, ContactInfo, HelpItem } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    console.log('\n  🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('  ✅ Connected!\n');

    // ─── Clear existing data ───
    console.log('  🗑️  Clearing old data...');
    await Promise.all([
        About.deleteMany({}),
        Skill.deleteMany({}),
        Semester.deleteMany({}),
        Attendance.deleteMany({}),
        Mark.deleteMany({}),
        ContactInfo.deleteMany({}),
        HelpItem.deleteMany({}),
    ]);

    // ─── About ───
    console.log('  📝 Seeding About...');
    await About.create({
        name: 'Varsha Shekhawat',
        title: 'Computer Science Engineer',
        bio: 'Hello! My name is Varsha Shekhawat. I am a Computer Science student at VIT-AP University. I love building creative and efficient applications. I am passionate about web development, problem-solving, and creating user-friendly solutions.',
        university: 'VIT-AP University',
        tags: ['CS Student', 'Web Developer', 'VIT-AP', 'Full Stack'],
    });

    // ─── Skills ───
    console.log('  💡 Seeding Skills...');
    await Skill.insertMany([
        { name: 'Java',           icon: '☕', proficiency: 85, category: 'Programming' },
        { name: 'HTML & CSS',     icon: '🌐', proficiency: 90, category: 'Frontend' },
        { name: 'JavaScript',     icon: '⚡', proficiency: 80, category: 'Frontend' },
        { name: 'DSA',            icon: '📊', proficiency: 75, category: 'Computer Science' },
        { name: 'SQL',            icon: '🗄️', proficiency: 70, category: 'Database' },
        { name: 'React',          icon: '⚛️', proficiency: 65, category: 'Frontend' },
        { name: 'Node.js',        icon: '🟢', proficiency: 70, category: 'Backend' },
        { name: 'Git & GitHub',   icon: '🔀', proficiency: 75, category: 'Tools' },
    ]);

    // ─── Semesters ───
    console.log('  📅 Seeding Semesters...');
    const sem1 = await Semester.create({ semester_number: 1, label: 'Semester 1', year: '2024-25', cgpa: 8.72 });
    const sem2 = await Semester.create({ semester_number: 2, label: 'Semester 2', year: '2024-25', cgpa: 8.45 });

    // ─── Attendance ───
    console.log('  📋 Seeding Attendance...');
    await Attendance.insertMany([
        // Sem 1
        { semester: sem1._id, semester_number: 1, subject: 'Web Technologies',                classes_attended: 38, total_classes: 42, percentage: 90.5 },
        { semester: sem1._id, semester_number: 1, subject: 'Theory of Computation',            classes_attended: 35, total_classes: 40, percentage: 87.5 },
        { semester: sem1._id, semester_number: 1, subject: 'Data Structures and Algorithm',    classes_attended: 40, total_classes: 44, percentage: 90.9 },
        { semester: sem1._id, semester_number: 1, subject: 'Operating Systems',                classes_attended: 32, total_classes: 38, percentage: 84.2 },
        { semester: sem1._id, semester_number: 1, subject: 'English',                          classes_attended: 28, total_classes: 30, percentage: 93.3 },
        // Sem 2
        { semester: sem2._id, semester_number: 2, subject: 'OOPS',                             classes_attended: 33, total_classes: 38, percentage: 86.8 },
        { semester: sem2._id, semester_number: 2, subject: 'Information Technology',            classes_attended: 36, total_classes: 42, percentage: 85.7 },
        { semester: sem2._id, semester_number: 2, subject: 'Software Engineering',             classes_attended: 39, total_classes: 43, percentage: 90.7 },
        { semester: sem2._id, semester_number: 2, subject: 'Internet Of Things',               classes_attended: 35, total_classes: 40, percentage: 87.5 },
        { semester: sem2._id, semester_number: 2, subject: 'Discrete Mathematics',             classes_attended: 27, total_classes: 30, percentage: 90.0 },
    ]);

    // ─── Marks ───
    console.log('  📊 Seeding Marks...');
    await Mark.insertMany([
        // Sem 1
        { semester: sem1._id, semester_number: 1, subject: 'Web Technologies',                marks_obtained: 82,  max_marks: 100, grade: 'A',  credits: 4 },
        { semester: sem1._id, semester_number: 1, subject: 'Theory of Computation',            marks_obtained: 75,  max_marks: 100, grade: 'B+', credits: 4 },
        { semester: sem1._id, semester_number: 1, subject: 'Data Structures and Algorithm',    marks_obtained: 88,  max_marks: 100, grade: 'A+', credits: 4 },
        { semester: sem1._id, semester_number: 1, subject: 'Operating Systems',                marks_obtained: 71,  max_marks: 100, grade: 'B',  credits: 3 },
        { semester: sem1._id, semester_number: 1, subject: 'English',                          marks_obtained: 85,  max_marks: 100, grade: 'A',  credits: 2 },
        // Sem 2
        { semester: sem2._id, semester_number: 2, subject: 'OOPS',                             marks_obtained: 78,  max_marks: 100, grade: 'B+', credits: 4 },
        { semester: sem2._id, semester_number: 2, subject: 'Information Technology',            marks_obtained: 80,  max_marks: 100, grade: 'A',  credits: 4 },
        { semester: sem2._id, semester_number: 2, subject: 'Software Engineering',             marks_obtained: 85,  max_marks: 100, grade: 'A',  credits: 4 },
        { semester: sem2._id, semester_number: 2, subject: 'Internet Of Things',               marks_obtained: 74,  max_marks: 100, grade: 'B+', credits: 3 },
        { semester: sem2._id, semester_number: 2, subject: 'Discrete Mathematics',             marks_obtained: 88,  max_marks: 100, grade: 'A+', credits: 2 },
    ]);

    // ─── Contact Info ───
    console.log('  📇 Seeding Contact Info...');
    await ContactInfo.insertMany([
        { type: 'email',    icon: '📧', label: 'Email',    value: 'varshashekhawatt@gmail.com',       url: 'mailto:varshashekhawatt@gmail.com' },
        { type: 'phone',    icon: '📱', label: 'Phone',    value: '+91-6367151890',                   url: null },
        { type: 'linkedin', icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/varsha',           url: 'https://www.linkedin.com/in/varsha-shekhawat-8a0121293?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app' },
        { type: 'github',   icon: '🐙', label: 'GitHub',   value: 'github.com/Varsha-shekhawat',     url: 'https://github.com/Varsha-shekhawat' },
    ]);

    // ─── Help Items ───
    console.log('  ❓ Seeding Help Items...');
    await HelpItem.insertMany([
        { question: 'What is this website?',   answer: 'This is a student portal / portfolio website built by Varsha Shekhawat to track academic progress including attendance, marks, skills, and contact information.', sort_order: 1 },
        { question: 'How do I navigate?',      answer: 'Use the top header menu or expand the sidebar by clicking the ☰ hamburger icon to navigate between Home, About, Skills, Attendance, Marks, Contact, and Help.', sort_order: 2 },
        { question: 'How does attendance work?', answer: 'Select a semester from the dropdown on the Attendance page to view subject-wise attendance percentages and classes attended.', sort_order: 3 },
        { question: 'How do marks work?',      answer: 'Select a semester from the dropdown on the Marks page to view subject-wise marks, grades, credits, and overall CGPA for that semester.', sort_order: 4 },
        { question: 'How can I contact?',      answer: 'Visit the Contact page to find email, phone, and social media links, or use the contact form to send a message.', sort_order: 5 },
        { question: 'Page not loading?',       answer: 'Make sure the Node.js server is running with "npm start" and check your network connection.', sort_order: 6 },
    ]);

    console.log('\n  ✅ All data seeded successfully!');
    console.log('  📦 Database: vtop\n');

    await mongoose.disconnect();
    console.log('  🔌 Disconnected from MongoDB.\n');
}

seed().catch((err) => {
    console.error('  ❌ Seed failed:', err.message);
    process.exit(1);
});
