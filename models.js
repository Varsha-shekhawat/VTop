const mongoose = require('mongoose');

// ─── About Schema ───
const aboutSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    title:      { type: String, required: true },
    bio:        { type: String, required: true },
    university: { type: String },
    tags:       [{ type: String }],
}, { timestamps: true });

// ─── Skill Schema ───
const skillSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    icon:        { type: String },
    proficiency: { type: Number, default: 50, min: 0, max: 100 },
    category:    { type: String, default: 'General' },
});

// ─── Semester Schema ───
const semesterSchema = new mongoose.Schema({
    semester_number: { type: Number, required: true, unique: true },
    label:           { type: String, required: true },
    year:            { type: String, required: true },
    cgpa:            { type: Number, default: 0.0 },
});

// ─── Attendance Schema ───
const attendanceSchema = new mongoose.Schema({
    semester:         { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    semester_number:  { type: Number, required: true },
    subject:          { type: String, required: true },
    classes_attended: { type: Number, default: 0 },
    total_classes:    { type: Number, default: 0 },
    percentage:       { type: Number, default: 0.0 },
});

// ─── Mark Schema ───
const markSchema = new mongoose.Schema({
    semester:       { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    semester_number:{ type: Number, required: true },
    subject:        { type: String, required: true },
    marks_obtained: { type: Number, default: 0 },
    max_marks:      { type: Number, default: 100 },
    grade:          { type: String },
    credits:        { type: Number, default: 3 },
});

// ─── Contact Info Schema ───
const contactInfoSchema = new mongoose.Schema({
    type:  { type: String, required: true },
    icon:  { type: String },
    label: { type: String, required: true },
    value: { type: String, required: true },
    url:   { type: String },
});

// ─── Message Schema ───
const messageSchema = new mongoose.Schema({
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Help Item Schema ───
const helpItemSchema = new mongoose.Schema({
    question:   { type: String, required: true },
    answer:     { type: String, required: true },
    sort_order: { type: Number, default: 0 },
});

// ─── Export Models ───
module.exports = {
    About:       mongoose.model('About', aboutSchema),
    Skill:       mongoose.model('Skill', skillSchema),
    Semester:    mongoose.model('Semester', semesterSchema),
    Attendance:  mongoose.model('Attendance', attendanceSchema),
    Mark:        mongoose.model('Mark', markSchema),
    ContactInfo: mongoose.model('ContactInfo', contactInfoSchema),
    Message:     mongoose.model('Message', messageSchema),
    HelpItem:    mongoose.model('HelpItem', helpItemSchema),
};
