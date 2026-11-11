const path = require('node:path');
const fs = require('node:fs');
const XLSX = require('xlsx');

const source = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'GSX CERT.xlsx'));
const destination = path.join(__dirname, '..', 'data', 'students.csv');
const workbook = XLSX.readFile(source, { cellText: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const values = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
const headers = values.shift().map((value) => String(value).trim().toLowerCase());
const nameIndex = headers.indexOf('name');
const enrollmentIndex = headers.findIndex((value) => value.startsWith('enrollment'));
if (nameIndex === -1 || enrollmentIndex === -1) throw new Error('The workbook must include Name and Enrollment No. columns.');
const quote = (value) => `"${String(value).trim().replace(/"/g, '""')}"`;
const rows = values
  .map((row) => [row[nameIndex], row[enrollmentIndex]].map((value) => String(value ?? '').trim()))
  .filter(([name, enrollment]) => name && enrollment);
fs.writeFileSync(destination, `name,enrollment_no\n${rows.map(([name, enrollment]) => `${quote(name)},${quote(enrollment)}`).join('\n')}\n`, 'utf8');
console.log(`Updated ${destination} with ${rows.length} students.`);
