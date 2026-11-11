const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');

function normalizeName(value) {
  return String(value).trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}

function normalizeEnrollment(value) {
  return String(value).trim().toLocaleLowerCase('en-US');
}

function loadStudents(dataPath) {
  const rows = parse(fs.readFileSync(dataPath, 'utf8'), { columns: true, skip_empty_lines: true, trim: true });
  const students = new Map();
  for (const row of rows) {
    if (!row.name || !row.enrollment_no) continue;
    students.set(`${normalizeName(row.name)}\u0000${normalizeEnrollment(row.enrollment_no)}`, row.name.trim());
  }
  return students;
}

function findStudent(students, name, enrollmentNo) {
  return students.get(`${normalizeName(name)}\u0000${normalizeEnrollment(enrollmentNo)}`) || null;
}

module.exports = { normalizeName, normalizeEnrollment, loadStudents, findStudent };
